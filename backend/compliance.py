"""
compliance.py
Responsible AI compliance evaluation module for SamaanAI.
"""

import pandas as pd

def evaluate_compliance(metrics: dict, df: pd.DataFrame, model, mitigation_applied: bool = False) -> dict:
    """
    Evaluate model and dataset for Responsible AI compliance.
    """
    
    # 1. Fairness Compliance
    # PASS if risk score is LOW (< 0.05), WARNING if MEDIUM, FAIL if HIGH
    risk_score = metrics.get("risk_score", 1.0)
    if risk_score <= 0.05:
        fairness_check = "PASS"
    elif risk_score <= 0.15:
        fairness_check = "WARNING"
    else:
        fairness_check = "FAIL"
        
    # 2. Dataset Balance Check
    # Check distribution of the sensitive attribute
    sensitive_col = metrics.get("sensitive_attribute")
    dataset_bias = "PASS"
    if sensitive_col in df.columns:
        counts = df[sensitive_col].value_counts(normalize=True)
        # If any group is less than 10% of the dataset, issue a warning
        if counts.min() < 0.10:
            dataset_bias = "WARNING"
        # If any group is less than 1% of the dataset, issue a fail
        if counts.min() < 0.01:
            dataset_bias = "FAIL"
            
    # 3. Model Transparency
    # Check if the model is an ensemble or complex neural net (less transparent)
    # vs simple linear models or trees
    model_type = str(type(model)).lower()
    transparency = "PASS"
    if "forest" in model_type or "gradientboosting" in model_type or "neural" in model_type:
        transparency = "WARNING"
    elif "deep" in model_type or "keras" in model_type or "torch" in model_type:
        transparency = "FAIL"
        
    # 4. Bias Mitigation Check
    bias_mitigation = "PASS" if mitigation_applied else "WARNING"
    
    # EU AI Act Compliance (Simplified heuristic)
    # PASS if fairness and dataset are PASS/WARNING and transparency is not FAIL
    if fairness_check == "FAIL" or dataset_bias == "FAIL":
        eu_ai_act_compliance = "FAIL"
    elif fairness_check == "WARNING" or dataset_bias == "WARNING":
        eu_ai_act_compliance = "WARNING"
    else:
        eu_ai_act_compliance = "PASS"

    return {
        "eu_ai_act_compliance": eu_ai_act_compliance,
        "fairness_check": fairness_check,
        "dataset_bias": dataset_bias,
        "transparency": transparency,
        "bias_mitigation_applied": bias_mitigation
    }
