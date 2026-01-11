import React, { useState, useMemo } from 'react';

const TransactionsViewer = ({ transactions }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grouped', 'timeline'
  const [sortField, setSortField] = useState('date_iso');
  const [sortDirection, setSortDirection] = useState('asc'); // Chronological order
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPeriods, setExpandedPeriods] = useState(new Set());
  const itemsPerPage = 20;

  // Group transactions by period
  const groupedTransactions = useMemo(() => {
    if (viewMode !== 'grouped') return {};
    
    const groups = {};
    transactions.forEach(tx => {
      const period = tx.month_year || 'Unknown Period';
      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(tx);
    });
    
    // Sort periods chronologically
    const sortedGroups = {};
    Object.keys(groups)
      .sort((a, b) => {
        if (a === 'Unknown Period') return 1;
        if (b === 'Unknown Period') return -1;
        return new Date(a) - new Date(b);
      })
      .forEach(key => {
        sortedGroups[key] = groups[key];
      });
    
    return sortedGroups;
  }, [transactions, viewMode]);

  // Process and sort transactions
  const processedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    let filtered = [...transactions];
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }
    
    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(term) ||
        tx.receipt_no?.toLowerCase().includes(term) ||
        tx.status?.toLowerCase().includes(term)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      // Handle dates
      if (sortField.includes('date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle strings
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [transactions, sortField, sortDirection, filterType, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const paginatedTransactions = processedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc'); // Default to chronological for dates
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      default: return '📄';
    }
  };

  const togglePeriod = (period) => {
    const newExpanded = new Set(expandedPeriods);
    if (newExpanded.has(period)) {
      newExpanded.delete(period);
    } else {
      newExpanded.add(period);
    }
    setExpandedPeriods(newExpanded);
  };

  const calculatePeriodStats = (periodTransactions) => {
    const deposits = periodTransactions.filter(tx => tx.type === 'deposit');
    const withdrawals = periodTransactions.filter(tx => tx.type === 'withdrawal');
    
    return {
      totalDeposits: deposits.reduce((sum, tx) => sum + (tx.amount_in || 0), 0),
      totalWithdrawals: withdrawals.reduce((sum, tx) => sum + (tx.amount_out || 0), 0),
      successful: periodTransactions.filter(tx => tx.status === 'Completed').length,
      count: periodTransactions.length
    };
  };

  // Get date range
  const dateRange = useMemo(() => {
    if (transactions.length === 0) return null;
    
    const dates = transactions
      .map(t => t.date_iso)
      .filter(Boolean)
      .sort();
    
    if (dates.length === 0) return null;
    
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString(),
      days: days,
      formatted: `${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${days} days)`
    };
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions</h3>
        <p className="text-gray-600">No transaction data available for display.</p>
      </div>
    );
  }

  // Calculate totals
  const totalDeposits = processedTransactions.reduce((sum, tx) => sum + (tx.amount_in || 0), 0);
  const totalWithdrawals = processedTransactions.reduce((sum, tx) => sum + (tx.amount_out || 0), 0);
  const successfulTransactions = processedTransactions.filter(tx => tx.status === 'Completed').length;
  const netFlow = totalDeposits - totalWithdrawals;

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-gray-600 mt-1">
              {processedTransactions.length} transactions • {dateRange?.formatted || 'Date range unavailable'}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Table
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 By Period
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Timeline
              </button>
            </div>
            
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits Only</option>
              <option value="withdrawal">Withdrawals Only</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-600 font-medium">Total Deposits</div>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(totalDeposits)}</div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 font-medium">Total Withdrawals</div>
                <div className="text-2xl font-bold text-red-700">{formatCurrency(totalWithdrawals)}</div>
              </div>
              <div className="text-2xl">💸</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-medium">Net Cash Flow</div>
                <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(netFlow)}
                </div>
              </div>
              <div className="text-2xl">{netFlow >= 0 ? '📈' : '📉'}</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-600 font-medium">Success Rate</div>
                <div className="text-2xl font-bold text-purple-700">
                  {Math.round((successfulTransactions / processedTransactions.length) * 100)}%
                </div>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('date_iso')}
                  >
                    <div className="flex items-center">
                      Date & Time {getSortIcon('date_iso')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Description {getSortIcon('description')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('amount_in')}
                  >
                    <div className="flex items-center">
                      Amount In {getSortIcon('amount_in')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('amount_out')}
                  >
                    <div className="flex items-center">
                      Amount Out {getSortIcon('amount_out')}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="flex items-center">
                      Balance {getSortIcon('balance')}
                    </div>
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((transaction, index) => (
                  <tr key={transaction.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="text-lg mr-3">
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.date_display || 'Unknown Date'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.day_of_week} • {transaction.time_only}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{transaction.description || 'No Description'}</div>
                      <div className="text-xs text-gray-500">{transaction.receipt_no || 'No Receipt'}</div>
                    </td>
                    <td className="py-4 px-6">
                      {transaction.amount_in > 0 ? (
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(transaction.amount_in)}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">—</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {transaction.amount_out > 0 ? (
                        <div className="text-sm font-medium text-red-600">
                          {formatCurrency(transaction.amount_out)}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">—</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.balance || 0)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, processedTransactions.length)}
                  </span>{' '}
                  of <span className="font-medium">{processedTransactions.length}</span> transactions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {viewMode === 'grouped' && (
        <div className="p-6">
          {Object.entries(groupedTransactions).map(([period, periodTransactions]) => {
            const stats = calculatePeriodStats(periodTransactions);
            const isExpanded = expandedPeriods.has(period);
            
            return (
              <div key={period} className="mb-6 last:mb-0">
                {/* Period Header */}
                <button
                  onClick={() => togglePeriod(period)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg hover:from-indigo-100 hover:to-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <span className="text-indigo-600 text-lg">📅</span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{period}</h3>
                      <p className="text-sm text-gray-600">
                        {periodTransactions.length} transactions • 
                        Net: {formatCurrency(stats.totalDeposits - stats.totalWithdrawals)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">+{formatCurrency(stats.totalDeposits)}</div>
                      <div className="text-sm font-medium text-red-600">-{formatCurrency(stats.totalWithdrawals)}</div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {/* Expanded Transactions */}
                {isExpanded && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Date</th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Description</th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Amount</th>
                          <th className="py-2 px-4 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {periodTransactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-2 px-4 text-sm">
                              <div>{tx.date_display}</div>
                              <div className="text-xs text-gray-500">{tx.time_only}</div>
                            </td>
                            <td className="py-2 px-4 text-sm">
                              <div className="font-medium">{tx.description}</div>
                              <div className="text-xs text-gray-500">{tx.receipt_no}</div>
                            </td>
                            <td className="py-2 px-4">
                              {tx.type === 'deposit' ? (
                                <div className="text-sm font-medium text-green-600">
                                  +{formatCurrency(tx.amount_in)}
                                </div>
                              ) : (
                                <div className="text-sm font-medium text-red-600">
                                  -{formatCurrency(tx.amount_out)}
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'timeline' && (
        <div className="p-6">
          <div className="relative">
            {/* Timeline */}
            <div className="space-y-4">
              {processedTransactions.map((tx, idx) => (
                <div key={tx.id || idx} className="flex">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'deposit' ? '💰' : '💸'}
                    </div>
                    {idx < processedTransactions.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{tx.description}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {tx.date_display} • {tx.receipt_no}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {tx.type === 'deposit' 
                              ? `+${formatCurrency(tx.amount_in)}`
                              : `-${formatCurrency(tx.amount_out)}`
                            }
                          </div>
                          <div className="text-sm text-gray-600">
                            Balance: {formatCurrency(tx.balance)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          {tx.day_of_week} • {tx.time_only}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsViewer;