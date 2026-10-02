import { FormEvent, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  Bell,
  ChevronDown,
  Heart,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import SlideoverCart from "./SlideoverCart";

const ANNOUNCEMENT =
  "Complimentary shipping on selected orders · Personal concierge service";

const discoverLinks = [
  ["Our Story", "/about"],
  ["Journal", "/journal"],
  ["Testimonials", "/testimonials"],
  ["FAQs", "/faqs"],
  ["Contact", "/contact"],
] as const;

export default function StoreHeader() {
  const { auth, cart, megaMenu, unreadNotificationsCount } = usePage().props;
  const currentPath = usePage().url;
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const featuredDepartments = megaMenu.slice(0, 2);
  const unread = unreadNotificationsCount ?? 0;

  function active(path: string) {
    return (
      currentPath === path || (path !== "/" && currentPath.startsWith(path))
    );
  }

  function navClass(path: string) {
    return `relative py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition after:absolute after:bottom-0 after:left-0 after:h-px after:bg-[#9B7435] after:transition-all ${
      active(path)
        ? "text-[#9B7435] after:w-full"
        : "text-[#181512]/72 hover:text-[#181512] after:w-0 hover:after:w-full"
    }`;
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = search.trim();
    router.get("/shop", value ? { search: value } : {});
  }

  return (
    <header className="w-full border-b border-[#181512]/10 bg-[#FAF8F4]/96 shadow-[0_10px_35px_-30px_rgba(24,21,18,.55)] backdrop-blur-xl">
      <div className="bg-[#181512] px-6 py-2 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-[#F8F5EF]/85">
        {ANNOUNCEMENT}
      </div>

      <div className="mx-auto grid max-w-[1480px] grid-cols-[180px_minmax(0,1fr)_180px] items-center gap-5 px-7 py-4 xl:grid-cols-[210px_minmax(0,1fr)_210px] xl:px-10">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Boutique Luxxe home"
        >
          <img
            src="/images/logo.png"
            alt="Boutique Luxxe"
            className="h-14 w-[145px] object-contain object-left xl:w-[165px]"
          />
        </Link>

        <nav
          className="flex min-w-0 items-center justify-center gap-5 xl:gap-7"
          aria-label="Primary navigation"
        >
          <Link href="/shop" className={navClass("/shop")}>
            Shop
          </Link>
          <Link
            href="/shop?sort=newest"
            className="relative py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#181512]/72 transition hover:text-[#9B7435]"
          >
            New In
          </Link>
          <div className="hidden items-center gap-5 xl:flex xl:gap-7">
            {featuredDepartments.map((department) => (
              <Link
                key={department.id}
                href={`/shop?category=${department.slug}`}
                className="relative py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#181512]/72 transition hover:text-[#9B7435]"
              >
                {department.name}
              </Link>
            ))}
          </div>
          <Link href="/collections" className={navClass("/collections")}>
            Collections
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setDiscoverOpen(true)}
            onMouseLeave={() => setDiscoverOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDiscoverOpen((value) => !value)}
              className="flex items-center gap-1 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#181512]/72 transition hover:text-[#9B7435]"
              aria-expanded={discoverOpen}
            >
              Discover{" "}
              <ChevronDown
                className={`h-3 w-3 transition ${discoverOpen ? "rotate-180" : ""}`}
              />
            </button>
            {discoverOpen && (
              <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3">
                <div className="rounded-2xl border border-[#181512]/10 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(24,21,18,.35)]">
                  {discoverLinks.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block rounded-xl px-4 py-3 text-sm text-[#181512]/70 transition hover:bg-[#F3EADB] hover:text-[#181512]"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          {searchOpen ? (
            <form
              onSubmit={submitSearch}
              className="absolute right-7 top-[72px] z-50 flex w-[min(420px,calc(100vw-3.5rem))] items-center gap-2 rounded-2xl border border-[#181512]/10 bg-white p-2 shadow-xl xl:right-10"
            >
              <Search className="ml-2 h-4 w-4 text-[#6F6961]" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bags, watches and collections"
                className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-full p-2 text-[#6F6961] hover:bg-[#F8F5EF]"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : null}
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="rounded-full p-2.5 text-[#181512] transition hover:bg-[#F3EADB] hover:text-[#9B7435]"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
          {auth.user && (
            <Link
              href="/account/notifications"
              className="relative rounded-full p-2.5 text-[#181512] transition hover:bg-[#F3EADB] hover:text-[#9B7435]"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#9B7435] ring-2 ring-[#FAF8F4]" />
              )}
            </Link>
          )}
          <Link
            href={auth.user ? "/account/wishlist" : "/login"}
            className="hidden rounded-full p-2.5 text-[#181512] transition hover:bg-[#F3EADB] hover:text-[#9B7435] xl:block"
            aria-label="Wishlist"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Link>
          <Link
            href={auth.user ? "/account" : "/login"}
            className="rounded-full p-2.5 text-[#181512] transition hover:bg-[#F3EADB] hover:text-[#9B7435]"
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative ml-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#181512] text-white shadow-sm transition hover:bg-[#9B7435]"
            aria-label="Open shopping bag"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {cart.item_count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9B7435] px-1 text-[9px] font-bold text-white ring-2 ring-[#FAF8F4]">
                {cart.item_count > 99 ? "99+" : cart.item_count}
              </span>
            )}
          </button>
        </div>
      </div>
      <SlideoverCart
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </header>
  );
}
