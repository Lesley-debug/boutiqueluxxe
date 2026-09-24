import { ReactNode } from "react";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";
import MobileTabBar from "./MobileTabBar";
import MobileStoreHeader from "./MobileStoreHeader";
import BackToTop from "./BackToTop";

export default function StoreLayout({
    children,
    noPadding = false,
    showMobileHeader = false,
}: {
    children: ReactNode;
    noPadding?: boolean;
    showMobileHeader?: boolean;
}) {
    return (
        <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#FAF8F4] text-[#181512]">
            <div className="sticky top-0 z-50 hidden w-full lg:block">
                <StoreHeader />
            </div>

            {showMobileHeader && (
                <div className="sticky top-0 z-50 w-full lg:hidden">
                    <MobileStoreHeader />
                </div>
            )}

            <main
                className={
                    noPadding
                        ? "w-full min-w-0 max-w-full overflow-x-clip"
                        : "w-full min-w-0 max-w-full overflow-x-clip pb-20 lg:pb-0"
                }
            >
                {children}
            </main>

            <StoreFooter />
            <MobileTabBar />
            <BackToTop />
        </div>
    );
}
