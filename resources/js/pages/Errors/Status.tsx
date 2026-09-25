import { Head, Link } from "@inertiajs/react";

interface ErrorPageProps {
    status: number;
    title: string;
    description: string;
}

export default function Status({
    status,
    title,
    description,
}: ErrorPageProps) {
    const canRetry = [419, 429, 500, 503].includes(status);

    return (
        <>
            <Head title={`${status} — ${title}`}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF8F4] px-5 py-16 text-[#181512]">
                <div
                    aria-hidden="true"
                    className="absolute -left-32 top-[-8rem] h-80 w-80 rounded-full bg-[#E8D8BC]/45 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-36 right-[-7rem] h-96 w-96 rounded-full bg-[#D8C29C]/30 blur-3xl"
                />

                <section className="relative w-full max-w-2xl border border-[#E7E1D8] bg-white/90 px-6 py-12 text-center shadow-[0_24px_80px_rgba(24,21,18,0.08)] backdrop-blur sm:px-12 sm:py-16">
                    <Link
                        href="/"
                        className="font-serif text-xl tracking-[0.22em] text-[#181512] sm:text-2xl"
                    >
                        BOUTIQUE LUXXE
                    </Link>

                    <div className="mx-auto my-8 h-px w-16 bg-[#9B7435]" />

                    <p className="text-xs font-semibold tracking-[0.32em] text-[#9B7435]">
                        ERROR {status}
                    </p>
                    <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#6F6961] sm:text-base">
                        {description}
                    </p>

                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex min-h-11 items-center justify-center bg-[#181512] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-white transition hover:bg-[#332E29]"
                        >
                            RETURN HOME
                        </Link>
                        <Link
                            href="/shop"
                            className="inline-flex min-h-11 items-center justify-center border border-[#181512] px-6 py-3 text-xs font-semibold tracking-[0.14em] transition hover:bg-[#181512] hover:text-white"
                        >
                            BROWSE COLLECTION
                        </Link>
                        {canRetry && (
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex min-h-11 items-center justify-center border border-[#D1C8BC] px-6 py-3 text-xs font-semibold tracking-[0.14em] transition hover:border-[#9B7435] hover:text-[#7B5A28]"
                            >
                                TRY AGAIN
                            </button>
                        )}
                    </div>

                    <p className="mt-10 text-xs leading-5 text-[#8B847B]">
                        If you continue to see this page, contact{" "}
                        <a
                            href="mailto:info@boutiqueluxxe.com"
                            className="underline decoration-[#CDB68F] underline-offset-4"
                        >
                            info@boutiqueluxxe.com
                        </a>
                        .
                    </p>
                </section>
            </main>
        </>
    );
}
