"""
Professional PDF Invoice Generator for FixUrDevice.
Generates compliant, print-ready, customer-facing PDF invoices.
CRITICAL: Never includes internal costs, profit margins, or internal notes.
"""
import io
import os
from decimal import Decimal
from django.conf import settings
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
)


def generate_invoice_pdf(invoice):
    """
    Generates a PDF binary stream for the given Invoice instance.
    Returns bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "InvoiceTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1e1b4b"),
        fontName="Helvetica-Bold",
    )
    company_style = ParagraphStyle(
        "CompanyInfo",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569"),
    )
    header_right_style = ParagraphStyle(
        "HeaderRight",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=12,
        alignment=2,  # Right-aligned
        textColor=colors.HexColor("#334155"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1e293b"),
        fontName="Helvetica-Bold",
    )
    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
        fontName="Helvetica-Bold",
    )
    meta_val_style = ParagraphStyle(
        "MetaValue",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
    )
    body_bold = ParagraphStyle(
        "BodyBold",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0f172a"),
        fontName="Helvetica-Bold",
    )
    body_style = ParagraphStyle(
        "BodyNormal",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )
    table_head = ParagraphStyle(
        "TableHead",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.white,
        fontName="Helvetica-Bold",
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1e293b"),
    )
    table_cell_right = ParagraphStyle(
        "TableCellRight",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        alignment=2,
        textColor=colors.HexColor("#1e293b"),
    )
    terms_style = ParagraphStyle(
        "TermsText",
        parent=styles["Normal"],
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#64748b"),
    )

    story = []

    # ─── HEADER: Logo & Company Information ────────────────────────────────────
    logo_path = os.path.join(settings.BASE_DIR, "static", "logo.png")
    logo_flowable = None
    if os.path.exists(logo_path):
        try:
            logo_flowable = Image(logo_path, width=2.0 * inch, height=0.65 * inch)
        except Exception:
            logo_flowable = Paragraph("<b>FixUrDevice</b>", title_style)
    else:
        logo_flowable = Paragraph("<b>FixUrDevice</b>", title_style)

    company_text = (
        "<b>FixUrDevice Apple & Device Service</b><br/>"
        "#159, 1st Floor, 32nd E Cross Rd, Opp. Sanjay Gandhi Hospital<br/>"
        "4th T Block East, Tilak Nagar, Jayanagar, Bengaluru - 560041<br/>"
        "Phone: +91 93435 84460 | Email: support@fixurdevice.in | Web: www.fixurdevice.in"
    )

    header_table = Table(
        [
            [logo_flowable, Paragraph(company_text, header_right_style)],
        ],
        colWidths=[2.5 * inch, 4.8 * inch],
    )
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#6366f1"), spaceAfter=14))

    # ─── INVOICE BANNER: Title & Key Metadata ──────────────────────────────────
    repair_order = getattr(invoice, "repair_order", None)
    customer = invoice.customer

    booking_id = repair_order.order_number if repair_order else "N/A"
    lead_ref = repair_order.lead.reference if (repair_order and repair_order.lead) else (invoice.lead.reference if invoice.lead else "N/A")
    issue_date = invoice.issued_at.strftime("%d %b %Y") if invoice.issued_at else "Today"

    status_color = "#166534" if invoice.status == "paid" else "#92400e"
    status_bg = "#dcfce7" if invoice.status == "paid" else "#fef3c7"
    status_label = "PAID" if invoice.status == "paid" else invoice.get_status_display().upper()

    banner_table = Table(
        [
            [
                Paragraph("<b>TAX INVOICE</b>", title_style),
                Paragraph(
                    f"<b>Invoice #:</b> {invoice.invoice_number}<br/>"
                    f"<b>Date:</b> {issue_date}<br/>"
                    f"<b>Booking ID:</b> {booking_id}<br/>"
                    f"<b>Lead Reference:</b> {lead_ref}<br/>"
                    f"<b>Status:</b> <font color='{status_color}'><b>{status_label}</b></font>",
                    header_right_style,
                ),
            ]
        ],
        colWidths=[3.5 * inch, 3.8 * inch],
    )
    banner_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # ─── BILL TO & SERVICE DETAILS ─────────────────────────────────────────────
    device_name = invoice.device_details or (
        (repair_order.device_model_text or f"{repair_order.device_brand} {repair_order.device_model}".strip())
        if repair_order else "Device"
    )
    reported_prob = invoice.reported_issue or (
        repair_order.intake_condition if repair_order else "General Service"
    )
    confirmed_work = invoice.confirmed_issue or invoice.work_performed or (
        repair_order.confirmed_issue or repair_order.work_performed or repair_order.diagnosis if repair_order else "Diagnostic & Repair Service"
    )
    tech_name = invoice.technician_name or (
        repair_order.assigned_technician.full_name if (repair_order and repair_order.assigned_technician) else "FixUrDevice Certified Engineer"
    )

    cust_address = (
        customer.address if customer and hasattr(customer, "address") and customer.address else
        (repair_order.lead.pickup_address if (repair_order and repair_order.lead and repair_order.lead.pickup_address) else "Bangalore, Karnataka")
    )

    bill_to_html = (
        f"<b>{customer.full_name}</b><br/>"
        f"Phone: {customer.phone}<br/>"
        f"Email: {customer.email or 'N/A'}<br/>"
        f"Service Address: {cust_address}"
    )

    service_info_html = (
        f"<b>Device:</b> {device_name}<br/>"
        f"<b>Reported Problem:</b> {reported_prob}<br/>"
        f"<b>Diagnosis & Work Done:</b> {confirmed_work}<br/>"
        f"<b>Technician:</b> {tech_name}"
    )

    details_table = Table(
        [
            [Paragraph("<b>CUSTOMER DETAILS (BILLED TO)</b>", meta_label_style), Paragraph("<b>SERVICE & DEVICE DETAILS</b>", meta_label_style)],
            [Paragraph(bill_to_html, body_style), Paragraph(service_info_html, body_style)],
        ],
        colWidths=[3.65 * inch, 3.65 * inch],
    )
    details_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 14))

    # ─── LINE ITEMS & CHARGES BREAKDOWN ─────────────────────────────────────────
    # Strictly customer-facing charges (Product Price + Service Charge = Total)
    # ZERO internal profit or cost shown!
    product_price = invoice.product_price or (repair_order.product_price if repair_order else Decimal("0.00"))
    service_charge = invoice.service_charges or (repair_order.service_charges if repair_order else Decimal("0.00"))
    total_billed = invoice.final_billed_amount or (product_price + service_charge)

    line_items = [
        [
            Paragraph("Item / Description", table_head),
            Paragraph("Category", table_head),
            Paragraph("Amount (INR)", table_head),
        ]
    ]

    item_index = 1
    if product_price > 0 and service_charge > 0:
        part_desc = getattr(repair_order, "part_name", "") or getattr(repair_order, "parts_used_notes", "") or "Genuine OEM / Compatible Replacement Part"
        line_items.append([
            Paragraph(f"<b>{part_desc}</b><br/><font color='#64748b' size='7.5'>Device: {device_name}</font>", table_cell),
            Paragraph("Replacement Hardware", table_cell),
            Paragraph(f"₹{product_price:,.2f}", table_cell_right),
        ])
        item_index += 1
        serv_desc = confirmed_work if confirmed_work else "Comprehensive Diagnostic, Repair & QC Service"
        line_items.append([
            Paragraph(f"<b>{serv_desc}</b><br/><font color='#64748b' size='7.5'>Handled by {tech_name}</font>", table_cell),
            Paragraph("Professional Labor & Service", table_cell),
            Paragraph(f"₹{service_charge:,.2f}", table_cell_right),
        ])
    else:
        part_desc = getattr(repair_order, "part_name", "") or getattr(repair_order, "parts_used_notes", "")
        desc = f"Device Repair & Replacement ({part_desc})" if part_desc else (confirmed_work or "Comprehensive Device Repair & Service")
        line_items.append([
            Paragraph(f"<b>{desc}</b><br/><font color='#64748b' size='7.5'>Device: {device_name} • Technician: {tech_name}</font>", table_cell),
            Paragraph("Repair & Replacement", table_cell),
            Paragraph(f"₹{total_billed:,.2f}", table_cell_right),
        ])

    items_table = Table(line_items, colWidths=[4.2 * inch, 1.8 * inch, 1.3 * inch])
    items_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 1), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor("#cbd5e1")),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 8))

    # ─── TOTALS & SUMMARY ──────────────────────────────────────────────────────
    subtotal = product_price + service_charge
    tax_amount = invoice.tax_amount or Decimal("0.00")
    amount_paid = invoice.amount_paid or (total_billed if invoice.status == "paid" else Decimal("0.00"))
    balance_due = invoice.outstanding_balance if invoice.outstanding_balance is not None else (total_billed - amount_paid)

    totals_data = [
        ["", Paragraph("<b>Subtotal:</b>", table_cell_right), Paragraph(f"₹{subtotal:,.2f}", table_cell_right)],
    ]
    if tax_amount > 0:
        totals_data.append([
            "", Paragraph(f"<b>GST / Taxes ({invoice.tax_rate}%):</b>", table_cell_right), Paragraph(f"₹{tax_amount:,.2f}", table_cell_right)
        ])
    totals_data.append([
        "", Paragraph("<font size='10.5'><b>Total Amount Payable:</b></font>", table_cell_right), Paragraph(f"<font size='10.5' color='#1e1b4b'><b>₹{total_billed:,.2f}</b></font>", table_cell_right)
    ])
    totals_data.append([
        "", Paragraph("<b>Amount Received:</b>", table_cell_right), Paragraph(f"<font color='#166534'><b>₹{amount_paid:,.2f}</b></font>", table_cell_right)
    ])
    if balance_due > 0:
        totals_data.append([
            "", Paragraph("<b>Balance Due:</b>", table_cell_right), Paragraph(f"<font color='#991b1b'><b>₹{balance_due:,.2f}</b></font>", table_cell_right)
        ])

    totals_table = Table(totals_data, colWidths=[4.2 * inch, 1.8 * inch, 1.3 * inch])
    totals_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (1, -3), (2, -3), 1, colors.HexColor("#6366f1")),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 14))

    # ─── TERMS & WARRANTY POLICY ───────────────────────────────────────────────
    warranty_notes = invoice.notes or "90 Days Service & Replacement Warranty on Replaced Components."
    terms_html = (
        "<b>Terms & Conditions:</b><br/>"
        f"1. <b>Warranty:</b> {warranty_notes}<br/>"
        "2. Warranty strictly excludes physical breakage, accidental impact, liquid ingress, or tampering by unauthorized third parties.<br/>"
        "3. All replacement parts have been tested under manufacturer quality benchmarks prior to final delivery.<br/>"
        "4. Invoices once issued can be verified online at www.fixurdevice.in using your unique Booking Reference."
    )

    terms_box = Table(
        [[Paragraph(terms_html, terms_style)]],
        colWidths=[7.3 * inch],
    )
    terms_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(terms_box)
    story.append(Spacer(1, 16))

    # ─── FOOTER SIGNATURE & ACKNOWLEDGEMENT ────────────────────────────────────
    footer_table = Table(
        [
            [
                Paragraph("<font color='#64748b'>Thank you for trusting <b>FixUrDevice</b> with your repair!</font>", body_style),
                Paragraph("<b>For FixUrDevice (Levlox Technologies)</b><br/><br/><i>Authorized Signatory</i>", header_right_style),
            ]
        ],
        colWidths=[4.5 * inch, 2.8 * inch],
    )
    footer_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
    ]))
    story.append(footer_table)

    # Build document
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
