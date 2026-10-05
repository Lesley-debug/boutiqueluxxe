import "../css/app.css";

import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import SmartsuppSupport from "./components/Store/SmartsuppSupport";
import { isPublicChatUrl } from "./lib/smartsupp";

createInertiaApp({
  title: (title) => `${title} - Boutique Luxxe`,

  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx"),
    );

    return page as ResolvedComponent;
  },

  setup({ el, App, props }) {
    if (!el) {
      throw new Error("Inertia mount element was not found.");
    }

    createRoot(el).render(
      <>
        <App {...props} />
        <SmartsuppSupport
          initialPublic={
            props.initialPage.component.startsWith("Store/") &&
            isPublicChatUrl(window.location.href)
          }
        />
      </>,
    );
  },

  progress: {
    color: "#9C7A3C",
  },
});
