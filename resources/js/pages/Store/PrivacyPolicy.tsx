import LegalPage from "@/components/Store/LegalPage";

export default function PrivacyPolicy() {
    return <LegalPage title="Privacy Policy" updated="24 September 2026" intro="This policy explains the information Boutique Luxxe uses to operate the store, fulfill orders, protect customers, and provide support." sections={[
        { title: "Information we collect", paragraphs: ["We collect information you provide, such as your name, email address, phone number, delivery address, account details, order notes, and newsletter preferences.", "We also receive technical information needed for security and operation, including session identifiers, IP address, browser information, and request logs."] },
        { title: "How we use information", paragraphs: ["We use information to manage carts, process and deliver orders, communicate payment instructions, provide account features, prevent abuse, and improve our services."] },
        { title: "Sharing", paragraphs: ["We share only what is necessary with service providers that support hosting, communications, payments, delivery, security, and analytics. We do not sell personal information."] },
        { title: "Retention and security", paragraphs: ["We retain records for operational, legal, fraud-prevention, and accounting needs. We use access controls, encrypted transport, secure cookies, and other reasonable safeguards, but no online service is risk-free."] },
        { title: "Your choices", paragraphs: ["You may request access, correction, or deletion of eligible personal information and may unsubscribe from marketing communications at any time."] },
        { title: "International customers", paragraphs: ["Information may be processed in countries other than your own. We take reasonable steps to protect it in accordance with applicable obligations."] },
        { title: "Policy updates", paragraphs: ["We may revise this policy as the store changes. The updated date above shows the latest published version."] },
    ]} />;
}
