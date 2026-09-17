import '../css/app.css';

import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

createInertiaApp({
    title: (title) => `${title} - Designer Bags Boutique`,

    resolve: async (name) => {
        const page = await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        );

        return page as ResolvedComponent;
    },

    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Inertia mount element was not found.');
        }

        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: '#9C7A3C',
    },
});
