"use client";

import { toast as manager } from "sonner";

type Options = Parameters<typeof manager.success>[1];
const options = (message: string, value?: Options): Options => ({ ...value, description: value?.description ?? message });

export const toast = {
  success: (message: string, value?: Options) => manager.success("Success", options(message, value)),
  error: (message: string, value?: Options) => manager.error("Something went wrong", options(message, value)),
  warning: (message: string, value?: Options) => manager.warning("Attention", options(message, value)),
  info: (message: string, value?: Options) => manager.info("Information", options(message, value)),
  loading: (message: string, value?: Options) => manager.loading("Please wait", options(message, value)),
  promise: manager.promise,
  dismiss: manager.dismiss,
};
