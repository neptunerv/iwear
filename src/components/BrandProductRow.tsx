import Link from "next/link";
import { ProductStripPlaceholder } from "@/components/ProductStripPlaceholder";
import { ProductStripTile } from "@/components/ProductStripTile";
import type { Product } from "@/lib/shopify";

type ViewportGrid = {
  columns: number;
  rows: number;
};

type BrandProductRowProps = {
  title: string;
  viewAllHref: string;
  products: Product[];
  slotCount: number;
  desktopColumns?: 4;
  borderTop?: boolean;
  viewportGrid?: ViewportGrid;
};

function gridCellBorderClass(
  index: number,
  columns: number,
  rows: number,
) {
  const isLastCol = (index + 1) % columns === 0;
  const isLastRow = Math.floor(index / columns) === rows - 1;

  return [
    "border-b-2 border-r-2 border-ink",
    isLastCol && "border-r-0",
    isLastRow && "border-b-0",
  ]
    .filter(Boolean)
    .join(" ");
}

function flowingCellBorderClass(index: number, columns: number) {
  const isLastCol = (index + 1) % columns === 0;

  return [
    "border-b-2 border-r-2 border-ink",
    isLastCol && "border-r-0",
  ]
    .filter(Boolean)
    .join(" ");
}

function ProductCell({
  product,
  borderClassName,
  square = false,
}: {
  product: Product | undefined;
  borderClassName: string;
  square?: boolean;
}) {
  const content = product ? (
    <ProductStripTile product={product} fill />
  ) : (
    <ProductStripPlaceholder fill />
  );

  if (square) {
    return (
      <div className={`h-full min-h-0 ${borderClassName}`}>
        <div className="mx-auto aspect-square h-full max-w-full w-auto min-h-0">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-square ${borderClassName}`}>{content}</div>
  );
}

function ViewportProductGrid({
  slots,
  title,
  columns,
  rows,
}: {
  slots: (Product | undefined)[];
  title: string;
  columns: number;
  rows: number;
}) {
  const mobileColumns = 4;

  return (
    <>
      <div
        className="grid min-h-0 flex-1 auto-rows-fr lg:hidden"
        style={{ gridTemplateColumns: `repeat(${mobileColumns}, minmax(0, 1fr))` }}
      >
        {slots.map((product, slotIndex) => (
          <ProductCell
            key={product?.id ?? `${title}-slot-${slotIndex}`}
            product={product}
            borderClassName={flowingCellBorderClass(slotIndex, mobileColumns)}
            square
          />
        ))}
      </div>

      <div
        className="hidden min-h-0 flex-1 lg:grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {slots.map((product, slotIndex) => (
          <ProductCell
            key={product?.id ?? `${title}-slot-${slotIndex}`}
            product={product}
            borderClassName={gridCellBorderClass(slotIndex, columns, rows)}
            square
          />
        ))}
      </div>
    </>
  );
}

export function BrandProductRow({
  title,
  viewAllHref,
  products,
  slotCount,
  desktopColumns = 4,
  borderTop = true,
  viewportGrid,
}: BrandProductRowProps) {
  const slots = Array.from(
    { length: slotCount },
    (_, slotIndex) => products[slotIndex],
  );

  return (
    <section
      className={`flex flex-col bg-cream text-ink ${
        viewportGrid ? "snap-section" : ""
      } ${borderTop ? "border-t-2 border-ink" : ""}`}
    >
      <div className="flex shrink-0 items-center justify-between border-b-2 border-ink px-5 py-2.5 sm:px-8 sm:py-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] sm:text-sm">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-brand sm:text-xs sm:tracking-[0.2em]"
        >
          View all →
        </Link>
      </div>

      {viewportGrid ? (
        <ViewportProductGrid
          slots={slots}
          title={title}
          columns={viewportGrid.columns}
          rows={viewportGrid.rows}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4">
          {slots.map((product, slotIndex) => {
            const isLastColMobile = slotIndex % 2 === 1;
            const isLastColDesktop = (slotIndex + 1) % desktopColumns === 0;

            return (
              <ProductCell
                key={product?.id ?? `${title}-slot-${slotIndex}`}
                product={product}
                borderClassName={[
                  "border-b-2 border-r-2 border-ink",
                  isLastColMobile && "max-md:border-r-0",
                  isLastColDesktop && "md:border-r-0",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
