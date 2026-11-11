import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

export function createSocialImage() {
  return new ImageResponse(
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

      {/* Identidade visual */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="76"
          height="76"
          viewBox="0 0 512 512"
          style={{ marginRight: 20 }}
        >
          <defs>
            <linearGradient
              id="brand"
              x1="110"
              y1="120"
              x2="410"
              y2="400"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#35C9E8" />
              <stop offset="0.52" stopColor="#287DEB" />
              <stop offset="1" stopColor="#6957E8" />
            </linearGradient>
          </defs>

          <path
            d="M390 126 C350 82 270 76 205 105 C145 132 111 181 130 225 C151 273 231 279 302 253 C370 228 410 253 390 302 C371 348 306 384 239 387 C191 389 151 372 126 343"
            fill="none"
            stroke="url(#brand)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx="414" cy="112" r="24" fill="#35C9E8" />
          <circle cx="105" cy="365" r="24" fill="#35C9E8" />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#F4F6FC",
          }}
        >
          <span
            style={{
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            Sinaliza
          </span>

          <span
            style={{
              marginTop: 2,
              color: "#C8D5F0",
              fontSize: 15,
              letterSpacing: 1.5,
            }}
          >
            APRENDER LIBRAS. PRATICAR. EVOLUIR.
          </span>
        </div>
      </div>

      {/* Chamada principal */}
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
    </div>,
    size,
  );
}
