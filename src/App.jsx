import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  const [bookings, setBookings] = useState([]);

  const months = [
    "Januari", "Februari", "Mac", "April", "Mei", "Jun",
    "Julai", "Ogos", "September", "Oktober", "November", "Disember"
  ];

  // Load bookings from Firebase
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const loadedBookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(loadedBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
      }
    };
    loadBookings();
  }, [selectedMonth, selectedYear]);

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

  const handleSubmit = async (e) => {
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
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "bookings"), submitData);

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
      
      // Reload bookings
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const loadedBookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(loadedBookings);
      
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Error saving booking!");
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
      notes: ''
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti untuk padam tempahan ini?')) {
      try {
        await deleteDoc(doc(db, "bookings", id));
        
        // Reload bookings
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const loadedBookings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(loadedBookings);
        
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Error deleting booking!");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">MAKLUMAT PELANGGAN</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Your existing form JSX */}
            {/* ... */}
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
              {bookings
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