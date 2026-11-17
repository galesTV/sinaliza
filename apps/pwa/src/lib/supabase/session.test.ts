import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getClaims = vi.fn().mockResolvedValue({ data: { claims: null } });
  return {
    getClaims,
    createServerClient: vi.fn(() => ({ auth: { getClaims } })),
  };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

import { updateSession } from "./session";

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const saved = { url: process.env[URL_VAR], key: process.env[KEY_VAR] };

afterEach(() => {
  if (saved.url === undefined) delete process.env[URL_VAR];
  else process.env[URL_VAR] = saved.url;
  if (saved.key === undefined) delete process.env[KEY_VAR];
  else process.env[KEY_VAR] = saved.key;
  vi.clearAllMocks();
});

describe("updateSession", () => {
  it("passes the request through untouched when unconfigured", async () => {
    delete process.env[URL_VAR];
    delete process.env[KEY_VAR];
    const request = new NextRequest("http://localhost/trilhas");

    const response = await updateSession(request);

    expect(mocks.createServerClient).not.toHaveBeenCalled();
    expect(mocks.getClaims).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("refreshes the session via getClaims when configured", async () => {
    process.env[URL_VAR] = "https://rrkyugefpydskajfilws.supabase.co";
    process.env[KEY_VAR] = "sb_publishable_real-key";
    const request = new NextRequest("http://localhost/trilhas");

    const response = await updateSession(request);

    expect(mocks.createServerClient).toHaveBeenCalledWith(
      "https://rrkyugefpydskajfilws.supabase.co",
      "sb_publishable_real-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );
    expect(mocks.getClaims).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
