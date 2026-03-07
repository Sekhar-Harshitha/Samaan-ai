import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# 1. Load the dataset (located in the same folder as this script)
csv_path = "adult.csv"

# 2. Adult Income dataset column names
column_names = [
    "age", "workclass", "fnlwgt", "education", "education-num", 
    "marital-status", "occupation", "relationship", "race", "sex", 
    "capital-gain", "capital-loss", "hours-per-week", "native-country", "income"
]

print(f"Loading dataset from {csv_path}...")
# Use header=0 to skip the header in the CSV file and use our custom names
df = pd.read_csv(csv_path, names=column_names, header=0, skipinitialspace=True)

# 3. Convert income into binary target: ">50K" = 1, "<=50K" = 0
df["income"] = df["income"].apply(lambda x: 1 if ">50K" in str(x) else 0)

# 4. Select only numeric columns for training
# age, fnlwgt, education-num, capital-gain, capital-loss, hours-per-week are numeric
X = df.select_dtypes(include=["int64", "float64"]).drop(columns=["income"])
y = df["income"]

# 5. Train a RandomForestClassifier
print("Training RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)

# 6. Fit the model
model.fit(X, y)

# 7. Save the trained model as model.pkl inside the backend folder
model_filename = "model.pkl"
joblib.dump(model, model_filename)

# 8. Print confirmation
print(f"Model saved as {model_filename}")
