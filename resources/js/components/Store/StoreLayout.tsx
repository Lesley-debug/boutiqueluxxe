import { ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function StoreLayout({
    children,
    categories = [],
}: {
    children: ReactNode;
    categories?: Category[];
}) {
    return (
        <div className="min-h-screen bg-white">
            <StoreHeader categories={categories} />
            {children}
            <StoreFooter />
        </div>
    );
}
