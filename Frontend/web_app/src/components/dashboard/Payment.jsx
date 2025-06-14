import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize =20;

  // Fetch payments with pagination
  const fetchPayments = async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/payments', {
        params: {
          page,
          size,
          sortBy: 'paymentId',
          direction: 'DESC'
        }
      });
      
      const data = response.data;
      // Backend returns paginated response with payments array
      setPayments(data.payments || []);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Filter payments based on search term (client-side filtering for current page)
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (payment.paymentId && payment.paymentId.toString().includes(searchTerm)) ||
      (payment.amount && payment.amount.toString().includes(searchTerm)) ||
      (payment.clientId && payment.clientId.toString().includes(searchTerm)) ||
      (payment.paymentStatus && payment.paymentStatus.toLowerCase().includes(searchLower)) ||
      (payment.month && payment.month.toString().includes(searchTerm)) ||
      (payment.year && payment.year.toString().includes(searchTerm))
    );
  });

  // Handle payment selection to view details
  const handlePaymentSelect = async (payment) => {
    try {
      setLoading(true);
      // Fetch detailed payment information using correct endpoint
      const response = await axios.get(`/api/admin/payments/${payment.paymentId}`);
      setSelectedPayment(response.data);
      setEditFormData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditFormData({ ...selectedPayment });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle save payment using correct endpoint
  const handleSavePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/admin/payments/${selectedPayment.paymentId}`,
        editFormData
      );
      
      // Update the payment in the list
      setPayments(payments.map(p => 
        p.paymentId === selectedPayment.paymentId 
          ? { ...p, ...response.data }
          : p
      ));
      
      setSelectedPayment(response.data);
      setIsEditing(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete payment
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/admin/payments/${paymentId}`);
      
      // Remove payment from list and refresh if needed
      const updatedPayments = payments.filter(p => p.paymentId !== paymentId);
      setPayments(updatedPayments);
      
      // If we deleted the selected payment, go back to list
      if (selectedPayment && selectedPayment.paymentId === paymentId) {
        handleBackToList();
      }
      
      // Refresh the list to maintain pagination
      fetchPayments(currentPage, pageSize);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditFormData({ ...selectedPayment });
    setIsEditing(false);
  };

  // Back to payment list
  const handleBackToList = () => {
    setSelectedPayment(null);
    setIsEditing(false);
    setEditFormData({});
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  if (loading && !selectedPayment && payments.length === 0) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Payment Management</h1>
      
      {!selectedPayment ? (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="mb-4">
              <label className="block text-gray-900 text-md font-bold mb-2" htmlFor="searchPayment">
                Search Payment
              </label>
              <div className="flex">
                <input
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                  id="searchPayment"
                  type="text"
                  placeholder="Search by Payment ID, Amount, Client ID, Status, Month, or Year"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex justify-end items-center mb-4">
              
              <div className="text-sm text-gray-700">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} entries
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.paymentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹ {payment.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.clientId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${payment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                          payment.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          payment.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                          payment.paymentStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.month}/{payment.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded"
                        onClick={() => handlePaymentSelect(payment)}
                      >
                        View
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
                        onClick={() => handleDeletePayment(payment.paymentId)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No payments found matching your search.' : 'No payments found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage + 1}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <button 
            onClick={handleBackToList}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          
          <h2 className="bg-purple-300 pl-4 px-3 py-2 border border-purple-800 rounded-3xl text-lg text-purple-900 font-bold mb-4">Payment ID - {selectedPayment.paymentId}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedPayment.paymentId}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="amount"
                    value={editFormData.amount || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded border">
                    ₹ {selectedPayment.amount?.toFixed(2) || '0.00'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedPayment.clientId}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                {isEditing ? (
                  <select
                    name="paymentStatus"
                    value={editFormData.paymentStatus || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded border">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedPayment.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                        selectedPayment.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        selectedPayment.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                        selectedPayment.paymentStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {selectedPayment.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                {isEditing ? (
                  <select
                    name="month"
                    value={editFormData.month || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Month</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                      <option key={month} value={month}>
                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })} ({month})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedPayment.month ? 
                      `${new Date(2024, selectedPayment.month - 1).toLocaleString('default', { month: 'long' })} (${selectedPayment.month})` 
                      : 'N/A'}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="year"
                    value={editFormData.year || ''}
                    onChange={handleInputChange}
                    min="2020"
                    max="2030"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded border">
                    {selectedPayment.year}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedPayment.updatedAt ? new Date(selectedPayment.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => handleDeletePayment(selectedPayment.paymentId)}
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Payment'}
            </button>
            
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePayment}
                    disabled={loading}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Edit Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md shadow-lg z-50">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="flex-1">{error}</span>
            <button 
              onClick={clearError}
              className="ml-2 text-red-700 hover:text-red-900 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}