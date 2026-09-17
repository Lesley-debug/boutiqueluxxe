import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import Reveal from "./Reveal";
import { Container, Eyebrow } from "./ui";

export default function NewsletterSection() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        recentlySuccessful,
        reset,
    } = useForm({ email: "" });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/newsletter", { preserveScroll: true, onSuccess: () => reset() });
    }

    return (
        <section className="bg-white py-28 text-center">
            <Container>
                <Reveal>
                    <Eyebrow>Newsletter</Eyebrow>
                    <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                        Enter the world of Designer Bags Boutique.
                    </h2>
                    <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#252525]/60">
                        Be the first to discover new arrivals, exclusive edits,
                        and special offers.
                    </p>

                    <form
                        onSubmit={submit}
                        className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="Your email address"
                            className="flex-1 rounded-full border border-[#171310]/15 bg-transparent px-5 py-3.5 text-sm focus:border-[#9C7A3C] focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full bg-[#171310] px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#9C7A3C] disabled:opacity-50"
                        >
                            Join
                        </button>
                    </form>
                    {errors.email && (
                        <p className="mt-3 text-xs text-red-600">
                            {errors.email}
                        </p>
                    )}
                    {recentlySuccessful && (
                        <p className="mt-3 text-xs text-green-700">
                            Thank you — you're on the list.
                        </p>
                    )}
                </Reveal>
            </Container>
        </section>
    );
}
