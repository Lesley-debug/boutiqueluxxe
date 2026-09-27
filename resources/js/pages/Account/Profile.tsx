import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck, User } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";

interface ProfileProps {
  user: { name: string; email: string };
}

export default function Profile({ user }: ProfileProps) {
  const profileForm = useForm({ name: user.name, email: user.email });
  const passwordForm = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const submitProfile = (event: FormEvent) => {
    event.preventDefault();
    profileForm.patch("/account/profile");
  };
  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    passwordForm.patch("/account/profile/password");
  };
  const inputClass =
    "w-full rounded-2xl border border-[#171310]/10 bg-[#FAF8F4] px-4 py-3.5 text-sm text-[#171310] outline-none transition focus:border-[#9B7435] focus:bg-white focus:ring-4 focus:ring-[#9B7435]/10";

  return (
    <StoreLayout showMobileHeader>
      <Head title="Profile & Security" />
      <main className="min-h-screen bg-[#F4F0E8] px-4 pb-20 pt-5 sm:px-6 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/account"
              className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#9B7435]">
                Private account
              </p>
              <h1 className="font-serif text-3xl font-medium">
                Profile & security
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <form
              onSubmit={submitProfile}
              className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_-38px_rgba(23,19,16,.5)] sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F4F0E8]">
                  <User className="h-5 w-5 text-[#9B7435]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl">Personal details</h2>
                  <p className="text-xs text-[#6F6961]">
                    Keep your contact details current.
                  </p>
                </div>
              </div>
              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Full name
                  </label>
                  <input
                    value={profileForm.data.name}
                    onChange={(e) =>
                      profileForm.setData("name", e.target.value)
                    }
                    className={inputClass}
                  />
                  {profileForm.errors.name && (
                    <p className="mt-2 text-xs text-red-600">
                      {profileForm.errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={profileForm.data.email}
                    onChange={(e) =>
                      profileForm.setData("email", e.target.value)
                    }
                    className={inputClass}
                  />
                  {profileForm.errors.email && (
                    <p className="mt-2 text-xs text-red-600">
                      {profileForm.errors.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                disabled={profileForm.processing}
                className="mt-7 w-full rounded-full bg-[#171310] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#9B7435] disabled:opacity-40"
              >
                {profileForm.processing ? "Saving…" : "Save personal details"}
              </button>
              {profileForm.recentlySuccessful && (
                <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                  Profile updated successfully.
                </p>
              )}
            </form>

            <form
              onSubmit={submitPassword}
              className="overflow-hidden rounded-3xl bg-[#171310] text-white shadow-[0_25px_65px_-40px_rgba(23,19,16,.9)]"
            >
              <div className="border-b border-white/10 p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                    <LockKeyhole className="h-5 w-5 text-[#D9BB82]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl">Change password</h2>
                    <p className="text-xs text-white/45">
                      Protect every Boutique Luxxe session.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-7">
                <div className="mb-5 flex gap-3 rounded-2xl border border-[#D9BB82]/20 bg-[#D9BB82]/10 p-4">
                  <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#D9BB82]" />
                  <p className="text-[11px] leading-5 text-white/65">
                    After changing your password, all active sessions are
                    closed. You will receive a security email and must sign in
                    again.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-white/80">
                      Current password
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.data.current_password}
                      onChange={(e) =>
                        passwordForm.setData("current_password", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 text-sm text-white outline-none focus:border-[#D9BB82]"
                    />
                    {passwordForm.errors.current_password && (
                      <p className="mt-2 text-xs text-red-300">
                        {passwordForm.errors.current_password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-white/80">
                      New password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.data.password}
                      onChange={(e) =>
                        passwordForm.setData("password", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 text-sm text-white outline-none focus:border-[#D9BB82]"
                    />
                    {passwordForm.errors.password && (
                      <p className="mt-2 text-xs text-red-300">
                        {passwordForm.errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-white/80">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordForm.data.password_confirmation}
                      onChange={(e) =>
                        passwordForm.setData(
                          "password_confirmation",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3.5 text-sm text-white outline-none focus:border-[#D9BB82]"
                    />
                  </div>
                </div>
                <button
                  disabled={passwordForm.processing}
                  className="mt-7 w-full rounded-full bg-[#B58A43] px-6 py-3.5 text-[10px] font-bold uppercase tracking-[.16em] text-white transition hover:bg-[#C79D59] disabled:opacity-40"
                >
                  {passwordForm.processing
                    ? "Securing account…"
                    : "Change password & sign out"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </StoreLayout>
  );
}
