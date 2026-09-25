import LegalPage from "@/components/Store/LegalPage";

export default function TermsOfService() {
    return <LegalPage title="Terms of Service" updated="24 September 2026" intro="These terms govern your use of Boutique Luxxe and purchases made through our store. Please read them before placing an order." sections={[
        { title: "Reservations and availability", paragraphs: ["Submitting checkout creates a reservation request. We may verify availability, pricing, and delivery details before accepting it.", "Our staff will contact you using the details supplied at checkout to discuss confirmation and the next steps."] },
        { title: "Pricing", paragraphs: ["Prices shown at checkout are recalculated by our server. Applicable duties, taxes, delivery charges, and destination fees may be discussed separately when required.", "Checkout does not collect payment information. Do not send sensitive financial information through the website or order notes."] },
        { title: "Delivery", paragraphs: ["Delivery timing varies by destination and begins after the reservation is confirmed. Customers are responsible for providing an accurate and complete delivery address."] },
        { title: "Authenticity and product details", paragraphs: ["We aim to describe each item accurately, including its condition and available variants. Display colors may vary by device."] },
        { title: "Cancellations and returns", paragraphs: ["Eligibility depends on the item, condition, and destination. Contact our concierge before returning any product. A return is not accepted until written authorization is provided."] },
        { title: "Acceptable use", paragraphs: ["You may not misuse the store, attempt unauthorized access, interfere with checkout, scrape protected data, or submit fraudulent orders."] },
        { title: "Changes", paragraphs: ["We may update these terms as our services change. The version displayed when you place an order applies to that transaction."] },
    ]} />;
}
