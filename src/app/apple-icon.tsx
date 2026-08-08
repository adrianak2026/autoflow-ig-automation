import { ImageResponse } from "next/og";

// edge runtime removed - not supported by @opennextjs/cloudflare
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #4F46E5, #D946EF, #DB2777)",
          color: "white",
          fontSize: "90px",
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, sans-serif",
          borderRadius: "40px",
        }}
      >
        AF
      </div>
    ),
    { ...size }
  );
}
