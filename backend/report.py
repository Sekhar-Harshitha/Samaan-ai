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
        # Arial bold 15
        self.set_font('Arial', 'B', 15)
        # Move to the right
        self.cell(80)
        # Title
        self.cell(30, 10, 'SamaanAI Fairness Audit Report', 0, 0, 'C')
        # Line break
        self.ln(20)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        # Page number
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')

def generate_audit_report(data: dict) -> str:
    """
    Generate a PDF report from the provided data dictionary and return the path to the saved PDF file.
    Expected data structure:
    {
        "model_summary": str,
        "dataset_description": str,
        "bias_findings": str,
        "affected_groups": str,
        "fairness_metrics": { "accuracy": float, "dpd": float, "eod": float },
        "mitigation_results": str,
        "final_fairness_score": float
    }
    """
    pdf = AuditReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font('Arial', '', 11)

    # Date and Time
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    pdf.cell(0, 10, f"Generated On: {current_time}", ln=True)
    pdf.ln(5)

    def add_section(title, content):
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, title, ln=True)
        pdf.set_font('Arial', '', 11)
        pdf.multi_cell(0, 8, content)
        pdf.ln(5)

    # Content Sections
    add_section("1. Model Summary", data.get("model_summary", "Not provided"))
    add_section("2. Dataset Description", data.get("dataset_description", "Not provided"))
    add_section("3. Bias Findings", data.get("bias_findings", "Not provided"))
    add_section("4. Affected Demographic Groups", data.get("affected_groups", "Not provided"))

    # Metrics Layout
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "5. Fairness Metrics (Before Mitigation)", ln=True)
    pdf.set_font('Arial', '', 11)
    metrics = data.get("fairness_metrics", {})
    pdf.cell(0, 8, f"- Accuracy: {metrics.get('accuracy', 'N/A')}", ln=True)
    pdf.cell(0, 8, f"- Demographic Parity Difference (DPD): {metrics.get('dpd', 'N/A')}", ln=True)
    pdf.cell(0, 8, f"- Equal Opportunity Difference (EOD): {metrics.get('eod', 'N/A')}", ln=True)
    pdf.ln(5)

    add_section("6. Bias Mitigation Results", data.get("mitigation_results", "Not provided"))

    # Final Score Highlight
    pdf.set_font('Arial', 'B', 14)
    final_score = data.get('final_fairness_score', 'N/A')
    pdf.cell(0, 15, f"FINAL FAIRNESS SCORE: {final_score}", border=1, ln=True, align='C')

    # Save to a temporary file
    temp_dir = tempfile.gettempdir()
    filepath = os.path.join(temp_dir, f"SamaanAI_Audit_Report_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf")
    pdf.output(filepath, 'F')
    
    return filepath
