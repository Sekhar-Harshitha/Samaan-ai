"""
report.py
PDF Audit Report Generator for SamaanAI Phase 6.
"""

from fpdf import FPDF
import datetime
import os
import tempfile

class AuditReportPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'AI FAIRNESS AUDIT REPORT', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')

def generate_audit_report(data: dict) -> str:
    """
    Generate a formatted AI Fairness Audit Report.
    Required sections:
    1. Model summary
    2. Dataset summary
    3. Fairness metrics
    4. Bias drivers
    5. Mitigation results
    6. Risk classification
    """
    pdf = AuditReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font('Arial', '', 11)

    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    pdf.cell(0, 10, f"Generated On: {current_time}", ln=True)
    pdf.ln(5)

    def add_section(title, content):
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, title, ln=True)
        pdf.set_font('Arial', '', 11)
        pdf.multi_cell(0, 8, str(content))
        pdf.ln(5)

    # 1. Model Summary
    add_section("1. Model Summary", data.get("model_summary", "Standard AI model analyzed for demographic fairness."))

    # 2. Dataset Summary
    add_section("2. Dataset Summary", data.get("dataset_description", "Demographic dataset containing features and sensitive attributes."))

    # 3. Fairness Metrics
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "3. Fairness Metrics", ln=True)
    pdf.set_font('Arial', '', 11)
    metrics = data.get("fairness_metrics", {})
    pdf.cell(0, 8, f"- Accuracy: {metrics.get('accuracy', 'N/A')}", ln=True)
    pdf.cell(0, 8, f"- Demographic Parity Difference: {metrics.get('dpd', 'N/A')}", ln=True)
    pdf.cell(0, 8, f"- Equal Opportunity Difference: {metrics.get('eod', 'N/A')}", ln=True)
    pdf.ln(5)

    # 4. Bias Drivers
    drivers = data.get("bias_drivers", [])
    add_section("4. Bias Drivers", ", ".join(drivers) if drivers else "No significant bias drivers identified.")

    # 5. Mitigation Results
    add_section("5. Mitigation Results", data.get("mitigation_results", "Baseline analysis performed (no mitigation applied)."))

    # 6. Risk Classification
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "6. Risk Classification", ln=True)
    pdf.set_font('Arial', '', 11)
    risk = data.get("risk_classification", "LOW")
    pdf.cell(0, 8, f"Assessed Risk Level: {risk}", ln=True)
    pdf.ln(10)

    # Compliance Overview
    compliance = data.get("compliance_status", {})
    if compliance:
        add_section("EU AI Act Compliance Overview", "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in compliance.items()]))

    # Final Score Highlight
    pdf.set_font('Arial', 'B', 14)
    final_score = data.get('final_fairness_score', 'N/A')
    pdf.cell(0, 15, f"FAIRNESS CERTIFICATION SCORE: {final_score}%", border=1, ln=True, align='C')

    temp_dir = tempfile.gettempdir()
    filepath = os.path.join(temp_dir, f"SamaanAI_Audit_Report_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf")
    pdf.output(filepath, 'F')
    return filepath

def generate_certificate_pdf(data: dict) -> str:
    """
    Generate a Samaan AI Fairness Compliance Certificate.
    """
    pdf = FPDF()
    pdf.add_page()
    
    # Border
    pdf.rect(5, 5, 200, 287)
    pdf.rect(8, 8, 194, 281)

    # Header
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(22, 163, 174) # Cyan-ish
    pdf.cell(0, 30, 'Samaan AI Fairness Compliance Certificate', ln=True, align='C')
    
    pdf.set_font('Arial', 'B', 16)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, 'AI Governance Certification Report', ln=True, align='C')
    pdf.ln(15)

    # Body
    pdf.set_font('Arial', '', 12)
    pdf.set_text_color(0, 0, 0)
    
    fields = [
        ("Model Fairness Score", f"{data.get('fairness_score', 'N/A')}%"),
        ("Bias Risk Level", data.get('bias_risk', 'N/A')),
        ("Dataset Compliance", data.get('dataset_bias', 'N/A')),
        ("Transparency Status", data.get('transparency', 'N/A')),
        ("Mitigation Status", data.get('mitigation', 'N/A')),
        ("Regulatory Alignment", data.get('eu_alignment', 'N/A'))
    ]

    for label, value in fields:
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(60, 12, f"{label}:", border='B')
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 12, f" {value}", ln=True, border='B')
        pdf.ln(5)

    pdf.ln(20)
    
    # Signature/Footer
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 10, "This certificate confirms that the analyzed model has been evaluated", ln=True, align='C')
    pdf.cell(0, 10, "using the Samaan AI Bias Lab governance protocols.", ln=True, align='C')
    
    pdf.ln(30)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 10, "Certified by Samaan AI Governance Engine", ln=True, align='C')
    
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    pdf.cell(0, 8, f"Timestamp: {current_time}", ln=True, align='C')
    
    import os
    cert_id = f"CERT-{datetime.datetime.now().strftime('%Y%m%d')}-{os.urandom(4).hex().upper()}"
    pdf.cell(0, 8, f"Unique Certificate ID: {cert_id}", ln=True, align='C')

    temp_dir = tempfile.gettempdir()
    filename = f"certificate_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    filepath = os.path.join(temp_dir, filename)
    pdf.output(filepath, 'F')
    
    return filepath
