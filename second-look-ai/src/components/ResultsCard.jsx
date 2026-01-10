// ResultsCard.jsx
import React from 'react';

const ResultsCard = ({ 
  decision_status, 
  alt_score, 
  synthetic_interest_rate, 
  reason_codes, 
  breakdown 
}) => {
  console.log('📊 ResultsCard props:', { 
    decision_status, 
    alt_score, 
    synthetic_interest_rate, 
    reason_codes, 
    breakdown 
  });

  // Determine card color based on decision
  const getCardColor = () => {
    switch (decision_status) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200';
      case 'APPROVED_WITH_CAUTION':
        return 'bg-yellow-50 border-yellow-200';
      case 'REVIEW_NEEDED':
        return 'bg-blue-50 border-blue-200';
      case 'DECLINED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (decision_status) {
      case 'APPROVED':
        return '✅';
      case 'APPROVED_WITH_CAUTION':
        return '⚠️';
      case 'REVIEW_NEEDED':
        return '🔍';
      case 'DECLINED':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 shadow-lg ${getCardColor()}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Credit Decision</h2>
          <p className="text-gray-600">Based on AI analysis of your transaction patterns</p>
        </div>
        <div className="text-right">
          <div className="text-3xl">{getStatusIcon()}</div>
          <div className={`text-lg font-semibold ${
            decision_status === 'APPROVED' ? 'text-green-700' :
            decision_status === 'APPROVED_WITH_CAUTION' ? 'text-yellow-700' :
            decision_status === 'REVIEW_NEEDED' ? 'text-blue-700' :
            'text-red-700'
          }`}>
            {decision_status?.replace(/_/g, ' ') || 'PENDING'}
          </div>
        </div>
      </div>

      {/* Score and Interest Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">Credit Score</div>
          <div className="text-3xl font-bold text-indigo-600">{alt_score || 0}%</div>
          <div className="text-xs text-gray-500 mt-1">AI Confidence Score</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">Interest Rate</div>
          <div className="text-3xl font-bold text-green-600">{synthetic_interest_rate || 0}%</div>
          <div className="text-xs text-gray-500 mt-1">Recommended Rate</div>
        </div>
      </div>

      {/* Reason Codes */}
      {reason_codes && reason_codes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Factors</h3>
          <div className="space-y-2">
            {reason_codes.map((reason, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <p className="text-gray-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown */}
      // In ResultsCard.jsx - Update the breakdown section
{breakdown && Object.keys(breakdown).length > 0 && (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Analysis</h3>
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-b pb-2">
          <div className="text-sm font-medium text-gray-500">Cash Flow</div>
          <div className={`text-lg font-semibold ${breakdown.cash_flow_analysis?.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
            {breakdown.cash_flow_analysis}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {breakdown.cash_flow_analysis?.includes('-') 
              ? 'Spending exceeds deposits' 
              : 'Healthy financial flow'}
          </div>
        </div>
        
        <div className="border-b pb-2">
          <div className="text-sm font-medium text-gray-500">Repayment History</div>
          <div className="text-lg font-semibold text-gray-900">
            {breakdown.repayment_behavior}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {breakdown.repayment_behavior?.includes('0') 
              ? 'No loan repayment patterns detected' 
              : 'Regular repayment behavior'}
          </div>
        </div>
        
        <div className="border-b pb-2">
          <div className="text-sm font-medium text-gray-500">Balance Stability</div>
          <div className="text-lg font-semibold text-gray-900">
            {breakdown.balance_stability}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Lower volatility indicates better financial management
          </div>
        </div>
        
        <div className="border-b pb-2">
          <div className="text-sm font-medium text-gray-500">Transaction Activity</div>
          <div className="text-lg font-semibold text-gray-900">
            {breakdown.transaction_volume}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total transactions analyzed
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Debug info */}
      <details className="mt-6 text-xs">
        <summary className="cursor-pointer text-gray-500">Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded">
          {JSON.stringify({ decision_status, alt_score, synthetic_interest_rate, reason_codes, breakdown }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ResultsCard;