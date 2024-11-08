// src/components/InvoicePreview.jsx

import React, { useState } from 'react';

const InvoicePreview = () => {
  // Sample booking data - boleh adjust mengikut data sebenar
  const [booking, setBooking] = useState({
    orderNumber: "ORD-1730807995392",
    name: "Sarah Ahmad",
    phone: "0123456789",
    address: "123, Jalan Maju, Taman Bahagia",
    postcode: "43000",
    state: "Selangor",
    amount: "240.00",
    deposit: "100.00",
    balance: "140.00",
    startDate: "2024-11-08",
    endDate: "2024-11-09",
    startTime: "09:00",
    endTime: "18:00",
    status: "ONGOING",
    paymentStatus: "PAID DEPO",
    notes: "Majlis perkahwinan pada 8/11/24 dan 9/11/24",
    unit: "2x Air Cooler"
  });

  const handleStatusChange = (e) => {
    setBooking({ ...booking, status: e.target.value });
  };

  const handlePaymentStatusChange = (e) => {
    setBooking({ ...booking, paymentStatus: e.target.value });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      
      {/* Header Section - Logo dan Company Details */}
      <div className="flex items-start gap-4 mb-8">
        {/* Logo */}
        <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold">
          V
        </div>
        
        {/* Company Details */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Vackool Enterprise</h1>
          <p className="text-gray-600">(003499862-P)</p>
          <p className="text-gray-600">{booking.phone}</p>
        </div>
      </div>

      {/* Order Details Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold">Order ID: </span>
            <span>{booking.orderNumber}</span>
          </div>
          
          {/* Status Badges with Select Options */}
          <div className="flex gap-2">
            <select
              value={booking.status}
              onChange={handleStatusChange}
              className="px-4 py-1 bg-orange-500 text-white rounded-full text-sm"
            >
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <select
              value={booking.paymentStatus}
              onChange={handlePaymentStatusChange}
              className="px-4 py-1 bg-green-500 text-white rounded-full text-sm"
            >
              <option value="PAID DEPO">PAID DEPO</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Customer Details</h2>
            <p className="text-gray-600">{booking.name}</p>
            <p className="text-gray-600">{booking.phone}</p>
          </div>
          
          <div>
            <h2 className="font-semibold mb-2">Address</h2>
            <p className="text-gray-600">
              {booking.address}, {booking.postcode}, {booking.state}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Booking Period</h2>
            <p className="text-gray-600">
              From: {new Date(booking.startDate).toLocaleDateString()} {booking.startTime}
            </p>
            <p className="text-gray-600">
              To: {new Date(booking.endDate).toLocaleDateString()} {booking.endTime}
            </p>
          </div>
          
          <div>
            <h2 className="font-semibold mb-2">Unit Details</h2>
            <p className="text-gray-600">{booking.unit}</p>
          </div>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="font-semibold mb-4">Payment Details</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">RM {booking.amount}</span>
          </div>
          <div className="flex justify-between">
            <span>Deposit:</span>
            <span className="text-green-600">RM {booking.deposit}</span>
          </div>
          <div className="flex justify-between">
            <span>Balance:</span>
            <span className="text-red-600">RM {booking.balance}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-8">
        <h2 className="font-semibold mb-2">Terms & Conditions</h2>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>Deposit tidak akan dikembalikan jika pembatalan dibuat</li>
          <li>Sila jaga peralatan dengan baik</li>
          <li>Sebarang kerosakan perlu diganti</li>
        </ul>
      </div>

      {/* Notes Section */}
      {booking.notes && (
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Notes</h2>
          <p className="text-gray-600">{booking.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
        <p>Contact us: 012-3456789</p>
      </div>
    </div>
  );
};

export default InvoicePreview;
