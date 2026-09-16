/* eslint-disable */
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import toast from 'react-hot-toast';
import {Inword} from '../types';

export const generatePDFHTML = (
  inwords: Inword[],
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
    <title>Inword History Report</title>
    <style>
      html, body { margin:0; padding:0; font-family: Arial, sans-serif; color:#000; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .header-wrapper { padding: 6px; border: 1px solid #0D47A1; text-align: center; margin-bottom: 10px; background: #E3F2FD; }
      .header-wrapper h1 { margin: 0; font-weight: 800; font-size: 24px; color: #0D47A1; }
      .header-wrapper p { margin: 6px 0 0; font-weight: bold; font-size: 11px; color: #000; }
      .title-wrapper { margin-top: 5px; text-align: center; margin-bottom: 15px; }
      .title-wrapper h2 { font-size: 18px; font-weight: bold; margin: 0; color: #fff; background: #0D47A1; padding: 8px; display: inline-block; border-radius: 4px; }
      .date-range { margin-bottom: 4px; color: #000; }
      .summary-wrapper { background: #f8f9fa; border-left: 4px solid #0D47A1; padding: 10px 20px; margin: 0 auto 15px auto; font-size: 12px; font-weight: bold; text-align: center; border-radius: 5px; width: fit-content; }
      .items-table { width: 100%; border-collapse: collapse; font-size: 11px; background: white; vertical-align: middle; }
      .items-table th { border: 1px solid #ccc; padding: 12px 8px; background-color: #1E3A8A !important; color: white !important; text-align: center; font-weight: bold; }
      .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold; }
      .items-table .text-center { text-align: center !important; }
      .items-table .text-right { text-align: right !important; }
      .items-table tbody tr:nth-child(even) { background-color: #fff !important; }
      .items-table tbody tr:nth-child(odd) { background-color: #f8f8f8 !important; }
      .transaction-total { background-color: #E3F2FD !important; font-weight: bold !important; }
      .print-actions { text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #ddd; }
      .print-btn { padding: 8px 20px; background: #0D47A1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; margin: 0 5px; transition: background 0.3s; }
      .print-btn:hover { background: #0B3A8A; }
      .close-btn { background: #6c757d; }
      .close-btn:hover { background: #5a6268; }
      @media print { body { margin: 0; padding: 0; width: 100%; } .no-print { display: none !important; } }
    </style>
  </head>
  <body>
    <div style="padding:20px;">
      <div class="header-wrapper">
        <h1>${userInfo?.fullname || 'Caterer Name'}</h1>
        <p>${userInfo?.address || ''}${userInfo?.email ? ` | Email: ${userInfo.email}` : ''} | Mob. ${userInfo?.phoneNumber || ''}</p>
      </div>

      <div class="title-wrapper">
        <h2>Inword History Report</h2>
        <div class="date-range">
          ${fromDate && toDate ? `Period: ${formatDateForHTML(fromDate, 'dd MMM yyyy')} to ${formatDateForHTML(toDate, 'dd MMM yyyy')}` : ''}
        </div>
      </div>

      ${inwords
        .map((inword, index) => {
          const inwordTotal = inword.inventoryItem.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0,
          );
          const transactionDate = formatDateForHTML(inword.createdAt);

          return `
            <table class="items-table">
              <thead>
                <tr>
                  <th colspan="6" style="text-align:left; background:#fff; color:#000; border:none; font-weight:bold; padding:8px 12px;">Transaction #${index + 1} — Date: ${transactionDate} — Items: ${inword.inventoryItem.length} — Total: ₹${inwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</th>
                </tr>
                <tr>
                  <th style="text-align:left;">Category</th>
                  <th style="text-align:left;">Material Name</th>
                  <th style="text-align:center;">Unit</th>
                  <th style="text-align:center;">Quantity</th>
                  <th style="text-align:right;">Unit Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${inword.inventoryItem
                  .map(
                    (item) => `
                    <tr>
                      <td style="text-align:left;">${item.material?.category?.name || '—'}</td>
                      <td style="text-align:left;">${item.material?.name || '—'}</td>
                      <td style="text-align:center;">${item.material?.unit || '—'}</td>
                      <td style="text-align:center;">${item.quantity.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td style="text-align:right;">₹${item.price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td style="text-align:right;">₹${(item.quantity * item.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  `,
                  )
                  .join('')}

                <tr class="transaction-total">
                  <td colspan="5" style="text-align:right; font-weight:bold;">Transaction Total:</td>
                  <td style="text-align:right; font-weight:bold;">₹${inwordTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
            <div style="height:12px;"></div>
          `;
        })
        .join('')}

      <div class="print-actions no-print">
        <button onclick="window.print()" class="print-btn">🖨️ Print Report</button>
        <button onclick="window.close()" class="print-btn close-btn">✕ Close Window</button>
      </div>

      <div style="margin-top:14px; font-size:11px; color:#666;">Generated on ${printedDateStr} at ${printedTimeStr}</div>
    </div>
  </body>
  </html>`;

  return html;
};

export const generateAndDownloadPDF = async (
  inwords: Inword[],
  fromDate: string | null,
  toDate: string | null,
  userInfo: any,
) => {
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

  reportContainer.innerHTML = generatePDFHTML(
    inwords,
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
    const fileName = `Inword_History_Report_${dateStr}.pdf`;

    pdf.save(fileName);
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('PDF generation failed:', error);
    toast.error('Failed to generate PDF');
  } finally {
    document.body.removeChild(reportContainer);
  }
};
