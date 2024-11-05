import React from 'react';
import jsPDF from 'jspdf';

function OrderList({ order }) {
  const generateInvoice = () => {
    const doc = new jsPDF();

    // Tambah maklumat invois ke dalam PDF
    doc.setFontSize(18);
    doc.text('Invois Tempahan', 10, 10);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderNumber}`, 10, 20);
    doc.text(`Nama: ${order.name}`, 10, 30);
    doc.text(`No. Telefon: ${order.phone}`, 10, 40);
    doc.text(`Alamat: ${order.address}`, 10, 50);
    doc.text(`Jumlah: RM ${order.amount}`, 10, 60);
    doc.text(`Deposit: RM ${order.deposit}`, 10, 70);
    doc.text(`Balance: RM ${order.balance}`, 10, 80);
    doc.text(`Tarikh Mula: ${order.startDate}`, 10, 90);
    doc.text(`Masa Mula: ${order.startTime}`, 10, 100);
    doc.text(`Tarikh Tamat: ${order.endDate}`, 10, 110);
    doc.text(`Masa Tamat: ${order.endTime}`, 10, 120);
    if (order.notes) {
      doc.text(`Nota: ${order.notes}`, 10, 130);
    }

    // Simpan PDF dengan nama fail yang mengandungi nama pelanggan
    doc.save(`Invoice_${order.name}.pdf`);
  };

  return (
    <div 
      className={`border p-4 rounded-lg relative hover:shadow-md ${
        order.status === 'Completed' ? 'bg-green-50' : 'bg-yellow-50'
      }`}
    >
      <div className="mb-2">
        <div className="flex justify-between items-start">
          <p className="font-bold text-2xl">{order.name}</p>
          <div className="flex gap-2">
            <button 
              onClick={generateInvoice}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
            >
              Generate Invoice
            </button>
          </div>
        </div>
        <p>No. Order: {order.orderNumber}</p>
        <p>No. Telefon: {order.phone}</p>
        <p>Alamat: {order.address}</p>
        <p>Jumlah: RM {order.amount}</p>
        <p>Deposit: RM {order.deposit}</p>
        <p>Balance: RM {order.balance}</p>
        <p>Tarikh Mula: {order.startDate}</p>
        <p>Tarikh Tamat: {order.endDate}</p>
        <p>Masa Mula: {order.startTime}</p>
        <p>Masa Tamat: {order.endTime}</p>
        {order.notes && (
          <div className="mt-2 text-gray-600">
            <p className="font-semibold">Nota:</p>
            <p className="italic">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderList;
