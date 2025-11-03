// src/test/test-utils.tsx
import { render as rtlRender } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { TestProviders } from "./TestProviders";

export function render(ui: React.ReactElement, options?: RenderOptions & { route?: string }) {
  const initialEntries = options?.route ? [options.route] : ["/"];
  return rtlRender(<TestProviders initialEntries={initialEntries}>{ui}</TestProviders>, options);
}

export * from "@testing-library/react";
