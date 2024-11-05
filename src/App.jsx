import React, { useState, useEffect } from 'react';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    unit: '',
    deposit: '',
    balance: '',
    address: '',
    notes: '',
    status: 'Pending' // Add default status
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter

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
      balance: (amount - deposit).toFixed(2)
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
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTime,
      endTime,
      status: 'Pending' // Set default status for new bookings
    };

    const existingData = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingData.push({
      id: Date.now(),
      ...submitData,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('bookings', JSON.stringify(existingData));

    // Reset form
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
    setFormData(prev => ({...prev})); // Trigger re-render
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">MAKLUMAT PELANGGAN</h2>
          
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
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Padamkan
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Senarai Tempahan</h3>
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">Semua</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {JSON.parse(localStorage.getItem('bookings') || '[]')
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .filter(booking => {
                  const bookingDate = new Date(booking.startDate);
                  return (statusFilter === 'all' || booking.status === statusFilter) &&
                         bookingDate.getMonth() === selectedMonth &&
                         bookingDate.getFullYear() === selectedYear;
                })
                .map(booking => (
                  <div 
                    key={booking.id} 
                    className={`border p-4 rounded-lg relative hover:shadow-md ${
                      booking.status === 'Completed' ? 'bg-green-50' : 'bg-yellow-50'
                    }`}
                  >
                    <div className="mb-2">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-lg">{booking.name}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleStatus(booking.id)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              booking.status === 'Completed' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {booking.status}
                          </button>
                          <button 
                            onClick={() => handleDelete(booking.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p>No. Telefon: {booking.phone}</p>
                      <p>Unit: {booking.unit}</p>
                      <p>Alamat: {booking.address}</p>
                      <div className="text-gray-600 text-sm mb-2">
                        <p>Dari: {new Date(booking.startDate).toLocaleDateString('ms-MY')} {formatTime(booking.startTime)}</p>
                        <p>Hingga: {new Date(booking.endDate).toLocaleDateString('ms-MY')} {formatTime(booking.endTime)}</p>
                      </div>
                      <p className="text-blue-600">Jumlah: RM {booking.amount}</p>
                      <p className="text-green-600">Deposit: RM {booking.deposit}</p>
                      <p className="text-red-600">Balance: RM {booking.balance}</p>
                      {booking.notes && (
                        <div className="mt-2 text-gray-600">
                          <p className="font-semibold">Nota:</p>
                          <p>{booking.notes}</p>
                        </div>
                      )}
                    </div>
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