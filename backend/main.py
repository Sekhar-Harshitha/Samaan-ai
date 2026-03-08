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
from typing import List, Dict, Any
from fastapi import FastAPI, File, Form, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uuid
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SamaanAI")

from bias_analysis import compute_metrics
from explain import compute_explanation
from mitigation import compute_mitigation
from report import generate_audit_report, generate_certificate_pdf, AuditReportPDF
from dataset_scanner import audit_dataset
from compliance import evaluate_compliance
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import datetime

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

# Task store for async operations
task_store: Dict[str, Dict[str, Any]] = {}

@app.get("/health")
def health_check():
    """Quick liveness check."""
    return {"status": "online", "service": "SamaanAI Bias Analysis API v2.0"}

async def run_bias_analysis_task_v2(task_id: str, model_path: str, dataset_path: str, target_col: str, sensitive_col: str):
    """Upgraded worker that handles I/O in background."""
    try:
        def update_progress(p, msg=None):
            task_store[task_id]["progress"] = p
            if msg: task_store[task_id]["message"] = msg

        update_progress(5, "[DATA_LOAD] Loading model and dataset from disk...")
        start_time = time.time()
        
        # Move I/O to background
        model = joblib.load(model_path)
        df = pd.read_csv(dataset_path)
        
        update_progress(20, "[DATA_LOAD] Dataset loaded. Starting computation...")

        if len(df) > 50000:
            task_store[task_id]["is_large"] = True

        # Wrap in timeout safeguard (e.g., 30s)
        results = compute_metrics(
            model=model,
            df=df,
            target_col=target_col,
            sensitive_col=sensitive_col,
            progress_callback=update_progress
        )
        
        if time.time() - start_time > 30:
            logger.warning(f"Task {task_id} took > 30s. Returning results.")
        
        task_store[task_id]["results"] = results
        task_store[task_id]["status"] = "completed"
        task_store[task_id]["progress"] = 100
        task_store[task_id]["message"] = "Analysis finalized."

        # Update global store for reporting
        latest_analysis_store["metrics"] = results
        latest_analysis_store["compliance"] = evaluate_compliance(results, df, model)

    except Exception as e:
        logger.error(f"Task {task_id} failed: {str(e)}")
        task_store[task_id]["status"] = "failed"
        task_store[task_id]["error"] = str(e)
    finally:
        # Cleanup
        shutil.rmtree(os.path.dirname(model_path), ignore_errors=True)

@app.post("/analyze")
async def analyze(
    background_tasks: BackgroundTasks,
    model_file: UploadFile = File(..., description="Serialised scikit-learn model (.pkl)"),
    dataset_file: UploadFile = File(..., description="Dataset with features + target (.csv)"),
    sensitive_col: str = Form("gender", description="Column name of the sensitive/protected attribute"),
    target_col: str = Form("income", description="Column name of the binary target variable"),
):
    """
    Starts an asynchronous bias analysis. Returns a task ID for polling.
    """
    if not model_file.filename.endswith(".pkl"):
        raise HTTPException(status_code=400, detail="Model file must be .pkl")
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")

    task_id = str(uuid.uuid4())
    task_store[task_id] = {"status": "starting", "progress": 0, "id": task_id}

    # ── Save uploads to temp directory ────────────────────────────────────────
    tmp_dir = tempfile.mkdtemp()
    model_path = os.path.join(tmp_dir, "model.pkl")
    dataset_path = os.path.join(tmp_dir, "dataset.csv")

    try:
        with open(model_path, "wb") as f:
            shutil.copyfileobj(model_file.file, f)
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)

        # Start background task with paths, NOT loaded objects
        background_tasks.add_task(
            run_bias_analysis_task_v2, 
            task_id, model_path, dataset_path, target_col, sensitive_col
        )
        
        return {"task_id": task_id, "status": "queued"}

    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True) # Cleanup on failure to initiate
        task_store[task_id]["status"] = "failed"
        task_store[task_id]["error"] = str(e)
        raise HTTPException(status_code=500, detail=f"Failed to initiate analysis: {str(e)}")


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
    print(f"DEBUG: Model ingestion started for {len(model_files)} models.")
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")
    
    tmp_dir = tempfile.mkdtemp()
    try:
        dataset_path = os.path.join(tmp_dir, "dataset.csv")
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)
        
        try:
            df = pd.read_csv(dataset_path)
            print(f"DEBUG: Dataset loaded successfully. Rows: {len(df)}")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {str(e)}")

        comparison_results = []

        for model_file in model_files:
            if not model_file.filename.endswith(".pkl"):
                continue
            
            model_name = model_file.filename.replace(".pkl", "")
            print(f"DEBUG: Processing model: {model_name}")
            model_path = os.path.join(tmp_dir, model_file.filename)
            
            try:
                # Re-seek file just in case
                model_file.file.seek(0)
                with open(model_path, "wb") as f:
                    shutil.copyfileobj(model_file.file, f)
                
                model = joblib.load(model_path)
                metrics = compute_metrics(
                    model=model,
                    df=df,
                    target_col=target_col,
                    sensitive_col=sensitive_col,
                )
                
                comparison_results.append({
                    "model": model_name,
                    "accuracy": round(metrics["accuracy"] * 100, 1),
                    "fairness": metrics["fairness_score"],
                    "dp_diff": metrics["demographic_parity_difference"],
                    "eo_diff": metrics["equal_opportunity_difference"],
                    "risk_score": metrics["risk_score"],
                    "bias_risk": metrics["bias_risk"],
                    "status": "success"
                })
            except Exception as e:
                print(f"DEBUG: Failed to process {model_file.filename}: {str(e)}")
                comparison_results.append({
                    "model": model_name,
                    "status": "error",
                    "error_message": str(e)
                })

        print(f"DEBUG: Comparison completed. Results: {comparison_results}")
        return {"models": comparison_results}

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.get("/analysis-progress/{job_id}")
async def get_analysis_progress(job_id: str):
    """Check status of a background analysis task (Renamed from task-status)."""
    if job_id not in task_store:
        raise HTTPException(status_code=404, detail="Job ID not found")
    return task_store[job_id]

async def run_explainability_task_v2(task_id: str, model_path: str, dataset_path: str, target_col: str, sensitive_col: str):
    """Background worker for SHAP explainability with background I/O."""
    try:
        task_store[task_id]["status"] = "processing"
        task_store[task_id]["progress"] = 30
        
        # Load in background
        model = joblib.load(model_path)
        df = pd.read_csv(dataset_path)

        results = compute_explanation(
            model=model,
            df=df,
            target_col=target_col,
            sensitive_col=sensitive_col,
        )
        
        task_store[task_id]["results"] = results
        task_store[task_id]["status"] = "completed"
        task_store[task_id]["progress"] = 100
        
        # Update global store
        latest_analysis_store["explanation"] = results

    except Exception as e:
        logger.error(f"Explain task {task_id} failed: {str(e)}")
        task_store[task_id]["status"] = "failed"
        task_store[task_id]["error"] = str(e)
    finally:
        # Cleanup temp files
        shutil.rmtree(os.path.dirname(model_path), ignore_errors=True)

@app.post("/explain")
async def explain(
    background_tasks: BackgroundTasks,
    model_file: UploadFile = File(..., description="Serialised scikit-learn model (.pkl)"),
    dataset_file: UploadFile = File(..., description="Dataset with features + target (.csv)"),
    sensitive_col: str = Form("gender", description="Column name of the sensitive/protected attribute"),
    target_col: str = Form("income", description="Column name of the binary target variable"),
):
    """
    Load the model and dataset, compute feature importance and bias drivers asynchronously.
    """
    if not model_file.filename.endswith(".pkl"):
        raise HTTPException(status_code=400, detail="Model file must be .pkl")
    if not dataset_file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Dataset must be .csv")

    task_id = str(uuid.uuid4())
    task_store[task_id] = {"status": "starting", "progress": 0, "id": task_id}

    tmp_dir = tempfile.mkdtemp()
    try:
        model_path = os.path.join(tmp_dir, "model.pkl")
        dataset_path = os.path.join(tmp_dir, "dataset.csv")

        with open(model_path, "wb") as f:
            shutil.copyfileobj(model_file.file, f)
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(dataset_file.file, f)

        # Start background task with paths, NOT loaded objects
        background_tasks.add_task(
            run_explainability_task_v2, 
            task_id, model_path, dataset_path, target_col, sensitive_col
        )
        
        return {"task_id": task_id, "status": "queued"}
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True) # Cleanup only if initiation failed
        raise HTTPException(status_code=500, detail=str(e))


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
            logger.error(f"Mitigation execution error: {str(e)}")
            return {
                "status": "error",
                "message": f"Mitigation Protocol Initialisation Failed: {str(e)}",
                "before_mitigation": {"accuracy": 0, "fairness_score": 0, "demographic_parity_difference": 0, "equal_opportunity_difference": 0},
                "after_mitigation": {"accuracy": 0, "fairness_score": 0, "demographic_parity_difference": 0, "equal_opportunity_difference": 0},
                "recommended_strategy": "N/A"
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


@app.get("/audit-report")
async def generate_audit_report_auto():
    """
    Generate the official AI Fairness Audit Report based on latest findings.
    """
    if not latest_analysis_store["metrics"]:
        raise HTTPException(status_code=400, detail="No analysis data available. Please run an analysis first.")
    
    metrics = latest_analysis_store["metrics"]
    explanation = latest_analysis_store.get("explanation") or {"bias_drivers": [], "explanation": "Not analyzed"}
    compliance = latest_analysis_store.get("compliance") or {}

    # Combine data for report
    report_data = {
        "fairness_metrics": {
            "accuracy": metrics.get("accuracy"),
            "dpd": metrics.get("demographic_parity_difference"),
            "eod": metrics.get("equal_opportunity_difference")
        },
        "bias_drivers": explanation.get("bias_drivers", []),
        "risk_classification": metrics.get("bias_risk"),
        "compliance_status": compliance,
        "final_fairness_score": metrics.get("fairness_score", 0)
    }

    try:
        filepath = generate_audit_report(report_data)
        return FileResponse(
            path=filepath,
            filename=f"SamaanAI_Audit_Report_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@app.post("/generate-certificate")
async def generate_cert():
    """
    Generates a PDF fairness compliance certificate based on the latest analysis.
    """
    metrics = latest_analysis_store.get("metrics")
    compliance = latest_analysis_store.get("compliance")

    if not metrics or not compliance:
        raise HTTPException(
            status_code=400,
            detail="Run Bias Analysis before generating certificate."
        )

    cert_data = {
        "fairness_score": metrics.get("fairness_score", "N/A"),
        "bias_risk": metrics.get("bias_risk", "N/A"),
        "fairness_check": compliance.get("fairness_check", "N/A"),
        "dataset_bias": compliance.get("dataset_bias", "N/A"),
        "transparency": compliance.get("transparency", "N/A"),
        "mitigation": compliance.get("bias_mitigation_applied", "N/A"),
        "eu_alignment": compliance.get("eu_ai_act_compliance", "N/A")
    }

    try:
        filepath = generate_certificate_pdf(cert_data)
        return FileResponse(
            path=filepath,
            filename=f"SamaanAI_Fairness_Certificate_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Certificate generation failed: {str(e)}")
