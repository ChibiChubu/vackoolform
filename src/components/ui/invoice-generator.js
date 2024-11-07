// Ubah warna logo
doc.setFillColor(0, 128, 128); // Tukar RGB value
doc.circle(30, 20, 10, 'F');

// Ubah font size company name
doc.setFontSize(16); // Boleh adjust size
doc.text('Vackool Enterprise', 50, 20);

// Ubah position elements
doc.text('Order ID:', 15, 48); // Adjust koordinat x,y

// Ubah warna status badge
doc.setFillColor(255, 165, 0); // Tukar warna status badge
doc.rect(150, 40, 45, 8, 'F');

// Tambah maklumat baru
doc.text(`Unit: ${booking.unit}`, 15, 190);
doc.text(`Payment Status: ${booking.paymentStatus}`, 15, 197);

// Ubah format tarikh/masa
doc.text(`${new Date(booking.startDate).toLocaleDateString('ms-MY')}`, 15, 77);

// Tambah table untuk items
const tableData = [
  ['Item', 'Qty', 'Price', 'Amount'],
  ['Air Cooler', '2', '120.00', '240.00']
];

doc.autoTable({
  startY: 210,
  head: [tableData[0]],
  body: [tableData[1]],
  theme: 'grid'
});

// Tambah QR code (perlu tambah plugin)
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