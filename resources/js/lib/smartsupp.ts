// The website widget key is public, not a private API credential.
export const SMARTSUPP_KEY = "32c1e66ba9c7812ea7cd94ceafb9f642dc4926f2";
export const CHAT_LOADER_ID = "boutique-luxxe-smartsupp-loader";

type ChatApi = ((...args: unknown[]) => void) & { _?: unknown[][] };
declare global {
  interface Window {
    _smartsupp?: Record<string, unknown>;
    smartsupp?: ChatApi;
  }
}

export const CHAT_OVERLAY_EVENT = "boutique-luxxe:store-overlay-change";
const storeOverlays = new Set<symbol>();

export function isStoreOverlayOpen(): boolean {
  return storeOverlays.size > 0;
}

// Only our own drawers call this. Never infer state from vendor scroll locks.
export function registerStoreOverlay(): () => void {
  const token = Symbol("store-overlay");
  storeOverlays.add(token);
  window.dispatchEvent(new Event(CHAT_OVERLAY_EVENT));
  let released = false;
  return () => {
    if (released) return;
    released = true;
    storeOverlays.delete(token);
    window.dispatchEvent(new Event(CHAT_OVERLAY_EVENT));
  };
}

let loading: Promise<void> | undefined;

// Explicit allowlist: unknown/new routes are excluded by default.
export function isPublicChatUrl(value: string | URL): boolean {
  const url = new URL(value, window.location.origin);
  if (url.origin !== window.location.origin) return false;
  if (
    [...url.searchParams.keys()].some((key) =>
      /token|email|signature|password|secret/i.test(key),
    )
  )
    return false;
  const path = url.pathname.replace(/\/+$/, "") || "/";
  return (
    [
      "/",
      "/shop",
      "/categories",
      "/collections",
      "/journal",
      "/about",
      "/faqs",
      "/testimonials",
      "/contact",
      "/privacy-policy",
      "/cookie-policy",
      "/terms-of-service",
    ].includes(path) || /^\/(products|collections|journal)\/[^/]+$/.test(path)
  );
}

export function chatHasStarted(): boolean {
  return !!document.getElementById(CHAT_LOADER_ID) || !!window.smartsupp;
}

export function hideChat(): void {
  window.smartsupp?.("chat:close");
  window.smartsupp?.("chat:hide");
}

export function showChat(open = false): void {
  window.smartsupp?.("chat:show");
  if (open) window.smartsupp?.("chat:open");
}

// Automatic native widget on explicitly permitted public storefront URLs only.
export function loadChat(): Promise<void> {
  if (!isPublicChatUrl(window.location.href)) {
    return Promise.reject(new Error("Chat is excluded from this page."));
  }
  if (loading) return loading;
  if (window.smartsupp || document.getElementById(CHAT_LOADER_ID)) {
    return Promise.reject(
      new Error("Another chat installation already exists."),
    );
  }
  window._smartsupp = {
    key: SMARTSUPP_KEY,
    hideWidget: true,
    orientation: "right",
    // Match BackToTop's right inset; keep the chat bubble 20px above its top.
    // Mobile: arrow bottom 96 + height 44 + gap 20 = chat bottom 160.
    // Desktop: arrow bottom 32 + height 44 + gap 20 = chat bottom 96.
    offsetX: window.innerWidth < 1024 ? 16 : 32,
    offsetY: window.innerWidth < 1024 ? 160 : 96,
    privacyNoticeEnabled: true,
    privacyNoticeUrl: window.location.origin + "/privacy-policy",
    privacyNoticeCheckRequired: true,
  };
  const queue: ChatApi = (...args: unknown[]) => {
    queue._!.push(args);
  };
  queue._ = [];
  window.smartsupp = queue;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = CHAT_LOADER_ID;
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.async = true;
    script.src = "https://www.smartsuppchat.com/loader.js?";
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      if (window.smartsupp === queue) delete window.smartsupp;
      delete window._smartsupp;
      loading = undefined;
      reject(new Error("Chat could not load. Please use our contact page."));
    };
    document.head.appendChild(script);
  });
  return loading;
}
