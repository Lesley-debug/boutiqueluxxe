export default function GoogleButton({ label }: { label: string }) {
    return (
        <a href="/auth/google" className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#181512]/12 bg-white px-5 text-sm font-semibold text-[#181512] shadow-sm transition hover:border-[#9B7435]/40 hover:bg-[#FAF8F4]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.23-.2-1.77H12v3.4h5.52a4.7 4.7 0 0 1-2.05 3.09l-.02.11 2.98 2.31.21.02c1.94-1.79 2.96-4.43 2.96-7.16Z"/>
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.61-2.42l-3.15-2.44c-.84.57-1.97.97-3.46.97-2.59 0-4.79-1.75-5.58-4.17l-.1.01-3.1 2.4-.03.1A9.99 9.99 0 0 0 12 22Z"/>
                <path fill="#FBBC05" d="M6.42 13.94A6.02 6.02 0 0 1 6.1 12c0-.67.12-1.32.31-1.94l-.01-.13-3.14-2.44-.1.05A9.97 9.97 0 0 0 2 12c0 1.61.39 3.13 1.08 4.46l3.34-2.52Z"/>
                <path fill="#EA4335" d="M12 5.89c1.88 0 3.15.81 3.88 1.48l2.8-2.73C16.97 3.05 14.7 2 12 2a9.99 9.99 0 0 0-8.81 5.54l3.23 2.52C7.22 7.64 9.41 5.89 12 5.89Z"/>
            </svg>
            {label}
        </a>
    );
}
