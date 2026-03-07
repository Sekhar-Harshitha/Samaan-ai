import pandas as pd
import numpy as np

def audit_dataset(df: pd.DataFrame) -> dict:
    """
    Scans a dataset for distribution imbalances in categorical/sensitive attributes.
    """
    # 1. Identify potential sensitive categorical attributes
    # We look for columns with low cardinality (e.g., < 10 unique values) that aren't numeric
    potential_sensitive = []
    for col in df.columns:
        unique_count = df[col].nunique()
        is_categorical = not pd.api.types.is_numeric_dtype(df[col])
        
        # Heuristic: Categorical columns with 2-10 unique values are likely sensitive candidates
        if (is_categorical and 1 < unique_count <= 10) or col.lower() in ["sex", "gender", "race", "ethnicity", "age_group"]:
            potential_sensitive.append(col)

    dataset_bias = {}
    max_imbalance = 0

    # 2. Compute distribution for each sensitive attribute
    for col in potential_sensitive:
        counts = df[col].value_counts(normalize=True) * 100
        stats = counts.to_dict()
        
        # Calculate imbalance score: max% - min%
        # For binary, it's |group1% - group2%| essentially
        imbalance_score = counts.max() - counts.min()
        stats["imbalance_score"] = float(round(imbalance_score, 2))
        
        # Round percentages
        formatted_stats = {k: float(round(v, 2)) for k, v in stats.items()}
        
        dataset_bias[col] = formatted_stats
        max_imbalance = max(max_imbalance, imbalance_score)

    # 3. Determine Risk Level
    if max_imbalance > 40:
        risk_level = "HIGH"
    elif max_imbalance > 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "dataset_bias": dataset_bias,
        "risk_level": risk_level,
        "total_rows": len(df),
        "attribute_count": len(df.columns)
    }
