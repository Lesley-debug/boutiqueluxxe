import { Link, usePage } from "@inertiajs/react";

export default function MobileCategoryShortcuts() {
    const { megaMenu } = usePage().props;

    const shortcuts = [
        { label: "New Arrivals", href: "/shop?sort=newest" },
        ...megaMenu.flatMap((top) => [
            { label: top.name, href: `/shop?category=${top.slug}` },
            ...top.audience.map((a) => ({
                label: a.name,
                href: `/shop?category=${a.slug}`,
            })),
        ]),
    ];

    if (shortcuts.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 px-4 py-4 lg:hidden">
            {shortcuts.map((s) => (
                <Link
                    key={s.label}
                    href={s.href}
                    className="whitespace-nowrap rounded-full border border-[#171310]/15 bg-white px-4 py-2 text-xs font-medium text-[#171310] transition active:bg-[#171310] active:text-white"
                >
                    {s.label}
                </Link>
            ))}
        </div>
    );
}
