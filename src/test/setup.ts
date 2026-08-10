import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

let mediaQueryMatches = false;

const createMediaQueryList = (media: string): MediaQueryList =>
  ({
    matches: mediaQueryMatches,
    media,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }) as MediaQueryList;

window.matchMedia = (media) => createMediaQueryList(media);

class ResizeObserverStub {
  constructor(_callback: ResizeObserverCallback) {}

  observe() {}

  unobserve() {}

  disconnect() {}
}

class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [0];

  constructor(_callback: IntersectionObserverCallback) {}

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve() {}
}

globalThis.ResizeObserver = ResizeObserverStub as typeof ResizeObserver;
globalThis.IntersectionObserver =
  IntersectionObserverStub as typeof IntersectionObserver;

export function setMediaQuery(matches: boolean): MediaQueryList {
  mediaQueryMatches = matches;

  return window.matchMedia("");
}

afterEach(() => {
  mediaQueryMatches = false;
});
