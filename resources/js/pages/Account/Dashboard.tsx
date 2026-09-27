import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  LockKeyhole,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";

interface OrderRow {
  id: number;
  order_number: string;
  status: string;
  total: string;
  created_at: string;
}

interface NotificationRow {
  id: string;
  data: { title?: string; message?: string; url?: string; icon?: string };
  read_at: string | null;
  created_at: string;
}

interface ActivityRow {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

interface DashboardProps {
  stats: {
    orders_count: number;
    active_orders_count: number;
    wishlist_count: number;
    addresses_count: number;
    unread_notifications_count: number;
    total_spent: number;
  };
  profileCompletion: number;
  account: { member_since: string | null; email_verified: boolean };
  recentOrders: OrderRow[];
  recentNotifications: NotificationRow[];
  recentActivity: ActivityRow[];
}

const STATUS = {
  pending: {
    label: "Pending",
    icon: Clock,
    style: "bg-amber-50 text-amber-700",
  },
  processing: {
    label: "Processing",
    icon: Activity,
    style: "bg-blue-50 text-blue-700",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    style: "bg-indigo-50 text-indigo-700",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    style: "bg-emerald-50 text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    style: "bg-red-50 text-red-600",
  },
} as const;

function StatusBadge({ status }: { status: string }) {
  const item = STATUS[status as keyof typeof STATUS] ?? STATUS.pending;
  const Icon = item.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${item.style}`}
    >
      <Icon className="h-3 w-3" /> {item.label}
    </span>
  );
}

function timeAgo(value: string) {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Package;
  tone: "gold" | "ink" | "cream";
}) {
  const styles = {
    gold: "bg-[#9B7435] text-white",
    ink: "bg-[#171310] text-white",
    cream: "border border-[#171310]/8 bg-white text-[#171310]",
  };
  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-2xl p-4 shadow-[0_14px_35px_-24px_rgba(23,19,16,.5)] ${styles[tone]}`}
    >
      <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/10" />
      <div className="flex items-center justify-between">
        <p
          className={`truncate text-[9px] font-bold uppercase tracking-[0.15em] ${tone === "cream" ? "text-[#6F6961]" : "text-white/70"}`}
        >
          {label}
        </p>
        <Icon
          className={`h-4 w-4 ${tone === "cream" ? "text-[#9B7435]" : "text-white/80"}`}
        />
      </div>
      <p className="mt-3 font-serif text-2xl font-semibold">{value}</p>
      <p
        className={`mt-1 truncate text-[10px] ${tone === "cream" ? "text-[#6F6961]" : "text-white/60"}`}
      >
        {hint}
      </p>
    </div>
  );
}

export default function Dashboard({
  stats,
  profileCompletion,
  account,
  recentOrders,
  recentNotifications,
  recentActivity,
}: DashboardProps) {
  const { auth } = usePage().props;
  const name = auth.user?.name ?? "Luxury Member";
  const firstName = name.split(" ")[0];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <StoreLayout showMobileHeader>
      <Head title="My Account" />
      <main className="min-h-screen bg-[#F4F0E8] pb-24 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-10 lg:pt-10">
          <section className="relative overflow-hidden rounded-[30px] bg-[#171310] px-5 pb-6 pt-5 text-white shadow-[0_30px_80px_-45px_rgba(23,19,16,.9)] sm:px-8 sm:py-8">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#B58A43]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#D9BB82]">
                  <Sparkles className="h-3.5 w-3.5" /> Private account
                </div>
                <h1 className="mt-3 font-serif text-3xl font-medium sm:text-5xl">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-2 max-w-lg text-xs leading-6 text-white/55 sm:text-sm">
                  Track your collection, orders, security and private updates in
                  one elegant space.
                </p>
              </div>
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 font-serif text-xl backdrop-blur sm:h-16 sm:w-16 sm:text-2xl">
                {initials}
              </div>
            </div>

            <div className="relative mt-7 grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:max-w-md">
              <div
                className="grid h-14 w-14 place-items-center rounded-full p-1"
                style={{
                  background: `conic-gradient(#D9BB82 ${profileCompletion * 3.6}deg, rgba(255,255,255,.12) 0deg)`,
                }}
              >
                <div className="grid h-full w-full place-items-center rounded-full bg-[#171310] text-[11px] font-bold">
                  {profileCompletion}%
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold">Account completion</p>
                  <ShieldCheck className="h-4 w-4 text-[#D9BB82]" />
                </div>
                <p className="mt-1 text-[10px] leading-5 text-white/45">
                  {account.email_verified
                    ? "Email verified"
                    : "Verify your email"}{" "}
                  ·{" "}
                  {stats.addresses_count > 0
                    ? "Delivery ready"
                    : "Add a delivery address"}
                </p>
              </div>
            </div>
          </section>

          <section className="-mt-2 grid grid-cols-3 gap-2.5 px-1 sm:gap-4 lg:-mt-5 lg:px-8">
            <MetricCard
              label="Orders"
              value={stats.orders_count}
              hint={`${stats.active_orders_count} active`}
              icon={Package}
              tone="ink"
            />
            <MetricCard
              label="Wishlist"
              value={stats.wishlist_count}
              hint="Saved pieces"
              icon={Heart}
              tone="gold"
            />
            <MetricCard
              label="Updates"
              value={stats.unread_notifications_count}
              hint="Unread"
              icon={Bell}
              tone="cream"
            />
          </section>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            <section className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_-38px_rgba(23,19,16,.5)] lg:col-span-5">
              <div className="border-b border-[#171310]/8 p-5 sm:p-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B7435]">
                  Collection overview
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#6F6961]">Lifetime spend</p>
                    <p className="mt-1 font-serif text-3xl font-semibold text-[#171310]">
                      {formatPrice(stats.total_spent)}
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className="grid h-11 w-11 place-items-center rounded-full bg-[#171310] text-white transition hover:bg-[#9B7435]"
                    aria-label="Browse the boutique"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
                <div
                  className="mt-5 flex h-12 items-end gap-1.5"
                  aria-hidden="true"
                >
                  {[28, 45, 34, 64, 48, 78, 62, 92, 70, 100].map(
                    (height, index) => (
                      <span
                        key={index}
                        className="flex-1 rounded-t-full bg-gradient-to-t from-[#9B7435] to-[#D9BB82]"
                        style={{
                          height: `${height}%`,
                          opacity: 0.38 + index * 0.05,
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px bg-[#171310]/8">
                <Link
                  href="/account/orders"
                  className="bg-white p-5 transition hover:bg-[#FAF8F4]"
                >
                  <ShoppingBag className="h-5 w-5 text-[#9B7435]" />
                  <p className="mt-3 text-sm font-semibold">My orders</p>
                  <p className="mt-1 text-[10px] text-[#6F6961]">
                    Track purchases
                  </p>
                </Link>
                <Link
                  href="/account/addresses"
                  className="bg-white p-5 transition hover:bg-[#FAF8F4]"
                >
                  <MapPin className="h-5 w-5 text-[#9B7435]" />
                  <p className="mt-3 text-sm font-semibold">Delivery</p>
                  <p className="mt-1 text-[10px] text-[#6F6961]">
                    {stats.addresses_count} saved
                  </p>
                </Link>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-38px_rgba(23,19,16,.5)] sm:p-6 lg:col-span-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B7435]">
                    Purchases
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-medium">
                    Recent orders
                  </h2>
                </div>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B7435]"
                >
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-[#171310]/12 p-8 text-center">
                  <ShoppingBag className="mx-auto h-7 w-7 text-[#9B7435]" />
                  <p className="mt-3 text-sm font-semibold">
                    Your collection begins here
                  </p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-flex rounded-full bg-[#171310] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.14em] text-white"
                  >
                    Explore pieces
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-2.5">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="group flex items-center gap-3 rounded-2xl border border-[#171310]/7 bg-[#FAF8F4] p-3.5 transition hover:border-[#9B7435]/35 hover:bg-white"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                        <Package className="h-4 w-4 text-[#9B7435]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold">
                          {order.order_number}
                        </p>
                        <p className="mt-1 text-[10px] text-[#6F6961]">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">
                          {formatPrice(order.total)}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#171310]/20 transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-38px_rgba(23,19,16,.5)] sm:p-6 lg:col-span-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B7435]">
                    Private updates
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-medium">
                    Notifications
                  </h2>
                </div>
                <Link
                  href="/account/notifications"
                  className="relative grid h-10 w-10 place-items-center rounded-full bg-[#F4F0E8]"
                >
                  <Bell className="h-4 w-4 text-[#9B7435]" />
                  {stats.unread_notifications_count > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#171310] px-1 text-[9px] font-bold text-white">
                      {stats.unread_notifications_count > 9
                        ? "9+"
                        : stats.unread_notifications_count}
                    </span>
                  )}
                </Link>
              </div>
              <div className="mt-5 space-y-2">
                {recentNotifications.length === 0 ? (
                  <p className="rounded-2xl bg-[#FAF8F4] p-6 text-center text-xs text-[#6F6961]">
                    No notifications yet.
                  </p>
                ) : (
                  recentNotifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.data.url ?? "/account/notifications"}
                      className={`flex items-start gap-3 rounded-2xl p-3.5 transition ${notification.read_at ? "bg-[#FAF8F4]/60" : "border border-[#9B7435]/15 bg-[#F8F1E5]"}`}
                    >
                      <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-white">
                        <Bell className="h-4 w-4 text-[#9B7435]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-semibold">
                            {notification.data.title ?? "Account update"}
                          </p>
                          <span className="text-[9px] text-[#6F6961]">
                            {timeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-[#6F6961]">
                          {notification.data.message}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <span className="mt-2 h-2 w-2 rounded-full bg-[#9B7435]" />
                      )}
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl bg-[#171310] p-5 text-white shadow-[0_18px_50px_-35px_rgba(23,19,16,.8)] sm:p-6 lg:col-span-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D9BB82]">
                    Security & activity
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-medium">
                    Account pulse
                  </h2>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                  <LockKeyhole className="h-5 w-5 text-[#D9BB82]" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 p-5 text-xs text-white/50">
                    Your secure account activity will appear here.
                  </p>
                ) : (
                  recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.05] p-3"
                    >
                      <Activity className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D9BB82]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-white/85">
                          {item.description}
                        </p>
                        <p className="mt-1 text-[9px] text-white/35">
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/account/activity"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#171310]"
              >
                View security activity <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          </div>

          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                href: "/account/profile",
                icon: User,
                label: "Profile",
                hint: "Personal details",
              },
              {
                href: "/account/wishlist",
                icon: Heart,
                label: "Wishlist",
                hint: "Saved pieces",
              },
              {
                href: "/account/addresses",
                icon: MapPin,
                label: "Addresses",
                hint: "Delivery details",
              },
              {
                href: "/account/notifications",
                icon: Bell,
                label: "Updates",
                hint: "Private alerts",
              },
            ].map(({ href, icon: Icon, label, hint }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-[#171310]/7 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#F4F0E8]">
                    <Icon className="h-4 w-4 text-[#9B7435]" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#171310]/20 transition group-hover:text-[#9B7435]" />
                </div>
                <p className="mt-3 text-xs font-bold">{label}</p>
                <p className="mt-1 text-[9px] text-[#6F6961]">{hint}</p>
              </Link>
            ))}
          </section>

          <button
            type="button"
            onClick={() => router.post("/logout")}
            className="mt-6 w-full rounded-full border border-[#171310]/12 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6F6961] transition hover:border-red-200 hover:text-red-600 sm:w-auto sm:px-8"
          >
            Sign out securely
          </button>
        </div>
      </main>
    </StoreLayout>
  );
}
