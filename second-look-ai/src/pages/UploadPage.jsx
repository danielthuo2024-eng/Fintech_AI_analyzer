// UploadPage.jsx
import React, { useState } from 'react';
import UploadArea from '../components/UploadArea';
import ResultsCard from '../components/ResultsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const UploadPage = () => {
  const [applicationResult, setApplicationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    console.log('🔄 Starting form submission...', formData);
    setIsLoading(true);
    setError(null);
    setApplicationResult(null);
    
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
      
      // FIXED: Use submissionFormData instead of formData
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        body: submissionFormData  // ✅ FIXED THIS LINE
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Full backend response:', result);
      
      // Map the response to match your React component expectations
      const mappedResult = {
        decision_status: result.prediction?.decision_status || 'UNDEFINED',
        alt_score: result.prediction?.alt_score || 0,
        synthetic_interest_rate: result.prediction?.synthetic_interest_rate || 0,
        reason_codes: result.prediction?.reason_codes || ['No reasons provided'],
        breakdown: result.prediction?.breakdown || {},
        raw_response: result  // Keep original for debugging
      };
      
      console.log('🔄 Mapped result for React:', mappedResult);
      setApplicationResult(mappedResult);
      
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
          breakdown: mappedResult.breakdown
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
  };

  // Debug: Check localStorage
  React.useEffect(() => {
    const history = JSON.parse(localStorage.getItem('mpesaAnalysisHistory') || '[]');
    console.log('📚 Current history in localStorage:', history);
  }, [applicationResult]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
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
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-4 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors duration-200"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-gray-600 font-medium">AI is analyzing your M-Pesa statement...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          )}
          
          {/* Debug: Show raw data */}
          {applicationResult && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <details>
                <summary className="cursor-pointer font-medium">Debug: Raw Response Data</summary>
                <pre className="text-xs mt-2">{JSON.stringify(applicationResult, null, 2)}</pre>
              </details>
            </div>
          )}
          
          {/* Content Area */}
          <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
            {applicationResult ? (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Credit Assessment Complete</h2>
                    <p className="text-gray-600 mt-1">Based on your M-Pesa statement analysis</p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm hover:shadow-md inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Assessment
                  </button>
                </div>
                <ResultsCard 
                  decision_status={applicationResult.decision_status}
                  alt_score={applicationResult.alt_score}
                  synthetic_interest_rate={applicationResult.synthetic_interest_rate}
                  reason_codes={applicationResult.reason_codes}
                  breakdown={applicationResult.breakdown}
                />
              </div>
            ) : (
              !isLoading && <UploadArea onSubmit={handleFormSubmit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;