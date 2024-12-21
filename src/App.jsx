import React, { useState, useEffect } from 'react';
import { db } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import ReactDOM from 'react-dom/client';
import { RentalReceipt } from './components/RentalReceipt';

function App() {
  const [editingId, setEditingId] = useState(null);
  
  const [sortOrder, setSortOrder] = useState('asc'); // Default sort order: ascending

  const handleSort = (order) => {
    setSortOrder(order);
    const sortedBookings = [...bookings].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setBookings(sortedBookings);
  };

  const [formData, setFormData] = useState({
  name: '',
  phone: '',
  amount: '',
  unit: '',
  deposit: '',
  balance: '',
  balancePaymentDate: '',
  fullPayment: '',
  fullPaymentDate: '',
  address: '',
  postcode: '',
  state: '',
  notes: '',
  status: 'Pending'
});

  
  const [bookings, setBookings] = useState([]);
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

  const fetchBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const querySnapshot = await getDocs(bookingsRef);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return bookingsData;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert('Error fetching bookings');
      return [];
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !startTime || !endTime) {
      alert('Sila pilih tarikh dan masa mula dan tamat');
      return;
    }

    try {
      const submitData = {
  ...formData,
  orderNumber: `ORD-${Date.now()}`,
  startDate: startDate.toISOString(),
  endDate: endDate.toISOString(),
  startTime,
  endTime,
  createdAt: new Date().toISOString(),
  balancePaymentDate: formData.balancePaymentDate ? new Date(formData.balancePaymentDate).toISOString() : null,
  fullPayment: formData.fullPayment,
  fullPaymentDate: formData.fullPaymentDate ? new Date(formData.fullPaymentDate).toISOString() : null,
  status: 'Pending'
};

console.log("Data to be submitted:", submitData);
      await addDoc(collection(db, 'bookings'), submitData);
      
      setFormData({
        name: '',
        phone: '',
        amount: '',
        unit: '',
        deposit: '',
        balance: '',
        balancePaymentDate: '',
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
      const updatedBookings = await fetchBookings();
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error adding booking:", error);
      alert('Error saving booking');
    }
  };

  
  const handleEdit = (booking) => {
    setFormData({
      name: booking.name,
      phone: booking.phone,
      amount: booking.amount,
      unit: booking.unit,
      deposit: booking.deposit,
      balance: booking.balance,
      balancePaymentDate: booking.balancePaymentDate ? booking.balancePaymentDate.split('T')[0] : '',
	  fullPayment: booking.fullPayment || '',
	  fullPaymentDate: booking.fullPaymentDate ? booking.fullPaymentDate.split('T')[0] : '',
      address: booking.address,
      postcode: booking.postcode,
      state: booking.state,
      notes: booking.notes,
      status: booking.status,
    });
    setStartDate(new Date(booking.startDate));
    setEndDate(new Date(booking.endDate));
    setStartTime(booking.startTime);
    setEndTime(booking.endTime);
    setEditingId(booking.id); // Set the booking ID being edited
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !startTime || !endTime) {
      alert('Sila pilih tarikh dan masa mula dan tamat');
      return;
    }
    try {
      const updateData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startTime,
        endTime,
      };

      const bookingRef = doc(db, 'bookings', editingId);
      await updateDoc(bookingRef, updateData);

      alert('Tempahan berjaya dikemaskini!');
      const updatedBookings = await fetchBookings();
      setBookings(updatedBookings);
      handleReset(); // Reset form after updating
    } catch (error) {
      console.error("Error updating booking:", error);
      alert('Error updating booking');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti untuk padam tempahan ini?')) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
        const updatedBookings = await fetchBookings();
        setBookings(updatedBookings);
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert('Error deleting booking');
      }
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
      balancePaymentDate: '',
      address: '',
      notes: '',
      status: 'Pending'
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
  };

  const toggleStatus = async (bookingId, currentStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await updateDoc(bookingRef, {
        status: newStatus
      });
      const updatedBookings = await fetchBookings();
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Error updating status');
    }
  };

  const generateInvoice = (booking) => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${booking.orderNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body {
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div id="receipt"></div>
          </body>
        </html>
      `);

      const root = ReactDOM.createRoot(printWindow.document.getElementById('receipt'));
      root.render(<RentalReceipt orderData={booking} />);

      setTimeout(() => {
        printWindow.document.close();
        printWindow.onload = function() {
          printWindow.print();
          printWindow.onafterprint = function() {
            printWindow.close();
          };
        };
      }, 1000);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      const allBookings = await fetchBookings();
      const filteredBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.startDate);
        return (statusFilter === 'all' || booking.status === statusFilter) &&
               bookingDate.getMonth() === selectedMonth &&
               bookingDate.getFullYear() === selectedYear;
      });
      setBookings(filteredBookings);
    };

    loadBookings();
  }, [selectedMonth, selectedYear, statusFilter]);

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
              <div className="flex gap-2">
                <input 
                  className="w-1/2 px-3 py-2 border rounded-md bg-gray-50" 
                  value={formData.balance}
                  readOnly 
                />
                <input 
                  type="date"
                  className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="balancePaymentDate"
                  value={formData.balancePaymentDate}
                  onChange={handleInputChange}
                  placeholder="Tarikh bayaran balance"
                />
              </div>
            </div>

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
  <select
    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    name="state"
    value={formData.state}
    onChange={handleInputChange}
    required
  >
    <option value="">PILIH NEGERI</option>
    <option value="JOHOR">JOHOR</option>
    <option value="MELAKA">MELAKA</option>
    <option value="PAHANG">PAHANG</option>
    <option value="NEGERI SEMBILAN">NEGERI SEMBILAN</option>
    <option value="SELANGOR">SELANGOR</option>
    <option value="PERAK">PERAK</option>
    <option value="TERENGGANU">TERENGGANU</option>
    <option value="KELANTAN">KELANTAN</option>
    <option value="PULAU PINANG">PULAU PINANG</option>
    <option value="KEDAH">KEDAH</option>
    <option value="PERLIS">PERLIS</option>
    <option value="SABAH">SABAH</option>
    <option value="SARAWAK">SARAWAK</option>
    <option value="KUALA LUMPUR">KUALA LUMPUR</option>
  </select>
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Full Payment (RM)</label>
  <div className="flex gap-2">
    <input 
      className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      name="fullPayment"
      type="number"
      step="0.01"
      value={formData.fullPayment}
      onChange={handleInputChange}
      placeholder="Masukkan full payment"
    />
    <input 
      type="date"
      className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      name="fullPaymentDate"
      value={formData.fullPaymentDate}
      onChange={handleInputChange}
      placeholder="Tarikh full payment"
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
  onClick={editingId ? handleUpdate : handleSubmit}
  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  {editingId ? 'Kemaskini' : 'Simpan'}
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

            
<div className="flex gap-2 mb-4">
  <button
    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    onClick={() => handleSort('asc')}
  >
    Sort Ascending
  </button>
  <button
    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    onClick={() => handleSort('desc')}
  >
    Sort Descending
  </button>
</div>

            <div className="space-y-4">
              {bookings
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
                        <p className="font-bold text-2xl">{booking.name}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleStatus(booking.id, booking.status)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              booking.status === 'Completed' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {booking.status}
                          </button>
                          
<button
  onClick={() => handleEdit(booking)}
  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
>
  Edit
</button>

                        <button 
                            onClick={() => handleDelete(booking.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p>No. Order: {booking.orderNumber}</p>
                      <p>No. Telefon: {booking.phone}</p>
                      <p>Unit: {booking.unit}</p>
                      <p>Alamat: {booking.address}, {booking.postcode}, {booking.state}</p>
                      <div className="text-gray-600 text-sm mb-2">
                        <p>Dari: {new Date(booking.startDate).toLocaleDateString('en-GB')} {formatTime(booking.startTime)}</p>
                        <p>Hingga: {new Date(booking.endDate).toLocaleDateString('en-GB')} {formatTime(booking.endTime)}</p>
                      </div>
                      <p className="text-blue-600">Jumlah: RM {booking.amount}</p>
                      <p className="text-green-600">
                        Deposit: RM {booking.deposit} 
                        <span className="text-gray-500 ml-2">
                          ({format(new Date(booking.createdAt), 'iiii, dd MMMM yyyy h:mm a')})
                        </span>
                      </p>
					  
					  
					  
               <p className="text-red-600">
  Balance: RM {Math.round(booking.balance)}
</p>

					  
<p className="text-green-600">
  Full Payment: RM {booking.fullPayment || 0}
  {booking.fullPaymentDate && (
    <span className="text-gray-500 ml-2">
      (Pay On: {new Date(booking.fullPaymentDate).toLocaleDateString('en-GB', {
        weekday: 'long', // Hari penuh
        day: '2-digit',  // Hari dalam dua digit
        month: 'long',   // Nama bulan penuh
        year: 'numeric', // Tahun penuh
      })})
    </span>
  )}
</p>

					  
					  
					  
                      {booking.notes && (
                        <div className="mt-2 text-gray-600">
                          <p className="font-semibold">Nota:</p>
                          <p className="italic">{booking.notes}</p>
                        </div>
                      )}
                      <button 
                        onClick={() => generateInvoice(booking)} 
                        className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Download PDF
                      </button>
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