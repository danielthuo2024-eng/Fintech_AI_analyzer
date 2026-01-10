// HistoryPage.jsx
import React, { useState, useEffect } from 'react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem('mpesaAnalysisHistory') || '[]');
      console.log('📚 Loaded history:', storedHistory);
      setHistory(storedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('mpesaAnalysisHistory');
      setHistory([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'APPROVED_WITH_CAUTION':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW_NEEDED':
        return 'bg-blue-100 text-blue-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
              <p className="text-gray-600 mt-2">Your past M-Pesa statement analyses</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear All History
              </button>
            )}
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis history yet</h3>
              <p className="text-gray-600 mb-6">Upload your first M-Pesa statement to see your analysis history here.</p>
              <a
                href="/upload"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start First Analysis
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getStatusIcon(item.status)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.filename || 'M-Pesa Statement'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()} at{' '}
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0 ${getStatusColor(item.status)}`}>
                        {item.status?.replace(/_/g, ' ') || 'UNKNOWN'}
                      </span>
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">
                          {item.result?.credit_score || 0}%
                        </div>
                        <div className="text-sm text-gray-500">Credit Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {item.result?.interest_rate || 0}%
                        </div>
                        <div className="text-sm text-gray-500">Interest Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {item.result?.reason_codes?.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Key Factors</div>
                      </div>
                    </div>

                    {/* Reason Codes */}
                    {item.result?.reason_codes && item.result.reason_codes.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Factors:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {item.result.reason_codes.slice(0, 3).map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-indigo-500 mr-2">•</span>
                              {reason}
                            </li>
                          ))}
                          {item.result.reason_codes.length > 3 && (
                            <li className="text-gray-500">
                              +{item.result.reason_codes.length - 3} more factors
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Debug info */}
                    <details className="mt-4 text-xs">
                      <summary className="cursor-pointer text-gray-500">Raw Data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;