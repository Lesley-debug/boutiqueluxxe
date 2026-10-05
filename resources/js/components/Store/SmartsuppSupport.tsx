import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import {
  CHAT_OVERLAY_EVENT,
  isStoreOverlayOpen,
  chatHasStarted,
  hideChat,
  isPublicChatUrl,
  loadChat,
  showChat,
} from "@/lib/smartsupp";

export default function SmartsuppSupport({
  initialPublic,
}: {
  initialPublic: boolean;
}) {
  const [allowed, setAllowed] = useState(initialPublic);
  const allowedRef = useRef(initialPublic);
  const readyRef = useRef(false);
  allowedRef.current = allowed;

  useEffect(() => {
    // This component renders no extra launcher, dialog or preference controls.
    // Only Smartsupp's native bubble and dashboard-configured message appear.
    try {
      sessionStorage.removeItem("boutique-luxxe:smartsupp-consent:v1");
    } catch {
      /* The old custom consent preference is no longer used. */
    }

    const before = router.on("before", (event) => {
      const visit = event.detail.visit as {
        url: URL;
        method: string;
        prefetch?: boolean;
      };
      if (
        chatHasStarted() &&
        visit.method.toLowerCase() === "get" &&
        !isPublicChatUrl(visit.url)
      ) {
        event.preventDefault();
        hideChat();
        if (!visit.prefetch) window.location.assign(visit.url.href);
      }
    });
    const navigate = router.on("navigate", (event) => {
      const page = event.detail.page;
      const publicPage =
        page.component.startsWith("Store/") && isPublicChatUrl(page.url);
      allowedRef.current = publicPage;
      setAllowed(publicPage);
      if (!publicPage && chatHasStarted()) {
        hideChat();
        window.location.replace(new URL(page.url, window.location.origin).href);
      }
    });
    return () => {
      before();
      navigate();
    };
  }, []);

  useEffect(() => {
    let current = true;
    if (!allowed) {
      hideChat();
      return;
    }

    function syncVisibility() {
      if (!readyRef.current) return;
      // Explicit store drawer state only: opening Smartsupp must not hide itself.
      const locked = isStoreOverlayOpen();
      if (
        current &&
        allowedRef.current &&
        isPublicChatUrl(window.location.href) &&
        !locked
      )
        showChat();
      else hideChat();
    }

    window.addEventListener(CHAT_OVERLAY_EVENT, syncVisibility);

    loadChat()
      .then(() => {
        readyRef.current = true;
        syncVisibility();
      })
      .catch(() => {
        // Fail gracefully: chat outage must not break storefront/checkout.
        // The existing Contact page remains available; no additional overlay.
        if (current)
          console.warn(
            "Boutique Luxxe live chat is unavailable; please use the Contact page.",
          );
      });
    return () => {
      current = false;
      window.removeEventListener(CHAT_OVERLAY_EVENT, syncVisibility);
    };
  }, [allowed]);

  return null;
}
