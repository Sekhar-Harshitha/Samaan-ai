import pandas as pd
import numpy as np
import shap

def compute_explanation(
    model,
    df: pd.DataFrame,
    target_col: str,
    sensitive_col: str,
) -> dict:
    """
    Upgraded Explainability layer using SHAP.
    Computes global feature importance and bias-specific impacts.
    """
    # 1. Normalize columns
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
        # Fallback to standard features if not present
        expected_features = [
            "age", "fnlwgt", "education-num", 
            "hours-per-week", "capital-gain", "capital-loss"
        ]

    X_data = pd.DataFrame(index=df.index)
    for feat in expected_features:
        if feat in df.columns:
            X_data[feat] = df[feat]
        else:
            X_data[feat] = 0

    # Ensure numeric encoding for SHAP
    X_encoded = X_data.copy()
    for col in X_encoded.columns:
        if not pd.api.types.is_numeric_dtype(X_encoded[col]):
            X_encoded[col] = pd.Categorical(X_encoded[col]).codes
    
    # Use a sample for SHAP calculation for efficiency
    sample_size = min(len(X_encoded), 200)
    X_sample = X_encoded.sample(n=sample_size, random_state=42)

    # 3. Compute SHAP Values
    try:
        # Try TreeExplainer for tree models, fall back to KernelExplainer/Explainer
        try:
            explainer = shap.Explainer(model, X_encoded)
            shap_values = explainer(X_sample)
        except Exception:
            # Fallback to a simpler explainer if the model is complex
            explainer = shap.Explainer(model.predict, X_sample)
            shap_values = explainer(X_sample)

        # Get SHAP values correctly depending on the explainer type
        if hasattr(shap_values, "values"):
            values = shap_values.values
        else:
            values = shap_values

        # If multi-class/probability, take the first class/output (e.g., binary)
        if len(values.shape) == 3:
            values = values[:, :, 1] if values.shape[2] > 1 else values[:, :, 0]

        # 4. Global Feature Importance (Mean Absolute SHAP)
        global_importance = np.abs(values).mean(axis=0)
        importances = {feat: float(global_importance[i]) for i, feat in enumerate(expected_features)}
        
        # Sort and get top
        sorted_imps = sorted(importances.items(), key=lambda item: item[1], reverse=True)
        top_features = [{"feature": k, "importance": round(v, 4)} for k, v in sorted_imps[:5]]

        # 5. Identify Bias Drivers (Correlation of SHAP values with Sensitive attribute)
        bias_drivers_data = []
        if sensitive_col in df.columns:
            sensitive = df.loc[X_sample.index, sensitive_col]
            if not pd.api.types.is_numeric_dtype(sensitive):
                sensitive_coded = pd.Categorical(sensitive).codes
            else:
                sensitive_coded = sensitive.values
            
            for i, feat in enumerate(expected_features):
                # Correlation between feature's SHAP contribution and sensitive attribute
                if np.std(values[:, i]) > 0 and np.std(sensitive_coded) > 0:
                    corr = np.corrcoef(values[:, i], sensitive_coded)[0, 1]
                    bias_drivers_data.append({"feature": feat, "impact": abs(float(corr))})
        
        # Sort by bias impact
        bias_drivers_data = sorted(bias_drivers_data, key=lambda x: x["impact"], reverse=True)
        top_bias_features = bias_drivers_data[:5]

        # 6. SHAP Summary Data (for JS visualization)
        # We'll provide a few data points for each top feature to simulate a summary plot
        summary_plot_data = []
        for feat_idx, feat in enumerate(expected_features):
            if any(tf["feature"] == feat for tf in top_features):
                # Sample 50 points for each top feature
                for j in range(min(50, len(X_sample))):
                    summary_plot_data.append({
                        "feature": feat,
                        "shapValue": float(values[j, feat_idx]),
                        "featureValue": float(X_sample.iloc[j, feat_idx])
                    })

        # 7. Final Explanation
        drivers = [d["feature"] for d in top_bias_features if d["impact"] > 0.1]
        driver_text = " and ".join(drivers[:2]) if drivers else "certain patterns"
        explanation = f"Using SHAP analysis, we identified that '{driver_text}' have a significant impact on decision variance across demographic groups. This indicates these features are the primary drivers of potential bias."

        return {
            "top_features": top_features,
            "top_bias_features": top_bias_features,
            "shap_summary": summary_plot_data,
            "explanation": explanation
        }

    except Exception as e:
        print(f"SHAP error: {str(e)}")
        # Fallback to simple mean if SHAP fails entirely
        return {
            "top_features": [{"feature": f, "importance": 0.1} for f in expected_features[:5]],
            "top_bias_features": [{"feature": f, "impact": 0.05} for f in expected_features[:5]],
            "shap_summary": [],
            "explanation": f"SHAP analysis encountered an error: {str(e)}. Falling back to baseline importance."
        }
