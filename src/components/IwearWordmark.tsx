import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SVGProps } from "react";

type IwearWordmarkProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

const rawSvg = readFileSync(
  join(process.cwd(), "src/assets/iwear-wordmark.svg"),
  "utf8",
);

const viewBox = rawSvg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 1024 454";
const pathData = rawSvg.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? "";

/**
 * Full "iWear Sunglasses" wordmark loaded from src/assets/iwear-wordmark.svg,
 * traced from the source logo. Used for the big hero lockup.
 * Replace that file with your own export, or run `npm run trace-wordmark`.
 */
export function IwearWordmark({
  title = "iWear Sunglasses",
  className,
  "aria-hidden": ariaHidden,
  ...props
}: IwearWordmarkProps) {
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
