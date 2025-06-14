import { useState } from 'react';
import { Search, X, CheckSquare, Edit, User, Mail, Phone, MapPin, DollarSign, ArrowLeft } from 'lucide-react';

export default function EditClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Clear states when returning to search
  const resetForm = () => {
    setSelectedClient(null);
    setFormData(null);
    setIsEditing(false);
    setError(null);
    setSuccessMessage('');
  };

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      // Determine if search is by ID or name
      const isNumeric = /^\d+$/.test(searchQuery.trim());
      
      // Use GET request with query parameters instead of POST
      let url = '/api/admin/clients';
      if (isNumeric) {
        // If ID search, get a specific client directly
        url = `/api/admin/clients/${searchQuery.trim()}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('No client found with this ID');
            setIsLoading(false);
            return;
          }
          throw new Error('Search failed');
        }
        
        const result = await response.json();
        setSearchResults([result]); // Wrap the single result in an array
      } else {
        // For name search, use the getClientsByStatus or getAllClients endpoint
        // and filter client-side (since the API doesn't have a direct name search)
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        // Filter results client-side by name
        const filteredResults = data.clients.filter(client => 
          client.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
        
        setSearchResults(filteredResults);
        
        if (filteredResults.length === 0) {
          setError('No clients found matching your search criteria');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Select client and fetch full details
  const handleSelectClient = async (client) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('Client not found');
        throw new Error('Failed to fetch client details');
      }
      
      const clientData = await response.json();
      setSelectedClient(clientData);
      setFormData({
        ...clientData,
        weeklyAvailability: Object.fromEntries(
          Object.entries(clientData.weeklyAvailability).map(([day, data]) => [
            day,
            {
              isAvailable: data.isAvailable,
              openingTime: data.isAvailable ? data.openingTime : '',
              closingTime: data.isAvailable ? data.closingTime : ''
            }
          ])
        )
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle different input types appropriately
    const processedValue = type === 'number' ? 
      (value === '' ? '' : type === 'number' && name === 'pricePerSlot' ? parseFloat(value) : parseFloat(value)) : 
      value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Availability change handler
  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [day]: {
          ...prev.weeklyAvailability[day],
          [field]: value,
          ...(field === 'isAvailable' && !value ? { openingTime: '', closingTime: '' } : {})
        }
      }
    }));
  };

  // Validate form before submitting
  const validateForm = () => {
    // Required fields
    const requiredFields = ['name', 'email', 'contactNumber', 'address', 'city', 'state', 'zipcode'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    
    // Phone validation - simple validation for demonstration
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      return 'Phone number should be in format: 555-123-4567';
    }
    
    // Coordinate validation
    if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
      return 'Latitude and longitude must be valid numbers';
    }
    
    // Price validation
    if (isNaN(formData.pricePerSlot) || formData.pricePerSlot < 0) {
      return 'Price per slot must be a positive number';
    }
    
    // Weekly availability validation
    const availableDays = Object.entries(formData.weeklyAvailability)
      .filter(([_, data]) => data.isAvailable);
      
    for (const [day, data] of availableDays) {
      if (!data.openingTime || !data.closingTime) {
        return `Please set both opening and closing times for ${day}`;
      }
    }
    
    return null; // No validation errors
  };

  // Update handler
  const handleUpdate = async () => {
    setShowConfirmation(false);
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Client not found');
        if (response.status === 400) throw new Error('Invalid client data');
        throw new Error('Update failed');
      }

      const updatedClient = await response.json();
      setSelectedClient(updatedClient);
      setFormData({
        ...updatedClient,
        weeklyAvailability: Object.fromEntries(
          Object.entries(updatedClient.weeklyAvailability).map(([day, data]) => [
            day,
            {
              isAvailable: data.isAvailable,
              openingTime: data.isAvailable ? data.openingTime : '',
              closingTime: data.isAvailable ? data.closingTime : ''
            }
          ])
        )
      });
      setIsEditing(false);
      setSuccessMessage('Client updated successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'INACTIVE':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'BLOCKED':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-blue-100 text-blue-800 border-blue-200';
      }
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold border rounded-full ${getStatusStyles()}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Client Management</h1>

      {/* Search Section - Always visible */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="text-gray-400" size={20} />
            <h2 className="text-xl font-medium">Search Clients</h2>
          </div>
          
          <div className="flex">
            <input
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="searchQuery"
              type="text"
              placeholder="Enter client name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
            >
              <Search size={16} />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>

      {/* Selected Client Detail View */}
      {selectedClient && !isEditing && (
        <div className="relative bg-white p-6 rounded-lg shadow-md mb-6">
          <button 
            onClick={resetForm}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>Back to Search</span>
          </button>
          
          <div className="flex justify-between items-start mt-8">
            <div>
              <h2 className="text-2xl font-semibold">{selectedClient.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Mail size={16} />
                <span>{selectedClient.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <Phone size={16} />
                <span>{selectedClient.contactNumber}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <MapPin size={16} />
                <span>
                  {selectedClient.address}, {selectedClient.city}, {selectedClient.state} {selectedClient.zipcode}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <DollarSign size={16} />
                <span>${selectedClient.pricePerSlot.toFixed(2)} per slot</span>
              </div>
              <div className="mt-3">
                <StatusBadge status={selectedClient.status} />
              </div>
            </div>
            
            {selectedClient.imageUrls && selectedClient.imageUrls[0] && (
              <div className="ml-4">
                <img 
                  src={selectedClient.imageUrls[0]} 
                  alt={selectedClient.name} 
                  className="rounded-lg shadow w-32 h-32 object-cover"
                />
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="mt-1 text-gray-600">{selectedClient.description || 'No description available'}</p>
          </div>
          
          {/* Availability */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-700">Weekly Availability</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(selectedClient.weeklyAvailability).map(([day, data]) => (
                <div key={day} className="border rounded-md p-3">
                  <div className="font-medium">{day}</div>
                  {data.isAvailable ? (
                    <div className="text-sm text-gray-600">
                      {data.openingTime} - {data.closingTime}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not available</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="mt-8 flex justify-end">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit size={16} />
              Edit Client
            </button>
          </div>
        </div>
      )}
      
      {/* Search Results - Show only when actively searching without selection */}
      {searchResults.length > 0 && !selectedClient && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <User size={20} />
            <span>Search Results</span>
            <span className="text-sm text-gray-500 font-normal">
              ({searchResults.length} {searchResults.length === 1 ? 'client' : 'clients'} found)
            </span>
          </h2>
          
          <div className="grid gap-4">
            {searchResults.map(client => (
              <div
                key={client.id}
                className="border p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectClient(client)}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{client.name}</h3>
                    <p className="text-gray-600">{client.email}</p>
                    <p className="text-gray-600">{client.contactNumber}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <StatusBadge status={client.status} />
                    <span className="text-gray-500 text-sm">ID: {client.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Form */}
      {selectedClient && formData && isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <Edit size={20} />
              Edit Client Details
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-700"
              title="Cancel Editing"
            >
              <X size={20} />
            </button>
          </div>
          
          {successMessage && (
            <div className="mb-6 p-3 bg-green-100 text-green-800 rounded-md flex items-center gap-2">
              <CheckSquare size={16} />
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id">
                Client ID
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
                id="id"
                type="text"
                value={formData.id}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                Address *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="city">
                City *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="state">
                State *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="zipcode">
                Zipcode *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="zipcode"
                name="zipcode"
                type="text"
                value={formData.zipcode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
                Latitude *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
                Longitude *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pricePerSlot">
                Price Per Slot ($) *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="pricePerSlot"
                name="pricePerSlot"
                type="number"
                step="0.01"
                value={formData.pricePerSlot}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
                Contact Number * (format: 555-123-4567)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="555-123-4567"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email *
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                Website
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                id="website"
                name="website"
                type="url"
                value={formData.website || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Weekly Availability */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Weekly Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(formData.weeklyAvailability).map(day => (
                <div key={day} className="p-4 border rounded-md">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.weeklyAvailability[day].isAvailable}
                      onChange={(e) => handleAvailabilityChange(day, 'isAvailable', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-gray-700 font-bold">{day}</span>
                  </label>
                  {formData.weeklyAvailability[day].isAvailable && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={formData.weeklyAvailability[day].openingTime}
                          onChange={(e) => handleAvailabilityChange(day, 'openingTime', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={formData.weeklyAvailability[day].closingTime}
                          onChange={(e) => handleAvailabilityChange(day, 'closingTime', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrls">
              Client Image
            </label>
            {formData.imageUrls[0] && (
              <div className="mb-2">
                <img src={formData.imageUrls[0]} alt="Client" className="border rounded-md w-32 h-32 object-cover" />
              </div>
            )}
            <input
              className="w-full text-gray-700 px-3 py-2 border rounded"
              // id="imageUrls"
              // type="text"
              // accept="image/*"
              id="imageUrls"
              type="text"
              placeholder="Image URL"
              value={formData.imageUrls[0] || ""}
              onChange={(e) => {
                // Note: Actual file upload implementation would require a separate endpoint
                setFormData(prev => ({
                  ...prev,
                  imageUrls: [e.target.value]
                  // imageUrls: e.target.files[0] ? [URL.createObjectURL(e.target.files[0])] : prev.imageUrls
                }));
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              type="button"
              disabled={isLoading}
              onClick={() => setShowConfirmation(true)}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchResults.length === 0 && searchQuery.trim() !== '' && !isLoading && !error && !selectedClient && (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-600">No clients found matching "{searchQuery}"</p>
          <p className="text-gray-500 mt-2">Try a different search term or client ID</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Update</h3>
            <p className="mb-6">Are you sure you want to save changes to client <strong>{formData.name}</strong>?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleUpdate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}