import { ReactNode } from "react";

export function Card({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-stone-200 bg-white p-5 ${className}`}
        >
            {children}
        </div>
    );
}

export function PageActions({ children }: { children: ReactNode }) {
    return (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            {children}
        </div>
    );
}

export function Button({
    children,
    variant = "primary",
    ...props
}: {
    children: ReactNode;
    variant?: "primary" | "secondary" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const styles = {
        primary: "bg-[#171310] text-white hover:bg-[#B89B6A]",
        secondary: "border border-stone-300 text-stone-700 hover:bg-stone-50",
        danger: "text-red-600 hover:bg-red-50",
    };
    return (
        <button
            {...props}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${props.className ?? ""}`}
        >
            {children}
        </button>
    );
}

export function Input({
    label,
    error,
    ...props
}: {
    label?: string;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={`w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition focus:border-[#B89B6A] focus:outline-none focus:ring-1 focus:ring-[#B89B6A] ${props.className ?? ""}`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function Select({
    label,
    error,
    children,
    ...props
}: {
    label?: string;
    error?: string;
    children: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    {label}
                </label>
            )}
            <select
                {...props}
                className={`w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition focus:border-[#B89B6A] focus:outline-none ${props.className ?? ""}`}
            >
                {children}
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function Textarea({
    label,
    error,
    ...props
}: {
    label?: string;
    error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                    {label}
                </label>
            )}
            <textarea
                {...props}
                className={`w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition focus:border-[#B89B6A] focus:outline-none ${props.className ?? ""}`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export function Table({
    head,
    children,
}: {
    head: string[];
    children: ReactNode;
}) {
    return (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                        {head.map((h, i) => (
                            <th key={i} className="px-4 py-3 font-medium">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">{children}</tbody>
            </table>
        </div>
    );
}

export function Badge({
    children,
    tone = "neutral",
}: {
    children: ReactNode;
    tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
    const tones = {
        neutral: "bg-stone-100 text-stone-700",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
    };
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
        >
            {children}
        </span>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <p className="py-12 text-center text-sm text-stone-400">{message}</p>
    );
}
