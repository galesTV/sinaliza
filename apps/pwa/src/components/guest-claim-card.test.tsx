import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  CLAIM_CONFIRMED_COPY,
  CLAIM_WARNING_COPY,
  GuestClaimCard,
  claimAwaitingCopy,
  claimFailedCopy,
  claimOfferLeadCopy,
} from "./guest-claim-card";

describe("claim card copy", () => {
  it("names the device and the destination account in the offer", () => {
    // Exact matches: a duplicated count ("3 3 atividades") must fail.
    expect(claimOfferLeadCopy(3, "ana@example.com")).toBe(
      "3 atividades foram marcadas como concluídas neste dispositivo " +
        "sem uma conta. Você pode transferi-las para ana@example.com.",
    );
    expect(claimOfferLeadCopy(1, null)).toBe(
      "1 atividade foi marcada como concluída neste dispositivo " +
        "sem uma conta. Você pode transferi-las para a sua conta.",
    );
  });

  it("warns that the activities may belong to someone else on this device", () => {
    expect(CLAIM_WARNING_COPY).toContain("neste dispositivo");
    expect(CLAIM_WARNING_COPY).toContain("outra pessoa");
    // Honest framing: completions are self-reported marks, not skill.
    expect(CLAIM_WARNING_COPY).toContain("não são uma avaliação");
  });

  it("describes in-flight work without claiming it finished", () => {
    const awaiting = claimAwaitingCopy(2);
    expect(awaiting).toContain("em andamento");
    expect(awaiting).toContain("aguardando confirmação");
    expect(awaiting).not.toContain("transferidas");
    expect(claimAwaitingCopy(1)).toContain("1 atividade aguardando");
  });

  it("reports exhausted retries as a recoverable sync issue", () => {
    const text = claimFailedCopy(1);
    expect(text).toContain("ainda não foi confirmada");
    expect(text).toContain("tenta novamente");
    expect(claimFailedCopy(2)).toContain("2 atividades ainda não");
  });

  it("confirms only activities, never proficiency", () => {
    expect(CLAIM_CONFIRMED_COPY).toContain("atividades");
    expect(CLAIM_CONFIRMED_COPY).not.toContain("domínio");
  });
});

describe("GuestClaimCard (SSR)", () => {
  it("renders nothing before client state exists", () => {
    const html = renderToStaticMarkup(
      <GuestClaimCard userId="user-1" email="ana@example.com" />,
    );
    // Claim state is client-only: SSR and first paint show no card, so
    // nothing is offered — or confirmed — without real consent state.
    expect(html).toBe("");
  });
});
