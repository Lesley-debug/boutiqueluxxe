import { ReactNode } from "react";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";

export default function StoreLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F8F5EF]">
            <StoreHeader />
            {children}
            <StoreFooter />
        </div>
    );
}
