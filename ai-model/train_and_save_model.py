import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from joblib import dump
import random

def create_training_data():
    """Create realistic training data based on M-Pesa patterns"""
    samples = []
    
    for _ in range(1000):
        # Realistic M-Pesa user patterns
        inflow = random.randint(5000, 80000)
        outflow = random.randint(4000, int(inflow * 0.9))  # ✅ FIXED (cast to int)
        net_flow = inflow - outflow
        
        # Loan repayment behavior
        repayments = random.randint(0, 8)
        repayment_ratio = repayments / max(inflow, 1)
        
        # Transaction patterns
        balance_volatility = random.uniform(100, 5000)
        avg_transaction = inflow / random.randint(15, 60)
        transaction_count = random.randint(20, 200)
        
        # Creditworthiness factors
        has_consistent_income = inflow > 20000
        has_positive_flow = net_flow > 0
        has_repayment_history = repayments > 2
        has_low_volatility = balance_volatility < 2000
        
        # Credit score simulation (1 = good, 0 = bad)
        credit_score = 1 if (
            has_consistent_income and 
            has_positive_flow and 
            has_repayment_history and
            has_low_volatility
        ) else 0
        
        samples.append({
            'monthly_inflow': inflow,
            'monthly_outflow': outflow,
            'net_cash_flow': net_flow,
            'repayments': repayments,
            'repayment_ratio': repayment_ratio,
            'balance_volatility': balance_volatility,
            'avg_transaction_amount': avg_transaction,
            'transaction_count': transaction_count,
            'creditworthy': credit_score
        })
    
    return pd.DataFrame(samples)

def train_model():
    print("🔄 Creating training data...")
    df = create_training_data()
    
    # Prepare features and target
    X = df.drop('creditworthy', axis=1)
    y = df['creditworthy']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("🔄 Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Calculate accuracy
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"✅ Model trained successfully!")
    print(f"   Training Accuracy: {train_score:.3f}")
    print(f"   Test Accuracy: {test_score:.3f}")
    
    # Save the model
    dump(model, 'credit_model.joblib')
    print("💾 Model saved as 'credit_model.joblib'")
    
    # Print feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔍 Feature Importance:")
    print(feature_importance)
    
    return model

if __name__ == "__main__":
    train_model()
