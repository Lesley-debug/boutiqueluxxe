import LegalPage from "@/components/Store/LegalPage";

export default function TermsOfService() {
    return <LegalPage title="Terms of Service" updated="24 September 2026" intro="These terms govern your use of Boutique Luxxe and purchases made through our store. Please read them before placing an order." sections={[
        { title: "Orders and availability", paragraphs: ["Submitting an order is a request to purchase. We may verify availability, pricing, delivery details, and payment information before accepting it.", "A reservation is not complete until Boutique Luxxe confirms the order and provides payment instructions."] },
        { title: "Pricing and payment", paragraphs: ["Prices shown at checkout are recalculated by our server. Applicable duties, taxes, bank charges, and destination fees may be communicated separately when required.", "Only use payment instructions sent through an official Boutique Luxxe channel."] },
        { title: "Delivery", paragraphs: ["Delivery timing varies by destination and begins after payment is confirmed. Customers are responsible for providing an accurate and complete delivery address."] },
        { title: "Authenticity and product details", paragraphs: ["We aim to describe each item accurately, including its condition and available variants. Display colors may vary by device."] },
        { title: "Cancellations and returns", paragraphs: ["Eligibility depends on the item, condition, and destination. Contact our concierge before returning any product. A return is not accepted until written authorization is provided."] },
        { title: "Acceptable use", paragraphs: ["You may not misuse the store, attempt unauthorized access, interfere with checkout, scrape protected data, or submit fraudulent orders."] },
        { title: "Changes", paragraphs: ["We may update these terms as our services change. The version displayed when you place an order applies to that transaction."] },
    ]} />;
}
