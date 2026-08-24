import { Head, router, usePage } from "@inertiajs/react";

interface AdminUserRow {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    role: string | null;
}

const ROLES = [
    { value: "", label: "No admin access" },
    { value: "super_admin", label: "Super Admin" },
    { value: "manager", label: "Manager" },
    { value: "support_staff", label: "Support Staff" },
];

export default function Index({ users }: { users: AdminUserRow[] }) {
    const { auth } = usePage().props as { auth: { user: { id: number } } };

    function updateRole(userId: number, role: string) {
        router.patch(
            `/admin/users/${userId}/role`,
            { role: role || null },
            { preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Admin — Users & Roles" />
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">Admin Users</h1>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                            <th className="py-2">Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr
                                key={u.id}
                                className="border-b border-stone-100"
                            >
                                <td className="py-2">{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    {u.id === auth.user.id ? (
                                        <span className="text-xs text-stone-400">
                                            Cannot edit your own role
                                        </span>
                                    ) : (
                                        <select
                                            value={u.role ?? ""}
                                            onChange={(e) =>
                                                updateRole(u.id, e.target.value)
                                            }
                                            className="rounded-sm border border-stone-300 px-2 py-1 text-sm"
                                        >
                                            {ROLES.map((r) => (
                                                <option
                                                    key={r.value}
                                                    value={r.value}
                                                >
                                                    {r.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
