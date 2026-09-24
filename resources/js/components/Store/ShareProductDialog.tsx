import { Check, Copy, Globe2, Link2, Mail, MessageCircle, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ShareProductDialogProps {
    open: boolean;
    onClose: () => void;
    productName: string;
    imageUrl?: string;
}

export default function ShareProductDialog({ open, onClose, productName, imageUrl }: ShareProductDialogProps) {
    const [copied, setCopied] = useState(false);
    const [productUrl, setProductUrl] = useState("");

    useEffect(() => {
        setProductUrl(window.location.href);
    }, []);

    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(productUrl);
        } catch {
            const input = document.createElement("textarea");
            input.value = productUrl;
            input.style.position = "fixed";
            input.style.opacity = "0";
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            input.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2200);
    }

    async function nativeShare() {
        if (navigator.share) {
            try {
                await navigator.share({ title: productName, text: `Discover ${productName} at Boutique Luxxe`, url: productUrl });
                return;
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
            }
        }
        await copyLink();
    }

    if (!open) return null;

    const text = encodeURIComponent(`Discover ${productName} at Boutique Luxxe`);
    const url = encodeURIComponent(productUrl);
    const web = "https:" + "//";
    const channels = [
        { label: "WhatsApp", href: `${web}wa.me/?text=${text}%20${url}`, icon: MessageCircle, color: "bg-[#25D366] text-white" },
        { label: "Facebook", href: `${web}www.facebook.com/sharer/sharer.php?u=${url}`, icon: Globe2, color: "bg-[#1877F2] text-white" },
        { label: "X", href: `${web}twitter.com/intent/tweet?text=${text}&url=${url}`, icon: X, color: "bg-black text-white" },
        { label: "Email", href: `mailto:?subject=${encodeURIComponent(productName)}&body=${text}%0A%0A${url}`, icon: Mail, color: "bg-[#F1ECE4] text-[#181512]" },
    ];

    return (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="share-product-title">
            <button type="button" className="absolute inset-0 bg-[#181512]/65 backdrop-blur-sm" onClick={onClose} aria-label="Close share dialog" />
            <div className="relative w-full overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">
                <div className="h-1 bg-gradient-to-r from-[#181512] via-[#D9BB82] to-[#181512]" />
                <div className="flex items-start justify-between border-b border-[#181512]/8 px-5 py-5 sm:px-7">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#9B7435]">Share this piece</p>
                        <h2 id="share-product-title" className="mt-1 font-serif text-2xl font-medium text-[#181512]">{productName}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F2EB] text-[#181512] transition hover:bg-[#181512] hover:text-white" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>

                <div className="p-5 sm:p-7">
                    <div className="flex gap-4 rounded-2xl bg-[#F8F5EF] p-3">
                        {imageUrl && <img src={imageUrl} alt="" className="h-20 w-16 rounded-xl object-cover" />}
                        <div className="min-w-0 self-center"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#9B7435]">Boutique Luxxe</p><p className="mt-1 line-clamp-2 font-serif text-lg text-[#181512]">{productName}</p></div>
                    </div>

                    <button type="button" onClick={nativeShare} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#181512] px-5 text-sm font-semibold text-white transition hover:bg-[#9B7435]"><Share2 className="h-4 w-4" /> Share from your device</button>

                    <p className="mb-3 mt-6 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6F6961]">Share with</p>
                    <div className="grid grid-cols-4 gap-2.5">
                        {channels.map(({ label, href, icon: Icon, color }) => (
                            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 flex-col items-center gap-2 rounded-xl border border-[#181512]/8 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}><Icon className="h-4 w-4" /></span>
                                <span className="truncate text-[10px] font-medium text-[#514C46]">{label}</span>
                            </a>
                        ))}
                    </div>

                    <p className="mb-3 mt-6 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6F6961]">Or copy product link</p>
                    <div className="flex items-center gap-2 rounded-xl border border-[#181512]/10 bg-[#FAF8F4] p-2 pl-3">
                        <Link2 className="h-4 w-4 flex-shrink-0 text-[#9B7435]" />
                        <span className="min-w-0 flex-1 truncate text-xs text-[#6F6961]">{productUrl}</span>
                        <button type="button" onClick={copyLink} className={`flex min-h-10 flex-shrink-0 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition ${copied ? "bg-emerald-600 text-white" : "bg-[#9B7435] text-white hover:bg-[#181512]"}`}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
