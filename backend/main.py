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
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from bias_analysis import compute_metrics
from explain import compute_explanation

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

        return results

    finally:
        # Clean up temp files regardless of outcome
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
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to load files: {str(e)}")

        try:
            results = compute_explanation(
                model=model,
                df=df,
                target_col=target_col,
                sensitive_col=sensitive_col,
            )
            return results
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Explainability analysis failed: {str(e)}")
            
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
