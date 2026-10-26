// src/components/RentalReceipt.jsx
import React from 'react';
import logo from '../images/logo.png';
import { format } from 'date-fns';

// Invois modern — statusLabel: 'ONGOING' | 'COMPLETED', paymentLabel: 'PAID DEPO' | 'DONE'
export const RentalReceipt = ({
  orderData,
  statusLabel = 'ONGOING',
  paymentLabel = 'PAID DEPO',
}) => {
  const isDone = statusLabel === 'COMPLETED';

  // RM tanpa sen
  const rm = (v) => `RM ${Math.round(parseFloat(v) || 0).toLocaleString('en-MY')}`;

  // Helper function to format time consistently
  const formatTime = (time) => {
    if (!time || typeof time !== 'string') return '';
    const [hours, minutes] = time.split(':');
    const hr = parseInt(hours);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hour12 = hr % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to format date with time
  const formatDateTime = (date, time) => {
    const formattedDate = format(new Date(date), 'iiii, dd MMMM yyyy');
    return time ? `${formattedDate} · ${formatTime(time)}` : formattedDate;
  };

  const unitPrice = (() => {
    const u = parseInt(orderData.unit);
    const a = parseFloat(orderData.amount);
    return Math.round(u > 0 ? a / u : a);
  })();

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
      {/* Brand accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#2E9484] via-[#38B09D] to-[#8FD8CB]" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
              <img src={logo} alt="Vackool" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                Vackool Enterprise
              </h2>
              <p className="text-xs font-medium text-slate-400">(003499862-P)</p>
            </div>
          </div>
          <a
            href="https://wa.me/60169694840"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF6F3] px-3.5 py-1.5 text-xs font-bold text-[#256B5F]"
          >
            WhatsApp 60169694840
          </a>
        </div>

        {/* Order ID + status pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Order ID
          </span>
          <span className="text-sm font-bold text-slate-800">{orderData.orderNumber}</span>
          <span
            className={`ml-auto rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${
              statusLabel === 'COMPLETED'
                ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
            }`}
          >
            {statusLabel}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${
              paymentLabel === 'DONE'
                ? 'bg-green-100 text-green-800 ring-1 ring-green-300'
                : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
            }`}
          >
            {paymentLabel}
          </span>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Date &amp; Time Slot
            </p>
            <div className="mt-2 space-y-1.5 text-xs">
              <p>
                <span className="font-bold text-slate-500">Start Event:</span>{' '}
                <span className="text-slate-700">
                  {formatDateTime(orderData.startDate, orderData.startTime)}
                </span>
              </p>
              <p>
                <span className="font-bold text-slate-500">End Event:</span>{' '}
                <span className="text-slate-700">
                  {formatDateTime(orderData.endDate, orderData.endTime)}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pelanggan
            </p>
            <div className="mt-2 space-y-1.5 text-xs">
              <p className="text-sm font-bold text-slate-800">{orderData.name}</p>
              <a
                href={`https://wa.me/${orderData.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#256B5F] underline"
              >
                {orderData.phone}
              </a>
              <p className="text-slate-600">
                {orderData.address}, {orderData.postcode}, {orderData.state}
              </p>
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Payment Details
          </p>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span>
                Deposit{' '}
                <span className="text-slate-400">
                  ({format(new Date(orderData.createdAt), 'dd MMMM yyyy')})
                </span>
              </span>
              <span className="font-bold text-green-700">{rm(orderData.deposit)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>
                Balance
                {isDone && (
                  <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-extrabold text-green-800">
                    DIBAYAR ✓
                  </span>
                )}
              </span>
              <span className={isDone ? 'font-bold text-green-700' : 'font-bold text-red-600'}>
                {rm(orderData.balance)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-1.5">
              <span className="font-semibold text-slate-600">
                Full Payment
                {orderData.fullPaymentDate && (
                  <span className="ml-1.5 font-normal text-slate-400">
                    (Pay On: {format(new Date(orderData.fullPaymentDate), 'dd MMMM yyyy')})
                  </span>
                )}
              </span>
              <span className="text-sm font-extrabold text-slate-900">{rm(orderData.fullPayment)}</span>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Order Items
          </p>
          <div className="mt-2 overflow-hidden rounded-xl ring-1 ring-slate-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2.5 font-bold">#</th>
                  <th className="px-3 py-2.5 font-bold">Item</th>
                  <th className="px-3 py-2.5 font-bold">Qty</th>
                  <th className="px-3 py-2.5 font-bold">Harga/Unit</th>
                  <th className="px-3 py-2.5 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-3 py-3 text-slate-500">1</td>
                  <td className="px-3 py-3 font-semibold text-slate-800">Air Cooler</td>
                  <td className="px-3 py-3">{orderData.unit}</td>
                  <td className="px-3 py-3">{rm(unitPrice)}</td>
                  <td className="px-3 py-3 text-right font-semibold">{rm(orderData.amount)}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Total
              </span>
              <span className="text-base font-extrabold text-slate-900">{rm(orderData.amount)}</span>
            </div>
          </div>
        </div>

        {orderData.notes && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes</p>
            <p className="mt-1 text-xs text-slate-600">{orderData.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 border-t border-dashed border-slate-200 pt-4 text-center">
          <p className="text-xs font-extrabold tracking-wide text-[#2E9484]">
            Thank you for your Support!
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            This invoice was created by our automated system.
          </p>
        </div>
      </div>
    </div>
  );
};
