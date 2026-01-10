import React, { useState } from 'react';

const UploadArea = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    loanAmount: '',
    loanTerm: '6'
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileUpload = (files) => {
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' || 
      file.name.endsWith('.csv') ||
      file.type === 'text/csv'
    );

    if (validFiles.length > 0) {
      setUploadedFiles(validFiles);
      if (errors.files) {
        setErrors(prev => ({ ...prev, files: '' }));
      }
    } else {
      setErrors(prev => ({ 
        ...prev, 
        files: 'Please upload PDF or CSV files only' 
      }));
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter a valid full name';
    }
    
    if (!formData.loanAmount || formData.loanAmount <= 0) {
      newErrors.loanAmount = 'Valid loan amount is required';
    } else if (formData.loanAmount < 1000) {
      newErrors.loanAmount = 'Minimum loan amount is KSh 1,000';
    } else if (formData.loanAmount > 1000000) {
      newErrors.loanAmount = 'Maximum loan amount is KSh 1,000,000';
    }
    
    if (!formData.loanTerm || formData.loanTerm <= 0) {
      newErrors.loanTerm = 'Valid loan term is required';
    }
    
    if (uploadedFiles.length === 0) {
      newErrors.files = 'Please upload your M-Pesa statement';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        uploadedFiles
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center mb-2">
            <div className="w-3 h-8 bg-indigo-600 rounded-full mr-4"></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Applicant Information</h3>
              <p className="text-gray-600 mt-1">Tell us about yourself</p>
            </div>
          </div>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Enter your full name as per ID"
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.fullName}
              </p>
            )}
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="space-y-6">
          <div className="flex items-center mb-2">
            <div className="w-3 h-8 bg-indigo-600 rounded-full mr-4"></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Loan Details</h3>
              <p className="text-gray-600 mt-1">Specify your loan requirements</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Amount (KSh) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">KSh</span>
                <input
                  type="number"
                  id="loanAmount"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  className={`w-full pl-16 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.loanAmount ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g., 25,000"
                  min="1000"
                  max="1000000"
                  step="1000"
                />
              </div>
              {errors.loanAmount && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.loanAmount}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">Minimum: KSh 1,000 • Maximum: KSh 1,000,000</p>
            </div>

            <div>
              <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term <span className="text-red-500">*</span>
              </label>
              <select
                id="loanTerm"
                name="loanTerm"
                value={formData.loanTerm}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                  errors.loanTerm ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
              </select>
              {errors.loanTerm && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {errors.loanTerm}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-6">
          <div className="flex items-center mb-2">
            <div className="w-3 h-8 bg-indigo-600 rounded-full mr-4"></div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">M-Pesa Statement</h3>
              <p className="text-gray-600 mt-1">Upload your transaction history</p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-600 mb-4">
              Upload your M-Pesa statement in PDF or CSV format for AI cashflow analysis. 
              We'll analyze your transaction patterns to determine creditworthiness.
            </p>
            
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragging 
                  ? 'border-indigo-400 bg-indigo-50' 
                  : errors.files 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('mpesa-statement').click()}
            >
              <input
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="mpesa-statement"
                multiple
              />
              
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {isDragging ? 'Drop your files here' : 'Upload M-Pesa Statement'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag & drop your files or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PDF or CSV files (max 10MB per file)
                  </p>
                </div>
              </div>
            </div>
            
            {errors.files && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errors.files}
              </p>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-gray-900">Selected Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        {file.type === 'application/pdf' ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Requirements */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Supported File Formats
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• PDF files exported from M-Pesa app or statements</li>
                <li>• CSV files downloaded from M-Pesa or bank portals</li>
                <li>• Maximum file size: 10MB per file</li>
                <li>• We support statements from last 3-6 months</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-8 border-t border-gray-200">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-lg py-4 px-12 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Get AI Credit Assessment
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            By submitting, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Privacy Policy
            </a>{' '}
            and confirm that you own the uploaded financial data.
          </p>
        </div>
      </form>
    </div>
  );
};

export default UploadArea;