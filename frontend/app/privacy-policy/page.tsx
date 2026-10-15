import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FixUrDevice",
  description: "FixUrDevice Privacy Policy — how we collect, use, and protect your personal data when you use our device repair service in Bangalore.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <>
      <Header />
      <main>
        <section style={{ background: "var(--gray-50)", padding: "3rem 0 2rem" }}>
          <div className="container">
            <h1 className="display-2" style={{ marginBottom: "0.625rem" }}>Privacy Policy</h1>
            <p style={{ color: "var(--gray-500)" }}>Last updated: {lastUpdated}</p>
          </div>
        </section>

        <section style={{ padding: "3rem 0 5rem" }}>
          <div className="container">
            <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: "2rem" }}>
              {[
                {
                  title: "1. Who We Are",
                  content: `FixUrDevice is a device repair service operating in Bangalore, Karnataka, India. We provide repair services for mobile phones, tablets, and laptops, with pickup and delivery across eligible areas of Bangalore. In this policy, "we", "us", and "our" refers to FixUrDevice.`,
                },
                {
                  title: "2. Information We Collect",
                  content: `When you submit a repair enquiry or contact us, we collect: your name, phone number, email address (if provided), device information (category, brand, model), the reported issue, your pickup area and PIN code, and your preferred contact method. We may also collect technical information such as your IP address, browser type, and referral source when you use our website. If you arrive via a Google Ads campaign, we may collect UTM parameters and Google click identifiers (GCLID) to understand how you found us.`,
                },
                {
                  title: "3. How We Use Your Information",
                  content: `We use your information to: process your repair enquiry, confirm service availability in your area, schedule pickup and delivery, diagnose your device and prepare a quotation, communicate with you about your repair, send relevant service notifications, and comply with applicable legal obligations. We do not use your information for unsolicited marketing.`,
                },
                {
                  title: "4. Data We Do Not Collect",
                  content: `We do not ask for or store your device unlock codes, passwords, banking PINs, payment card numbers, or any credentials. If we need to verify hardware functionality after a repair, this is done with your knowledge. Our technicians do not access your personal files, messages, or accounts.`,
                },
                {
                  title: "5. Sharing Your Information",
                  content: `We do not sell your personal information. We may share your information with: staff members who need it to process your repair (limited to what each role requires), email service providers used to send notifications, and analytics services (in anonymised or aggregated form). We do not share your personal information with third parties for their own marketing purposes.`,
                },
                {
                  title: "6. Data Retention",
                  content: `We retain your repair and contact information for a period appropriate to our business operations and legal obligations. You may request deletion of your data by contacting us. Some records may be retained for legal, accounting, or audit purposes.`,
                },
                {
                  title: "7. Your Rights",
                  content: `You have the right to access the personal information we hold about you, request correction of inaccurate data, request deletion of your data (subject to legal retention requirements), and withdraw consent where applicable. To exercise these rights, contact us at fixurdevice.in@gmail.com.`,
                },
                {
                  title: "8. Cookies and Analytics",
                  content: `Our website may use cookies and analytics tools including Google Analytics 4 and Google Tag Manager to understand how visitors use our site. These tools may collect anonymised data about your visit. You can control cookies through your browser settings. We do not send personally identifiable information (such as your name, phone, or email) in analytics event data.`,
                },
                {
                  title: "9. Security",
                  content: `We implement appropriate technical and organisational measures to protect your personal data from unauthorised access, loss, or disclosure. Customer data in our CRM is accessible only to authorised staff with the permissions appropriate to their role.`,
                },
                {
                  title: "10. Contact",
                  content: `For any privacy-related questions or requests, contact us at: fixurdevice.in@gmail.com. We aim to respond within 5 working days.`,
                },
              ].map(({ title, content }) => (
                <div key={title}>
                  <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.75rem", color: "var(--brand-navy)" }}>{title}</h2>
                  <p style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem" }}>{content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
