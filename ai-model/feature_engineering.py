def extract_features(df):
    """Extract features including temporal patterns"""
    import numpy as np
    
    # Sort by date FIRST
    if 'completion_time' in df.columns:
        df['completion_time'] = pd.to_datetime(df['completion_time'], errors='coerce')
        df = df.sort_values('completion_time', ascending=True)
    
    # Existing features
    inflow = df[df['paid_in'] > 0]['paid_in'].sum()
    outflow = df[df['withdrawn'] > 0]['withdrawn'].sum()
    net_flow = inflow - outflow

    repayments = df['details'].str.contains("repay|tingg|eclof|loan|m-kopa", case=False, na=False).sum()
    repayment_ratio = repayments / inflow if inflow > 0 else 0

    balance_volatility = df['balance'].std() if 'balance' in df.columns else 0
    avg_transaction = df[df['paid_in'] > 0]['paid_in'].mean() or 0
    transaction_count = len(df)
    
    # NEW TEMPORAL FEATURES
    if 'completion_time' in df.columns and not df['completion_time'].isna().all():
        valid_dates = df['completion_time'].dropna()
        if len(valid_dates) > 1:
            date_range = (valid_dates.max() - valid_dates.min()).days
            days_covered = max(1, date_range)
            transactions_per_day = transaction_count / days_covered
            
            # Simple trend: first half vs second half
            half_idx = len(df) // 2
            first_half_inflow = df.iloc[:half_idx][df['paid_in'] > 0]['paid_in'].sum()
            second_half_inflow = df.iloc[half_idx:][df['paid_in'] > 0]['paid_in'].sum()
            inflow_trend = (second_half_inflow - first_half_inflow) / max(first_half_inflow, 1)
            
            # Consistency
            if len(valid_dates) > 5:
                date_diffs = []
                sorted_dates = valid_dates.sort_values().dt.date
                for i in range(1, min(10, len(sorted_dates))):
                    diff = (sorted_dates.iloc[i] - sorted_dates.iloc[i-1]).days
                    if diff > 0:
                        date_diffs.append(diff)
                transaction_consistency = np.std(date_diffs) if date_diffs else 0
            else:
                transaction_consistency = 0
        else:
            days_covered = 30
            transactions_per_day = transaction_count / 30
            inflow_trend = 0
            transaction_consistency = 0
    else:
        days_covered = 30
        transactions_per_day = transaction_count / 30
        inflow_trend = 0
        transaction_consistency = 0

    return {
        'monthly_inflow': inflow,
        'monthly_outflow': outflow,
        'net_cash_flow': net_flow,
        'repayments': repayments,
        'repayment_ratio': repayment_ratio,
        'balance_volatility': balance_volatility,
        'avg_transaction_amount': avg_transaction,
        'transaction_count': transaction_count,
        # New temporal features
        'days_covered': days_covered,
        'transactions_per_day': transactions_per_day,
        'inflow_trend': inflow_trend,
        'transaction_consistency': transaction_consistency
    }