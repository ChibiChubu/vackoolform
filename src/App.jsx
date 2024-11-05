import React, { useState, useEffect } from 'react';
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Calendar } from "./components/ui/calendar";

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    unit: '',
    deposit: '',
    balance: '',
    address: '',
    notes: ''
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Januari", "Februari", "Mac", "April", "Mei", "Jun",
    "Julai", "Ogos", "September", "Oktober", "November", "Disember"
  ];

  const formatTime = (time) => {
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
      endTime
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
      notes: ''
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');

    alert('Tempahan berjaya disimpan!');
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
      notes: ''
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Adakah anda pasti untuk padam tempahan ini?')) {
      const currentBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBookings = currentBookings.filter(b => b.id !== id);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setFormData(prev => ({...prev}));
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">MAKLUMAT PELANGGAN</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nama</Label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama" 
                required
              />
            </div>

            <div>
              <Label>No. Telefon</Label>
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Masukkan nombor telefon" 
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jumlah (RM)</Label>
                <Input 
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
                <Label>Unit Sewaan</Label>
                <Input 
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
                <Label>Deposit (RM)</Label>
                <Input 
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
                <Label>Balance (RM)</Label>
                <Input 
                  value={formData.balance}
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tarikh Mula</Label>
                <div className="border rounded-md mt-1 bg-white">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="rounded-md"
                    required
                  />
                </div>
                <div className="mt-2">
                  <Label>Masa Mula</Label>
                  <Input 
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Tarikh Tamat</Label>
                <div className="border rounded-md mt-1 bg-white">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="rounded-md"
                    required
                  />
                </div>
                <div className="mt-2">
                  <Label>Masa Tamat</Label>
                  <Input 
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Alamat</Label>
              <Input 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat" 
                required
              />
            </div>

            <div>
              <Label>Nota</Label>
              <Textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Masukkan nota tambahan"
                className="h-24"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit">Simpan</Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Padamkan
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Senarai Tempahan</h3>
              <div className="flex gap-2">
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
                  return bookingDate.getMonth() === selectedMonth &&
                         bookingDate.getFullYear() === selectedYear;
                })
                .map(booking => (
                  <div key={booking.id} className="border p-4 rounded-lg relative hover:shadow-md">
                    <div className="mb-2">
                      <p className="font-bold text-lg">{booking.name}</p>
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
                    <button 
                      onClick={() => handleDelete(booking.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      ✕
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