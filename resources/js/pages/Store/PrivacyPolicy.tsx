import LegalPage from "@/components/Store/LegalPage";

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="5 October 2026"
      intro="This policy explains the information Boutique Luxxe uses to operate the store, manage reservations, protect customers, and provide support."
      sections={[
        {
          title: "Information we collect",
          paragraphs: [
            "We collect information you provide, such as your name, email address, phone number, delivery address, account details, reservation notes, and newsletter preferences.",
            "We also receive technical information required for security and operation, including session identifiers, IP address, browser information, and request logs.",
          ],
        },
        {
          title: "How we use information",
          paragraphs: [
            "We use information to manage carts, create and discuss order reservations, provide account features, communicate with you, prevent abuse, and improve the reliability of our services.",
          ],
        },
        {
          title: "Essential cookies",
          paragraphs: [
            "The store uses essential cookies for sessions, security, authentication, carts, and form protection. These cookies are necessary for the service to function.",
            "Smartsupp live chat loads automatically on eligible public store pages. It may use cookies or browser storage and process technical visitor information before you open the chat bubble. Any additional tracking or session-recording features require a separate review before activation.",
          ],
        },

        {
          title: "Optional live chat — Smartsupp",
          paragraphs: [
            "When an eligible public store page loads, Smartsupp may process your IP address, browser/device information, public-page information, chat identifiers, and messages or contact details you voluntarily send. Smartsupp processes this information to provide the support service. Its privacy information is available at https://help.smartsupp.com/en/articles/12647743-privacy-policy.",
            "There is no separate store chat-enable or chat-preferences panel. Closing the chat bubble does not stop the provider script or remove its cookies. You can use browser controls to block the service or clear stored cookies; our contact form is an alternative. Contact info@boutiqueluxxe.com for privacy questions or applicable deletion requests. Removing browser cookies does not automatically delete messages already held by the provider.",
            "We do not automatically send your account name, email, order details or payment information to the chat service. Live chat is excluded from admin, account, login, cart, checkout, and order-confirmation pages. When chat is already loaded, moving to excluded pages uses a full page reload to stop that script. Our contact form remains available without enabling live chat.",
          ],
        },
        {
          title: "Sharing",
          paragraphs: [
            "We share only what is necessary with service providers supporting hosting, email communications, security, delivery coordination, and optional live chat through Smartsupp. Payment is discussed directly with our team; the website does not currently process card details. We do not sell personal information.",
          ],
        },
        {
          title: "Retention and security",
          paragraphs: [
            "We retain records for operational, legal, fraud-prevention, and accounting needs. We use access controls, encrypted transport, secure cookies, and other reasonable safeguards, but no online service is risk-free.",
          ],
        },
        {
          title: "Your choices",
          paragraphs: [
            "You may request access, correction, or deletion of eligible personal information and may unsubscribe from marketing communications at any time by contacting info@boutiqueluxxe.com.",
          ],
        },
        {
          title: "International customers",
          paragraphs: [
            "Information may be processed in countries other than your own. We take reasonable steps to protect it in accordance with applicable obligations.",
          ],
        },
        {
          title: "Policy updates",
          paragraphs: [
            "We may revise this policy as the store changes. The updated date above shows the latest published version.",
          ],
        },
      ]}
    />
  );
}
