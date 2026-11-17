import { afterEach, describe, expect, it } from "vitest";

import { createClient } from "./client";

const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";
const KEY_VAR = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const saved = { url: process.env[URL_VAR], key: process.env[KEY_VAR] };

afterEach(() => {
  if (saved.url === undefined) delete process.env[URL_VAR];
  else process.env[URL_VAR] = saved.url;
  if (saved.key === undefined) delete process.env[KEY_VAR];
  else process.env[KEY_VAR] = saved.key;
});

describe("createClient (browser)", () => {
  it("throws a clear error when Supabase is not configured", () => {
    delete process.env[URL_VAR];
    delete process.env[KEY_VAR];
    expect(() => createClient()).toThrow(/not configured/);
  });

  it("creates a browser client when configured", () => {
    process.env[URL_VAR] = "https://rrkyugefpydskajfilws.supabase.co";
    process.env[KEY_VAR] = "sb_publishable_real-key";
    expect(createClient()).toBeDefined();
  });
});
