import { Link } from "@inertiajs/react";
import { ReactNode } from "react";

export function Container({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`mx-auto max-w-7xl px-6 ${className}`}>{children}</div>
    );
}

export function Eyebrow({
    children,
    light = false,
}: {
    children: ReactNode;
    light?: boolean;
}) {
    return (
        <p
            className={`text-[11px] font-semibold uppercase tracking-[0.35em] ${light ? "text-[#9C7A3C]" : "text-[#9C7A3C]"}`}
        >
            {children}
        </p>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    subtitle,
    light = false,
}: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    light?: boolean;
}) {
    return (
        <div className="mx-auto mb-16 max-w-xl text-center">
            {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
            <h2
                className={`mt-4 font-serif text-4xl font-medium tracking-tight md:text-5xl ${light ? "text-white" : "text-[#171310]"}`}
            >
                {title}
            </h2>
            <div
                className={`mx-auto mt-6 h-px w-12 ${light ? "bg-[#9C7A3C]" : "bg-[#9C7A3C]"}`}
            />
            {subtitle && (
                <p
                    className={`mx-auto mt-6 max-w-md text-sm leading-relaxed ${light ? "text-white/60" : "text-[#252525]/60"}`}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export function PrimaryButton({
    href,
    onClick,
    children,
    type = "button",
    disabled,
    className = "",
}: {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
    type?: "button" | "submit";
    disabled?: boolean;
    className?: string;
}) {
    const classes = `inline-flex items-center justify-center gap-2 rounded-full bg-[#171310] px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] hover:shadow-[0_8px_28px_-6px_rgba(156,122,60,0.45)] disabled:opacity-40 ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({
    href,
    onClick,
    children,
    type = "button",
    disabled,
    light = false,
    className = "",
}: {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
    type?: "button" | "submit";
    disabled?: boolean;
    light?: boolean;
    className?: string;
}) {
    const classes = `inline-flex items-center justify-center gap-2 rounded-full border px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition duration-300 disabled:opacity-40 ${
        light
            ? "border-white/40 text-white hover:bg-white hover:text-[#171310]"
            : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
    } ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
        >
            {children}
        </button>
    );
}

export function TextLink({
    href,
    children,
}: {
    href: string;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171310] underline decoration-[#9C7A3C] decoration-2 underline-offset-8 transition hover:text-[#9C7A3C]"
        >
            {children}
        </Link>
    );
}
