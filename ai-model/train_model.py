import pandas as pd
import random
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from joblib import dump
from feature_engineering import extract_features

# Load or create sample data
df = pd.read_csv("mpesa_synthetic_dataset.csv")  

samples = []
for _ in range(200):  # Increased sample size
    # Create features similar to new structure
    inflow = random.randint(1000, 20000)
    outflow = random.randint(500, inflow)
    repayments = random.randint(0, 5)
    repayment_ratio = repayments / inflow if inflow > 0 else 0
    balance_volatility = random.uniform(0, 1000)
    avg_transaction = inflow / random.randint(10, 50)
    transaction_count = random.randint(10, 150)
    
    # New temporal features
    days_covered = random.choice([30, 60, 90])
    transactions_per_day = transaction_count / days_covered
    inflow_trend = random.uniform(-0.3, 0.3)  # -30% to +30%
    transaction_consistency = random.uniform(1, 10)
    
    # Smarter labeling with temporal factors
    is_growing = inflow_trend > 0.1
    is_regular = transaction_consistency < 5
    has_sufficient_data = days_covered > 60
    
    label = 1 if (is_growing and is_regular and has_sufficient_data) else 0

    samples.append({
        'monthly_inflow': inflow,
        'monthly_outflow': outflow,
        'net_cash_flow': inflow - outflow,
        'repayments': repayments,
        'repayment_ratio': repayment_ratio,
        'balance_volatility': balance_volatility,
        'avg_transaction_amount': avg_transaction,
        'transaction_count': transaction_count,
        # Temporal features
        'days_covered': days_covered,
        'transactions_per_day': transactions_per_day,
        'inflow_trend': inflow_trend,
        'transaction_consistency': transaction_consistency,
        'loan_defaulted': label
    })

train_df = pd.DataFrame(samples)
X = train_df.drop('loan_defaulted', axis=1)
y = train_df['loan_defaulted']

print(f"Training with {len(X.columns)} features: {list(X.columns)}")

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

dump(model, 'credit_model.joblib')
print("✅ Model trained and saved as credit_model.joblib")
print(f"   Features used: {X.columns.tolist()}")