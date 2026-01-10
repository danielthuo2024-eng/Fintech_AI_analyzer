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
CORS(app)  # Enable CORS for React frontend

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load your trained model
MODEL_PATH = 'credit_model.joblib'

try:
    model = joblib.load(MODEL_PATH)
    logger.info(f"✅ AI Model loaded successfully from {MODEL_PATH}")
    logger.info(f"📊 Model type: {type(model).__name__}")
except Exception as e:
    logger.error(f"❌ Failed to load model: {str(e)}")
    model = None

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, (np.integer, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    else:
        return obj

def extract_features(df):
    """Extract features exactly as defined in your feature_engineering.py"""
    try:
        # Convert date column to datetime if needed
        if 'completion_time' in df.columns:
            df['completion_time'] = pd.to_datetime(df['completion_time'], errors='coerce')
        
        # Your exact feature engineering logic
        inflow = df[df['paid_in'] > 0]['paid_in'].sum()
        outflow = df[df['withdrawn'] > 0]['withdrawn'].sum()
        net_flow = inflow - outflow

        # IMPROVED repayment pattern detection
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
        
        # Also count consistent send money patterns (could indicate loan repayments to individuals)
        send_money_count = df['details'].str.contains("send money", case=False, na=False).sum()
        
        # If user has regular send money patterns, count some as potential repayments
        potential_repayments = repayments + (send_money_count * 0.3)  # 30% of send money could be repayments
        
        repayment_ratio = potential_repayments / len(df) if len(df) > 0 else 0

        balance_volatility = df['balance'].std() if 'balance' in df.columns else 0
        avg_transaction = df[df['paid_in'] > 0]['paid_in'].mean() or 0
        transaction_count = len(df)

        features = {
            'monthly_inflow': inflow,
            'monthly_outflow': outflow,
            'net_cash_flow': net_flow,
            'repayments': int(potential_repayments),  # Convert to int for display
            'repayment_ratio': repayment_ratio,
            'balance_volatility': balance_volatility,
            'avg_transaction_amount': avg_transaction,
            'transaction_count': transaction_count
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
    # This must match the order and features your model was trained on
    feature_columns = [
        'monthly_inflow', 
        'monthly_outflow', 
        'net_cash_flow',
        'repayments', 
        'repayment_ratio', 
        'balance_volatility',
        'avg_transaction_amount', 
        'transaction_count'
    ]
    
    # Create array in the exact order your model expects
    feature_array = np.array([[features[col] for col in feature_columns]])
    return feature_array

def predict_with_ai_model(features):
    """Use your trained AI model for prediction"""
    if model is None:
        raise Exception("AI model not loaded - using fallback scoring")
    
    try:
        # Prepare features for model (must match training data format)
        X = prepare_features_for_model(features)
        
        # Make prediction using your actual model
        logger.info(f"🤖 Making AI prediction with features shape: {X.shape}")
        
        if hasattr(model, 'predict_proba'):
            # For classifiers that support probability
            prediction_proba = model.predict_proba(X)[0]
            prediction = model.predict(X)[0]
            
            logger.info(f"📈 Prediction probabilities: {prediction_proba}")
            logger.info(f"🎯 Raw prediction: {prediction}")
            
            # Your model predicts probability of being creditworthy
            # Based on your code: 1 = good, 0 = bad
            approval_probability = prediction_proba[1]  # Probability of class 1 (creditworthy)
            
            return {
                'prediction': prediction,
                'approval_probability': approval_probability,
                'model_used': True,
                'model_type': type(model).__name__
            }
        else:
            # For models without probability
            prediction = model.predict(X)[0]
            logger.info(f"🎯 Raw prediction: {prediction}")
            
            return {
                'prediction': prediction,
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
    
    # Simple rule-based scoring as backup
    score = 0
    
    # Net cash flow (positive is good)
    if features['net_cash_flow'] > 0:
        score += 40
    elif features['net_cash_flow'] > -1000:
        score += 20
    else:
        score += 0
    
    # Repayment history
    if features['repayments'] > 3:
        score += 30
    elif features['repayments'] > 0:
        score += 15
    else:
        score += 0
    
    # Balance stability
    if features['balance_volatility'] < 1000:
        score += 20
    elif features['balance_volatility'] < 3000:
        score += 10
    else:
        score += 0
    
    # Transaction volume
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

@app.route('/api/predict', methods=['POST'])
def predict():
    """Main prediction endpoint using your AI model"""
    try:
        logger.info(f"📨 Received POST request to /api/predict")
        logger.info(f"📦 Request files: {list(request.files.keys())}")
        
        # Check for file - note: your React code uses 'mpesa_statement' as field name
        if 'mpesa_statement' not in request.files and 'file' not in request.files:
            logger.error("❌ No file found in request.files")
            return jsonify({
                'error': 'No file uploaded', 
                'received_files': list(request.files.keys()),
                'expected_fields': ['mpesa_statement', 'file']
            }), 400
        
        # Use either 'mpesa_statement' (from React) or 'file' (from direct calls)
        file_field = 'mpesa_statement' if 'mpesa_statement' in request.files else 'file'
        file = request.files[file_field]
        
        logger.info(f"📁 Processing file: {file.filename}")
        
        if file.filename == '':
            logger.error("❌ File filename is empty")
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            logger.error(f"❌ File is not CSV: {file.filename}")
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read and parse CSV
        df = pd.read_csv(file)
        logger.info(f"✅ Successfully parsed CSV with {len(df)} rows")
        logger.info(f"📊 DataFrame columns: {list(df.columns)}")
        
        # Validate required columns
        required_columns = ['receipt_no.', 'completion_time', 'details', 'transaction_status', 'paid_in', 'withdrawn', 'balance']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            logger.error(f"❌ Missing required columns: {missing_columns}")
            return jsonify({
                'error': f'CSV missing required columns: {missing_columns}',
                'required_columns': required_columns,
                'found_columns': list(df.columns)
            }), 400
        
        # Extract features using your exact logic
        features = extract_features(df)
        
        # Try to use AI model first, fallback to rule-based if needed
        try:
            model_prediction = predict_with_ai_model(features)
            logger.info(f"🤖 AI Model prediction: {model_prediction}")
            
            # Convert model output to credit decision
            if model_prediction['approval_probability'] is not None:
                prob = model_prediction['approval_probability']
                credit_score = round(prob * 100, 2)
                
                # Your decision logic from credit_score_algorithm.py
                if prob >= 0.7:  # 70% probability of being creditworthy
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
                    
                # Calculate interest rate based on risk
                base_rate = 12.0  # 12% base rate
                risk_adjustment = (1 - prob) * 15.0  # Up to 15% additional for risk
                synthetic_interest_rate = round(base_rate + risk_adjustment, 2)
                    
                prediction_result = {
                    'decision_status': decision_status,
                    'alt_score': credit_score,
                    'synthetic_interest_rate': synthetic_interest_rate,
                    'recommended_limit': round(limit, 2),
                    'model_used': True,
                    'approval_probability': round(prob, 4),
                    'model_type': model_prediction['model_type'],
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
                # Handle models without probability
                raw_pred = model_prediction['prediction']
                decision_status = "APPROVED" if raw_pred == 1 else "DECLINED"
                credit_score = 100 if raw_pred == 1 else 0
                
                prediction_result = {
                    'decision_status': decision_status,
                    'alt_score': credit_score,
                    'synthetic_interest_rate': 12.0 if raw_pred == 1 else 0,
                    'recommended_limit': 50000 if raw_pred == 1 else 0,
                    'model_used': True,
                    'model_type': model_prediction['model_type'],
                    'reason_codes': [f"AI classification: {'Creditworthy' if raw_pred == 1 else 'Not creditworthy'}"],
                    'breakdown': {
                        'ai_assessment': 'Model classification completed',
                        'decision_basis': 'Trained on transaction patterns'
                    }
                }
                
        except Exception as model_error:
            logger.warning(f"AI model failed, using fallback: {model_error}")
            fallback = fallback_prediction(features)
            prediction_result = {
                'decision_status': fallback['decision'],
                'alt_score': fallback['credit_score'],
                'synthetic_interest_rate': 15.0 if fallback['credit_score'] > 60 else 25.0,
                'recommended_limit': fallback['recommended_limit'],
                'model_used': False,
                'reason_codes': [fallback['reasoning']],
                'breakdown': {
                    'fallback_analysis': 'Rule-based scoring used',
                    'scoring_factors': 'Cash flow, repayments, stability'
                }
            }
        
        logger.info(f"🎯 Final prediction: {prediction_result['decision_status']} (Score: {prediction_result['alt_score']})")
        
        # Prepare response
        response = {
            'status': 'success',
            'features': features,
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
        'message': 'Credit Scoring API with AI Model'
    })

@app.route('/')
def index():
    """Root endpoint with API information"""
    return jsonify({
        'message': 'M-Pesa AI Credit Scoring API',
        'version': '1.0',
        'model_loaded': model is not None,
        'endpoints': {
            'POST /api/predict': 'Upload CSV for AI credit scoring',
            'GET /api/health': 'Health check'
        }
    })

if __name__ == '__main__':
    # Make sure the model file exists
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"⚠️  Model file not found at {MODEL_PATH}")
        logger.warning("The app will use fallback scoring until the model is available")
    
    app.run(debug=True, host='0.0.0.0', port=5000)