import { useState, useEffect } from 'react';
import { Search} from 'lucide-react';
import axios from 'axios';

export default function CustomersManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Status update state
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = ['ACTIVE', 'INACTIVE', 'PENDING'];

  // Fetch customers with pagination
  const fetchCustomers = async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
        sortBy: 'id',
        direction: 'DESC'
      };
      
      const response = await axios.get('/api/admin/clients/customers', { params });
      
      const data = response.data;
      setCustomers(data.customers || []);
      setCurrentPage(data.currentPage || 0);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
      setIsSearching(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Search customers by ID or name
  const searchCustomers = async () => {
    if (!searchTerm.trim()) {
      // If search term is empty, fetch all customers
      fetchCustomers(0, pageSize);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      // Determine if search term is numeric (ID) or text (name)
      const isNumeric = /^\d+$/.test(searchTerm.trim());
      const searchRequest = isNumeric 
        ? { id: parseInt(searchTerm.trim()) }
        : { name: searchTerm.trim() };

      const response = await axios.post('/api/admin/clients/search/customer', searchRequest);
      
      const data = response.data;
      setCustomers(data || []);
      // Reset pagination for search results
      setCurrentPage(0);
      setTotalPages(1);
      setTotalItems(data?.length || 0);
      setError(null);
    } catch (err) {
      console.error('Error searching customers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to search customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search button click
  const handleSearch = () => {
    searchCustomers();
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCustomers();
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    fetchCustomers(0, pageSize);
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers(currentPage, pageSize);
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && !isSearching) {
      setCurrentPage(newPage);
    }
  };

  // Handle status update initiation
  const handleUpdateClick = (customer) => {
    setEditingCustomerId(customer.id);
    setNewStatus(customer.status);
  };

  // Handle status change
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  // Handle save status
  const handleSaveStatus = async (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to change the status of "${customer.name}" from "${customer.status}" to "${newStatus}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await axios.patch(`/api/admin/clients/${customerId}/status`, null, {
        params: { status: newStatus }
      });

      // Update the customer in the list
      setCustomers(customers.map(c => 
        c.id === customerId 
          ? { ...c, status: newStatus, updatedAt: new Date().toISOString() }
          : c
      ));

      setEditingCustomerId(null);
      setNewStatus('');
      setError(null);
    } catch (err) {
      console.error('Error updating customer status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update customer status');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel status edit
  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setNewStatus('');
  };

  // Clear error message
  const clearError = () => {
    setError(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading customers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Customer Management</h1>
      
      {/* Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="text-gray-400" size={20} />
            <h2 className="text-xl font-medium">Search Customers</h2>
          </div>
          <div className="flex">
            <input
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              id="searchCustomer"
              type="text"
              placeholder="Enter customer name or ID"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-500 flex gap-1 hover:bg-blue-600 items-center text-white px-6 py-2 rounded-r text-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            > 
            <Search className="text-white" size={16} />
              Search
            </button>
            {(searchTerm || isSearching) && (
              <button
                onClick={clearSearch}
                className="ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Pagination Info - Only show if not searching */}
        {!isSearching && totalPages > 1 && (
          <div className="flex justify-end items-center mb-4">
            <div className="text-sm text-gray-700">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} entries
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {isSearching && (
          <div className="mb-4 text-sm text-gray-600">
            {customers.length > 0 
              ? `Found ${customers.length} customer${customers.length === 1 ? '' : 's'} matching "${searchTerm}"`
              : `No customers found matching "${searchTerm}"`
            }
          </div>
        )}
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {customer.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.city || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.contactNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingCustomerId === customer.id ? (
                      <select
                        value={newStatus}
                        onChange={handleStatusChange}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {editingCustomerId === customer.id ? (
                      <div className="flex space-x-2">
                        <button 
                          className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-xs transition-colors"
                          onClick={() => handleSaveStatus(customer.id)}
                          disabled={loading || newStatus === customer.status}
                        >
                          Save
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs transition-colors"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-xs transition-colors"
                        onClick={() => handleUpdateClick(customer)}
                        disabled={loading}
                      >
                        Update Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {customers.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination - Only show if not searching */}
      {!isSearching && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
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
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md z-50">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="ml-2 text-red-700 hover:text-red-900 flex-shrink-0 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && customers.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}