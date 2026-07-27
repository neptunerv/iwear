"use server";

import {
  createCustomer,
  getCustomer,
  loginCustomer,
  logoutCustomer,
} from "./customer";

export async function getCustomerAction() {
  return getCustomer();
}

export async function loginCustomerAction(email: string, password: string) {
  return loginCustomer(email.trim(), password);
}

export async function createCustomerAction(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  return createCustomer({
    email: input.email.trim(),
    password: input.password,
    firstName: input.firstName?.trim() || undefined,
    lastName: input.lastName?.trim() || undefined,
  });
}

export async function logoutCustomerAction() {
  return logoutCustomer();
}
