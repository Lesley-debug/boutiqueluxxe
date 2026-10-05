import LegalPage from "@/components/Store/LegalPage";

export default function CookiePolicy() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="5 October 2026"
      intro="This policy explains how Boutique Luxxe uses cookies and similar browser storage to provide a secure, functional shopping experience."
      sections={[
        {
          title: "Essential cookies",
          paragraphs: [
            "We use essential cookies to maintain your session, protect forms against forgery, keep your cart available, support authentication, and remember security-related state.",
            "These cookies are required for core website functions and cannot be disabled through a consent preference without making those functions unavailable.",
          ],
        },
        {
          title: "Analytics and advertising",
          paragraphs: [
            "We do not install advertising pixels through this chat integration. Smartsupp live chat loads automatically on eligible public store pages. It can use cookies or browser storage and collect technical visitor information before you open the chat bubble. Any additional analytics or session-recording features require a separate review before activation.",
          ],
        },
        {
          title: "Managing cookies",
          paragraphs: [
            "You can remove or block cookies using your browser settings. Blocking essential cookies may prevent login, cart, checkout, and security features from working correctly.",
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
          title: "Updates",
          paragraphs: [
            "We may update this policy when website functionality or service providers change. The date above identifies the current version.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            "Questions about cookies or privacy can be sent to info@boutiqueluxxe.com.",
          ],
        },
      ]}
    />
  );
}
