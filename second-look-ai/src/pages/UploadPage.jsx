import React, { useState } from 'react';
import UploadArea from '../components/UploadArea';
import ResultsCard from '../components/ResultsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import TransactionsViewer from '../components/TransactionsViewer';

const UploadPage = () => {
  const [applicationResult, setApplicationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false); // NEW: Toggle state

  const handleFormSubmit = async (formData) => {
    console.log('🔄 Starting form submission...', formData);
    setIsLoading(true);
    setError(null);
    setApplicationResult(null);
    setTransactions([]);
    setShowTransactions(false); // Reset toggle
    
    try {
      const submissionFormData = new FormData();
      
      // Add basic form data
      submissionFormData.append('full_name', formData.fullName);
      submissionFormData.append('amount_requested', formData.loanAmount);
      submissionFormData.append('term_months', formData.loanTerm);
      submissionFormData.append('consent_for_data', 'true');

      // Add M-Pesa statement file
      if (formData.uploadedFiles && formData.uploadedFiles.length > 0) {
        submissionFormData.append('mpesa_statement', formData.uploadedFiles[0]);
        console.log('📁 File added:', formData.uploadedFiles[0].name);
      } else {
        throw new Error('Please upload your M-Pesa statement');
      }

      console.log('🚀 Sending request to backend...');
      
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: submissionFormData
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Full backend response:', result);
      
      // Map the response
      const mappedResult = {
        decision_status: result.prediction?.decision_status || 'UNDEFINED',
        alt_score: result.prediction?.alt_score || 0,
        synthetic_interest_rate: result.prediction?.synthetic_interest_rate || 0,
        reason_codes: result.prediction?.reason_codes || ['No reasons provided'],
        breakdown: result.prediction?.breakdown || {},
        explanations: result.prediction?.explanations || null,
        raw_response: result
      };
      
      // Extract transactions from response
      const extractedTransactions = result.transactions || [];
      console.log('💳 Transactions received:', extractedTransactions.length);
      
      // Log date range for debugging
      if (extractedTransactions.length > 0) {
        const dates = extractedTransactions
          .map(t => t.date_iso)
          .filter(Boolean)
          .sort();
        if (dates.length > 0) {
          console.log('📅 Date range:', {
            earliest: dates[0],
            latest: dates[dates.length - 1],
            total_days: Math.ceil(
              (new Date(dates[dates.length - 1]) - new Date(dates[0])) / (1000 * 60 * 60 * 24)
            )
          });
        }
      }
      
      setApplicationResult(mappedResult);
      setTransactions(extractedTransactions);
      
      // Save to history
      const analysisRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filename: formData.uploadedFiles[0].name,
        status: mappedResult.decision_status,
        result: {
          credit_score: mappedResult.alt_score,
          interest_rate: mappedResult.synthetic_interest_rate,
          reason_codes: mappedResult.reason_codes,
          breakdown: mappedResult.breakdown,
          explanations: mappedResult.explanations,
          transaction_count: extractedTransactions.length
        }
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('mpesaAnalysisHistory') || '[]');
      const newHistory = [analysisRecord, ...existingHistory];
      localStorage.setItem('mpesaAnalysisHistory', JSON.stringify(newHistory));
      console.log('💾 Saved to history:', newHistory);
      
    } catch (err) {
      console.error('💥 API Error:', err);
      setError(err.message || 'Failed to process M-Pesa statement. Please check your file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setApplicationResult(null);
    setError(null);
    setTransactions([]);
    setShowTransactions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">AI Credit Assessment</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload your M-Pesa statement for instant AI-powered credit scoring
            </p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 shadow-sm">
              {/* Error content remains same */}
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-gray-600 font-medium">AI is analyzing your M-Pesa statement...</p>
                <p className="text-sm text-gray-500 mt-2">Processing {transactions.length} transactions</p>
              </div>
            </div>
          )}
          
          {/* Content Area */}
          <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
            {applicationResult ? (
              <div className="space-y-8 animate-fade-in">
                {/* Header with Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Credit Assessment Complete</h2>
                    <p className="text-gray-600 mt-1">
                      Based on analysis of {transactions.length} transactions
                      {transactions.length > 0 && transactions[0].date_display && 
                        ` from ${transactions[0].date_display} to ${transactions[transactions.length - 1].date_display}`
                      }
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Transactions Toggle Button */}
                    {transactions.length > 0 && (
                      <button 
                        onClick={() => setShowTransactions(!showTransactions)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md inline-flex items-center justify-center"
                      >
                        {showTransactions ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Hide Transactions
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            View {transactions.length} Transactions
                          </>
                        )}
                      </button>
                    )}
                    
                    <button 
                      onClick={handleReset}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md inline-flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Assessment
                    </button>
                  </div>
                </div>
                
                {/* Results Card */}
                <ResultsCard 
                  decision_status={applicationResult.decision_status}
                  alt_score={applicationResult.alt_score}
                  synthetic_interest_rate={applicationResult.synthetic_interest_rate}
                  reason_codes={applicationResult.reason_codes}
                  breakdown={applicationResult.breakdown}
                  explanations={applicationResult.explanations}
                  transaction_count={transactions.length}
                />
                
                {/* Transactions Viewer - Conditionally Rendered */}
                {showTransactions && transactions.length > 0 && (
                  <div className="mt-8 animate-slideDown">
                    <TransactionsViewer transactions={transactions} />
                  </div>
                )}
                
                {/* Transaction Summary Card (Always visible) */}
                {transactions.length > 0 && !showTransactions && (
                  <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Transaction Summary</h3>
                        <p className="text-gray-600 mt-1">
                          {transactions.length} transactions analyzed. Click "View Transactions" to see detailed history.
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowTransactions(true)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center"
                      >
                        View Full History
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES'
                          }).format(
                            transactions.reduce((sum, tx) => sum + (tx.amount_in || 0), 0)
                          )}
                        </div>
                        <div className="text-sm text-green-800">Total Deposits</div>
                      </div>
                      
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES'
                          }).format(
                            transactions.reduce((sum, tx) => sum + (tx.amount_out || 0), 0)
                          )}
                        </div>
                        <div className="text-sm text-red-800">Total Withdrawals</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {transactions.filter(tx => tx.status === 'Completed').length}
                        </div>
                        <div className="text-sm text-blue-800">Successful</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const dates = transactions
                              .map(t => t.date_short)
                              .filter(Boolean);
                            const uniqueDates = new Set(dates);
                            return uniqueDates.size;
                          })()}
                        </div>
                        <div className="text-sm text-purple-800">Active Days</div>
                      </div>
                    </div>
                    
                    {/* Date Range */}
                    {transactions[0].date_display && transactions[transactions.length - 1].date_display && (
                      <div className="mt-4 text-center text-sm text-gray-600">
                        Period: {transactions[0].date_display} to {transactions[transactions.length - 1].date_display}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              !isLoading && <UploadArea onSubmit={handleFormSubmit} />
            )}
          </div>
        </div>
      </div>
      
      {/* Add CSS animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UploadPage;