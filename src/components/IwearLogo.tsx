import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SVGProps } from "react";

type IwearLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

const rawSvg = readFileSync(
  join(process.cwd(), "src/assets/iwear-logo.svg"),
  "utf8",
);

const viewBox =
  rawSvg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 447 447";
const pathData = rawSvg.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? "";

/**
 * Vector iWear mark loaded from src/assets/iwear-logo.svg.
 * Replace that file with your own export, or run `npm run trace-logo`.
 */
export function IwearLogo({
  title = "iWear Sunglasses",
  className,
  "aria-hidden": ariaHidden,
  ...props
}: IwearLogoProps) {
  const isDecorative = ariaHidden === true || ariaHidden === "true";

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={isDecorative ? undefined : "img"}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={isDecorative ? undefined : title}
      {...props}
    >
      {!isDecorative && title ? <title>{title}</title> : null}
      <path d={pathData} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
