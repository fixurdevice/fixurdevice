"use client";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  Shield,
  Clock,
  Loader2,
  AlertCircle,
  Truck,
} from "lucide-react";

const deviceCategories = [
  "iPhone",
  "Android Phone",
  "MacBook / Laptop",
  "iPad / Tablet",
  "Smartwatch",
  "Other",
];

const deviceBrands: Record<string, string[]> = {
  "iPhone": ["Apple"],
  "Android Phone": [
    "Samsung",
    "OnePlus",
    "Google Pixel",
    "Xiaomi / Redmi / POCO",
    "Vivo",
    "OPPO",
    "Realme",
    "Motorola",
    "Nothing",
    "Other",
  ],
  "MacBook / Laptop": [
    "Apple (MacBook)",
    "Dell",
    "HP",
    "Lenovo",
    "ASUS",
    "Acer",
    "Other",
  ],
  "iPad / Tablet": [
    "Apple (iPad)",
    "Samsung (Galaxy Tab)",
    "Lenovo",
    "Other",
  ],
  "Smartwatch": [
    "Apple (Watch)",
    "Samsung (Galaxy Watch)",
    "Other",
  ],
  "Other": ["Other"],
};

const deviceModels: Record<string, string[]> = {
  "Apple": [
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 13 mini",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 12 mini",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone XS Max",
    "iPhone XS",
    "iPhone XR",
    "iPhone X",
    "iPhone SE (3rd Gen - 2022)",
    "iPhone SE (2nd Gen - 2020)",
    "iPhone 8 Plus",
    "iPhone 8",
    "iPhone 7 Plus",
    "iPhone 7",
    "Other iPhone Model (Type Manually)",
  ],
  "Samsung": [
    "Galaxy S24 Ultra",
    "Galaxy S24+ / S24",
    "Galaxy S23 Ultra",
    "Galaxy S23+ / S23",
    "Galaxy S23 FE",
    "Galaxy S22 Ultra",
    "Galaxy S22+ / S22",
    "Galaxy S21 Ultra / S21+",
    "Galaxy S21 / S21 FE",
    "Galaxy S20 FE / S20",
    "Galaxy Z Fold 6 / 5 / 4 / 3",
    "Galaxy Z Flip 6 / 5 / 4 / 3",
    "Galaxy Note 20 Ultra / Note 20",
    "Galaxy Note 10+ / Note 10",
    "Galaxy A55 / A54 5G",
    "Galaxy A35 / A34 5G",
    "Galaxy A25 / A15 / A14 5G",
    "Galaxy M54 / M53 / M34 5G",
    "Galaxy F54 / F34 5G",
    "Other Samsung Model (Type Manually)",
  ],
  "OnePlus": [
    "OnePlus 12",
    "OnePlus 12R",
    "OnePlus 11",
    "OnePlus 11R",
    "OnePlus 10 Pro",
    "OnePlus 10T",
    "OnePlus 10R",
    "OnePlus 9 Pro / 9",
    "OnePlus 9R / 9RT",
    "OnePlus 8 Pro / 8T / 8",
    "OnePlus 7 Pro / 7T / 7",
    "OnePlus Open (Foldable)",
    "OnePlus Nord 4",
    "OnePlus Nord 3",
    "OnePlus Nord CE 4 / CE 4 Lite",
    "OnePlus Nord CE 3 / CE 3 Lite",
    "OnePlus Nord CE 2 / CE 2 Lite",
    "Other OnePlus Model (Type Manually)",
  ],
  "Google Pixel": [
    "Pixel 9 Pro XL",
    "Pixel 9 Pro",
    "Pixel 9",
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 8a",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 7a",
    "Pixel 6 Pro",
    "Pixel 6",
    "Pixel 6a",
    "Pixel Fold",
    "Pixel 5 / 4a",
    "Other Pixel Model (Type Manually)",
  ],
  "Xiaomi / Redmi / POCO": [
    "Xiaomi 14 Ultra / 14",
    "Xiaomi 13 Pro / 12 Pro",
    "Xiaomi 11T Pro / 11X / 11 Lite",
    "Redmi Note 13 Pro+ / 13 Pro / 13",
    "Redmi Note 12 Pro+ / 12 Pro / 12",
    "Redmi Note 11 Pro / 11",
    "Redmi Note 10 Pro / 10",
    "Redmi 13C / 12 5G",
    "POCO X6 Pro / X6",
    "POCO X5 Pro / X4 Pro",
    "POCO F6 / F5 / F4",
    "POCO M6 Pro / M4 Pro",
    "Other Xiaomi / Redmi Model (Type Manually)",
  ],
  "Vivo": [
    "Vivo X100 Pro / X100",
    "Vivo X90 Pro / X90",
    "Vivo X80 Pro / X80",
    "Vivo V30 Pro / V30 / V30e",
    "Vivo V29 Pro / V29 / V29e",
    "Vivo V27 Pro / V27",
    "Vivo T3 5G / T3x",
    "Vivo T2 Pro / T2 5G",
    "Vivo Y200 / Y100 5G",
    "Other Vivo Model (Type Manually)",
  ],
  "OPPO": [
    "OPPO Find N3 Flip / N2 Flip",
    "OPPO Reno 12 Pro / Reno 12",
    "OPPO Reno 11 Pro / Reno 11",
    "OPPO Reno 10 Pro+ / 10 Pro / 10",
    "OPPO Reno 8 Pro / 8",
    "OPPO F27 Pro+ 5G",
    "OPPO F25 Pro / F23 5G",
    "OPPO A79 / A78 / A59 5G",
    "Other OPPO Model (Type Manually)",
  ],
  "Realme": [
    "Realme GT 6 / GT 6T",
    "Realme GT 2 Pro / GT Neo 3",
    "Realme 13 Pro+ / 13 Pro",
    "Realme 12 Pro+ / 12 Pro / 12 5G",
    "Realme 11 Pro+ / 11 Pro",
    "Realme 10 Pro+ / 10 Pro",
    "Realme Narzo 70 Pro / Narzo 70",
    "Realme Narzo 60 Pro / Narzo 60",
    "Realme C67 / C65 / C55",
    "Other Realme Model (Type Manually)",
  ],
  "Motorola": [
    "Moto Razr 50 Ultra / Razr 40",
    "Moto Edge 50 Ultra / Edge 50 Pro / Edge 50 Fusion",
    "Moto Edge 40 Neo / Edge 40",
    "Moto Edge 30 Fusion / Edge 30 Pro",
    "Moto G85 5G / G64 5G",
    "Moto G54 5G / G34 5G",
    "Other Motorola Model (Type Manually)",
  ],
  "Nothing": [
    "Nothing Phone (2a) Plus",
    "Nothing Phone (2a)",
    "Nothing Phone (2)",
    "Nothing Phone (1)",
    "CMF Phone 1",
    "Other Nothing Model (Type Manually)",
  ],
  "Apple (MacBook)": [
    "MacBook Air 13\" (M3, 2024)",
    "MacBook Air 15\" (M3, 2024)",
    "MacBook Air 13\" (M2, 2022)",
    "MacBook Air 15\" (M2, 2023)",
    "MacBook Air 13\" (M1, 2020)",
    "MacBook Air 13\" (Intel Retina, 2018–2020)",
    "MacBook Pro 14\" (M3 / M3 Pro / M3 Max, 2023)",
    "MacBook Pro 16\" (M3 Pro / M3 Max, 2023)",
    "MacBook Pro 14\" (M2 Pro / M2 Max, 2023)",
    "MacBook Pro 16\" (M2 Pro / M2 Max, 2023)",
    "MacBook Pro 13\" (M2, 2022)",
    "MacBook Pro 14\" (M1 Pro / M1 Max, 2021)",
    "MacBook Pro 16\" (M1 Pro / M1 Max, 2021)",
    "MacBook Pro 13\" (M1, 2020)",
    "MacBook Pro 16\" (Intel, 2019)",
    "MacBook Pro 15\" (Intel Touch Bar, 2016–2019)",
    "MacBook Pro 13\" (Intel Touch Bar, 2016–2020)",
    "Mac mini (M2 / M1)",
    "iMac 24\" (M3 / M1)",
    "Other MacBook / Mac Model (Type Manually)",
  ],
  "Apple (iPad)": [
    "iPad Pro 13\" (M4, 2024)",
    "iPad Pro 11\" (M4, 2024)",
    "iPad Pro 12.9\" (6th Gen M2 / 5th Gen M1)",
    "iPad Pro 11\" (4th Gen M2 / 3rd Gen M1)",
    "iPad Air 13\" (M2, 2024)",
    "iPad Air 11\" (M2, 2024)",
    "iPad Air 5 (M1, 2022)",
    "iPad Air 4 (2020)",
    "iPad 10th Gen (10.9\", 2022)",
    "iPad 9th Gen (10.2\", 2021)",
    "iPad mini 6 (8.3\", 2021)",
    "iPad mini 5 (2019)",
    "Other iPad Model (Type Manually)",
  ],
  "Dell": [
    "Dell XPS 13 / 15 / 17",
    "Dell Inspiron 14 / 15 / 16",
    "Dell Latitude (Corporate Series)",
    "Dell Vostro Series",
    "Dell Alienware Gaming (m15 / m16 / x14)",
    "Dell G15 / G16 Gaming Laptop",
    "Other Dell Laptop Model (Type Manually)",
  ],
  "HP": [
    "HP Spectre x360 14 / 16",
    "HP Envy x360 13 / 15",
    "HP Pavilion 14 / 15 / Aero",
    "HP OMEN Gaming 16 / 17",
    "HP Victus Gaming 15 / 16",
    "HP EliteBook / ProBook",
    "Other HP Laptop Model (Type Manually)",
  ],
  "Lenovo": [
    "Lenovo ThinkPad X1 Carbon / T14 / E14",
    "Lenovo Yoga 9i / Yoga Slim 7 / 6",
    "Lenovo IdeaPad Slim 5 / 3 / Gaming",
    "Lenovo Legion 5 / 7 / Pro Series",
    "Lenovo LOQ Gaming Laptop",
    "Lenovo Tab P12 / P11 Pro / M10",
    "Other Lenovo Model (Type Manually)",
  ],
  "ASUS": [
    "ASUS ROG Zephyrus G14 / G16",
    "ASUS ROG Strix SCAR 16 / 18",
    "ASUS TUF Gaming F15 / A15",
    "ASUS ZenBook 14 / Duo / S 13 OLED",
    "ASUS VivoBook 15 / 16 / Pro OLED",
    "Other ASUS Laptop Model (Type Manually)",
  ],
  "Acer": [
    "Acer Predator Helios 16 / Neo 16",
    "Acer Nitro 5 / Nitro V 15",
    "Acer Swift Go 14 / Swift X",
    "Acer Aspire 5 / 7 / Lite",
    "Other Acer Laptop Model (Type Manually)",
  ],
  "Samsung (Galaxy Tab)": [
    "Galaxy Tab S9 Ultra / S9+ / S9",
    "Galaxy Tab S9 FE+ / S9 FE",
    "Galaxy Tab S8 Ultra / S8+ / S8",
    "Galaxy Tab S7 FE / S7+",
    "Galaxy Tab A9+ / A9",
    "Galaxy Tab A8 / A7 Lite",
    "Other Samsung Tab Model (Type Manually)",
  ],
  "Apple (Watch)": [
    "Apple Watch Ultra 2 / Ultra",
    "Apple Watch Series 10 (46mm / 42mm)",
    "Apple Watch Series 9 (45mm / 41mm)",
    "Apple Watch Series 8 (45mm / 41mm)",
    "Apple Watch Series 7 (45mm / 41mm)",
    "Apple Watch SE (2nd Gen - 2022)",
    "Apple Watch SE (1st Gen - 2020)",
    "Apple Watch Series 6 / 5 / 4 / 3",
    "Other Apple Watch Model (Type Manually)",
  ],
  "Samsung (Galaxy Watch)": [
    "Galaxy Watch Ultra",
    "Galaxy Watch 7 (44mm / 40mm)",
    "Galaxy Watch 6 Classic / Watch 6",
    "Galaxy Watch 5 Pro / Watch 5",
    "Galaxy Watch 4 Classic / Watch 4",
    "Other Galaxy Watch Model (Type Manually)",
  ],
};

const issues = [
  "Screen Cracked / Broken",
  "Screen Not Displaying / Black Screen",
  "Battery Draining Fast",
  "Battery Swollen",
  "Not Charging",
  "Charging Port Damaged",
  "Water Damage",
  "Back Panel Broken",
  "Camera Not Working",
  "Speaker / Microphone Issue",
  "Face ID / Touch ID Not Working",
  "Device Not Turning On",
  "Software / System Issue",
  "Other",
];

const timeWindows = [
  { value: "morning", label: "Morning (9AM–12PM)" },
  { value: "afternoon", label: "Afternoon (12PM–4PM)" },
  { value: "evening", label: "Evening (4PM–8PM)" },
];

const contactPreferences = [
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

interface FormData {
  name: string;
  phone: string;
  email: string;
  device_category: string;
  device_brand: string;
  device_model: string;
  reported_problem: string;
  pickup_area: string;
  pickup_pincode: string;
  preferred_time_window: string;
  contact_preference: string;
  consent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function BookRepairPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    device_category: "",
    device_brand: "",
    device_model: "",
    reported_problem: "",
    pickup_area: "",
    pickup_pincode: "",
    preferred_time_window: "",
    contact_preference: "phone",
    consent: false,
  });

  const [customModel, setCustomModel] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [apiError, setApiError] = useState("");

  const availableBrands =
    form.device_category && deviceBrands[form.device_category]
      ? deviceBrands[form.device_category]
      : [];

  const availableModels =
    form.device_brand && deviceModels[form.device_brand]
      ? deviceModels[form.device_brand]
      : [];

  const isManualModel =
    form.device_brand === "Other" ||
    (form.device_model && form.device_model.includes("Type Manually")) ||
    (Boolean(form.device_brand) && availableModels.length === 0);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Please enter your name.";
    if (!form.phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }
    if (!form.device_category) newErrors.device_category = "Please select a device type.";
    if (!form.device_brand) newErrors.device_brand = "Please select a brand.";

    if (form.device_brand === "Other" || availableModels.length === 0) {
      if (!customModel.trim()) newErrors.device_model = "Please enter your device model.";
    } else {
      if (!form.device_model) {
        newErrors.device_model = "Please select your device model.";
      } else if (form.device_model.includes("Type Manually") && !customModel.trim()) {
        newErrors.custom_model = "Please specify your model name.";
      }
    }

    if (!form.reported_problem) newErrors.reported_problem = "Please describe the issue.";
    if (!form.pickup_area.trim() && !form.pickup_pincode.trim()) {
      newErrors.pickup_area = "Please enter your area or PIN code.";
    }
    if (!form.consent) newErrors.consent = "Please acknowledge the privacy notice.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setSubmitting(true);

    // Fire GTM event for form start
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "repair_form_submit_attempt" });
    }

    try {
      const resolvedModel = (
        isManualModel
          ? (customModel.trim() || form.device_model.replace(/\(Type Manually\)/i, "").trim())
          : form.device_model
      ).trim();

      const finalModelText = form.device_brand && form.device_brand !== "Other"
        ? (resolvedModel.toLowerCase().includes(form.device_brand.toLowerCase().split(" ")[0])
            ? resolvedModel
            : `${form.device_brand} ${resolvedModel}`.trim())
        : (resolvedModel || form.device_category);

      const payload = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || "",
        phone: form.phone,
        email: form.email || "",
        device_category: form.device_category,
        device_brand: form.device_brand,
        device_model_text: finalModelText,
        service_requested_text: form.reported_problem,
        reported_problem: form.reported_problem,
        pickup_area: form.pickup_area,
        pickup_pincode: form.pickup_pincode,
        preferred_time_window: form.preferred_time_window || "",
        preferred_contact_method: form.contact_preference,
        privacy_consent: form.consent,
        source: "website",
        utm_source: new URLSearchParams(window.location.search).get("utm_source") || "website",
        utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || "organic",
        utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
        gclid: new URLSearchParams(window.location.search).get("gclid") || "",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/enquiry/submit/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.errors?.reported_problem?.[0] || "Submission failed. Please try again.");
      }

      const data = await res.json();
      const ref = data.reference || `FUD-${Date.now().toString().slice(-6)}`;
      setReference(ref);
      setSubmitted(true);

      // Save to local leads cache for real-time CRM updates
      if (typeof window !== "undefined") {
        try {
          const newLead = {
            id: ref,
            customer: form.name,
            phone: form.phone,
            email: form.email,
            device: finalModelText,
            issue: form.reported_problem,
            area: form.pickup_area || "Bangalore",
            pincode: form.pickup_pincode,
            timeWindow: form.preferred_time_window,
            status: "new",
            priority: "high",
            assigned: "Unassigned",
            created: "Just now",
            source: "website",
          };
          const existing = JSON.parse(localStorage.getItem("crm_recent_leads") || "[]");
          localStorage.setItem("crm_recent_leads", JSON.stringify([newLead, ...existing]));
        } catch (e) {}
      }

      // Fire conversion event ONLY after confirmed lead save
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "repair_form_success",
          lead_reference: ref,
          device_category: form.device_category,
        });
      }
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (key: keyof FormData, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "device_category") {
        if (value === "iPhone") {
          updated.device_brand = "Apple";
        } else if (prev.device_category !== value) {
          updated.device_brand = "";
        }
        updated.device_model = "";
      } else if (key === "device_brand") {
        updated.device_model = "";
      }
      return updated;
    });

    if (key === "device_category" || key === "device_brand") {
      setCustomModel("");
    }

    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    if (errors.custom_model) setErrors((prev) => ({ ...prev, custom_model: "" }));

    // Fire GTM form start on first interaction
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: "repair_form_start" });
    }
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--gradient-hero)",
            padding: "3rem 1.5rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--border-radius-2xl)",
              padding: "3rem",
              maxWidth: 560,
              width: "100%",
              textAlign: "center",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--success-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <CheckCircle2 size={36} color="var(--success)" />
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.75rem",
                marginBottom: "0.75rem",
                color: "var(--brand-navy)",
              }}
            >
              Enquiry Received!
            </h1>
            <p style={{ color: "var(--gray-500)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Thank you for reaching out. Our team will review your enquiry and get back to you shortly.
            </p>
            <div
              style={{
                background: "var(--brand-lavender)",
                borderRadius: "var(--border-radius-lg)",
                padding: "1rem 1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "0.25rem" }}>
                Your Reference Number
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "var(--brand-purple)",
                  letterSpacing: "0.05em",
                }}
              >
                {reference}
              </div>
            </div>
            <ul style={{ textAlign: "left", marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                "Our team will contact you within a few hours to confirm details.",
                "We'll verify pickup availability for your area.",
                "You'll receive a clear quotation before any repair begins.",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.625rem",
                    fontSize: "0.9rem",
                    color: "var(--gray-600)",
                  }}
                >
                  <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" className="btn btn-primary" style={{ minWidth: 180, justifyContent: "center" }}>
                Back to Home <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {/* Header */}
        <section
          style={{
            background: "var(--gradient-hero)",
            padding: "4rem 0 3rem",
            textAlign: "center",
          }}
        >
          <div className="container">
            <div className="section-label" style={{ justifyContent: "center" }}>
              <Truck size={12} />
              Pickup &amp; Delivery Available
            </div>
            <h1 className="display-1" style={{ marginBottom: "1rem", maxWidth: 600, margin: "0 auto 1rem" }}>
              Request a Repair
            </h1>
            <p
              style={{
                color: "var(--gray-500)",
                fontSize: "1.0625rem",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Fill in the details below and we&apos;ll assess your device and send you a clear quotation. No upfront payment required.
            </p>
          </div>
        </section>

        <section style={{ padding: "3rem 0 5rem" }}>
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 360px",
                gap: "3rem",
                alignItems: "start",
              }}
              className="booking-grid"
            >
              {/* Form */}
              <div
                style={{
                  background: "white",
                  borderRadius: "var(--border-radius-2xl)",
                  padding: "2.5rem",
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "2rem", color: "var(--brand-navy)" }}>
                  Your Repair Enquiry
                </h2>

                {apiError && (
                  <div
                    style={{
                      background: "var(--error-light)",
                      border: "1px solid #fca5a5",
                      borderRadius: "var(--border-radius-lg)",
                      padding: "1rem",
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      color: "#991b1b",
                      fontSize: "0.9rem",
                    }}
                  >
                    <AlertCircle size={16} />
                    {apiError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }} className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="form-input"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        autoComplete="name"
                      />
                      {errors.name && <span className="form-error"><AlertCircle size={12} />{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">
                        Phone Number *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="form-input"
                        placeholder="10-digit mobile number"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                        autoComplete="tel"
                        maxLength={10}
                      />
                      {errors.phone && <span className="form-error"><AlertCircle size={12} />{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                    <label className="form-label" htmlFor="email">
                      Email Address <span style={{ color: "var(--gray-400)" }}>(optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      autoComplete="email"
                    />
                  </div>

                  <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}
                    className="form-row"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="device_category">
                        Device Type *
                      </label>
                      <select
                        id="device_category"
                        className="form-input form-select"
                        value={form.device_category}
                        onChange={(e) => updateForm("device_category", e.target.value)}
                      >
                        <option value="">Select device type</option>
                        {deviceCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.device_category && <span className="form-error"><AlertCircle size={12} />{errors.device_category}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="device_brand">
                        Brand *
                      </label>
                      <select
                        id="device_brand"
                        className="form-input form-select"
                        value={form.device_brand}
                        onChange={(e) => updateForm("device_brand", e.target.value)}
                        disabled={!form.device_category}
                      >
                        <option value="">Select brand</option>
                        {availableBrands.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      {errors.device_brand && <span className="form-error"><AlertCircle size={12} />{errors.device_brand}</span>}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                    <label className="form-label" htmlFor="device_model">
                      Device Model *
                    </label>
                    {availableModels.length > 0 && form.device_brand !== "Other" ? (
                      <select
                        id="device_model"
                        className="form-input form-select"
                        value={form.device_model}
                        onChange={(e) => {
                          updateForm("device_model", e.target.value);
                          if (!e.target.value.includes("Type Manually")) {
                            setCustomModel("");
                          }
                        }}
                        disabled={!form.device_brand}
                      >
                        <option value="">
                          {!form.device_brand
                            ? "Select brand first"
                            : `-- Select ${form.device_brand} model --`}
                        </option>
                        {availableModels.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="device_model"
                        type="text"
                        className="form-input"
                        placeholder={
                          form.device_brand
                            ? `e.g. ${form.device_brand} exact model`
                            : "Select device type & brand first"
                        }
                        value={customModel}
                        onChange={(e) => {
                          setCustomModel(e.target.value);
                          if (errors.device_model) {
                            setErrors((prev) => ({ ...prev, device_model: "" }));
                          }
                        }}
                        disabled={!form.device_brand}
                      />
                    )}
                    {errors.device_model && (
                      <span className="form-error">
                        <AlertCircle size={12} />
                        {errors.device_model}
                      </span>
                    )}

                    {/* Show manual input if user chooses 'Other ... (Type Manually)' */}
                    {form.device_model && form.device_model.includes("Type Manually") && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <label
                          className="form-label"
                          htmlFor="custom_model"
                          style={{ fontSize: "0.825rem", color: "var(--brand-blue)", fontWeight: 600 }}
                        >
                          Please specify your exact model name *
                        </label>
                        <input
                          id="custom_model"
                          type="text"
                          className="form-input"
                          placeholder="e.g. iPhone 16 Plus 256GB, Galaxy S21 FE 5G"
                          value={customModel}
                          onChange={(e) => {
                            setCustomModel(e.target.value);
                            if (errors.custom_model) {
                              setErrors((prev) => ({ ...prev, custom_model: "" }));
                            }
                          }}
                          autoFocus
                        />
                        {errors.custom_model && (
                          <span className="form-error">
                            <AlertCircle size={12} />
                            {errors.custom_model}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                    <label className="form-label" htmlFor="reported_problem">
                      What is the issue? *
                    </label>
                    <select
                      id="reported_problem"
                      className="form-input form-select"
                      value={form.reported_problem}
                      onChange={(e) => updateForm("reported_problem", e.target.value)}
                    >
                      <option value="">Select the primary issue</option>
                      {issues.map((issue) => (
                        <option key={issue} value={issue}>{issue}</option>
                      ))}
                    </select>
                    {errors.reported_problem && <span className="form-error"><AlertCircle size={12} />{errors.reported_problem}</span>}
                  </div>

                  <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}
                    className="form-row"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="pickup_area">
                        Your Area / Locality
                      </label>
                      <input
                        id="pickup_area"
                        type="text"
                        className="form-input"
                        placeholder="e.g. Koramangala, HSR Layout"
                        value={form.pickup_area}
                        onChange={(e) => updateForm("pickup_area", e.target.value)}
                      />
                      {errors.pickup_area && <span className="form-error"><AlertCircle size={12} />{errors.pickup_area}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="pickup_pincode">
                        PIN Code
                      </label>
                      <input
                        id="pickup_pincode"
                        type="text"
                        className="form-input"
                        placeholder="560034"
                        value={form.pickup_pincode}
                        onChange={(e) => updateForm("pickup_pincode", e.target.value)}
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}
                    className="form-row"
                  >
                    <div className="form-group">
                      <label className="form-label" htmlFor="preferred_time_window">
                        Preferred Pickup Time
                      </label>
                      <select
                        id="preferred_time_window"
                        className="form-input form-select"
                        value={form.preferred_time_window}
                        onChange={(e) => updateForm("preferred_time_window", e.target.value)}
                      >
                        <option value="">Any time</option>
                        {timeWindows.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact_preference">
                        Preferred Contact Method
                      </label>
                      <select
                        id="contact_preference"
                        className="form-input form-select"
                        value={form.contact_preference}
                        onChange={(e) => updateForm("contact_preference", e.target.value)}
                      >
                        {contactPreferences.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      marginBottom: "1.75rem",
                      padding: "1rem",
                      background: "var(--gray-50)",
                      borderRadius: "var(--border-radius-lg)",
                      border: errors.consent ? "1px solid var(--error)" : "1px solid var(--border-color)",
                    }}
                  >
                    <input
                      id="consent"
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => updateForm("consent", e.target.checked)}
                      style={{ marginTop: 3, accentColor: "var(--brand-purple)", width: 16, height: 16, flexShrink: 0 }}
                    />
                    <label htmlFor="consent" style={{ fontSize: "0.8125rem", color: "var(--gray-600)", lineHeight: 1.5, cursor: "pointer" }}>
                      I consent to FixUrDevice collecting and using the information I provide to process my repair enquiry. I have read the{" "}
                      <Link href="/privacy-policy" style={{ color: "var(--brand-purple)" }}>Privacy Policy</Link>.
                    </label>
                  </div>
                  {errors.consent && <span className="form-error" style={{ marginBottom: "1rem", display: "block" }}><AlertCircle size={12} />{errors.consent}</span>}

                  <button
                    type="submit"
                    id="book-repair-submit-btn"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "0.875rem", fontSize: "1rem" }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Repair Enquiry
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", textAlign: "center", marginTop: "0.875rem" }}>
                    No upfront payment. We'll contact you to confirm details before any service begins.
                  </p>
                </form>
              </div>

              {/* Sidebar Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div
                  style={{
                    background: "var(--brand-lavender)",
                    borderRadius: "var(--border-radius-xl)",
                    padding: "1.5rem",
                    border: "1px solid rgba(108,63,255,0.15)",
                  }}
                >
                  <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", color: "var(--brand-navy)" }}>
                    What Happens Next
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {[
                      { step: 1, label: "We receive your enquiry" },
                      { step: 2, label: "We confirm your pickup area" },
                      { step: 3, label: "Device collected from you" },
                      { step: 4, label: "Diagnosis & quotation sent" },
                      { step: 5, label: "Repair on your approval" },
                      { step: 6, label: "Device delivered back" },
                    ].map((item) => (
                      <div key={item.step} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--brand-purple)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {item.step}
                        </div>
                        <span style={{ fontSize: "0.875rem", color: "var(--gray-700)", fontWeight: 500 }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: "white",
                    borderRadius: "var(--border-radius-xl)",
                    padding: "1.5rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h3 style={{ fontWeight: 700, marginBottom: "1rem", color: "var(--brand-navy)" }}>
                    Our Commitment
                  </h3>
                  {[
                    { icon: Shield, text: "Clear quotation before any chargeable work" },
                    { icon: Clock, text: "Status updates throughout the repair" },
                    { icon: CheckCircle2, text: "Quality check before device return" },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        marginBottom: "0.875rem",
                        fontSize: "0.875rem",
                        color: "var(--gray-600)",
                      }}
                    >
                      <Icon size={16} color="var(--brand-purple)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {text}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "var(--brand-navy)",
                    borderRadius: "var(--border-radius-xl)",
                    padding: "1.5rem",
                    color: "white",
                  }}
                >
                  <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>
                    Prefer to Talk?
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                    Reach out directly — our team is here to help.
                  </p>
                  <a
                    href="tel:9343584460"
                    id="booking-page-click-to-call"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.75rem 1.25rem",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "var(--border-radius-lg)",
                      color: "white",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      marginBottom: "0.75rem",
                      transition: "background 0.2s",
                    }}
                  >
                    <Phone size={16} />
                    Call: 93435 84460
                  </a>
                  <a
                    href="https://wa.me/919343584460"
                    id="booking-page-whatsapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.75rem 1.25rem",
                      background: "rgba(37,211,102,0.2)",
                      borderRadius: "var(--border-radius-lg)",
                      color: "#25d366",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      transition: "background 0.2s",
                    }}
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        @media (max-width: 1024px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
