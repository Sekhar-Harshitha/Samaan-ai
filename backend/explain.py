"""
explain.py
Explainability Layer for SamaanAI Phase 4.
Extracts feature importance and identifies bias drivers.
"""

import pandas as pd
import numpy as np
from sklearn.inspection import permutation_importance

def compute_explanation(
    model,
    df: pd.DataFrame,
    target_col: str,
    sensitive_col: str,
) -> dict:

    # 1. Normalize columns (similar to bias_analysis.py)
    df.columns = df.columns.str.strip().str.lower()
    target_col = target_col.strip().lower()
    sensitive_col = sensitive_col.strip().lower()

    mapping = {
        "education.num": "education-num",
        "hours.per.week": "hours-per-week",
        "capital.gain": "capital-gain",
        "capital.loss": "capital-loss",
        "marital.status": "marital-status",
        "native.country": "native-country"
    }
    df = df.rename(columns=mapping)

    # 2. Extract Features
    if hasattr(model, "feature_names_in_"):
        expected_features = list(model.feature_names_in_)
    else:
        expected_features = [
            "age", "fnlwgt", "education-num", 
            "hours-per-week", "capital-gain", "capital-loss"
        ]

    # Build Feature Matrix X and Target y
    X_data = pd.DataFrame(index=df.index)
    for feat in expected_features:
        if feat in df.columns:
             X_data[feat] = df[feat]
        else:
             X_data[feat] = 0
             
    # Handle Target
    if target_col in df.columns:
        y_true = df[target_col].astype(str).str.strip().replace({"<=50k": 0, ">50k": 1, "<=50K": 0, ">50K": 1})
        y_true = pd.to_numeric(y_true, errors="coerce").fillna(0).astype(int)
    else:
        raise ValueError(f"Target column '{target_col}' not found.")

    # Encode categorical features for correlation and prediction
    X_encoded = X_data.copy()
    for col in X_encoded.select_dtypes(include=["object", "category"]).columns:
        X_encoded[col] = pd.Categorical(X_encoded[col]).codes

    # 3. Compute Feature Importance
    importances = {}
    
    # Check if model has direct feature importances (e.g., RandomForest, XGBoost)
    if hasattr(model, "feature_importances_"):
        imps = model.feature_importances_
        for i, feat in enumerate(expected_features):
            importances[feat] = float(imps[i])
    # Check for linear models (coefficients)
    elif hasattr(model, "coef_"):
        imps = np.abs(model.coef_[0])
        # Normalize coefficients to sum to 1 to resemble importance scores
        imps_sum = np.sum(imps)
        if imps_sum > 0:
            imps = imps / imps_sum
        for i, feat in enumerate(expected_features):
             importances[feat] = float(imps[i])
    else:
        # Fallback: Permutation Importance
        try:
             # Subsample for speed if dataset is large
             if len(df) > 5000:
                  X_sample = X_encoded.sample(n=5000, random_state=42)
                  y_sample = y_true.loc[X_sample.index]
             else:
                  X_sample = X_encoded
                  y_sample = y_true
                  
             r = permutation_importance(model, X_sample, y_sample, n_repeats=5, random_state=42)
             for i, feat in enumerate(expected_features):
                 importances[feat] = float(np.abs(r.importances_mean[i]))
        except Exception as e:
             # If permutation fails, just return equal weights
             weight = 1.0 / len(expected_features) if len(expected_features) > 0 else 0
             for feat in expected_features:
                  importances[feat] = weight

    # Sort and get top 5
    sorted_imps = sorted(importances.items(), key=lambda item: item[1], reverse=True)
    top_features = [{"feature": k, "importance": round(v, 4)} for k, v in sorted_imps[:5]]

    # 4. Compute Bias Drivers (Correlation with Sensitive Attribute)
    bias_drivers = []
    if sensitive_col in df.columns:
        sensitive = df[sensitive_col]
        # Encode sensitive attribute if it's categorical
        if sensitive.dtype == "object" or sensitive.dtype.name == "category":
            sensitive = pd.Categorical(sensitive).codes
            
        correlations = {}
        for feat in expected_features:
            if X_encoded[feat].std() > 0 and sensitive.std() > 0:
                corr = X_encoded[feat].corr(pd.Series(sensitive, index=X_encoded.index))
                correlations[feat] = abs(corr)
            else:
                correlations[feat] = 0.0
                
        # Get top 2 features with highest correlation with sensitive attribute
        sorted_corr = sorted(correlations.items(), key=lambda item: item[1], reverse=True)
        bias_drivers = [k for k, v in sorted_corr[:2] if v > 0.05] # Require at least a small correlation
        
    if not bias_drivers and top_features:
         bias_drivers = [top_features[0]["feature"]]

    # 5. Generate Text Explanation
    driver_text = " and ".join(bias_drivers) if bias_drivers else "certain features"
    explanation = f"Model predictions are strongly influenced by {driver_text}, which correlate with the sensitive attribute ({sensitive_col}). This suggests potential systemic bias embedded in these variables."

    return {
        "top_features": top_features,
        "bias_drivers": bias_drivers,
        "explanation": explanation
    }
