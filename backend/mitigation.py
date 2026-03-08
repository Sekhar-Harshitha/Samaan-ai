"""
mitigation.py
Fairlearn-based bias mitigation for SamaanAI Phase 5.
"""

import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from fairlearn.postprocessing import ThresholdOptimizer
from fairlearn.reductions import ExponentiatedGradient, DemographicParity, EqualizedOdds
from fairlearn.metrics import (
    demographic_parity_difference,
    equal_opportunity_difference,
)
from bias_analysis import compute_metrics
import warnings

warnings.filterwarnings('ignore')

def detect_columns(df: pd.DataFrame):
    """Detects likely target and sensitive columns based on priority."""
    target_priority = ["income", "label", "target", "outcome", "class", "y"]
    sensitive_priority = ["sex", "gender", "race", "age", "ethnicity"]
    
    target = None
    sensitive = None
    
    cols = [c.lower() for c in df.columns]
    
    # Priority-based detection for sensitive attribute
    for s in sensitive_priority:
        if s in cols:
            sensitive = df.columns[cols.index(s)]
            break
            
    # Priority-based detection for target variable
    for t in target_priority:
        if t in cols:
            target = df.columns[cols.index(t)]
            break
            
    return target, sensitive

def compute_mitigation(
    model,
    df: pd.DataFrame,
    target_col: str,
    sensitive_col: str,
    technique: str = "Threshold Adjustment"
) -> dict:

    # 1. Normalize columns
    df.columns = df.columns.str.strip().str.lower()
    target_col = target_col.strip().lower() if target_col else None
    sensitive_col = sensitive_col.strip().lower() if sensitive_col else None

    mapping = {
        "education.num": "education-num",
        "hours.per.week": "hours-per-week",
        "capital.gain": "capital-gain",
        "capital.loss": "capital-loss",
        "marital.status": "marital-status",
        "native.country": "native-country"
    }
    df = df.rename(columns=mapping)

    # Auto-detection logic
    detected_target, detected_sensitive = detect_columns(df)
    
    auto_target_used = False
    auto_sensitive_used = False

    if not target_col or target_col not in df.columns:
        if detected_target:
            target_col = detected_target
            auto_target_used = True
        else:
            raise ValueError("Target column missing and could not be auto-detected.")
            
    if not sensitive_col or sensitive_col not in df.columns:
        if detected_sensitive:
            sensitive_col = detected_sensitive
            auto_sensitive_used = True
        else:
            raise ValueError("Sensitive column missing and could not be auto-detected.")

    # 2. Handle Target
    df[target_col] = (
        df[target_col]
        .astype(str)
        .str.strip()
        .replace({"<=50k": 0, ">50k": 1, "<=50K": 0, ">50K": 1})
    )
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce").fillna(0).astype(int)

    # 3. Features
    if hasattr(model, "feature_names_in_"):
        expected_features = list(model.feature_names_in_)
    else:
        expected_features = ["age", "fnlwgt", "education-num", "hours-per-week", "capital-gain", "capital-loss"]

    X_data = pd.DataFrame(index=df.index)
    for feat in expected_features:
        if feat in df.columns:
            X_data[feat] = df[feat]
        else:
            X_data[feat] = 0

    y_true = df[target_col]
    sensitive = df[sensitive_col]

    # Encode X
    X_encoded = X_data.copy()
    for col in X_encoded.select_dtypes(include=["object", "category"]).columns:
        X_encoded[col] = pd.Categorical(X_encoded[col]).codes

    # 4. Before Mitigation Metrics
    try:
        X_inference = X_encoded[expected_features]
        y_pred_before = model.predict(X_inference)
        acc_before = accuracy_score(y_true, y_pred_before)
        dpd_before = demographic_parity_difference(y_true, y_pred_before, sensitive_features=sensitive)
        try:
            eod_before = equal_opportunity_difference(y_true, y_pred_before, sensitive_features=sensitive)
        except Exception:
            eod_before = 0.0
    except Exception as e:
        raise ValueError(f"Failed to generate predictions for before metrics: {e}")

    if technique == "Reweighing":
        try:
            s_prob = sensitive.value_counts(normalize=True).to_dict()
            y_prob = y_true.value_counts(normalize=True).to_dict()
            
            weights = np.zeros(len(df))
            for i, (s_val, y_val) in enumerate(zip(sensitive, y_true)):
                sy_prob = len(df[(sensitive == s_val) & (y_true == y_val)]) / len(df)
                if sy_prob > 0:
                    weights[i] = (s_prob[s_val] * y_prob[y_val]) / sy_prob
                else:
                    weights[i] = 1.0
                    
            base_model = LogisticRegression(solver='liblinear')
            base_model.fit(X_inference, y_true, sample_weight=weights)
            y_pred_after = base_model.predict(X_inference)
            
            acc_after = accuracy_score(y_true, y_pred_after)
            dpd_after = demographic_parity_difference(y_true, y_pred_after, sensitive_features=sensitive)
            try:
                eod_after = equal_opportunity_difference(y_true, y_pred_after, sensitive_features=sensitive)
            except Exception:
                eod_after = 0.0
            strategy = "Reweighing"
        except Exception as e:
            acc_after = acc_before
            dpd_after = dpd_before
            eod_after = eod_before
            strategy = f"Reweighing Failed: {str(e)[:50]}"

    else:
        # Threshold Adjustment
        try:
            optimizer = ThresholdOptimizer(
                estimator=model,
                constraints="demographic_parity",
                prefit=True,
                predict_method='predict'
            )
            optimizer.fit(X_inference, y_true, sensitive_features=sensitive)
            y_pred_after = optimizer.predict(X_inference, sensitive_features=sensitive)
            
            acc_after = accuracy_score(y_true, y_pred_after)
            dpd_after = demographic_parity_difference(y_true, y_pred_after, sensitive_features=sensitive)
            try:
                eod_after = equal_opportunity_difference(y_true, y_pred_after, sensitive_features=sensitive)
            except Exception:
                eod_after = 0.0
            strategy = "Threshold Adjustment"
        except Exception as e:
            try:
                base_estimator = LogisticRegression(solver='liblinear')
                mitigater = ExponentiatedGradient(base_estimator, DemographicParity())
                mitigater.fit(X_inference, y_true, sensitive_features=sensitive)
                y_pred_after = mitigater.predict(X_inference)
                
                acc_after = accuracy_score(y_true, y_pred_after)
                dpd_after = demographic_parity_difference(y_true, y_pred_after, sensitive_features=sensitive)
                try:
                    eod_after = equal_opportunity_difference(y_true, y_pred_after, sensitive_features=sensitive)
                except Exception:
                    eod_after = 0.0
                strategy = "ExponentiatedGradient Fallback"
            except Exception as e2:
                acc_after = acc_before
                dpd_after = dpd_before
                eod_after = eod_before
                strategy = f"Mitigation Failed: {str(e2)[:50]}"

    return {
        "accuracy_before": round(float(acc_before), 4),
        "accuracy_after": round(float(acc_after), 4),
        "fairness_before": round(float(1.0 - abs(dpd_before)), 4),
        "fairness_after": round(float(1.0 - abs(dpd_after)), 4),
        "dpd_before": round(float(abs(dpd_before)), 4),
        "dpd_after": round(float(abs(dpd_after)), 4),
        "eod_before": round(float(abs(eod_before)), 4),
        "eod_after": round(float(abs(eod_after)), 4),
        "before_mitigation": {
            "accuracy": round(float(acc_before), 4),
            "fairness_score": round(1.0 - abs(dpd_before), 4),
            "demographic_parity_difference": round(abs(dpd_before), 4),
            "equal_opportunity_difference": round(abs(eod_before), 4)
        },
        "after_mitigation": {
            "accuracy": round(float(acc_after), 4),
            "fairness_score": round(1.0 - abs(dpd_after), 4),
            "demographic_parity_difference": round(abs(dpd_after), 4),
            "equal_opportunity_difference": round(abs(eod_after), 4)
        },
        "recommended_strategy": strategy,
        "auto_detected_target": auto_target_used,
        "auto_detected_sensitive": auto_sensitive_used,
        "status": "success"
    }
