import shap
import pandas as pd
from joblib import load
from feature_engineering import extract_features

model = load("credit_model.joblib")

# Load some sample data
df = pd.read_csv("mpesa_synthetic_dataset.csv")

# Extract features with new temporal features
features = extract_features(df)

# Create feature array with all 12 features
feature_names = [
    'monthly_inflow', 'monthly_outflow', 'net_cash_flow',
    'repayments', 'repayment_ratio', 'balance_volatility',
    'avg_transaction_amount', 'transaction_count',
    'days_covered', 'transactions_per_day', 'inflow_trend', 'transaction_consistency'
]

# Ensure all features exist
for name in feature_names:
    if name not in features:
        features[name] = 0

X = pd.DataFrame([[features[col] for col in feature_names]], columns=feature_names)

print(f"Explaining model with {X.shape[1]} features")

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)

# Plot with new feature names
shap.summary_plot(shap_values, X, feature_names=feature_names, show=True)
print("✅ SHAP plot generated with temporal features")