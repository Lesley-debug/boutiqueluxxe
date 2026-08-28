import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

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
        <>
            <Head title="My Profile" />
            <div className="mx-auto max-w-lg px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">My Profile</h1>

                <form onSubmit={submitProfile} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Name
                        </label>
                        <input
                            value={profileForm.data.name}
                            onChange={(e) =>
                                profileForm.setData("name", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {profileForm.errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {profileForm.errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={profileForm.data.email}
                            onChange={(e) =>
                                profileForm.setData("email", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {profileForm.errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {profileForm.errors.email}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={profileForm.processing}
                        className="rounded-sm bg-stone-900 px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Save Profile
                    </button>
                </form>

                <div className="mt-10 border-t border-stone-200 pt-8">
                    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500">
                        Change Password
                    </h2>
                    <form onSubmit={submitPassword} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
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
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {passwordForm.errors.current_password && (
                                <p className="mt-1 text-xs text-red-600">
                                    {passwordForm.errors.current_password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
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
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {passwordForm.errors.password && (
                                <p className="mt-1 text-xs text-red-600">
                                    {passwordForm.errors.password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
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
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="rounded-sm bg-stone-900 px-6 py-2 text-sm text-white disabled:opacity-50"
                        >
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
