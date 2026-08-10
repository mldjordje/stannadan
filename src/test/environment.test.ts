import { expect, test } from "vitest";

import { setMediaQuery } from "./setup";

test("provides deterministic browser observer and media-query APIs", () => {
  expect(window.matchMedia).toBeTypeOf("function");
  expect(ResizeObserver).toBeTypeOf("function");
  expect(IntersectionObserver).toBeTypeOf("function");
});

test("allows tests to set a matching media query", () => {
  expect(setMediaQuery(true)).toMatchObject({ matches: true });
});
