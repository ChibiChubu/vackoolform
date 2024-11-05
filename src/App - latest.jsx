import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    unit: '',
    deposit: '',
    balance: '',
    address: '',
    postcode: '',
    state: '',
    notes: '',
    status: 'Pending'
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all');

  const months = [
    "Januari", "Februari", "Mac", "April", "Mei", "Jun",
    "Julai", "Ogos", "September", "Oktober", "November", "Disember"
  ];

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hr = parseInt(hours);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hour12 = hr % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const deposit = parseFloat(formData.deposit) || 0;
    setFormData(prev => ({
      ...prev,
      balance: Math.round(amount - deposit)
    }));
  }, [formData.amount, formData.deposit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !startTime || !endTime) {
      alert('Sila pilih tarikh dan masa mula dan tamat');
      return;
    }

    const submitData = {
      ...formData,
      orderNumber: `ORD-${Date.now()}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime,
      endTime,
      status: 'Pending'
    };

    const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingData.push({
      id: Date.now(),
      ...submitData,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('bookings', JSON.stringify(existingData));

    setFormData({
      name: '',
      phone: '',
      amount: '',
      unit: '',
      deposit: '',
      balance: '',
      address: '',
      postcode: '',
      state: '',
      notes: '',
      status: 'Pending'
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');

    alert('Tempahan berjaya disimpan!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Adakah anda pasti untuk padam tempahan ini?')) {
      const currentBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBookings = currentBookings.filter(b => b.id !== id);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setFormData(prev => ({...prev}));
    }
  };

const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      amount: '',
      unit: '',
      deposit: '',
      balance: '',
      address: '',
      notes: '',
      status: 'Pending'
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
  };

  const toggleStatus = (bookingId) => {
    const currentBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = currentBookings.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: booking.status === 'Pending' ? 'Completed' : 'Pending'
        };
      }
      return booking;
    });
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    setFormData(prev => ({...prev}));
  };

  const generateInvoice = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Invois Tempahan', 10, 10);
    doc.setFontSize(12);
    doc.text(`Order ID: ${booking.orderNumber}`, 10, 20);
    doc.text(`Nama: ${booking.name}`, 10, 30);
    doc.text(`No. Telefon: ${booking.phone}`, 10, 40);
    doc.text(`Alamat: ${booking.address}, ${booking.postcode}, ${booking.state}`, 10, 50);
    doc.text(`Jumlah: RM ${booking.amount}`, 10, 60);
    doc.text(`Deposit: RM ${booking.deposit}`, 10, 70);
    doc.text(`Balance: RM ${booking.balance}`, 10, 80);
    doc.text(`Tarikh Mula: ${new Date(booking.startDate).toLocaleDateString('en-GB')} ${formatTime(booking.startTime)}`, 10, 90);
    doc.text(`Tarikh Tamat: ${new Date(booking.endDate).toLocaleDateString('en-GB')} ${formatTime(booking.endTime)}`, 10, 100);
    if (booking.notes) {
      doc.text(`Nota: ${booking.notes}`, 10, 110);
    }
    doc.save(`Invoice_${booking.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">MAKLUMAT PELANGGAN</h2>
          
          {/* Kod UI asal untuk form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama" 
                required
              />
            </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Masukkan nombor telefon" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (RM)</label>
                <input 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Masukkan jumlah" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Sewaan</label>
                <input 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  placeholder="Masukkan unit" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (RM)</label>
                <input 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="deposit"
                  type="number"
                  step="0.01"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  placeholder="Masukkan deposit" 
                  required
                />
              </div>
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Balance (RM)</label>
  <input 
    className="w-full px-3 py-2 border rounded-md bg-gray-50" 
    value={formData.balance}
    readOnly 
  />
</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Mula</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masa Mula</label>
                  <input 
                    type="time"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Tamat</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Masa Tamat</label>
                  <input 
                    type="time"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <input 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat" 
                required
              />
            </div>
			
		<div className="grid grid-cols-2 gap-4">
			<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">Poskod</label>
			<input 
				className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				name="postcode"
				value={formData.postcode}
				onChange={handleInputChange}
				placeholder="Masukkan poskod"
				required
			/>
		</div>
  
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">Negeri</label>
			<input 
				className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				name="state"
				value={formData.state}
				onChange={handleInputChange}
				placeholder="Masukkan negeri"
				required
			/>
		</div>
		</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Masukkan nota tambahan"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Simpan
              </button>
              <button 
                type="button"
                onClick={() => setFormData({
                  name: '', phone: '', amount: '', unit: '', deposit: '', balance: '', address: '', postcode: '', state: '', notes: '', status: 'Pending'
                })}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Padamkan
              </button>
            </div>
          </form>

          {/* Senarai Tempahan */}
		  
          <div className="mt-8">
            <h3 className="font-bold">Senarai Tempahan</h3>
            <div className="space-y-4">
              {JSON.parse(localStorage.getItem('bookings') || '[]')
                .filter(booking => (statusFilter === 'all' || booking.status === statusFilter))
                .map((booking) => (
                  <div key={booking.id} className="border p-4 rounded-lg relative hover:shadow-md">
				  <p>No. Order: {booking.orderNumber}</p> {/* Tambahkan No. Order */}
                    <p><strong>Nama:</strong> {booking.name}</p>
                    <p><strong>No. Telefon:</strong> {booking.phone}</p>
                    <p><strong>Alamat:</strong> {booking.address}, {booking.postcode}, {booking.state}</p>
					<div className="text-gray-600 text-sm mb-2">
						<p>Dari: {new Date(booking.startDate).toLocaleDateString('en-GB')} {formatTime(booking.startTime)}</p>
						<p>Hingga: {new Date(booking.endDate).toLocaleDateString('en-GB')} {formatTime(booking.endTime)}</p>
					</div>
                    <p><strong>Jumlah:</strong> RM {booking.amount}</p>
                    <p><strong>Deposit:</strong> RM {booking.deposit}</p>
                    <p><strong>Balance:</strong> RM {Math.round(booking.balance)}</p>
					
                    <button onClick={() => generateInvoice(booking)} className="bg-blue-500 text-white px-2 py-1 rounded mt-2">
                      Download PDF
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
