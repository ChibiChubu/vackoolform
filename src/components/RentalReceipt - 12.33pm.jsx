import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

// Ganti import logo dengan placeholder logo atau URL
const LOGO_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAVNSURBVGiB7VlrTBxVFP7usLu8kUeBLSAFipUqD4stWK0iKkqjVRP/mJg0/vGHaezDxEQbTZp0/eEPTZpGE01MNI1t/KHGNGKMik2tNqRQUIu0lUd5FWiB8mYLLDDLwDn+2GV3dhb2CSw2cP/M7D3nfOfcM/eee+4Z4D7uLTjdBni9XqfT6awH0AhgM4DVALwAlGUQGa4kAOQAON3m83k1AGqetLW1ZQzKqQGA1+utB3AQQAOAHACqvLw8R0lJiTs/P99eWFhozcvLs+Xm5lptNpvNarXaLBaL3Ww2O0wmk9VgMFiMRqPVYDBYdDqdVafTWbVarUWr1dosFovdarU6bDab3W632202m+1Op9NptVqdJpPJZTQanUajMU+v1+fr9XqPXq932Ww2p9lstprNZqfBYHBqNBqnwWBwmc1mh8PhsBuNRpfJZLKZzWaH0+nMs1qtdr1eb9VqtTaTyWQ3Go0Og8FgMxqNdoPB4DSZTHaDweDQ6XQ2i8ViNRqNNr1eb9fpdFaz2Ww1GAw2s9lsNxqNTr1e79Dr9Q6r1Wq32+12h8PhcDqdTqfT6XS5XC6Xy+Wy2WxKQzF3dXU9A+AoAOf4+HhiZmYmMTk5mZicnEwKCPQpXZkDAPj9fumzQMhkMsBGo1GQSqWQSqWQy+WQyWQghEAulwMApFIpZDIZAEAmk4EQAkIIZDIZpFIpJBIJCCH3dE5ks6iiKIsB4DlvGhchAPlvUBQFiqJACIFEIgFN0yAE4DgOHMeBYRiwLAuaphEKhVBaWjq0f//+j7q7u39lGEaQWUwDNE2Lnx0AIJPJQAgBz/NgWRY0TYOmaXAcB5ZlwTAMWJYFx3GAOD4qlUqYmpryNzU1vR8MBn8QihHVAMuyPMMURYGiKLAsC47jwPM8KIoCz/PgeR4cx4HneXAcB4qiQFEUHA4HxsfHA42Njc3BYLBbaE5UAwzD8MamT0L8n+M4cBwn8iCRSEDTNBiGAcMwYBgGDMOAoig4nU4EAoFgQ0PD/t7e3m4hQ6IakEqlkEgkkEgkIISAYRiwLCsyx3G8kDQNOgjH8WAYBgzDgOM4OJ1OTE5OBuvr6/f19vZ2iekmqgG5XA6WZQVjEonIBBJppAOe50FRlDDHiNcL5HI5HA4HJicng3V1dft6enraheYS1YBSqQTDMNBoNEKRIB5pmhaN0zQNmqbBsqyYDFw+BAYGBkJ1dXX7e3p62oTmE89ASUnJNbVaLRkdHQ1XVlbiVtLZTyKT+GeWZcHzPBwOBwKBQLC+vn5/T0/PRaF5RTWwbt26GxaLRXXlypWZxsfHZ6LRaJxlWYlEIgFN01AoFGAYJiMBKYoCIQQqlQoGgwEsyyIUCoFhGASDwXBtbe2B7u7u82nVmwB8fj7fWrJkycdqtbpGLpdLGYYBx3FgGAYcx4HneXAcB5qmxfw/w8MAIQBarRYajQYURSEcDoNhGPT394dra2uf7+rqai0uLv4UwO8AeKGSguZomj4nl8trKIpKeWfieR4cx4HneYRCIUQiEXAcB5ZlEY1GEYlEEI/HEY1GEYvFEI1GEYvFEI/HodFooFarYbFYoFQqEQ6HwbIs+vr6Ivv27Tva3t7+jvBSE9VAUVHRCZVKtT0ajaZMQFEU4vE4QqEQpqenEYvFEI1GEY1GEYlEEIlEEIvFQFEUHA4HnE4nXC4XVCoVgsEgGIbBwMBAZO/evUfb29vfzpQIyfYNKZfLvQDKARQDyAegAaADoE2a+F6AARACcBNAEMAogBEAf5SVlcXT+f8PqVoZM4n0JjgAAAAASUVORK5CYII=";

export const RentalReceipt = ({ orderData }) => {
  const receiptRef = useRef();

  const downloadPDF = () => {
    const input = receiptRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${orderData.orderNumber}.pdf`);
    });
  };

  const handleDownloadAndWhatsApp = () => {
    // Handle WhatsApp click
    window.open(`https://wa.me/60169694840`, '_blank');
    // Download PDF
    downloadPDF();
  };

  return (
    <div ref={receiptRef} className="max-w-xl mx-auto bg-white rounded-lg p-8 text-gray-800">
      <div className="flex items-start gap-6 mb-6">
        <img 
          src={LOGO_PLACEHOLDER}  // Ganti dengan logo placeholder
          alt="Vackool Enterprise"
          className="w-16 h-16 object-contain"
        />
        <div>
          <h2 className="text-lg font-semibold">Vackool Enterprise</h2>
          <p className="text-xs text-gray-500">(003499862-P)</p>
          <button 
            onClick={handleDownloadAndWhatsApp} 
            className="text-xs text-blue-600 underline cursor-pointer"
          >
            WhatsApp 60169694840
          </button>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* Order ID with Status Tags */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Order ID: {orderData.orderNumber}</span>
          <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-600">ONGOING</span>
          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-600">PAID DEPO</span>
        </div>
      </div>

      {/* Date & Time Slot */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-1">Date & Time Slot</h3>
        <p className="text-xs">
          {format(new Date(orderData.startDate), 'iiii, dd MMMM yyyy h:mm a')}
          <br />
          {format(new Date(orderData.endDate), 'iiii, dd MMMM yyyy h:mm a')}
        </p>
      </div>

      {/* Rest of your receipt content... */}
      {/* Semua bahagian lain kekal sama */}
    </div>
  );
};