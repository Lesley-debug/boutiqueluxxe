import { ReactNode } from "react";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";
import MobileTabBar from "./MobileTabBar";

export default function StoreLayout({
    children,
    noPadding = false,
}: {
    children: ReactNode;
    noPadding?: boolean;
}) {
    return (
        <div className="min-h-screen bg-[#F8F5EF]">
            <div className="hidden lg:block">
                <StoreHeader />
            </div>
            <div className={noPadding ? "" : "pb-16 lg:pb-0"}>{children}</div>
            <div className="hidden lg:block">
                <StoreFooter />
            </div>
            <MobileTabBar />
        </div>
    );
}
