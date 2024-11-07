// src/components/RentalReceipt.jsx
import React from 'react';
import jsPDF from 'jspdf';
import logo from '../images/logo.png';
import { format } from 'date-fns';

export const RentalReceipt = ({ orderData }) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();

    // Tambahkan logo dan teks utama ke dalam PDF
    doc.text("Vackool Enterprise", 10, 10);
    doc.text("(003499862-P)", 10, 20);
    doc.text("60169694840", 10, 30);

    // Tambahkan maklumat tempahan
    doc.text(`Order ID: ${orderData.orderNumber}`, 10, 50);
    doc.text(`Name: ${orderData.name}`, 10, 60);
    doc.text(`Phone Number: ${orderData.phone}`, 10, 70);
    doc.text(`Address: ${orderData.address}, ${orderData.postcode}, ${orderData.state}`, 10, 80);

    // Tambahkan maklumat tarikh
    doc.text("Date & Time Slot:", 10, 90);
    doc.text(`${format(new Date(orderData.startDate), 'iiii, dd MMMM yyyy h:mm a')} -`, 10, 100);
    doc.text(`${format(new Date(orderData.endDate), 'iiii, dd MMMM yyyy h:mm a')}`, 10, 110);

    // Tambahkan maklumat bayaran
    doc.text("Payment Details:", 10, 120);
    doc.text(`Amount: RM ${parseFloat(orderData.amount).toFixed(2)}`, 10, 130);
    doc.text(`Deposit: RM ${parseFloat(orderData.deposit).toFixed(2)} (${format(new Date(orderData.createdAt), 'iiii, dd MMMM yyyy h:mm a')})`, 10, 140);
    doc.text(`Balance: RM ${parseFloat(orderData.balance).toFixed(2)}`, 10, 150);

    // Tambahkan item tempahan
    doc.text("Order Items:", 10, 160);
    doc.text(`1. Air Cooler - Qty: ${orderData.unit}, Price: RM ${(parseFloat(orderData.amount) / parseInt(orderData.unit)).toFixed(2)}, Total: RM ${parseFloat(orderData.amount).toFixed(2)}`, 10, 170);

    // Tambahkan nota jika ada
    if (orderData.notes) {
      doc.text("Notes:", 10, 180);
      doc.text(orderData.notes, 10, 190);
    }

    // Simpan PDF
    doc.save(`${orderData.orderNumber}.pdf`);
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg p-8">
      {/* Header with Right-aligned Logo */}
      <div className="flex items-start gap-6 mb-8">
        <img 
          src={logo}
          alt="Vackool Enterprise"
          className="w-20 h-20 object-contain"
        />
        <div>
          <h2 className="text-lg font-medium">Vackool Enterprise</h2>
          <p className="text-sm text-gray-500">(003499862-P)</p>
          <p className="text-sm text-gray-500">60169694840</p>
        </div>
      </div>

      {/* Order ID with Status Tags */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex items-center gap-2">
          <span>Order ID: {orderData.orderNumber}</span>
          <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-600">ONGOING</span>
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-600">PAID DEPO</span>
        </div>
      </div>

      {/* Date & Time Slot */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Date & Time Slot</h3>
        <p className="text-sm">
          {format(new Date(orderData.startDate), 'iiii, dd MMMM yyyy h:mm a')}
          <br />
          {format(new Date(orderData.endDate), 'iiii, dd MMMM yyyy h:mm a')}
        </p>
      </div>

      {/* Name */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Name</h3>
        <p className="text-sm">{orderData.name}</p>
      </div>

      {/* Phone Number */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Phone Number</h3>
        <p className="text-sm">{orderData.phone}</p>
      </div>

      {/* Address */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Address</h3>
        <p className="text-sm">{orderData.address}, {orderData.postcode}, {orderData.state}</p>
      </div>

      {/* Payment Details */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Payment Details</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="text-blue-600">RM {parseFloat(orderData.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>
              Deposit: 
              <span className="text-gray-500 ml-2">
                ({format(new Date(orderData.createdAt), 'iiii, dd MMMM yyyy h:mm a')})
              </span>
            </span>
            <span className="text-green-600">RM {parseFloat(orderData.deposit).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Balance:</span>
            <span className="text-red-600">RM {parseFloat(orderData.balance).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Order Items</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Qty</th>
                <th className="text-left p-3">Price</th>
                <th className="text-right p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3">1</td>
                <td className="p-3">Air Cooler</td>
                <td className="p-3">{orderData.unit}</td>
                <td className="p-3">{(parseFloat(orderData.amount) / parseInt(orderData.unit)).toFixed(2)}</td>
                <td className="text-right p-3">{parseFloat(orderData.amount).toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td colSpan="4" className="text-right p-3 font-medium">Total:</td>
                <td className="text-right p-3">{parseFloat(orderData.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {orderData.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Notes:</h3>
          <p className="text-sm text-blue-600">{orderData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Thank you for your business!
      </div>

      {/* Download PDF Button */}
      <button 
        onClick={generatePDF} 
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Muat Turun PDF
      </button>
    </div>
  );
};
