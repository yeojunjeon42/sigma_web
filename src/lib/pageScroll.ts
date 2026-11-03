const MOBILE = "(max-width: 63.999rem), (pointer: coarse)";
let mobile: MediaQueryList | undefined;

// Mobile scrolls inside the black document backdrop so Safari's bars stay black.
export function pageScroller(): HTMLElement {
  mobile ??= window.matchMedia(MOBILE);
  return mobile.matches ? document.body : document.documentElement;
}

export const pageY = () => pageScroller().scrollTop;

export function scrollPage(options: ScrollToOptions) {
  pageScroller().scrollTo(options);
}

export function onPageScroll(listener: EventListener, type = "scroll") {
  // Listen to both so changing between the mobile and desktop layout keeps working.
  window.addEventListener(type, listener, { passive: true });
  document.body.addEventListener(type, listener, { passive: true });
  return () => {
    window.removeEventListener(type, listener);
    document.body.removeEventListener(type, listener);
  };
}
