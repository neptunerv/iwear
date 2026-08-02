import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — Authentic Ray-Ban & Oakley in Bali`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/logo-full-source.jpg"),
  );
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#e4002b",
        }}
      >
        <img
          alt=""
          src={logoSrc}
          width={760}
          height={380}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
