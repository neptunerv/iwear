"use server";

import {
  addToCart,
  getCart,
  removeCartLines,
  updateCartDiscountCodes,
  updateCartLine,
} from "./cart";

export async function getCartAction() {
  return getCart();
}

export async function addToCartAction(variantId: string, quantity = 1) {
  return addToCart(variantId, quantity);
}

export async function updateCartLineAction(lineId: string, quantity: number) {
  return updateCartLine(lineId, quantity);
}

export async function removeCartLineAction(lineId: string) {
  return removeCartLines([lineId]);
}

export async function updateCartDiscountCodesAction(codes: string[]) {
  return updateCartDiscountCodes(codes);
}
