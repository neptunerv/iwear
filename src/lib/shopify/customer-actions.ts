"use server";

import { getCustomer, logoutCustomer } from "./customer";

export async function getCustomerAction() {
  return getCustomer();
}

export async function logoutCustomerAction() {
  return logoutCustomer();
}
