import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const size = { width: 1200, height: 630 };

const logoData = await readFile(
  join(process.cwd(), "public/brand/sinaliza-horizontal.svg"),
  "base64",
);
const logoSrc = `data:image/svg+xml;base64,${logoData}`;

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "76px 84px",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #10172B 0%, #151D38 58%, #1B1B45 100%)",
          color: "#F4F6FC",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -190,
            right: -90,
            width: 560,
            height: 560,
            borderRadius: 280,
            background: "rgba(105, 87, 232, 0.16)",
            border: "1px solid rgba(169, 158, 255, 0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 110,
            bottom: -270,
            width: 520,
            height: 520,
            borderRadius: 260,
            background: "rgba(53, 201, 232, 0.08)",
          }}
        />
        <img
          src={logoSrc}
          width="420"
          height="126"
          style={{ objectFit: "contain", objectPosition: "left center" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 52,
            maxWidth: 900,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -2.5,
          }}
        >
          <span>Aprenda Libras</span>
          <span style={{ color: "#63D6EB" }}>de forma visual e interativa.</span>
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 760,
            color: "#C8D5F0",
            fontSize: 25,
            lineHeight: 1.5,
          }}
        >
          Explore o alfabeto, descubra vocabulário e desenvolva sua prática.
        </div>
        <div
          style={{
            position: "absolute",
            right: 82,
            bottom: 52,
            color: "rgba(200, 213, 240, 0.68)",
            fontSize: 17,
            letterSpacing: 1.2,
          }}
        >
          sinaliza-eta.vercel.app
        </div>
      </div>
    ),
    size,
  );
}
