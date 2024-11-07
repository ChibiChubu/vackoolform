// src/components/RentalReceipt.jsx
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../images/logo.png';
import { format } from 'date-fns';

export const RentalReceipt = ({ orderData }) => {
  const receiptRef = useRef();

  const downloadPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${orderData.orderNumber}.pdf`);
    });
  };

  const handleDownloadAndWhatsApp = () => {
    // Buka WhatsApp Web dengan nombor yang ditetapkan
    window.open("https://wa.me/60169694840", "_blank");

    // Muat turun PDF
    downloadPDF();
  };

  return (
    <div ref={receiptRef} className="max-w-xl mx-auto bg-white rounded-lg p-8 text-gray-800">
      <div className="flex items-start gap-6 mb-6">
        <img 
          src={logo}
          alt="Vackool Enterprise"
          className="w-16 h-16 object-contain"
        />
        <div>
          <h2 className="text-lg font-semibold">Vackool Enterprise</h2>
          <p className="text-xs text-gray-500">(003499862-P)</p>
          <button 
            onClick={handleDownloadAndWhatsApp} 
            className="text-xs text-blue-600 underline cursor-pointer"
          >
            WhatsApp 60169694840
          </button>
        </div>
      </div>

      {/* Order ID with Status Tags */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Order ID: {orderData.orderNumber}</span>
          <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-600">ONGOING</span>
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-600">PAID DEPO</span>
        </div>
      </div>

      {/* Date & Time Slot */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Date & Time Slot</h3>
        <p className="text-xs">
          {format(new Date(orderData.startDate), 'iiii, dd MMMM yyyy h:mm a')}
          <br />
          {format(new Date(orderData.endDate), 'iiii, dd MMMM yyyy h:mm a')}
        </p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Name</h3>
        <p className="text-xs">{orderData.name}</p>
      </div>

      {/* Phone Number */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Phone Number</h3>
        <p className="text-xs">{orderData.phone}</p>
      </div>

      {/* Address */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Address</h3>
        <p className="text-xs">{orderData.address}, {orderData.postcode}, {orderData.state}</p>
      </div>

      {/* Payment Details */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Payment Details</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="text-blue-600">RM {parseFloat(orderData.amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>
              Deposit: 
              <span className="text-gray-500 ml-1">
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
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Order Items</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Item</th>
                <th className="text-left p-2">Qty</th>
                <th className="text-left p-2">Price</th>
                <th className="text-right p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">1</td>
                <td className="p-2">Air Cooler</td>
                <td className="p-2">{orderData.unit}</td>
                <td className="p-2">{(parseFloat(orderData.amount) / parseInt(orderData.unit)).toFixed(2)}</td>
                <td className="text-right p-2">{parseFloat(orderData.amount).toFixed(2)}</td>
              </tr>
              <tr className="border-t">
                <td colSpan="4" className="text-right p-2 font-medium">Total:</td>
                <td className="text-right p-2">{parseFloat(orderData.amount).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {orderData.notes && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-1">Notes:</h3>
          <p className="text-xs text-blue-600">{orderData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-4">
        Thank you for your business!
      </div>
    </div>
  );
};
