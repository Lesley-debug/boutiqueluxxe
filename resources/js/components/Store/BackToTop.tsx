import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const updateVisibility = () => setVisible(window.scrollY > 520);
        updateVisibility();
        window.addEventListener("scroll", updateVisibility, { passive: true });
        return () => window.removeEventListener("scroll", updateVisibility);
    }, []);

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            title="Back to top"
            className={`fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#D9BB82]/50 bg-[#181512] text-[#D9BB82] shadow-[0_12px_30px_-10px_rgba(24,21,18,.65)] transition duration-300 hover:-translate-y-1 hover:bg-[#9B7435] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#D9BB82] focus:ring-offset-2 lg:bottom-8 lg:right-8 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
        >
            <ArrowUp className="h-5 w-5" strokeWidth={1.8} />
        </button>
    );
}
