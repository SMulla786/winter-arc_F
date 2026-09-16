/* eslint-disable */
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import toast from 'react-hot-toast';
import {Outword} from '../types';

// NOTE: this file mostly contains the same logic as previously in the big
// component. It is kept standalone so the main file stays small.

export const generatePDFHTML = (
  outwords: Outword[],
  fromDate: string | null,
  toDate: string | null,
  userInfo: any,
) => {
  const formatDateForHTML = (
    dateString: string,
    formatType = 'dd MMM yyyy HH:mm',
  ) => {
    if (!dateString) return '—';
    const date = new Date(dateString);

    if (formatType === 'dd MMM yyyy') {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const printedDate = new Date();
  const printedDateStr = printedDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const printedTimeStr = printedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <title>Outword History Report</title>
    <style>
      html, body { margin:0; padding:0; font-family: Arial, sans-serif; color:#000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .header-wrapper { padding: 6px; border: 1px solid #0D47A1; text-align: center; margin-bottom: 10px; background: #E3F2FD; }
      .header-wrapper h1 { margin: 0; font-weight: 800; font-size: 28px; color: #0D47A1; }
      .header-info { margin: 0; font-size: 14px; font-weight: bold; color: #000; margin-top: 6px; }
      .title-wrapper { margin-top: 5px; text-align: center; margin-bottom: 15px; }
      .title-wrapper h2 { font-size: 18px; font-weight: bold; margin: 0; color: #000; }
      .date-range { margin-bottom: 4px; color: #000; }
      .transaction-header { background: #E3F2FD; padding: 10px 15px; margin: 15px 0 8px 0; border-radius: 5px; border-left: 4px solid #0D47A1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; font-size: 11px; color: #333; }
      .transaction-title { font-weight: bold; font-size: 12px; color: #0D47A1; }
      .transaction-info { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
      .type-badge { color: black; padding: 2px 8px; border-radius: 12px; font-size: 10px; text-transform: uppercase; }
      .items-table { width: 100%; border-collapse: collapse; font-size: 11px; background: white; vertical-align: middle; }
      .items-table th { border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A !important; color: white !important; text-align: center; font-weight: bold; font: bold 12px Arial, sans-serif !important; vertical-align: middle; }
      .items-table td { border: 1px solid #ddd; padding-bottom: 10px; padding-top: 10px; text-align: left; font: bold 12px Arial !important; color: black !important; white-space: normal; word-break: break-word; }
      .items-table .text-center { text-align: center !important; }
      .items-table .text-right { text-align: right !important; }
      .items-table tbody tr:nth-child(even) { background-color: #fff !important; }
      .items-table tbody tr:nth-child(odd) { background-color: #f8f8f8 !important; }
      .transaction-total { background-color: #E3F2FD !important; font-weight: bold !important; }
      .print-actions { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #ddd; }
      .print-btn { padding: 8px 20px; background: #0D47A1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; margin: 0 5px; transition: background 0.3s; }
      .print-btn:hover { background: #0D3A8A; }
      .close-btn { background: #6c757d; }
      .close-btn:hover { background: #5a6268; }
      @media print { body { margin: 0; padding: 0; width: 100%; } .no-print { display: none !important; } }
    </style>
  </head>
  <body>
    <div style="padding:20px;">
      <div class="header-wrapper">
        <h1>${userInfo?.fullname || 'Caterer Name'}</h1>
        <p class="header-info">${userInfo?.address || ''}<br/>${userInfo?.email ? `Email: ${userInfo.email}<br/>` : ''}Mobile: ${userInfo?.phoneNumber || ''}</p>
      </div>
      <div class="title-wrapper">
        <h2>Outword History Report</h2>
        <div class="date-range">
          ${fromDate && toDate ? `Period: ${formatDateForHTML(fromDate, 'dd MMM yyyy')} to ${formatDateForHTML(toDate, 'dd MMM yyyy')}` : ''}
        </div>
      </div>

      ${outwords
        .map((outword, index) => {
          const outwordTotal = outword.inventoryItem.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0,
          );

          let referenceInfo = '';
          if (outword.type.toLowerCase() === 'wastage') {
            referenceInfo = 'Wastage';
          } else if (outword.event) {
            referenceInfo = `Event: ${outword.event.name} (${formatDateForHTML(outword.event.startDate, 'dd MMM yyyy')})`;
          } else if (outword.poNumber) {
            referenceInfo = `PO #${outword.poNumber}`;
          } else {
            referenceInfo = 'General Transaction';
          }

          const transactionDate = formatDateForHTML(outword.createdAt);
          const typeDisplay =
            outword.type.charAt(0).toUpperCase() +
            outword.type.slice(1).toLowerCase();

          return `
          <div style="max-width: 800px; margin: 0 auto;">
            <div class="transaction-header">
              <span class="transaction-title">Transaction #${index + 1}</span>
              <div class="transaction-info">
                <span><strong>Date:</strong> ${transactionDate}</span>
                <span><strong>Type:</strong> <span class="type-badge">${typeDisplay}</span></span>
                <span><strong>Items:</strong> ${outword.inventoryItem.length}</span>
                <span><strong>Total:</strong> ₹${outwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          ${
            outword.inventoryItem.length > 0
              ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th style="text-align: left;">Category</th>
                  <th style="text-align: left;">Material Name</th>
                  <th style="text-align: center;">Unit</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                  <th style="text-align: left;">Vendor</th>
                  <th style="text-align: left;">Reason</th>
                </tr>
              </thead>
              <tbody>
                ${outword.inventoryItem
                  .map((item, itemIndex) => {
                    const rowBg = itemIndex % 2 === 0 ? '#fff' : '#f8f8f8';
                    return `
                      <tr style="background: ${rowBg};">
                        <td style="text-align: left; font: bold 12px Arial;">${item.material?.category?.name || '—'}</td>
                        <td style="text-align: left; font: bold 12px Arial;">${item.material?.name || '—'}</td>
                        <td style="text-align: center; font: bold 12px Arial;">${item.material?.unit || '—'}</td>
                        <td style="text-align: center; font: bold 12px Arial;">${item.quantity.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="text-align: right; font: bold 12px Arial;">₹${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="text-align: right; font: bold 12px Arial;">₹${(item.quantity * item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td style="text-align: left; font: bold 12px Arial;">${item.vendorName || '—'}</td>
                        <td style="text-align: left; font: bold 12px Arial;">${item.reason || '—'}</td>
                      </tr>
                    `;
                  })
                  .join('')}

                <tr class="transaction-total">
                  <td colspan="7" style="text-align: right; font: bold 12px Arial;"><strong>Transaction Total:</strong></td>
                  <td style="text-align: right; font: bold 12px Arial;"><strong>₹${outword.inventoryItem.reduce((s, it) => s + it.quantity * it.price, 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                </tr>
              </tbody>
            </table>
          `
              : `
            <div style="text-align: center; padding: 15px; color: #666; font-style: italic; max-width: 800px; margin: 0 auto;">No items recorded for this transaction.</div>
          `
          }

          ${index < outwords.length - 1 ? '<div style="height: 20px;"></div>' : ''}
        `;
        })
        .join('')}

      <div class="print-actions no-print">
        <button onclick="window.print()" class="print-btn">🖨️ Print Report</button>
        <button onclick="window.close()" class="print-btn close-btn">✕ Close Window</button>
      </div>

      <script>window.onload = function(){ setTimeout(()=>{ window.close() }, 1000); };</script>
    </div>
  </body>
  </html>`;

  return html;
};

export const generateAndDownloadPDF = async (
  outwords: Outword[],
  fromDate: string | null,
  toDate: string | null,
  userInfo: any,
) => {
  // Implementation preserved from original component; kept as helper for consumers
  const reportContainer = document.createElement('div');
  Object.assign(reportContainer.style, {
    width: '800px',
    padding: '20px',
    background: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
    color: 'black',
    textAlign: 'center',
  });

  const formatDateForPDF = (
    dateString: string,
    formatType = 'dd MMM yyyy HH:mm',
  ) => {
    if (!dateString) return '—';
    const date = new Date(dateString);

    if (formatType === 'dd MMM yyyy') {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  let htmlContent = `...`; // To keep the file compact we reuse generatePDFHTML for full preview flow

  reportContainer.innerHTML = generatePDFHTML(
    outwords,
    fromDate,
    toDate,
    userInfo,
  );
  document.body.appendChild(reportContainer);

  try {
    const canvas = await html2canvas(reportContainer, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = 15;
    const topMargin = 18;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let pageNumber = 1;

    while (heightLeft > 0) {
      if (pageNumber > 1) pdf.addPage();

      const usableHeight =
        pageHeight - bottomMargin - (pageNumber === 1 ? 0 : topMargin);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.floor((usableHeight * canvas.width) / imgWidth);

      const ctx = pageCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        (imgHeight - heightLeft) * (canvas.width / imgWidth),
        canvas.width,
        pageCanvas.height,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height,
      );

      const imgData = pageCanvas.toDataURL('image/jpeg', 1);
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        pageNumber === 1 ? 0 : topMargin,
        imgWidth,
        usableHeight,
        undefined,
        'FAST',
      );

      pdf.setFontSize(9);
      pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, {
        align: 'center',
      });

      heightLeft -= usableHeight;
      pageNumber++;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Outword_History_Report_${dateStr}.pdf`;

    pdf.save(fileName);
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.error('Failed to generate PDF');
  } finally {
    document.body.removeChild(reportContainer);
  }
};
