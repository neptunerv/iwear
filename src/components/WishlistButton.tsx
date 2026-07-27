"use client";

import { HeartIcon, HeartIconFilled } from "@/components/icons";
import { useWishlist, type WishlistItem } from "@/components/WishlistProvider";

type WishlistButtonProps = {
  item: WishlistItem;
  className?: string;
  /** Open the wishlist drawer after saving (default true). */
  openOnSave?: boolean;
};

export function WishlistButton({
  item,
  className = "",
  openOnSave = true,
}: WishlistButtonProps) {
  const { isSaved, toggleItem, openWishlist } = useWishlist();
  const saved = isSaved(item.handle);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const wasSaved = saved;
        toggleItem(item);
        if (!wasSaved && openOnSave) openWishlist();
      }}
      className={`transition-opacity hover:opacity-60 ${className}`}
    >
      {saved ? (
        <HeartIconFilled className="h-5 w-5" />
      ) : (
        <HeartIcon className="h-5 w-5" />
      )}
    </button>
  );
}
