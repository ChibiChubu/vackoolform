import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { RentalReceipt } from './components/RentalReceipt';
import logo from './images/logo.png';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500';

const cardCls = 'rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6';

const selectCls = 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [editingId, setEditingId] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

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
  const invoiceRef = useRef(null);
  const printAreaRef = useRef(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [invStatus, setInvStatus] = useState('ONGOING');
  const [invPayment, setInvPayment] = useState('PAID DEPO');
  const [invoiceSync, setInvoiceSync] = useState('');

  const todayStr = new Date().toLocaleDateString('en-CA');

  // Semua booking bulan/tahun yang dipilih (status filter takkan kurangkan dashboard)
  const monthBookings = useMemo(() => {
    return (bookings || []).filter((b) => {
      const d = new Date(b.startDate);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [bookings, selectedMonth, selectedYear]);

  const monthlyStats = useMemo(() => {
    const list = monthBookings || [];
    const total = list.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const deposit = list.reduce((s, b) => s + (parseFloat(b.deposit) || 0), 0);
    // Completed = baki dah bayar
    const balancePaid = list
      .filter((b) => b.status === 'Completed')
      .reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);
    const balanceDue = list
      .filter((b) => b.status !== 'Completed')
      .reduce((s, b) => s + (parseFloat(b.balance) || 0), 0);
    const done = list.filter((b) => b.status === 'Completed').length;
    return { total, deposit, balancePaid, balanceDue, count: list.length, done };
  }, [monthBookings]);

  const months = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
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
      const bookingsData = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return bookingsData;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Error fetching bookings');
      return [];
    }
  };

  // Auto-hitung balance = jumlah - deposit
  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const deposit = parseFloat(formData.deposit) || 0;
    setFormData((prev) => ({ ...prev, balance: Math.round(amount - deposit) }));
  }, [formData.amount, formData.deposit]);

  // Load semua booking sekali (filter bulan dibuat dalam useMemo)
  useEffect(() => {
    const loadBookings = async () => {
      const allBookings = await fetchBookings();
      setBookings(allBookings);
    };
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await addDoc(collection(db, 'bookings'), submitData);

      setFormData({
        name: '', phone: '', amount: '', unit: '', deposit: '', balance: '',
        balancePaymentDate: '', fullPayment: '', fullPaymentDate: '',
        address: '', postcode: '', state: '', notes: '', status: 'Pending'
      });
      setStartDate(null);
      setEndDate(null);
      setStartTime('');
      setEndTime('');

      alert('Tempahan berjaya disimpan!');
      const updatedBookings = await fetchBookings();
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error adding booking:', error);
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
      status: booking.status
    });
    setStartDate(new Date(booking.startDate));
    setEndDate(new Date(booking.endDate));
    setStartTime(booking.startTime);
    setEndTime(booking.endTime);
    setEditingId(booking.id);
    setActiveTab('form');
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
        endTime
      };
      const bookingRef = doc(db, 'bookings', editingId);
      await updateDoc(bookingRef, updateData);
      alert('Tempahan berjaya dikemaskini!');
      const updatedBookings = await fetchBookings();
      setBookings(updatedBookings);
      handleReset();
    } catch (error) {
      console.error('Error updating booking:', error);
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
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '', phone: '', amount: '', unit: '', deposit: '', balance: '',
      balancePaymentDate: '', fullPayment: '', fullPaymentDate: '',
      address: '', postcode: '', state: '', notes: '', status: 'Pending'
    });
    setStartDate(null);
    setEndDate(null);
    setStartTime('');
    setEndTime('');
    setEditingId(null);
  };

  const toggleStatus = async (bookingId, currentStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      await updateDoc(bookingRef, { status: newStatus });
      const updatedBookings = await fetchBookings();
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Buka page invois dulu (modal), baru download PDF dari dalam page tu
  const openInvoice = (booking) => {
    setInvoiceBooking(booking);
    if (booking.status === 'Completed') {
      setInvStatus('COMPLETED');
      setInvPayment('DONE');
    } else {
      setInvStatus('ONGOING');
      setInvPayment('PAID DEPO');
    }
  };

  // Adjust pills kat invois -> save ke Firebase, Senarai Tempahan & dashboard ikut sama
  const changeInvoiceState = async (target) => {
    const isCompleted = target === 'COMPLETED';
    const newStatus = isCompleted ? 'Completed' : 'Pending';
    setInvStatus(isCompleted ? 'COMPLETED' : 'ONGOING');
    setInvPayment(isCompleted ? 'DONE' : 'PAID DEPO');
    setInvoiceSync('Menyimpan…');
    try {
      if (invoiceBooking) {
        await updateDoc(doc(db, 'bookings', invoiceBooking.id), { status: newStatus });
      }
      // Sync local state supaya Senarai Tempahan & dashboard terus update
      setInvoiceBooking((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setBookings((prev) =>
        prev.map((b) => (b.id === invoiceBooking.id ? { ...b, status: newStatus } : b))
      );
      setInvoiceSync('✓ Disimpan — Senarai Tempahan dah update');
      setTimeout(() => setInvoiceSync(''), 2500);
    } catch (err) {
      console.error('Gagal update status:', err);
      setInvoiceSync('');
      alert('Gagal update status. Sila cuba lagi.');
    }
  };

  // Tandai body bila invois dibuka — print CSS akan print invois je, takde baris terpotong
  useEffect(() => {
    if (invoiceBooking) {
      document.body.classList.add('printing-invoice');
    } else {
      document.body.classList.remove('printing-invoice');
    }
    return () => document.body.classList.remove('printing-invoice');
  }, [invoiceBooking]);

  // Download PDF
  // iPhone/iPad: jana fail PDF betul — print preview iOS lambat + kena zoom & share manual
  // Desktop/Android: guna print dialog (native, sharp, cepat)
  const PDF_FILENAME = 'Vackool - Confirmation Invoice';

  const isIOSDevice = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const isInAppBrowser = () => /FBAN|FBAV|Instagram|Line\/|TikTok/i.test(navigator.userAgent);

  // Desktop/Android — nama fail PDF ikut document.title
  const printInvoice = () => {
    const prevTitle = document.title;
    document.title = PDF_FILENAME;

    const restoreTitle = () => {
      document.title = prevTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);

    window.print();

    // Fallback kalau browser tak trigger afterprint (phone)
    setTimeout(restoreTitle, 120000);
  };

  // iOS — render invois ke canvas, potong ikut sempadan baris (takde baris terpotong), simpan PDF
  const buildPdfForIOS = async () => {
    const node = printAreaRef.current;
    if (!node) throw new Error('Invois belum siap');

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    node.classList.add('capture-mode');

    try {
      // Bagi layout settle dulu sebelum capture
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Pastikan logo dah load — kalau tak, html2canvas skip gambar
      await Promise.all(
        Array.from(node.querySelectorAll('img')).map((img) =>
          img.complete
            ? null
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
        )
      );

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 8;
      const contentW = 210 - margin * 2; // mm
      const contentH = 297 - margin * 2; // mm
      const pxPerMm = canvas.width / contentW;
      const pageHPx = contentH * pxPerMm;

      // Titik potong selamat: bawah setiap baris / section
      const nodeRect = node.getBoundingClientRect();
      const scale = canvas.width / nodeRect.width;
      const breaks = Array.from(node.querySelectorAll('tr, .break-avoid'))
        .map((el) => Math.round((el.getBoundingClientRect().bottom - nodeRect.top) * scale))
        .filter((b) => b > 0)
        .sort((a, b) => a - b);

      let pos = 0;
      let first = true;
      while (pos < canvas.height - 1) {
        let end = Math.min(pos + pageHPx, canvas.height);
        if (end < canvas.height) {
          const safe = breaks.filter((b) => b <= end && b > pos + pageHPx * 0.25);
          if (safe.length) end = safe[safe.length - 1];
        }

        const sliceH = Math.max(1, Math.round(end - pos));
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = sliceH;
        const ctx = slice.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, slice.width, sliceH);
        ctx.drawImage(canvas, 0, -pos);

        if (!first) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.92),
          'JPEG',
          margin,
          margin,
          contentW,
          sliceH / pxPerMm
        );
        first = false;
        pos = end;
      }

      pdf.save(`${PDF_FILENAME}.pdf`);
    } finally {
      node.classList.remove('capture-mode');
    }
  };

  const generateInvoice = async () => {
    if (!isIOSDevice()) {
      printInvoice();
      return;
    }

    try {
      setGeneratingPDF(true);
      await buildPdfForIOS();
    } catch (err) {
      console.error('PDF error:', err);
      // Fallback — jangan tinggal pengguna tergantung
      printInvoice();
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSort = (order) => {
    setSortOrder(order);
    const sortedBookings = [...monthBookings].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setBookings(sortedBookings);
  };

  const visibleBookings = monthBookings.filter(
    (b) => statusFilter === 'all' || b.status === statusFilter
  );

  const maxAmount = Math.max(...monthBookings.map((x) => parseFloat(x.amount) || 0), 1);

  const tabs = [
    { id: 'form', label: 'Maklumat Pelanggan' },
    { id: 'list', label: 'Senarai Tempahan' },
    { id: 'dashboard', label: 'Dashboard' }
  ];

  return (
    <>
    <div className="app-shell min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <img src={logo} alt="Vackool" className="h-10 w-auto" />
          <div className="hidden xs:block sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">Vackool</p>
            <p className="-mt-0.5 text-sm font-semibold text-slate-800">Sistem Tempahan</p>
          </div>
          <div className="ml-auto rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            {months[selectedMonth]} {selectedYear}
          </div>
        </div>
        {/* Tab bar */}
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <nav className="inline-flex w-full gap-1 rounded-2xl bg-slate-100 p-1 sm:w-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6">
        {/* ============ TAB: FORM ============ */}
        {activeTab === 'form' && (
          <div className="space-y-5">
            {editingId && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="font-medium">Sedang edit tempahan — semak semula sebelum kemaskini.</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg px-3 py-1.5 font-semibold text-amber-700 ring-1 ring-amber-300 hover:bg-amber-100"
                >
                  Batal
                </button>
              </div>
            )}

            <form id="vackool-form" onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-5">
              {/* Pelanggan */}
              <section className={cardCls}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-base font-bold text-brand-600 ring-1 ring-brand-100">1</span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Maklumat Pelanggan</h3>
                    <p className="text-xs text-slate-400">Nama, telefon dan alamat</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Nama</label>
                    <input className={inputCls} name="name" value={formData.name} onChange={handleInputChange} placeholder="Nama penuh" required />
                  </div>
                  <div>
                    <label className={labelCls}>No. Telefon</label>
                    <input className={inputCls} name="phone" value={formData.phone} onChange={handleInputChange} placeholder="012-3456789" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Alamat</label>
                    <input className={inputCls} name="address" value={formData.address} onChange={handleInputChange} placeholder="No. rumah / flat, jalan, kawasan" required />
                  </div>
                  <div>
                    <label className={labelCls}>Poskod</label>
                    <input className={inputCls} name="postcode" value={formData.postcode} onChange={handleInputChange} placeholder="54100" required />
                  </div>
                  <div>
                    <label className={labelCls}>Negeri</label>
                    <select className={inputCls} name="state" value={formData.state} onChange={handleInputChange} required>
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
                </div>
              </section>

              {/* Bayaran */}
              <section className={cardCls}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-base font-bold text-brand-600 ring-1 ring-brand-100">2</span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Bayaran</h3>
                    <p className="text-xs text-slate-400">Semua dalam RM (tanpa sen)</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Jumlah (RM)</label>
                    <input className={inputCls} name="amount" type="number" min="0" step="1" value={formData.amount} onChange={handleInputChange} placeholder="cth: 350" required />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Sewaan</label>
                    <input className={inputCls} name="unit" value={formData.unit} onChange={handleInputChange} placeholder="cth: 2 unit" required />
                  </div>
                  <div>
                    <label className={labelCls}>Deposit (RM)</label>
                    <input className={inputCls} name="deposit" type="number" min="0" step="1" value={formData.deposit} onChange={handleInputChange} placeholder="cth: 100" required />
                  </div>
                  <div>
                    <label className={labelCls}>Balance (RM)</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700" value={formData.balance} readOnly />
                  </div>
                  <div>
                    <label className={labelCls}>Tarikh Bayar Deposit</label>
                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500" type="date" value={todayStr} readOnly title="Ditetapkan secara automatik (tarikh hari ini)" />
                    <p className="mt-1 text-[11px] text-slate-400">Automatik = tarikh borang diisi</p>
                  </div>
                  <div>
                    <label className={labelCls}>Full Payment (RM)</label>
                    <input className={inputCls} name="fullPayment" type="number" min="0" step="1" value={formData.fullPayment} onChange={handleInputChange} placeholder="Pilihan" />
                  </div>
                  <div>
                    <label className={labelCls}>Tarikh Full Payment</label>
                    <input className={inputCls} type="date" name="fullPaymentDate" value={formData.fullPaymentDate} onChange={handleInputChange} />
                  </div>
                </div>
              </section>

              {/* Tempahan */}
              <section className={cardCls}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-base font-bold text-brand-600 ring-1 ring-brand-100">3</span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Butiran Tempahan</h3>
                    <p className="text-xs text-slate-400">Tarikh &amp; masa sewaan</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Tarikh Mula</label>
                    <input className={inputCls} type="date" value={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={(e) => setStartDate(new Date(e.target.value))} required />
                  </div>
                  <div>
                    <label className={labelCls}>Masa Mula</label>
                    <input className={inputCls} type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                  <div>
                    <label className={labelCls}>Tarikh Tamat</label>
                    <input className={inputCls} type="date" value={endDate ? endDate.toISOString().split('T')[0] : ''} onChange={(e) => setEndDate(new Date(e.target.value))} required />
                  </div>
                  <div>
                    <label className={labelCls}>Masa Tamat</label>
                    <input className={inputCls} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nota</label>
                    <textarea className={`${inputCls} h-24 resize-none`} name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Nota tambahan (pilihan)" />
                  </div>
                </div>
              </section>
            </form>
          </div>
        )}

        {/* ============ TAB: LIST ============ */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Senarai Tempahan</h2>
                <p className="text-xs text-slate-400">{visibleBookings.length} tempahan · {months[selectedMonth]} {selectedYear}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select className={selectCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                <select className={selectCls} value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select className={selectCls} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button type="button" onClick={() => handleSort(sortOrder === 'asc' ? 'desc' : 'asc')} className={selectCls}>
                  {sortOrder === 'asc' ? '↑ Terlama' : '↓ Terbaru'}
                </button>
              </div>
            </div>

            {visibleBookings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-12 text-center">
                <p className="text-3xl">📭</p>
                <p className="mt-2 font-semibold text-slate-600">Tiada tempahan bulan ini</p>
                <p className="text-sm text-slate-400">Cuba tukar bulan atau tambah tempahan baharu.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="mt-4 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-600"
                >
                  + Tambah Tempahan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleBookings.map((booking) => {
                  const statusCls =
                    booking.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : 'bg-amber-50 text-amber-700 ring-amber-200';
                  const dotCls = booking.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500';
                  return (
                    <article key={booking.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-800">{booking.name}</h3>
                            <button
                              type="button"
                              onClick={() => toggleStatus(booking.id, booking.status)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${statusCls}`}
                              title="Klik untuk tukar status"
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
                              {booking.status}
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs font-medium text-slate-400">
                            {booking.orderNumber} · {booking.phone}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleEdit(booking)} className="rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openInvoice(booking)}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-500/30 transition hover:bg-brand-600"
                          >
                            🧾 Invois &amp; PDF
                          </button>
                          <button type="button" onClick={() => handleDelete(booking.id)} className="rounded-lg bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">
                            Padam
                          </button>
                        </div>
                      </div>

                      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Unit</dt>
                          <dd className="font-medium text-slate-700">{booking.unit}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Alamat</dt>
                          <dd className="font-medium text-slate-700">{booking.address}, {booking.postcode}, {booking.state}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Jangka Sewaan</dt>
                          <dd className="font-medium text-slate-700">
                            {new Date(booking.startDate).toLocaleDateString('en-GB')} {formatTime(booking.startTime)} —{' '}
                            {new Date(booking.endDate).toLocaleDateString('en-GB')} {formatTime(booking.endTime)}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-sm">
                        <span className="text-slate-500">
                          Jumlah <strong className="text-slate-800">RM {Math.round(parseFloat(booking.amount) || 0).toLocaleString('en-MY')}</strong>
                        </span>
                        <span className="text-slate-500">
                          Deposit <strong className="text-emerald-600">RM {Math.round(parseFloat(booking.deposit) || 0).toLocaleString('en-MY')}</strong>
                        </span>
                        <span className="text-slate-500">
                          {booking.status === 'Completed' ? (
                            <>Baki <strong className="text-emerald-600">✓ RM {Math.round(parseFloat(booking.balance) || 0).toLocaleString('en-MY')} (Dibayar)</strong></>
                          ) : (
                            <>Balance <strong className="text-rose-600">RM {Math.round(parseFloat(booking.balance) || 0).toLocaleString('en-MY')}</strong></>
                          )}
                        </span>
                        {booking.fullPayment !== '' && booking.fullPayment !== undefined && (
                          <span className="text-slate-500">
                            Full Pay <strong className="text-emerald-600">RM {Math.round(parseFloat(booking.fullPayment) || 0).toLocaleString('en-MY')}</strong>
                          </span>
                        )}
                      </div>

                      {booking.notes && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs italic text-slate-500">“{booking.notes}”</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ TAB: DASHBOARD ============ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Dashboard Jualan</h2>
                <p className="text-xs text-slate-400">Ringkasan bulanan</p>
              </div>
              <div className="flex gap-2">
                <select className={selectCls} value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select className={selectCls} value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Jumlah Jualan</p>
                <p className="mt-1 text-xl font-bold text-slate-800">RM {Math.round(monthlyStats.total).toLocaleString('en-MY')}</p>
              </div>
              <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Duit Masuk (Deposit + Baki Selesai)</p>
                <p className="mt-1 text-xl font-bold text-brand-700">RM {Math.round(monthlyStats.deposit + monthlyStats.balancePaid).toLocaleString('en-MY')}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Baki Belum Bayar (Pending)</p>
                <p className="mt-1 text-xl font-bold text-slate-800">RM {Math.round(monthlyStats.balanceDue).toLocaleString('en-MY')}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Selesai</p>
                <p className="mt-1 text-xl font-bold text-slate-800">
                  {monthlyStats.done}
                  <span className="text-sm font-medium text-slate-400"> / {monthlyStats.count}</span>
                </p>
              </div>
            </div>

            <div className={cardCls}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Graf Tempahan Bulanan</h3>
                  <p className="text-xs text-slate-400">Setiap bar = satu tempahan, tinggi ikut jumlah RM</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {monthlyStats.count} tempahan
                </span>
              </div>

              {monthBookings.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  Tiada data tempahan untuk bulan ini
                </div>
              ) : (
                <div className="flex h-36 items-end gap-1.5">
                  {monthBookings.map((b) => {
                    const amount = parseFloat(b.amount) || 0;
                    const pct = Math.max((amount / maxAmount) * 100, 6);
                    return (
                      <div key={b.id} className="flex h-full flex-1 items-end group" title={`${b.name} — RM ${Math.round(amount).toLocaleString('en-MY')}`}>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            b.status === 'Completed'
                              ? 'bg-[#38B09D] group-hover:bg-[#2E9484]'
                              : 'bg-[#A9DCD1] group-hover:bg-[#8FD0C2]'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>Padu = Selesai · Pudar = Belum selesai</span>
                <span>Hover bar untuk lihat butiran</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky action bar — button simpan sentiasa nampak */}
      {activeTab === 'form' && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
            {editingId ? (
              <p className="text-xs font-medium text-amber-600 sm:mr-2">Mod edit — kemaskini akan tulis ke Firestore.</p>
            ) : (
              <p className="hidden text-xs text-slate-400 sm:block">Order ID di-jana automatik bila disimpan.</p>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="submit"
                form="vackool-form"
                className="min-w-[11rem] rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30 transition hover:from-brand-600 hover:to-brand-700 active:scale-[0.99]"
              >
                {editingId ? 'Kemaskini Tempahan' : 'Simpan Tempahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {invoiceBooking && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm"
          onClick={() => setInvoiceBooking(null)}
        >
          <div
            className="mx-auto flex min-h-full max-w-2xl items-start justify-center p-3 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full rounded-2xl bg-white shadow-2xl">
              {/* Toolbar: adjust status & bayaran */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Invois Tempahan</h3>
                  <p className="text-[11px] font-medium text-slate-400">
                    {invoiceBooking.orderNumber} · {invoiceBooking.name}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                  <div className="flex rounded-full bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => changeInvoiceState('PENDING')}
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                        invStatus === 'ONGOING'
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      ONGOING
                    </button>
                    <button
                      type="button"
                      onClick={() => changeInvoiceState('COMPLETED')}
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                        invStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      COMPLETED
                    </button>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bayaran</span>
                  <div className="flex rounded-full bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => changeInvoiceState('PENDING')}
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                        invPayment === 'PAID DEPO'
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      PAID DEPO
                    </button>
                    <button
                      type="button"
                      onClick={() => changeInvoiceState('COMPLETED')}
                      className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                        invPayment === 'DONE'
                          ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      DONE
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInvoiceBooking(null)}
                    className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100"
                  >
                    ✕ Tutup
                  </button>
                </div>
              </div>

              {/* Invois */}
              <div ref={invoiceRef} className="bg-white p-4 sm:p-6">
                <RentalReceipt
                  orderData={invoiceBooking}
                  statusLabel={invStatus}
                  paymentLabel={invPayment}
                />
              </div>

              {/* Nota: dalam app browser (IG/FB/TikTok) download selalu kena block */}
              {isInAppBrowser() && (
                <div className="mx-3 mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-800">
                  ⚠️ PDF susah keluar dalam app ni. Tekan menu (⋯) di atas →{' '}
                  <b>Open in browser</b> (Safari/Chrome), lepas tu download semula.
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <p className="hidden text-[11px] sm:block">
                  {invoiceSync ? (
                    <span className="font-bold text-emerald-600">{invoiceSync}</span>
                  ) : (
                    <span className="text-slate-400">Adjust pills kat atas — Senarai Tempahan akan ikut sama.</span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => generateInvoice()}
                  disabled={generatingPDF}
                  className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 disabled:opacity-60"
                >
                  {generatingPDF ? 'Menjana PDF…' : '⬇ Muat Turun PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Print-only: bila print, area ni je yang keluar — takde baris terpotong */}
    {invoiceBooking && (
      <div className="invoice-print-area" ref={printAreaRef}>
        <RentalReceipt
          orderData={invoiceBooking}
          statusLabel={invStatus}
          paymentLabel={invPayment}
        />
      </div>
    )}
    </>
  );
}

export default App;
