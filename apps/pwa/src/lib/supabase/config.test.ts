import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getSupabaseEnv, isSupabaseConfigured } from "./config";

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

const saved = { url: process.env[URL_VAR], key: process.env[KEY_VAR] };

function setEnv(url?: string, key?: string) {
  if (url === undefined) delete process.env[URL_VAR];
  else process.env[URL_VAR] = url;
  if (key === undefined) delete process.env[KEY_VAR];
  else process.env[KEY_VAR] = key;
}

beforeEach(() => setEnv());
afterEach(() => setEnv(saved.url, saved.key));

describe("getSupabaseEnv", () => {
  it("is unconfigured when both variables are absent", () => {
    setEnv();
    expect(getSupabaseEnv()).toBeNull();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("is unconfigured when only one variable is set", () => {
    setEnv("https://rrkyugefpydskajfilws.supabase.co");
    expect(getSupabaseEnv()).toBeNull();
    setEnv(undefined, "sb_publishable_real-key");
    expect(getSupabaseEnv()).toBeNull();
  });

  it("returns normalized settings when fully configured", () => {
    setEnv(
      "https://rrkyugefpydskajfilws.supabase.co/",
      "sb_publishable_real-key",
    );
    expect(getSupabaseEnv()).toEqual({
      url: "https://rrkyugefpydskajfilws.supabase.co",
      publishableKey: "sb_publishable_real-key",
    });
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("treats the .env.example placeholder as unconfigured", () => {
    setEnv(
      "https://your-project-ref.supabase.co",
      "sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx",
    );
    expect(getSupabaseEnv()).toBeNull();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("rejects malformed URLs and non-https endpoints", () => {
    setEnv("not-a-url", "sb_publishable_real-key");
    expect(getSupabaseEnv()).toBeNull();
    setEnv("http://localhost:54321", "sb_publishable_real-key");
    expect(getSupabaseEnv()).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    setEnv(
      "  https://rrkyugefpydskajfilws.supabase.co  ",
      "  sb_publishable_real-key  ",
    );
    expect(getSupabaseEnv()?.url).toBe(
      "https://rrkyugefpydskajfilws.supabase.co",
    );
  });
});
