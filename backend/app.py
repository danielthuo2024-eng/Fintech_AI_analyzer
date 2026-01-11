from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import logging
from datetime import datetime
import traceback
import joblib
import os

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load your trained model
MODEL_PATH = 'credit_model.joblib'

try:
    model = joblib.load(MODEL_PATH)
    logger.info(f"✅ AI Model loaded successfully from {MODEL_PATH}")
    logger.info(f"📊 Model type: {type(model).__name__}")
    # Check model feature count
    if hasattr(model, 'n_features_in_'):
        logger.info(f"📊 Model expects {model.n_features_in_} features")
except Exception as e:
    logger.error(f"❌ Failed to load model: {str(e)}")
    model = None

# ============================================
# EXPLANATION ENGINE
# ============================================

def explain_credit_decision(features, prediction, prediction_proba=None):
    """MSME Credit Scoring Explanation Engine"""
    
    # BUSINESS BEHAVIOR CLASSIFICATION
    volatility = features.get('balance_volatility', 0)
    tx_count = features.get('transaction_count', 0)
    net_flow = features.get('net_cash_flow', 0)
    
    if volatility < 1000 and tx_count > 50:
        business_label = "Stable Business"
    elif net_flow > 10000 and features.get('monthly_inflow', 0) > 50000:
        business_label = "Growing Business"
    elif volatility > 3000 or abs(net_flow) > 5000:
        business_label = "Volatile Business"
    elif tx_count < 20:
        business_label = "Low Activity Business"
    elif features.get('repayment_ratio', 0) > 0.1:
        business_label = "Credit-Conscious Business"
    else:
        business_label = "Typical MSME"
    
    # RISK LEVEL ASSESSMENT
    risk_score = 0
    
    if net_flow > 0:
        risk_score -= 1
    if features.get('repayments', 0) >= 3:
        risk_score -= 1
    if volatility < 1500:
        risk_score -= 1
    
    if net_flow < -2000:
        risk_score += 2
    if volatility > 4000:
        risk_score += 2
    if features.get('repayments', 0) == 0:
        risk_score += 1
    
    if risk_score <= -2:
        risk_level = "Low Risk"
    elif risk_score <= 0:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"
    
    if prediction == 0:
        risk_level = "High Risk"
    
    # EXPLANATION GENERATION
    explanations = []
    
    if prediction == 1:
        if prediction_proba:
            confidence = "high" if prediction_proba > 0.8 else "moderate"
            explanations.append(f"AI model indicates {confidence} confidence in creditworthiness ({prediction_proba:.0%})")
        else:
            explanations.append("AI model classifies as creditworthy based on transaction patterns")
    else:
        if prediction_proba:
            confidence = "high" if prediction_proba < 0.3 else "moderate"
            explanations.append(f"AI model shows {confidence} confidence in elevated risk ({1-prediction_proba:.0%})")
        else:
            explanations.append("AI model identifies elevated risk factors in transaction history")
    
    # Cash flow explanation
    if net_flow > 5000:
        explanations.append(f"Strong positive cash flow: Business generates KES {net_flow:,.0f} more than it spends monthly")
    elif net_flow > 0:
        explanations.append(f"Positive cash flow: Business maintains a healthy financial buffer of KES {net_flow:,.0f}")
    elif net_flow < 0:
        explanations.append(f"Cash flow concern: Monthly spending exceeds income by KES {abs(net_flow):,.0f}")
    else:
        explanations.append("Balanced cash flow: Income and expenses are closely matched")
    
    # Repayment behavior explanation
    repayments = features.get('repayments', 0)
    if repayments >= 4:
        explanations.append(f"Excellent repayment history: {repayments} loan/credit transactions indicate strong financial discipline")
    elif repayments >= 2:
        explanations.append(f"Good repayment pattern: {repayments} credit-related transactions show credit awareness")
    elif repayments == 1:
        explanations.append(f"Limited credit history: Only {repayments} credit-related transaction detected")
    else:
        explanations.append("No detected repayment history: Consider establishing credit relationships")
    
    # Transaction stability explanation
    if volatility < 1000:
        explanations.append(f"High financial stability: Low balance volatility (KES {volatility:,.0f}) indicates consistent operations")
    elif volatility < 3000:
        explanations.append(f"Moderate financial stability: Balance volatility of KES {volatility:,.0f} suggests typical business fluctuations")
    else:
        explanations.append(f"Financial variability: High balance volatility (KES {volatility:,.0f}) may indicate inconsistent cash management")
    
    # Transaction volume explanation
    if tx_count > 100:
        explanations.append(f"High transaction volume: {tx_count} transactions monthly show active business operations")
    elif tx_count > 30:
        explanations.append(f"Healthy transaction activity: {tx_count} monthly transactions indicate regular business flow")
    else:
        explanations.append(f"Limited transaction activity: {tx_count} transactions may suggest seasonal or low-volume business")
    
    # FINAL EXPLANATION PACKAGE
    explanation_package = {
        "business_behavior": business_label,
        "risk_assessment": risk_level,
        "explanations": explanations[:4],
        "key_metrics": {
            "net_monthly_cash_flow": f"KES {net_flow:,.0f}",
            "monthly_transactions": tx_count,
            "detected_repayments": repayments,
            "balance_stability": f"KES {volatility:,.0f} volatility"
        },
        "note": "Explanations generated using rule-based logic. In production, this would be powered by Gemini on Vertex AI."
    }
    
    return explanation_package

# ============================================
# HELPER FUNCTIONS
# ============================================

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, (np.integer, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        if pd.isna(obj):
            return None
        return obj.isoformat()
    elif pd.isna(obj):
        return None
    else:
        return obj

def safe_date_convert(date_str):
    """Safely convert date strings, handling NaT"""
    try:
        return pd.to_datetime(date_str, errors='coerce')
    except:
        return pd.NaT

def parse_and_format_transactions(df):
    """Parse and format transactions for frontend display with proper date handling"""
    try:
        # Make a copy to avoid warnings
        df = df.copy()
        
        # Convert date column to datetime
        if 'completion_time' in df.columns:
            df['completion_time'] = df['completion_time'].apply(safe_date_convert)
            
            # Sort by date (earliest to latest for analysis)
            df = df.sort_values('completion_time', ascending=True)
            
            # Check date range
            valid_dates = df['completion_time'].dropna()
            if len(valid_dates) > 1:
                date_range = (valid_dates.max() - valid_dates.min()).days
                logger.info(f"📅 Date range: {date_range} days")
        
        # Format for frontend
        transactions = []
        for idx, row in df.iterrows():
            # Extract values safely
            paid_in = float(row.get('paid_in', 0) or 0)
            withdrawn = float(row.get('withdrawn', 0) or 0)
            balance = float(row.get('balance', 0) or 0)
            
            transaction = {
                'id': idx,
                'receipt_no': str(row.get('receipt_no.', 'N/A')).strip(),
                'date': row.get('completion_time'),
                'description': str(row.get('details', 'N/A')).strip(),
                'status': str(row.get('transaction_status', 'N/A')).strip(),
                'amount_in': paid_in,
                'amount_out': withdrawn,
                'balance': balance,
                'type': 'deposit' if paid_in > 0 else 'withdrawal'
            }
            
            # Convert date to readable formats
            date_val = transaction['date']
            if pd.notna(date_val) and hasattr(date_val, 'strftime'):
                transaction['date_iso'] = date_val.isoformat()
                transaction['date_display'] = date_val.strftime('%b %d, %Y %I:%M %p')
                transaction['date_short'] = date_val.strftime('%Y-%m-%d')
                transaction['month_year'] = date_val.strftime('%b %Y')
                transaction['day_of_week'] = date_val.strftime('%A')
                transaction['time_only'] = date_val.strftime('%I:%M %p')
            else:
                transaction['date_iso'] = ''
                transaction['date_display'] = 'Unknown Date'
                transaction['date_short'] = ''
                transaction['month_year'] = ''
                transaction['day_of_week'] = ''
                transaction['time_only'] = ''
            
            transactions.append(transaction)
        
        logger.info(f"📊 Processed {len(transactions)} transactions")
        
        # Return sorted by date (chronological)
        return sorted(transactions, key=lambda x: x.get('date_iso', ''))
        
    except Exception as e:
        logger.error(f"Error formatting transactions: {str(e)}")
        logger.error(traceback.format_exc())
        return []

def extract_features(df):
    """Extract features including temporal patterns"""
    try:
        # Make a copy to avoid warnings
        df = df.copy()
        
        # Convert date column to datetime
        if 'completion_time' in df.columns:
            df['completion_time'] = df['completion_time'].apply(safe_date_convert)
        
        # ===== TEMPORAL ANALYSIS =====
        has_temporal_data = 'completion_time' in df.columns and not df['completion_time'].isna().all()
        
        temporal_features = {}
        if has_temporal_data:
            # Sort by date for temporal analysis
            df = df.sort_values('completion_time', ascending=True)
            
            # Calculate days covered by transactions
            valid_dates = df['completion_time'].dropna()
            if len(valid_dates) > 1:
                date_range = (valid_dates.max() - valid_dates.min()).days
                days_covered = max(1, date_range)
                
                # Transaction frequency
                transactions_per_day = len(df) / days_covered
                
                # Simple trend: compare first half vs second half
                half_idx = len(df) // 2
                # FIXED: Use .loc to avoid reindexing warning
                first_half_mask = df.index[:half_idx]
                second_half_mask = df.index[half_idx:]
                
                first_half_inflow = df.loc[first_half_mask][df.loc[first_half_mask, 'paid_in'] > 0]['paid_in'].sum()
                second_half_inflow = df.loc[second_half_mask][df.loc[second_half_mask, 'paid_in'] > 0]['paid_in'].sum()
                
                if first_half_inflow > 0:
                    inflow_trend = (second_half_inflow - first_half_inflow) / first_half_inflow
                else:
                    inflow_trend = 0 if second_half_inflow == 0 else 1
                
                # Consistency: check if transactions are regular
                if len(valid_dates) > 5:
                    date_diffs = []
                    sorted_dates = valid_dates.sort_values().dt.date
                    for i in range(1, min(10, len(sorted_dates))):
                        diff = (sorted_dates.iloc[i] - sorted_dates.iloc[i-1]).days
                        if diff > 0:
                            date_diffs.append(diff)
                    
                    if date_diffs:
                        transaction_consistency = np.std(date_diffs)
                    else:
                        transaction_consistency = 0
                else:
                    transaction_consistency = 0
                
                temporal_features = {
                    'days_covered': days_covered,
                    'transactions_per_day': transactions_per_day,
                    'inflow_trend': inflow_trend,
                    'transaction_consistency': transaction_consistency
                }
            else:
                temporal_features = {
                    'days_covered': 30,
                    'transactions_per_day': len(df) / 30,
                    'inflow_trend': 0,
                    'transaction_consistency': 0
                }
        else:
            temporal_features = {
                'days_covered': 30,
                'transactions_per_day': len(df) / 30,
                'inflow_trend': 0,
                'transaction_consistency': 0
            }
        
        # ===== EXISTING FEATURE CALCULATIONS =====
        inflow = df[df['paid_in'] > 0]['paid_in'].sum()
        outflow = df[df['withdrawn'] > 0]['withdrawn'].sum()
        net_flow = inflow - outflow

        # Improved repayment pattern detection
        repayment_patterns = [
            "repay", "loan", "lend", "borrow", "credit", 
            "finance", "microfinance", "branch", "equity", 
            "kcb", "cooperative", "sacco", "m-shwari"
        ]
        
        # Count transactions that might indicate financial responsibility
        repayments = df['details'].str.contains(
            "|".join(repayment_patterns), 
            case=False, 
            na=False
        ).sum()
        
        # Also count consistent send money patterns
        send_money_count = df['details'].str.contains("send money", case=False, na=False).sum()
        
        # If user has regular send money patterns, count some as potential repayments
        potential_repayments = repayments + (send_money_count * 0.3)
        
        repayment_ratio = potential_repayments / len(df) if len(df) > 0 else 0

        balance_volatility = df['balance'].std() if 'balance' in df.columns else 0
        avg_transaction = df[df['paid_in'] > 0]['paid_in'].mean() or 0
        transaction_count = len(df)

        # ===== COMBINE ALL FEATURES =====
        features = {
            # Existing features
            'monthly_inflow': inflow,
            'monthly_outflow': outflow,
            'net_cash_flow': net_flow,
            'repayments': int(potential_repayments),
            'repayment_ratio': repayment_ratio,
            'balance_volatility': balance_volatility,
            'avg_transaction_amount': avg_transaction,
            'transaction_count': transaction_count,
            
            # New temporal features
            **temporal_features,
            
            # Metadata
            'has_temporal_data': has_temporal_data
        }
        
        # Convert all values to native Python types
        features = {k: convert_numpy_types(v) for k, v in features.items()}
        
        logger.info(f"🔍 Features extracted: {features}")
        return features
        
    except Exception as e:
        logger.error(f"Error extracting features: {str(e)}")
        raise

def prepare_features_for_model(features):
    """Convert features to the exact format expected by your trained model"""
    # Define feature order - MUST MATCH WHAT YOUR MODEL WAS TRAINED WITH
    # Check your model's feature count!
    if model and hasattr(model, 'n_features_in_'):
        feature_count = model.n_features_in_
        logger.info(f"📊 Model expects {feature_count} features")
        
        if feature_count == 8:
            # Old model (8 features)
            feature_columns = [
                'monthly_inflow', 'monthly_outflow', 'net_cash_flow',
                'repayments', 'repayment_ratio', 'balance_volatility',
                'avg_transaction_amount', 'transaction_count'
            ]
        elif feature_count == 12:
            # New model with temporal features (12 features)
            feature_columns = [
                'monthly_inflow', 'monthly_outflow', 'net_cash_flow',
                'repayments', 'repayment_ratio', 'balance_volatility',
                'avg_transaction_amount', 'transaction_count',
                'days_covered', 'transactions_per_day', 'inflow_trend', 'transaction_consistency'
            ]
        else:
            # Default to new model
            feature_columns = [
                'monthly_inflow', 'monthly_outflow', 'net_cash_flow',
                'repayments', 'repayment_ratio', 'balance_volatility',
                'avg_transaction_amount', 'transaction_count',
                'days_covered', 'transactions_per_day', 'inflow_trend', 'transaction_consistency'
            ]
    else:
        # Default to 12 features if we can't determine
        feature_columns = [
            'monthly_inflow', 'monthly_outflow', 'net_cash_flow',
            'repayments', 'repayment_ratio', 'balance_volatility',
            'avg_transaction_amount', 'transaction_count',
            'days_covered', 'transactions_per_day', 'inflow_trend', 'transaction_consistency'
        ]
    
    # Ensure all features exist with default values
    for col in feature_columns:
        if col not in features:
            features[col] = 0
    
    # Create array in the exact order
    feature_array = np.array([[features[col] for col in feature_columns]])
    logger.info(f"📊 Prepared {len(feature_columns)} features for model")
    return feature_array

def predict_with_ai_model(features):
    """Use your trained AI model for prediction"""
    if model is None:
        raise Exception("AI model not loaded - using fallback scoring")
    
    try:
        # Prepare features for model
        X = prepare_features_for_model(features)
        
        # Make prediction
        logger.info(f"🤖 Making AI prediction with features shape: {X.shape}")
        
        if hasattr(model, 'predict_proba'):
            prediction_proba = model.predict_proba(X)[0]
            prediction = model.predict(X)[0]
            
            logger.info(f"📈 Prediction probabilities: {prediction_proba}")
            logger.info(f"🎯 Raw prediction: {prediction}")
            
            approval_probability = prediction_proba[1] if len(prediction_proba) > 1 else prediction_proba[0]
            
            return {
                'prediction': int(prediction),
                'approval_probability': float(approval_probability),
                'model_used': True,
                'model_type': type(model).__name__
            }
        else:
            prediction = model.predict(X)[0]
            logger.info(f"🎯 Raw prediction: {prediction}")
            
            return {
                'prediction': int(prediction),
                'approval_probability': None,
                'model_used': True,
                'model_type': type(model).__name__
            }
        
    except Exception as e:
        logger.error(f"AI model prediction failed: {str(e)}")
        raise

def fallback_prediction(features):
    """Fallback to rule-based scoring if model fails"""
    logger.warning("🔄 Using fallback rule-based scoring")
    
    # Simple rule-based scoring
    score = 0
    
    if features['net_cash_flow'] > 0:
        score += 40
    elif features['net_cash_flow'] > -1000:
        score += 20
    
    if features['repayments'] > 3:
        score += 30
    elif features['repayments'] > 0:
        score += 15
    
    if features['balance_volatility'] < 1000:
        score += 20
    elif features['balance_volatility'] < 3000:
        score += 10
    
    if features['transaction_count'] > 50:
        score += 10
    
    final_score = max(0, min(100, score))
    
    if final_score >= 60:
        decision = "APPROVED"
        limit = min(50000, max(5000, final_score * 500))
    elif final_score >= 40:
        decision = "APPROVED_WITH_CAUTION"
        limit = min(10000, max(1000, final_score * 200))
    elif final_score >= 20:
        decision = "REVIEW_NEEDED"
        limit = 0
    else:
        decision = "DECLINED"
        limit = 0
    
    return {
        'credit_score': round(final_score, 2),
        'decision': decision,
        'recommended_limit': round(limit, 2),
        'model_used': False,
        'reasoning': f"Fallback scoring: Net flow KES {features['net_cash_flow']:.0f}, Repayments: {features['repayments']}, Volatility: {features['balance_volatility']:.0f}"
    }

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/explain', methods=['POST'])
def explain_decision():
    """Endpoint to get explanations for credit decisions without prediction"""
    try:
        data = request.json
        
        features = data.get('features', {})
        prediction = data.get('prediction')
        probability = data.get('probability')
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
        explanations = explain_credit_decision(
            features=features,
            prediction=prediction,
            prediction_proba=probability
        )
        
        return jsonify({
            'status': 'success',
            'explanations': explanations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Explanation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Main prediction endpoint using your AI model WITH explanations"""
    try:
        logger.info(f"📨 Received POST request to /api/predict")
        
        if 'mpesa_statement' not in request.files and 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file_field = 'mpesa_statement' if 'mpesa_statement' in request.files else 'file'
        file = request.files[file_field]
        
        logger.info(f"📁 Processing file: {file.filename}")
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read and parse CSV
        df = pd.read_csv(file)
        logger.info(f"✅ Successfully parsed CSV with {len(df)} rows")
        
        # Validate required columns
        required_columns = ['receipt_no.', 'completion_time', 'details', 'transaction_status', 'paid_in', 'withdrawn', 'balance']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return jsonify({'error': f'CSV missing required columns: {missing_columns}'}), 400
        
        # Extract features
        features = extract_features(df)
        
        # Parse and format transactions for display
        transactions = parse_and_format_transactions(df)
        logger.info(f"📊 Processed {len(transactions)} transactions for display")
        
        # Try to use AI model first, fallback to rule-based if needed
        try:
            model_prediction = predict_with_ai_model(features)
            logger.info(f"🤖 AI Model prediction: {model_prediction}")
            
            if model_prediction['approval_probability'] is not None:
                prob = model_prediction['approval_probability']
                credit_score = round(prob * 100, 2)
                
                if prob >= 0.7:
                    decision_status = "APPROVED"
                    limit = prob * 50000
                elif prob >= 0.5:
                    decision_status = "APPROVED_WITH_CAUTION" 
                    limit = prob * 20000
                elif prob >= 0.3:
                    decision_status = "REVIEW_NEEDED"
                    limit = 0
                else:
                    decision_status = "DECLINED"
                    limit = 0
                    
                base_rate = 12.0
                risk_adjustment = (1 - prob) * 15.0
                synthetic_interest_rate = round(base_rate + risk_adjustment, 2)
                    
                explanations = explain_credit_decision(
                    features=features,
                    prediction=model_prediction['prediction'],
                    prediction_proba=prob
                )
                    
                prediction_result = {
                    'decision_status': decision_status,
                    'alt_score': credit_score,
                    'synthetic_interest_rate': synthetic_interest_rate,
                    'recommended_limit': round(limit, 2),
                    'model_used': True,
                    'approval_probability': round(prob, 4),
                    'model_type': model_prediction['model_type'],
                    'explanations': explanations,
                    'reason_codes': [
                        f"Transaction pattern analysis: {credit_score}% confidence",
                        f"Cash flow: {'Positive' if features['net_cash_flow'] > 0 else 'Needs improvement'}",
                        f"Repayment history: {features['repayments']} transactions identified"
                    ],
                    'breakdown': {
                        'cash_flow_analysis': f"KES {features['net_cash_flow']:.0f} net monthly flow",
                        'repayment_behavior': f"{features['repayments']} repayment transactions",
                        'balance_stability': f"Volatility: KES {features['balance_volatility']:.0f}",
                        'transaction_volume': f"{features['transaction_count']} total transactions"
                    }
                }
            else:
                raw_pred = model_prediction['prediction']
                decision_status = "APPROVED" if raw_pred == 1 else "DECLINED"
                credit_score = 100 if raw_pred == 1 else 0
                
                explanations = explain_credit_decision(
                    features=features,
                    prediction=raw_pred,
                    prediction_proba=None
                )
                
                prediction_result = {
                    'decision_status': decision_status,
                    'alt_score': credit_score,
                    'synthetic_interest_rate': 12.0 if raw_pred == 1 else 0,
                    'recommended_limit': 50000 if raw_pred == 1 else 0,
                    'model_used': True,
                    'model_type': model_prediction['model_type'],
                    'explanations': explanations,
                    'reason_codes': [f"AI classification: {'Creditworthy' if raw_pred == 1 else 'Not creditworthy'}"],
                    'breakdown': {
                        'ai_assessment': 'Model classification completed',
                        'decision_basis': 'Trained on transaction patterns'
                    }
                }
                
        except Exception as model_error:
            logger.warning(f"AI model failed, using fallback: {model_error}")
            fallback = fallback_prediction(features)
            
            explanations = explain_credit_decision(
                features=features,
                prediction=1 if fallback['credit_score'] >= 60 else 0,
                prediction_proba=fallback['credit_score'] / 100
            )
            
            prediction_result = {
                'decision_status': fallback['decision'],
                'alt_score': fallback['credit_score'],
                'synthetic_interest_rate': 15.0 if fallback['credit_score'] > 60 else 25.0,
                'recommended_limit': fallback['recommended_limit'],
                'model_used': False,
                'explanations': explanations,
                'reason_codes': [fallback['reasoning']],
                'breakdown': {
                    'fallback_analysis': 'Rule-based scoring used',
                    'scoring_factors': 'Cash flow, repayments, stability'
                }
            }
        
        logger.info(f"🎯 Final prediction: {prediction_result['decision_status']} (Score: {prediction_result['alt_score']})")
        
        # Prepare response - ensure all dates are serializable
        features_clean = {k: convert_numpy_types(v) for k, v in features.items()}
        transactions_clean = []
        for tx in transactions:
            tx_clean = {}
            for k, v in tx.items():
                tx_clean[k] = convert_numpy_types(v)
            transactions_clean.append(tx_clean)
        
        response = {
            'status': 'success',
            'features': features_clean,
            'transactions': transactions_clean,
            'prediction': prediction_result,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = "loaded" if model is not None else "not loaded"
    model_type = type(model).__name__ if model else "none"
    
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'model_status': model_status,
        'model_type': model_type,
        'message': 'Credit Scoring API with AI Model & Explanation Engine'
    })

@app.route('/')
def index():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'M-Pesa AI Credit Scoring API',
        'version': '2.0',
        'model_loaded': model is not None,
        'explanation_engine': 'Enabled',
        'endpoints': {
            'POST /api/predict': 'Upload CSV for AI credit scoring with explanations',
            'POST /api/explain': 'Get explanations for existing predictions',
            'GET /api/health': 'Health check'
        }
    })

if __name__ == '__main__':
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"⚠️  Model file not found at {MODEL_PATH}")
        logger.warning("The app will use fallback scoring until the model is available")
    
    app.run(debug=True, host='0.0.0.0', port=5000)