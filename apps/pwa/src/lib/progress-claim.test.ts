import { describe, expect, it } from "vitest";

import {
  claimStorageKey,
  createClaimMarker,
} from "./progress-claim";
import type { ProgressStorage } from "./progress";

const ALICE = "user-alice";
const K1 = "alfabeto/letras-a-e/letra-a";
const K2 = "alfabeto/letras-a-e/letra-b";
const K3 = "alfabeto/letras-a-e/letra-c";

function makeStorage() {
  const map = new Map<string, string>();
  const storage: ProgressStorage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
  return { storage, map };
}

describe("createClaimMarker", () => {
  it("starts empty for an unknown account", () => {
    const { storage } = makeStorage();
    const marker = createClaimMarker({
      storage,
      storageKey: claimStorageKey(ALICE),
    });
    const snap = marker.snapshot();
    expect(snap.dismissed.size).toBe(0);
    expect(snap.initiated.size).toBe(0);
    expect(snap.confirmed.size).toBe(0);
  });

  it("persists each set under its own versioned key", () => {
    const { storage, map } = makeStorage();
    const key = claimStorageKey(ALICE);
    const marker = createClaimMarker({ storage, storageKey: key });
    marker.addDismissed([K1]);
    marker.addInitiated([K2]);
    marker.addConfirmed([K3]);

    const raw = JSON.parse(map.get(key)!) as {
      version: number;
      dismissed: string[];
      initiated: string[];
      confirmed: string[];
    };
    expect(raw.version).toBe(1);
    expect(raw.dismissed).toEqual([K1]);
    expect(raw.initiated).toEqual([K2]);
    expect(raw.confirmed).toEqual([K3]);
  });

  it("survives a reload: a new marker over the same storage sees the sets", () => {
    const { storage } = makeStorage();
    const key = claimStorageKey(ALICE);
    createClaimMarker({ storage, storageKey: key }).addInitiated([K1, K2]);

    const reloaded = createClaimMarker({ storage, storageKey: key });
    expect(reloaded.snapshot().initiated).toEqual(new Set([K1, K2]));
  });

  it("never contaminates another account's marker", () => {
    const { storage } = makeStorage();
    createClaimMarker({
      storage,
      storageKey: claimStorageKey(ALICE),
    }).addDismissed([K1]);
    const bob = createClaimMarker({
      storage,
      storageKey: claimStorageKey("user-bob"),
    });
    expect(bob.snapshot().dismissed.size).toBe(0);
  });

  it("addInitiated skips keys already dismissed or confirmed", () => {
    const { storage } = makeStorage();
    const marker = createClaimMarker({
      storage,
      storageKey: claimStorageKey(ALICE),
    });
    marker.addDismissed([K1]);
    marker.addConfirmed([K2]);
    marker.addInitiated([K1, K2, K3]);
    expect(marker.snapshot().initiated).toEqual(new Set([K3]));
  });

  it("addConfirmed moves keys out of initiated", () => {
    const { storage } = makeStorage();
    const marker = createClaimMarker({
      storage,
      storageKey: claimStorageKey(ALICE),
    });
    marker.addInitiated([K1, K2]);
    marker.addConfirmed([K1]);
    expect(marker.snapshot().initiated).toEqual(new Set([K2]));
    expect(marker.snapshot().confirmed).toEqual(new Set([K1]));
  });

  it("addDismissed pulls keys out of an in-flight initiated set", () => {
    const { storage } = makeStorage();
    const marker = createClaimMarker({
      storage,
      storageKey: claimStorageKey(ALICE),
    });
    marker.addInitiated([K1, K2]);
    marker.addDismissed([K2]);
    expect(marker.snapshot().initiated).toEqual(new Set([K1]));
  });

  it("merges a sibling tab's persisted writes by union", () => {
    const { storage, map } = makeStorage();
    const key = claimStorageKey(ALICE);
    const marker = createClaimMarker({ storage, storageKey: key });
    marker.addInitiated([K1]);

    // Sibling tab persists its own record for the same account.
    map.set(
      key,
      JSON.stringify({
        version: 1,
        dismissed: [K2],
        initiated: [K3],
        confirmed: [K1],
      }),
    );
    const snap = marker.snapshot();
    expect(snap.confirmed).toEqual(new Set([K1]));
    expect(snap.dismissed).toEqual(new Set([K2]));
    // Confirmed/dismissed shadow initiated even if a sibling still has it.
    expect(snap.initiated).toEqual(new Set([K3]));
  });

  it("ignores stored records with a foreign version", () => {
    const { storage, map } = makeStorage();
    const key = claimStorageKey(ALICE);
    map.set(
      key,
      JSON.stringify({ version: 99, initiated: [K1], dismissed: [K2] }),
    );
    const marker = createClaimMarker({ storage, storageKey: key });
    expect(marker.snapshot().initiated.size).toBe(0);
    expect(marker.snapshot().dismissed.size).toBe(0);
  });

  it("works without storage: markers hold for the session", () => {
    const marker = createClaimMarker({
      storageKey: claimStorageKey(ALICE),
    });
    marker.addInitiated([K1]);
    marker.addConfirmed([K1]);
    expect(marker.snapshot().confirmed.has(K1)).toBe(true);
  });
});
