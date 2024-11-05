import jsPDF from "jspdf";
import "jspdf-autotable";

export function generateInvoice(booking) {
  const doc = new jsPDF();
  
  // (Masukkan kod `generateInvoice` di sini seperti yang diberikan tadi)
  
  doc.save(`Invois_${booking.orderNumber}.pdf`);
}
Untuk menambah jadual
// Tambah QR code library jika mahu QR code: npm install qrcode

function generateInvoice(booking) {
  const doc = new jsPDF();

  // Tajuk utama
  doc.setFontSize(18);
  doc.text("Invoice", 20, 20);

  // Maklumat Syarikat (di sini boleh masukkan logo syarikat jika ada)
  doc.setFontSize(12);
  doc.text("Vackool Enterprise", 20, 30);
  doc.text("Order ID:", 20, 40);
  doc.text(`${booking.orderNumber}`, 60, 40); // Order ID booking
  doc.text("Received At:", 20, 50);
  doc.text(new Date(booking.startDate).toLocaleString("en-GB"), 60, 50); // Tarikh diterima

  // Maklumat Pelanggan
  doc.text("Customer Info:", 20, 70);
  doc.text(`Nama: ${booking.name}`, 20, 80);
  doc.text(`No. Telefon: ${booking.phone}`, 20, 90);
  doc.text(`Alamat: ${booking.address}, ${booking.postcode}, ${booking.state}`, 20, 100);

  // Tarikh & Masa
  doc.text("Date & Time Slot:", 20, 120);
  doc.text(`Start: ${new Date(booking.startDate).toLocaleDateString('en-GB')} ${formatTime(booking.startTime)}`, 20, 130);
  doc.text(`End: ${new Date(booking.endDate).toLocaleDateString('en-GB')} ${formatTime(booking.endTime)}`, 20, 140);

  // Maklumat Harga
  doc.text("Pricing Info:", 20, 160);
  doc.text(`Jumlah: RM ${booking.amount}`, 20, 170);
  doc.text(`Deposit: RM ${booking.deposit}`, 20, 180);
  doc.text(`Balance: RM ${Math.round(booking.balance)}`, 20, 190);

  // Nota jika ada
  if (booking.notes) {
    doc.text("Notes:", 20, 210);
    doc.text(booking.notes, 20, 220);
  }

  // Tambah QR Code (contoh, jika perlu QR code)
  // QRCode.toDataURL('https://example.com', { width: 80 }, (err, url) => {
  //   if (!err) {
  //     doc.addImage(url, 'JPEG', 150, 20, 50, 50); // Lokasi QR di dokumen
  //   }
  // });

  // Tambah Jadual Barang
  const items = [
    ["Air Cooler", "2", "120.00", "240.00"], // Contoh item, gantikan dengan data sebenar
  ];
  doc.autoTable({
    head: [["Item", "Qty", "Price", "Amount"]],
    body: items,
    startY: 240,
  });

  // Simpan PDF
  doc.save(`Invois_${booking.orderNumber}.pdf`);
}
