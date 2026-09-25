import LegalPage from "@/components/Store/LegalPage";

export default function CookiePolicy() {
    return <LegalPage title="Cookie Policy" updated="25 September 2026" intro="This policy explains how Boutique Luxxe uses cookies and similar browser storage to provide a secure, functional shopping experience." sections={[
        { title: "Essential cookies", paragraphs: ["We use essential cookies to maintain your session, protect forms against forgery, keep your cart available, support authentication, and remember security-related state.", "These cookies are required for core website functions and cannot be disabled through a consent preference without making those functions unavailable."] },
        { title: "Analytics and advertising", paragraphs: ["Boutique Luxxe does not currently use advertising pixels, cross-site tracking, or non-essential analytics cookies. A consent control will be introduced before any non-essential tracking technology is enabled."] },
        { title: "Managing cookies", paragraphs: ["You can remove or block cookies using your browser settings. Blocking essential cookies may prevent login, cart, checkout, and security features from working correctly."] },
        { title: "Updates", paragraphs: ["We may update this policy when website functionality or service providers change. The date above identifies the current version."] },
        { title: "Contact", paragraphs: ["Questions about cookies or privacy can be sent to info@boutiqueluxxe.com."] },
    ]} />;
}
