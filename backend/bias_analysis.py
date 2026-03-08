"""
bias_analysis.py
Fairlearn-based fairness metric computation for SamaanAI Phase 2
Robust version that adapts to the Adult dataset automatically.
"""

import pandas as pd
from sklearn.metrics import accuracy_score
from fairlearn.metrics import (
    demographic_parity_difference,
    equal_opportunity_difference,
    selection_rate_difference,
    false_positive_rate_difference,
    false_negative_rate_difference,
)
from compliance import evaluate_compliance


import time
import logging

logger = logging.getLogger("SamaanAI")

def compute_metrics(
    model,
    df: pd.DataFrame,
    target_col: str,
    sensitive_col: str,
    progress_callback=None
) -> dict:

    # -------------------------------
    # 1. Normalize column names
    # -------------------------------
    original_cols = df.columns.tolist()
    df.columns = df.columns.str.strip().str.lower()
    target_col = target_col.strip().lower()
    sensitive_col = sensitive_col.strip().lower()
    
    if progress_callback: progress_callback(10, "[DATA_LOAD] Normalized columns and mapping features...")

    # -------------------------------
    # 2. Adaptive column mapping
    # -------------------------------
    mapping = {
        "education.num": "education-num",
        "hours.per.week": "hours-per-week",
        "capital.gain": "capital-gain",
        "capital.loss": "capital-loss",
        "marital.status": "marital-status",
        "native.country": "native-country",
        "sex": "gender"
    }
    df = df.rename(columns=mapping)
    # Identfy categorical features early to avoid repeated scans
    categorical_features = df.select_dtypes(include=['object', 'category']).columns.tolist()
    if progress_callback: progress_callback(15, f"[DATA_LOAD] Identified {len(categorical_features)} categorical features...")

    # -------------------------------
    # 3. Handle Income Labels
    # -------------------------------
    if target_col in df.columns:
        df[target_col] = (
            df[target_col]
            .astype(str)
            .str.strip()
            .replace({
                "<=50k": 0,
                ">50k": 1,
                "<=50K": 0,
                ">50K": 1
            })
        )
        # Attempt to convert to numeric, coercing errors to NaN
        df[target_col] = pd.to_numeric(df[target_col], errors="coerce").fillna(0).astype(int)

    # -------------------------------
    # 4. Identify Model Features
    # -------------------------------
    # Try to extract required features from model (scikit-learn >= 1.0)
    if hasattr(model, "feature_names_in_"):
        expected_features = list(model.feature_names_in_)
    else:
        # Fallback to hardcoded list if model doesn't have metadata
        expected_features = [
            "age", "fnlwgt", "education-num", 
            "hours-per-week", "capital-gain", "capital-loss"
        ]

    # -------------------------------
    # 5. Build Feature Matrix (Adaptive)
    # -------------------------------
    X_data = pd.DataFrame(index=df.index)
    
    for feat in expected_features:
        if feat in df.columns:
            X_data[feat] = df[feat]
        else:
            # Phase 6: Universal Resilience
            # Gracefully ignore/fill missing features instead of erroring
            X_data[feat] = 0

    # 5b. Robust Fill Missing Values
    # Fill numerical with median, categorical with mode
    for col in X_data.columns:
        if X_data[col].dtype in ['int64', 'float64']:
            X_data[col] = X_data[col].fillna(X_data[col].median() if not X_data[col].isna().all() else 0)
        else:
            X_data[col] = X_data[col].fillna(X_data[col].mode()[0] if not X_data[col].mode().empty else "unknown")

    # Validate target and sensitive columns
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found. Available: {list(df.columns)}")
    if sensitive_col not in df.columns:
        raise ValueError(f"Sensitive column '{sensitive_col}' not found. Available: {list(df.columns)}")

    y_true = df[target_col]
    sensitive = df[sensitive_col]
    
    if progress_callback: progress_callback(30, "[METRIC_CALC] Computing fairness disparities...")

    # -------------------------------
    # 6. Encode categorical features (Vectorized)
    # -------------------------------
    X_encoded = X_data.copy()
    try:
        cat_start = time.time()
        for col in X_encoded.select_dtypes(include=["object", "category"]).columns:
            X_encoded[col] = pd.Categorical(X_encoded[col]).codes
        logger.info(f"Categorical encoding took {time.time() - cat_start:.4f}s")
    except Exception as e:
        logger.warning(f"Categorical encoding failed, falling back: {str(e)}")

    # -------------------------------
    # 7. Run Model Prediction
    # -------------------------------
    try:
        # Reorder columns to match model's expected order exactly
        X_inference = X_encoded[expected_features]
        # Final safety check for any remaining NaNs (though handled above)
        X_inference = X_inference.fillna(0)
        y_pred = model.predict(X_inference)
    except Exception as e:
        raise ValueError(f"Model prediction failed: {str(e)}")

    # -------------------------------
    # 8. Compute Fairness Metrics
    # -------------------------------
    accuracy = float(accuracy_score(y_true, y_pred))

    dpd = float(
        demographic_parity_difference(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive,
        )
    )

    eod = float(
        equal_opportunity_difference(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive,
        )
    )

    srd = float(
        selection_rate_difference(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive,
        )
    )

    fprd = float(
        false_positive_rate_difference(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive,
        )
    )

    fnrd = float(
        false_negative_rate_difference(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive,
        )
    )

    # ── Risk Scoring ──────────────────────────────────────────────────────────
    risk_score = (abs(dpd) + abs(eod)) / 2
    fairness_score = round(100 * (1.0 - risk_score), 1)
    
    if progress_callback: progress_callback(80, "[COMPLIANCE_EVAL] Running regulatory alignment checks...")
    
    if risk_score <= 0.05:
        bias_risk = "LOW"
    elif risk_score <= 0.15:
        bias_risk = "MEDIUM"
    else:
        bias_risk = "HIGH"

    results = {
        "accuracy": round(accuracy, 4),
        "fairness_score": fairness_score,
        "risk_score": round(risk_score, 4),
        "bias_risk": bias_risk,
        "demographic_parity_ratio": round(1.0 - abs(dpd), 4),
        "demographic_parity_difference": round(abs(dpd), 4),
        "equal_opportunity_difference": round(abs(eod), 4),
        "selection_rate_difference": round(abs(srd), 4),
        "false_positive_rate_difference": round(abs(fprd), 4),
        "false_negative_rate_difference": round(abs(fnrd), 4),
        "sensitive_attribute": sensitive_col,
        "target_variable": target_col
    }

    # ── Compliance Check ──────────────────────────────────────────────────────
    compliance = evaluate_compliance(results, X_data, model)
    results["compliance"] = compliance

    return results