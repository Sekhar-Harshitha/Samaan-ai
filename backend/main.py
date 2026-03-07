"""
main.py
FastAPI entry point for SamaanAI Phase 2 bias analysis service.

Run with:
    uvicorn main:app --reload --port 8000
"""

import os
import tempfile
import shutil

import joblib
import pandas as pd
from typing import List
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from bias_analysis import compute_metrics
from explain import compute_explanation
from mitigation import compute_mitigation
from report import generate_audit_report, AuditReportPDF
from dataset_scanner import audit_dataset
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(
    title="SamaanAI Bias Analysis API",
    description="Upload a scikit-learn model (.pkl) and a dataset (.csv) to compute fairness metrics.",
    version="2.0.0",
)

# ── CORS (allow all origins so the Vite dev server can call us) ───────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReportData(BaseModel):
    model_summary: str
    dataset_description: str
    bias_findings: str
    affected_groups: str
    bias_drivers: List[str] = []
    fairness_metrics: dict
    mitigation_results: str
    compliance_status: dict = {}
    final_fairness_score: float

# Global store for latest analysis (demo purposes)
latest_analysis_store = {
    "metrics": None,
    "explanation": None,
    "compliance": None,
    "dataset_audit": None
}

@app.get("/health")
def health_check():
    """Quick liveness check."""
    return {"status": "online", "service": "SamaanAI Bias Analysis API v2.0"}


@app.post("/analyze")
async def analyze(
    model_file: UploadFile = File(..., description="Serialised scikit-learn model (.pkl)"),
    dataset_file: UploadFile = File(..., description="Dataset with features + target (.csv)"),
    sensitive_col: str = Form("gender", description="Column name of the sensitive/protected attribute"),
    target_col: str = Form("income", description="Column name of the binary target variable"),
):
    """
    Load the uploaded model and dataset, run predictions, and return fairness metrics.

    Returns:
        {
            "accuracy": float,
            "demographic_parity_difference": float,
            "equal_opportunity_difference": float
        }
    """
    # ── Validate file extensions ──────────────────────────────────────────────
    if not model_file.filename.endswith(".pkl"):
        raise HTTPException(
            status_code=400,
            detail=f"Model file must be a .pkl file. Got: {model_file.filename}",
        )
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail=f"Dataset must be a .csv file. Got: {dataset_file.filename}",
        )

    # ── Save uploads to temp directory ────────────────────────────────────────
    tmp_dir = tempfile.mkdtemp()
    try:
        model_path = os.path.join(tmp_dir, "model.pkl")
        dataset_path = os.path.join(tmp_dir, "dataset.csv")

        with open(model_path, "wb") as f:
            shutil.copyfileobj(model_file.file, f)
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)

        # ── Load model & dataset ──────────────────────────────────────────────
        try:
            model = joblib.load(model_path)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to load model: {str(e)}")

        try:
            df = pd.read_csv(dataset_path)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}")

        # ── Compute fairness metrics ──────────────────────────────────────────
        try:
            results = compute_metrics(
                model=model,
                df=df,
                target_col=target_col,
                sensitive_col=sensitive_col,
            )
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Bias analysis failed: {str(e)}",
            )

        # Store results for report generation
        latest_analysis_store["metrics"] = results
        latest_analysis_store["compliance"] = results.get("compliance")

        return results

    finally:
        # Clean up temp files regardless of outcome
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/compare_models")
async def compare_models(
    model_files: List[UploadFile] = File(..., description="Multiple serialized scikit-learn models (.pkl)"),
    dataset_file: UploadFile = File(..., description="Dataset with features + target (.csv)"),
    sensitive_col: str = Form("gender", description="Column name of the sensitive/protected attribute"),
    target_col: str = Form("income", description="Column name of the binary target variable"),
):
    """
    Compare multiple models on the same dataset.
    """
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")
    
    tmp_dir = tempfile.mkdtemp()
    try:
        dataset_path = os.path.join(tmp_dir, "dataset.csv")
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)
        
        try:
            df = pd.read_csv(dataset_path)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}")

        comparison_results = []

        for model_file in model_files:
            if not model_file.filename.endswith(".pkl"):
                continue
            
            model_path = os.path.join(tmp_dir, model_file.filename)
            with open(model_path, "wb") as f:
                shutil.copyfileobj(model_file.file, f)
            
            try:
                model = joblib.load(model_path)
                metrics = compute_metrics(
                    model=model,
                    df=df,
                    target_col=target_col,
                    sensitive_col=sensitive_col,
                )
                comparison_results.append({
                    "model": model_file.filename.replace(".pkl", ""),
                    "accuracy": metrics["accuracy"],
                    "dp_diff": metrics["demographic_parity_difference"],
                    "eo_diff": metrics["equal_opportunity_difference"],
                    "risk_score": metrics["risk_score"],
                    "bias_risk": metrics["bias_risk"],
                    "fairness_score": metrics["fairness_score"]
                })
            except Exception as e:
                print(f"Failed to process {model_file.filename}: {str(e)}")
                continue

        return {"models": comparison_results}

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/explain")
async def explain(
    model_file: UploadFile = File(..., description="Serialised scikit-learn model (.pkl)"),
    dataset_file: UploadFile = File(..., description="Dataset with features + target (.csv)"),
    sensitive_col: str = Form("gender", description="Column name of the sensitive/protected attribute"),
    target_col: str = Form("income", description="Column name of the binary target variable"),
):
    """
    Load the model and dataset, compute feature importance and bias drivers.

    Returns:
        {
            "top_features": [ {"feature": str, "importance": float} ],
            "bias_drivers": [ str ],
            "explanation": str
        }
    """
    if not model_file.filename.endswith(".pkl"):
        raise HTTPException(status_code=400, detail="Model file must be .pkl")
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")

    tmp_dir = tempfile.mkdtemp()
    try:
        model_path = os.path.join(tmp_dir, "model.pkl")
        dataset_path = os.path.join(tmp_dir, "dataset.csv")

        with open(model_path, "wb") as f:
            shutil.copyfileobj(model_file.file, f)
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)

        try:
            model = joblib.load(model_path)
            df = pd.read_csv(dataset_path)
            results = compute_explanation(
                model=model,
                df=df,
                target_col=target_col,
                sensitive_col=sensitive_col,
            )
            # Store explanation for report generation
            latest_analysis_store["explanation"] = results
            return results
        except Exception as e:
            return {
                "top_features": [],
                "bias_drivers": [],
                "explanation": f"Explainability analysis could not be fully computed. (Error: {str(e)})"
            }
            
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/mitigate")
async def mitigate(
    model_file: UploadFile = File(..., description="Serialised scikit-learn model (.pkl)"),
    dataset_file: UploadFile = File(..., description="Dataset with features + target (.csv)"),
    sensitive_col: str = Form("gender", description="Column name of the sensitive/protected attribute"),
    target_col: str = Form("income", description="Column name of the binary target variable"),
    technique: str = Form("Threshold Adjustment", description="Bias mitigation technique to apply"),
):
    """
    Load the model and dataset, split, and run Fairlearn bias mitigation algorithms.
    Returns metrics before and after mitigation and the recommended strategy.
    """
    if not model_file.filename.endswith(".pkl"):
        raise HTTPException(status_code=400, detail="Model file must be .pkl")
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")

    tmp_dir = tempfile.mkdtemp()
    try:
        model_path = os.path.join(tmp_dir, "model.pkl")
        dataset_path = os.path.join(tmp_dir, "dataset.csv")

        with open(model_path, "wb") as f:
            shutil.copyfileobj(model_file.file, f)
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)

        try:
            model = joblib.load(model_path)
            df = pd.read_csv(dataset_path)
            results = compute_mitigation(
                model=model,
                df=df,
                target_col=target_col,
                sensitive_col=sensitive_col,
                technique=technique,
            )
            return results
        except Exception as e:
            return {
                "before_mitigation": {"accuracy": 0, "fairness_score": 0, "demographic_parity_difference": 0, "equal_opportunity_difference": 0},
                "after_mitigation": {"accuracy": 0, "fairness_score": 0, "demographic_parity_difference": 0, "equal_opportunity_difference": 0},
                "recommended_strategy": f"Failed Mitigation: {str(e)}"
            }
            
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.post("/dataset_audit")
async def dataset_audit(
    dataset_file: UploadFile = File(..., description="Dataset CSV to scan for bias"),
):
    """
    Scans the uploaded dataset for categorical distribution imbalances.
    """
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")

    tmp_dir = tempfile.mkdtemp()
    try:
        dataset_path = os.path.join(tmp_dir, "audit_dataset.csv")
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)

        df = pd.read_csv(dataset_path)
        results = audit_dataset(df)
        latest_analysis_store["dataset_audit"] = results
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset audit failed: {str(e)}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)



@app.post("/report")
async def create_report(data: ReportData):
    """
    Generate a formatted PDF Compliance Audit Report and return it as a download.
    """
    try:
        pdf_path = generate_audit_report(data.dict())
        return FileResponse(
            path=pdf_path,
            filename="SamaanAI_Audit_Report.pdf",
            media_type="application/pdf",
            background=None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@app.get("/generate_audit_report")
async def generate_audit_report_auto():
    """
    Generate the official AI Fairness Audit Report based on latest findings.
    """
    if not latest_analysis_store["metrics"]:
        raise HTTPException(status_code=400, detail="No analysis data available. Please run an analysis first.")
    
    metrics = latest_analysis_store["metrics"]
    explanation = latest_analysis_store["explanation"] or {"bias_drivers": [], "explanation": "Not analyzed"}
    compliance = latest_analysis_store["compliance"] or {}
    dataset_audit = latest_analysis_store["dataset_audit"] or {}

    # Extract dataset summary from audit if available
    dataset_desc = "Analysis performed on the provided CSV dataset."
    if dataset_audit:
        dataset_desc = f"Analyzed {dataset_audit.get('total_rows', 0)} records. "
        dataset_desc += f"Detected {len(dataset_audit.get('dataset_bias', {}))} sensitive attributes."

    report_payload = {
        "model_summary": "SamaanAI Automated Analysis of the uploaded model.",
        "dataset_description": dataset_desc,
        "fairness_metrics": {
            "accuracy": metrics.get("accuracy", 0),
            "dpd": metrics.get("demographic_parity_difference", 0),
            "eod": metrics.get("equal_opportunity_difference", 0)
        },
        "bias_drivers": explanation.get("bias_drivers", []),
        "mitigation_results": "Baseline analysis performed on the primary model state.",
        "risk_classification": metrics.get("bias_risk", "LOW"),
        "compliance_status": compliance,
        "final_fairness_score": metrics.get("fairness_score", 0)
    }

    try:
        pdf_path = generate_audit_report(report_payload)
        return FileResponse(
            path=pdf_path,
            filename="SamaanAI_Fairness_Audit_Report.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate audit report: {str(e)}")
