import LegalPage from "@/components/Store/LegalPage";

export default function PrivacyPolicy() {
    return <LegalPage title="Privacy Policy" updated="25 September 2026" intro="This policy explains the information Boutique Luxxe uses to operate the store, manage reservations, protect customers, and provide support." sections={[
        { title: "Information we collect", paragraphs: ["We collect information you provide, such as your name, email address, phone number, delivery address, account details, reservation notes, and newsletter preferences.", "We also receive technical information required for security and operation, including session identifiers, IP address, browser information, and request logs."] },
        { title: "How we use information", paragraphs: ["We use information to manage carts, create and discuss order reservations, provide account features, communicate with you, prevent abuse, and improve the reliability of our services."] },
        { title: "Essential cookies", paragraphs: ["The store uses essential cookies for sessions, security, authentication, carts, and form protection. These cookies are necessary for the service to function.", "Boutique Luxxe does not currently use advertising pixels or non-essential analytics cookies. If that changes, this policy and any required consent controls will be updated before those tools are enabled."] },
        { title: "Sharing", paragraphs: ["We share only what is necessary with service providers supporting hosting, email communications, security, and delivery coordination. Payment is discussed directly with our team; the website does not currently process card details. We do not sell personal information."] },
        { title: "Retention and security", paragraphs: ["We retain records for operational, legal, fraud-prevention, and accounting needs. We use access controls, encrypted transport, secure cookies, and other reasonable safeguards, but no online service is risk-free."] },
        { title: "Your choices", paragraphs: ["You may request access, correction, or deletion of eligible personal information and may unsubscribe from marketing communications at any time by contacting info@boutiqueluxxe.com."] },
        { title: "International customers", paragraphs: ["Information may be processed in countries other than your own. We take reasonable steps to protect it in accordance with applicable obligations."] },
        { title: "Policy updates", paragraphs: ["We may revise this policy as the store changes. The updated date above shows the latest published version."] },
    ]} />;
}
