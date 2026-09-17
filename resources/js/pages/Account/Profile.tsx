import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
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

    function submitProfile(e: FormEvent) {
        e.preventDefault();
        profileForm.patch("/account/profile");
    }

    function submitPassword(e: FormEvent) {
        e.preventDefault();
        passwordForm.patch("/account/profile/password", {
            onSuccess: () => passwordForm.reset(),
        });
    }

    return (
        <StoreLayout>
            <Head title="My Profile" />
            <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
                <div className="mb-12">
                    <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310]">
                        My Profile
                    </h1>
                    <p className="mt-2 text-sm text-[#252525]/60">
                        Manage your personal information and account settings
                    </p>
                </div>

                <form onSubmit={submitProfile} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#171310]">
                            Full Name
                        </label>
                        <input
                            value={profileForm.data.name}
                            onChange={(e) =>
                                profileForm.setData("name", e.target.value)
                            }
                            className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        />
                        {profileForm.errors.name && (
                            <p className="mt-2 text-xs text-red-600">
                                {profileForm.errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#171310]">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profileForm.data.email}
                            onChange={(e) =>
                                profileForm.setData("email", e.target.value)
                            }
                            className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        />
                        {profileForm.errors.email && (
                            <p className="mt-2 text-xs text-red-600">
                                {profileForm.errors.email}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={profileForm.processing}
                        className="rounded-full bg-[#171310] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                    >
                        {profileForm.processing ? "Saving..." : "Save Profile"}
                    </button>
                    {profileForm.recentlySuccessful && (
                        <p className="text-sm text-green-700">
                            ✓ Profile updated successfully
                        </p>
                    )}
                </form>

                <div className="mt-16 border-t border-[#171310]/10 pt-12">
                    <div className="mb-8">
                        <h2 className="font-serif text-2xl font-medium tracking-tight text-[#171310]">
                            Change Password
                        </h2>
                        <p className="mt-2 text-sm text-[#252525]/60">
                            Update your password to keep your account secure
                        </p>
                    </div>
                    <form onSubmit={submitPassword} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#171310]">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.current_password}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        "current_password",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                            />
                            {passwordForm.errors.current_password && (
                                <p className="mt-2 text-xs text-red-600">
                                    {passwordForm.errors.current_password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#171310]">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.password}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        "password",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                            />
                            {passwordForm.errors.password && (
                                <p className="mt-2 text-xs text-red-600">
                                    {passwordForm.errors.password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#171310]">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="rounded-full bg-[#171310] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                        >
                            {passwordForm.processing
                                ? "Updating..."
                                : "Update Password"}
                        </button>
                        {passwordForm.recentlySuccessful && (
                            <p className="text-sm text-green-700">
                                ✓ Password changed successfully
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </StoreLayout>
    );
}
