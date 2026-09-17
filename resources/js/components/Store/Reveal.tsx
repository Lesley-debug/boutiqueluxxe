import { ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

export default function Reveal({
    children,
    delay = 0,
}: {
    children: ReactNode;
    delay?: number;
}) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={inView ? "reveal-visible" : "opacity-0"}
            style={inView ? { animationDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    );
}
