import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

def train_and_save_models(data_path="backend/data/adult.csv", output_dir="backend/models"):
    """
    Load dataset, preprocess, train multiple models, and save them.
    """
    print(f"Loading dataset from {data_path}...")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # 1. Load the dataset
    column_names = [
        "age", "workclass", "fnlwgt", "education", "education-num", 
        "marital-status", "occupation", "relationship", "race", "sex", 
        "capital-gain", "capital-loss", "hours-per-week", "native-country", "income"
    ]
    
    # Check if header exists by reading first row
    first_row = pd.read_csv(data_path, nrows=1)
    if "age" in first_row.columns:
        df = pd.read_csv(data_path)
    else:
        df = pd.read_csv(data_path, names=column_names, header=0, skipinitialspace=True)

    # 2. Preprocessing
    print("Preprocessing data...")
    # Remove missing values
    df.replace(" ?", pd.NA, inplace=True)
    df.dropna(inplace=True)

    # Convert income into binary target: ">50K" = 1, "<=50K" = 0
    if df["income"].dtype == object:
        df["income"] = df["income"].apply(lambda x: 1 if ">50K" in str(x) else 0)

    # Encode categorical columns
    label_encoders = {}
    for col in df.select_dtypes(include="object").columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    # Split features and target
    X = df.drop(columns=["income"])
    y = df["income"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 3. Train Models
    models = {
        "logistic_regression": LogisticRegression(max_iter=2000),
        "decision_tree": DecisionTreeClassifier(),
        "random_forest": RandomForestClassifier(n_estimators=100)
    }

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        
        # 4. Save model
        model_path = os.path.join(output_dir, f"{name}.pkl")
        joblib.dump(model, model_path)
        print(f"Saved {name} to {model_path}")

    # Save a default 'model.pkl' (Random Forest) to the models directory for backward compatibility if needed in some scripts
    joblib.dump(models["random_forest"], os.path.join(output_dir, "model.pkl"))
    print(f"Saved default model as model.pkl in {output_dir}")

    print("\nAll models trained and saved successfully!")

if __name__ == "__main__":
    train_and_save_models()
