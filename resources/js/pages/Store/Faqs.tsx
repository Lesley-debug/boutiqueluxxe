import { Head, Link } from "@inertiajs/react";
import { ChevronDown, Mail } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";

const FAQS = [
    ["Do I need an account to place an order?", "No. You can add products to your cart and complete checkout as a guest. Creating an account makes order history, saved addresses, and wishlists easier to manage."],
    ["How does payment work?", "Checkout creates a secure order reservation. Our team reviews availability and sends payment instructions to the email address supplied at checkout."],
    ["Do you deliver internationally?", "Yes. Boutique Luxxe serves local and international clients. Delivery timing, destination availability, duties, and any additional charges are confirmed before payment."],
    ["How do I know a piece is authentic?", "Each listing is reviewed before publication and includes the product details available to us. Contact our team if you need additional documentation or condition information before ordering."],
    ["Can I change or cancel my order?", "Contact us as soon as possible. A change may be possible before payment or dispatch, but cannot be guaranteed once fulfillment has started."],
    ["What is your return process?", "Return eligibility depends on the item, its condition, and the delivery destination. Contact us before sending anything back; returns require written authorization."],
    ["Why have I not received an order email?", "Check your spam folder and confirm the email address used at checkout. If it is still missing, contact us with your order number."],
];

export default function Faqs() {
    return (
        <StoreLayout showMobileHeader>
            <Head title="Frequently Asked Questions"><meta name="description" content="Answers about Boutique Luxxe ordering, payment, delivery, authenticity, and support." /></Head>
            <section className="border-b border-[#181512]/10 bg-white px-5 py-14 sm:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B7435]">Client care</p>
                    <h1 className="mt-3 font-serif text-4xl font-medium text-[#181512] sm:text-5xl">Frequently asked questions</h1>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#6F6961]">Clear answers before you choose, reserve, and receive your next piece.</p>
                </div>
            </section>
            <section className="mx-auto max-w-3xl space-y-3 px-5 py-12 sm:px-8 sm:py-16">
                {FAQS.map(([question, answer]) => (
                    <details key={question} className="group overflow-hidden rounded-xl border border-[#181512]/10 bg-white">
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-[#181512] marker:content-none">
                            <span>{question}</span><ChevronDown className="h-4 w-4 shrink-0 text-[#9B7435] transition group-open:rotate-180" />
                        </summary>
                        <p className="border-t border-[#181512]/8 px-5 py-4 text-sm leading-6 text-[#6F6961]">{answer}</p>
                    </details>
                ))}
                <div className="mt-10 rounded-xl bg-[#181512] p-6 text-white sm:flex sm:items-center sm:justify-between">
                    <div><p className="font-serif text-xl">Still need help?</p><p className="mt-1 text-sm text-white/60">Our team will respond within one business day.</p></div>
                    <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#D9BB82] px-5 text-sm font-semibold text-[#181512] sm:mt-0"><Mail className="h-4 w-4" /> Contact us</Link>
                </div>
            </section>
        </StoreLayout>
    );
}
