import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function AddClient() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    latitude: '',
    longitude: '',
    pricePerSlot: '',
    imageUrls: [],
    contactNumber: '',
    email: '',
    website: '',
    accountNumber: '',
    accountType: '',
    branch: '',
    ifscCode: '',
    upiId: '',
    weeklyAvailability: daysOfWeek.reduce((acc, day) => ({
      ...acc,
      [day]: { isAvailable: false, openingTime: '', closingTime: '' }
    }), {})
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayInputChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: value });
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData({
      ...formData,
      weeklyAvailability: {
        ...formData.weeklyAvailability,
        [day]: {
          ...formData.weeklyAvailability[day],
          [field]: value
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      latitude: '',
      longitude: '',
      pricePerSlot: '',
      imageUrls: [],
      contactNumber: '',
      email: '',
      website: '',
      accountNumber: '',
      accountType: '',
      branch: '',
      ifscCode: '',
      upiId: '',
      weeklyAvailability: daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [day]: { isAvailable: false, openingTime: '', closingTime: '' }
      }), {})
    });
  };

  const validateForm = () => {
    if (!formData.name) return 'Name is required';
    if (formData.name.length > 100) return 'Name must not exceed 100 characters';
    if (formData.address && formData.address.length > 200) return 'Address must not exceed 200 characters';
    if (formData.city && formData.city.length > 50) return 'City must not exceed 50 characters';
    if (formData.state && formData.state.length > 50) return 'State must not exceed 50 characters';
    if (formData.zipcode && formData.zipcode.length > 20) return 'Zipcode must not exceed 20 characters';
    if (formData.contactNumber && formData.contactNumber.length > 20) return 'Contact number must not exceed 20 characters';
    if (formData.email && formData.email.length > 100) return 'Email must not exceed 100 characters';
    if (formData.website && formData.website.length > 200) return 'Website must not exceed 200 characters';
    if (formData.email && !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) return 'Invalid email format';
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) return 'Invalid website URL';
    if (formData.accountNumber && formData.accountNumber.length > 50) return 'Account number must not exceed 50 characters';
    if (formData.accountType && formData.accountType.length > 50) return 'Account type must not exceed 50 characters';
    if (formData.branch && formData.branch.length > 100) return 'Branch must not exceed 100 characters';
    if (formData.ifscCode && formData.ifscCode.length > 11) return 'IFSC code must not exceed 11 characters';
    if (formData.upiId && formData.upiId.length > 50) return 'UPI ID must not exceed 50 characters';
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) return 'Invalid IFSC code format';
    if (formData.upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) return 'Invalid UPI ID format';

    for (const day of daysOfWeek) {
      const avail = formData.weeklyAvailability[day];
      if (avail.isAvailable) {
        if (!avail.openingTime) return `Opening time is required for ${day}`;
        if (!avail.closingTime) return `Closing time is required for ${day}`;
        const opening = dayjs(`2000-01-01 ${avail.openingTime}`);
        const closing = dayjs(`2000-01-01 ${avail.closingTime}`);
        if (closing.isBefore(opening) && !closing.isAfter(opening.add(1, 'day'))) {
          return `Closing time must be after opening time for ${day} or span past midnight`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        pricePerSlot: formData.pricePerSlot ? parseFloat(formData.pricePerSlot) : null,
        weeklyAvailability: Object.fromEntries(
          Object.entries(formData.weeklyAvailability).map(([day, avail]) => [
            day,
            {
              isAvailable: avail.isAvailable,
              openingTime: avail.openingTime || null,
              closingTime: avail.closingTime || null
            }
          ])
        )
      };

      await axios.post('/api/admin/clients', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      setSuccessMessage('Client added successfully!');
      resetForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to create client. Please check your input and try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeChange = (day, field, e) => {
    const timeValue = e.target.value;
    handleAvailabilityChange(day, field, timeValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Add New Client
          </h1>
          <p className="text-gray-600 text-lg">Create a comprehensive client profile with all essential details</p>
        </div>

        {/* Alert Messages */}
        {successMessage && (
          <div className="mb-6 mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-emerald-800 font-semibold">{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            
            {/* Basic Information Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-gray-600">Essential client details and description</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    maxLength={100}
                    required
                    placeholder="Enter client name"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    placeholder="Describe the client's business and services"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Location Details Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Location Details</h2>
                  <p className="text-gray-600">Address and geographical information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    maxLength={200}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={50}
                      placeholder="City name"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={50}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipcode" className="block text-sm font-semibold text-gray-700 mb-2">
                      Zipcode
                    </label>
                    <input
                      type="text"
                      id="zipcode"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={20}
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="latitude" className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., 12.9716"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., 77.5946"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-white text-2xl font-semibold">₹</span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
                  <p className="text-gray-600">Service rates and pricing information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pricePerSlot" className="block text-sm font-semibold text-gray-700 mb-2">
                    Price per Slot
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-500 font-semibold text-lg">₹</span>
                    </div>
                    <input
                      type="number"
                      id="pricePerSlot"
                      name="pricePerSlot"
                      value={formData.pricePerSlot}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Details Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Banking Details</h2>
                  <p className="text-gray-600">Payment and financial account information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    maxLength={50}
                    placeholder="Bank account number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="accountType" className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Type
                    </label>
                    <input
                      type="text"
                      id="accountType"
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={50}
                      placeholder="e.g., Savings, Current"
                    />
                  </div>
                  <div>
                    <label htmlFor="branch" className="block text-sm font-semibold text-gray-700 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={100}
                      placeholder="Branch name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="ifscCode" className="block text-sm font-semibold text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      id="ifscCode"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={11}
                      placeholder="e.g., SBIN0001234"
                    />
                  </div>
                  <div>
                    <label htmlFor="upiId" className="block text-sm font-semibold text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      id="upiId"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={50}
                      placeholder="e.g., client@upi"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Availability Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Weekly Availability</h2>
                  <p className="text-gray-600">Set operating hours for each day of the week</p>
                </div>
              </div>

              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div key={day} className={`p-6 rounded-2xl border-2 transition-all duration-300 ${formData.weeklyAvailability[day].isAvailable ? 'border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-lg' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3 flex items-center">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`available-${day}`}
                            checked={formData.weeklyAvailability[day].isAvailable}
                            onChange={(e) => handleAvailabilityChange(day, 'isAvailable', e.target.checked)}
                            className="h-5 w-5 rounded-lg border-2 border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2 mr-3"
                          />
                          <label htmlFor={`available-${day}`} className="text-lg font-semibold text-gray-800">
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-4">
                        <label htmlFor={`opening-${day}`} className="block text-sm font-semibold text-gray-700 mb-2">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          id={`opening-${day}`}
                          value={formData.weeklyAvailability[day].openingTime}
                          onChange={(e) => handleTimeChange(day, 'openingTime', e)}
                          disabled={!formData.weeklyAvailability[day].isAvailable}
                          required={formData.weeklyAvailability[day].isAvailable}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label htmlFor={`closing-${day}`} className="block text-sm font-semibold text-gray-700 mb-2">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          id={`closing-${day}`}
                          value={formData.weeklyAvailability[day].closingTime}
                          onChange={(e) => handleTimeChange(day, 'closingTime', e)}
                          disabled={!formData.weeklyAvailability[day].isAvailable}
                          required={formData.weeklyAvailability[day].isAvailable}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Media & Contact Information Section */}
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Media & Contact Information</h2>
                  <p className="text-gray-600">Images and contact details for client outreach</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="imageUrls" className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URLs (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="imageUrls"
                    value={formData.imageUrls.join(',')}
                    onChange={(e) => handleArrayInputChange(e, 'imageUrls')}
                    placeholder="e.g., http://example.com/image1.jpg, http://example.com/image2.jpg"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={20}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                      maxLength={100}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                    maxLength={200}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className={`group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ${isSubmitting ? 'opacity-70 cursor-not-allowed scale-100 hover:scale-100' : ''}`}
                >
                  <div className="flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6 mr-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Client
                      </>
                    )}
                  </div>
                </button>
              </div>
              <p className="text-center text-gray-600 mt-4 text-sm">
                All information can be updated later
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}