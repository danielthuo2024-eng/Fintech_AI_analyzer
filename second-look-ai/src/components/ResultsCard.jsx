import React from 'react';

const ResultsCard = ({ 
  decision_status, 
  alt_score, 
  synthetic_interest_rate, 
  reason_codes, 
  breakdown,
  explanations 
}) => {
  console.log('📊 ResultsCard props:', { 
    decision_status, 
    alt_score, 
    synthetic_interest_rate, 
    reason_codes, 
    breakdown,
    explanations 
  });

  // Determine card color based on decision
  const getCardColor = () => {
    switch (decision_status) {
      case 'APPROVED':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'APPROVED_WITH_CAUTION':
        return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200';
      case 'REVIEW_NEEDED':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200';
      case 'DECLINED':
        return 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
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

  const getStatusColor = () => {
    switch (decision_status) {
      case 'APPROVED':
        return 'text-green-700';
      case 'APPROVED_WITH_CAUTION':
        return 'text-yellow-700';
      case 'REVIEW_NEEDED':
        return 'text-blue-700';
      case 'DECLINED':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusBgColor = () => {
    switch (decision_status) {
      case 'APPROVED':
        return 'bg-green-100';
      case 'APPROVED_WITH_CAUTION':
        return 'bg-yellow-100';
      case 'REVIEW_NEEDED':
        return 'bg-blue-100';
      case 'DECLINED':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`rounded-2xl border-2 p-8 shadow-xl ${getCardColor()}`}>
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900">Credit Decision Summary</h2>
          <p className="text-gray-600 mt-2">AI-powered analysis of your financial transaction patterns</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-center sm:text-right">
            <div className="text-4xl mb-2">{getStatusIcon()}</div>
            <div className={`text-xl font-bold ${getStatusColor()}`}>
              {decision_status?.replace(/_/g, ' ') || 'PENDING'}
            </div>
          </div>
          <div className={`${getStatusBgColor()} px-4 py-2 rounded-lg`}>
            <div className="text-sm text-gray-600">Confidence Score</div>
            <div className="text-2xl font-bold text-gray-900">{alt_score || 0}%</div>
          </div>
        </div>
      </div>

      {/* Score and Interest Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">Credit Score</div>
              <div className="text-4xl font-bold text-indigo-600">{alt_score || 0}%</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${alt_score || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">Recommended Interest Rate</div>
              <div className="text-4xl font-bold text-green-600">{synthetic_interest_rate || 0}%</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-teal-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💵</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Base Rate</span>
              <span className="font-medium">12.0%</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Adjustment</span>
              <span className="font-medium">+{Math.max(0, (synthetic_interest_rate || 0) - 12).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanations Section */}
      {explanations && (
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-white text-lg font-bold">AI</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">AI Business Intelligence</h3>
              <p className="text-gray-600">Automated insights from transaction pattern analysis</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
            {/* Business Classification */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
              <div>
                <div className="text-sm text-gray-500">Business Profile</div>
                <div className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
                  {explanations.business_behavior}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
              <div>
                <div className="text-sm text-gray-500">Risk Assessment</div>
                <div className={`text-xl font-bold ${
                  explanations.risk_assessment === 'Low Risk' ? 'text-green-600' :
                  explanations.risk_assessment === 'Medium Risk' ? 'text-yellow-600' :
                  'text-red-600'
                } flex items-center`}>
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    explanations.risk_assessment === 'Low Risk' ? 'bg-green-500' :
                    explanations.risk_assessment === 'Medium Risk' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></span>
                  {explanations.risk_assessment}
                </div>
              </div>
            </div>
            
            {/* AI Explanations */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h4>
              <div className="space-y-4">
                {explanations.explanations && explanations.explanations.map((exp, idx) => (
                  <div key={idx} className="flex items-start group">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform duration-200">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{exp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Metrics Snapshot</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {explanations.key_metrics && Object.entries(explanations.key_metrics).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                      {key.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Note */}
            <div className="mt-4 text-sm text-gray-500 italic">
              <div className="flex items-start">
                <span className="mr-2">💡</span>
                <span>{explanations.note}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Analysis Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Cash Flow Analysis</h4>
                  <p className="text-sm text-gray-600">Income vs Expenses</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                breakdown.cash_flow_analysis?.includes('-') ? 'text-red-600' : 'text-green-600'
              }`}>
                {breakdown.cash_flow_analysis}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {breakdown.cash_flow_analysis?.includes('-') 
                  ? 'Spending exceeds deposits - consider reducing expenses' 
                  : 'Healthy financial flow - positive cash generation'}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Repayment Behavior</h4>
                  <p className="text-sm text-gray-600">Credit responsibility</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {breakdown.repayment_behavior}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {breakdown.repayment_behavior?.includes('0') 
                  ? 'No loan repayment patterns detected' 
                  : 'Regular repayment behavior observed'}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Balance Stability</h4>
                  <p className="text-sm text-gray-600">Financial consistency</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {breakdown.balance_stability}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Lower volatility indicates better financial management
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Transaction Volume</h4>
                  <p className="text-sm text-gray-600">Business activity level</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {breakdown.transaction_volume}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total transactions analyzed for pattern detection
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reason Codes */}
      {reason_codes && reason_codes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Decision Factors</h3>
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="space-y-3">
              {reason_codes.map((reason, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-gray-700">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📝</span>
            </div>
            <div className="font-medium text-gray-900 mb-1">Review Analysis</div>
            <div className="text-sm text-gray-600">Carefully review the AI insights above</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💼</span>
            </div>
            <div className="font-medium text-gray-900 mb-1">Consider Options</div>
            <div className="text-sm text-gray-600">Explore financial products matching your profile</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📈</span>
            </div>
            <div className="font-medium text-gray-900 mb-1">Improve Score</div>
            <div className="text-sm text-gray-600">Follow recommendations to enhance credit profile</div>
          </div>
        </div>
      </div>

      {/* Debug info - Hidden in production */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 text-xs">
          <summary className="cursor-pointer text-gray-500 font-medium">Developer Debug Info</summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-64">
            {JSON.stringify({ 
              decision_status, 
              alt_score, 
              synthetic_interest_rate, 
              reason_codes, 
              breakdown, 
              explanations 
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ResultsCard;