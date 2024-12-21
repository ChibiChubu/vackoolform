// invoice-generator.js

import jsPDF from 'jspdf';
import QRious from 'qrious';

function generateInvoicePDF(booking) {
  const doc = new jsPDF();

  // Ubah warna logo
  doc.setFillColor(0, 128, 128); // Tukar RGB value
  doc.circle(30, 20, 10, 'F');

  // Ubah font size company name
  doc.setFontSize(16); // Boleh adjust size
  doc.text('Vackool Enterprise', 50, 20);

  // Ubah position elements
  doc.text('Order ID:', 15, 48);
  doc.text(booking.orderNumber, 50, 48);

  // Status Badge
  doc.setFontSize(10);
  if (booking.status === 'ONGOING') {
    doc.setFillColor(255, 165, 0); // Warna oren untuk ONGOING
    doc.text(booking.status, 152, 46); // Letak teks status
  } else if (booking.status === 'COMPLETED') {
    doc.setFillColor(0, 128, 0); // Warna hijau untuk COMPLETED
    doc.text(booking.status, 152, 46);
  }
  doc.rect(150, 40, 45, 8, 'F'); // Status Badge background

  // Payment Status Badge
  if (booking.paymentStatus === 'PAID DEPO') {
    doc.setFillColor(0, 255, 0); // Warna hijau muda untuk PAID DEPO
    doc.text(booking.paymentStatus, 202, 46); // Letak teks payment status
  } else if (booking.paymentStatus === 'DONE') {
    doc.setFillColor(0, 128, 0); // Warna hijau gelap untuk DONE
    doc.text(booking.paymentStatus, 202, 46);
  }
  doc.rect(200, 40, 45, 8, 'F'); // Payment Status Badge background

  // Tambah maklumat tambahan
  doc.text(`Date & Time Slot:`, 15, 77);
  doc.text(`${new Date(booking.startDate).toLocaleDateString('ms-MY')} ${new Date(booking.startDate).toLocaleTimeString('ms-MY')}`, 15, 84);
  doc.text(`${new Date(booking.endDate).toLocaleDateString('ms-MY')} ${new Date(booking.endDate).toLocaleTimeString('ms-MY')}`, 15, 91);

  // Nama, Nombor Telefon, dan Alamat
  doc.text(`Name: ${booking.name}`, 15, 105);
  doc.text(`Phone Number: ${booking.phone}`, 15, 112);
  doc.text(`Address: ${booking.address}, ${booking.postcode}, ${booking.state}`, 15, 119);

  / Payment Details
  doc.text('Payment Details:', 15, 142);
  doc.text(`Amount: RM ${parseFloat(booking.amount).toFixed(2)} (Complete payment upon setup)`, 15, 149);
  doc.text(`Deposit: RM ${parseFloat(booking.deposit).toFixed(2)} (${new Date(booking.createdAt).toLocaleDateString('ms-MY')})`, 15, 156);
  const amountToComplete = parseFloat(booking.amount) - parseFloat(booking.deposit);
  doc.text(`Balance: RM ${amountToComplete.toFixed(2)} (${new Date(booking.endDate).toLocaleDateString('ms-MY')} ${new Date(booking.endDate).toLocaleTimeString('ms-MY')})`, 15, 163);


  // Order Items
  const tableData = [
    ['Item', 'Qty', 'Price', 'Amount'],
    ['Air Cooler', booking.unit, (parseFloat(booking.amount) / parseInt(booking.unit)).toFixed(2), booking.amount]
  ];

  doc.autoTable({
    startY: 170,
    head: [tableData[0]],
    body: [tableData.slice(1)],
    theme: 'grid'
  });

  // Tambah QR code (perlu tambah plugin QRious untuk QR code)
  const qr = new QRious({
    value: booking.orderNumber,
    size: 50
  });
  doc.addImage(qr.toDataURL(), 'PNG', 150, 10, 50, 50);

  // Customize footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Terima kasih kerana memberi kepercayaan kepada kami!', 15, 280);

  // Tambah terms & conditions
  doc.setFontSize(8);
  doc.text('Terms & Conditions:', 15, 250);
  doc.text('1. Deposit tidak akan dikembalikan jika pembatalan dibuat', 15, 257);
  doc.text('2. Sila jaga peralatan dengan baik', 15, 264);

  // Simpan fail PDF
  doc.save(`${booking.orderNumber}.pdf`);
}

export default generateInvoicePDF;
