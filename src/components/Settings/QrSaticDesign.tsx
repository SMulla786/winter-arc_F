/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {
  useGetQrDesign,
  useSaveQrDesign,
} from '@/lib/react-query/queriesAndMutations/cateror/designselection';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useRouter} from '@tanstack/react-router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, {useRef, useState, useMemo} from 'react';
import {BiArrowBack, BiErrorCircle} from 'react-icons/bi';
import QRCode from 'react-qr-code';

// --- IMPORTS FOR DESIGNS ---
import {ClassicDesignPreview} from './ClassicDesign';
import {GoldDarkDesignPreview} from './GoldBlack';
// Import the new Green Design we just created
import {GreenDesign} from './GreenDesign';

export type props = {
  subEventId: string;
  SubEventData?: any;
};

// --- Helper Component for Missing Designs ---
const DefaultDesignPreview = ({color}: {color: string}) => (
  <div className="bg-gray-100 text-gray-400 flex h-full min-h-[370px] flex-col items-center justify-center p-4 text-center">
    <BiErrorCircle className="mb-2 h-8 w-8" />
    <p className="text-sm">Preview not available for</p>
    <p className="font-mono text-gray-500 text-xs font-bold">{color}</p>
  </div>
);

// --- Black Design Preview Component ---
const BlackDesignPreview = ({caterorData, SubEventData}: any) => {
  const titleFont = {fontFamily: "'Cinzel', serif"};
  const elegantFont = {fontFamily: "'Cormorant Garamond', serif"};
  const accentFont = {fontFamily: "'Marcellus', serif"};

  return (
    <div className="from-gray-900 relative h-full min-h-[370px] overflow-hidden bg-gradient-to-br to-black">
      <div className="absolute inset-0 bg-black-2 blur-sm"></div>
      <div className="relative z-10 flex h-full flex-col justify-between p-4">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block">
            <img
              src={caterorData?.data?.image}
              alt="Logo"
              className="mx-auto h-12 w-12 rounded-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
          <h3 className="text-base font-bold text-[#c7a552]" style={titleFont}>
            {caterorData?.data?.user?.fullname}
          </h3>
          <p className="text-[12px] text-[#c7a552]" style={elegantFont}>
            Premium Catering Services
          </p>
        </div>
        {/* Event Info */}
        <div className="mb-2 text-center">
          <h2
            className="text-sm font-semibold text-[#c7a552]"
            style={titleFont}
          >
            {SubEventData?.data?.subevent?.name}
          </h2>
          <p className="text-[10px] text-[#e4b94d]" style={elegantFont}>
            {SubEventData?.data?.subevent?.address}
          </p>
          <p className="text-[10px] text-[#e4b94d]">
            {SubEventData?.data?.subevent?.date
              ? new Date(SubEventData.data.subevent.date).toLocaleDateString(
                  'en-In',
                  {year: 'numeric', month: 'long', day: '2-digit'},
                )
              : ''}
            {SubEventData?.data?.subevent?.time
              ? ', ' +
                new Date(SubEventData.data.subevent.time).toLocaleTimeString(
                  'en-US',
                  {hour: '2-digit', minute: '2-digit', hour12: true},
                )
              : ''}
          </p>
        </div>
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div
            data-qr-target="true"
            className="rounded border-2 border-[#c7a552] bg-white p-2 shadow-lg"
          >
            <QRCode
              value={`https://menubook.cc/qr/${SubEventData?.data?.subevent?.id}`}
              size={80}
            />
          </div>
          <p
            className="mt-1 text-center text-[10px] text-[#c7a552]"
            style={accentFont}
          >
            Scan for Menu
          </p>
        </div>
        {/* Contact Info */}
        <div className="mx-10 rounded-lg text-center">
          <p className="text-[10px] text-[#e4b94d]" style={elegantFont}>
            {caterorData?.data?.user?.phoneNumber}
          </p>
          <p className="text-[10px] leading-snug text-[#e4b94d]">
            {caterorData?.data?.address}
          </p>
        </div>
        {/* Footer */}
        <div
          className="text-center text-[10px] text-[#c7a552]"
          style={accentFont}
        >
          ✦ Premium Services ✦
        </div>
      </div>
    </div>
  );
};

// --- Orange Design Preview Component ---
const OrangeDesignPreview = ({caterorData, SubEventData}: any) => (
  <div className="relative h-full min-h-[370px] overflow-hidden bg-gradient-to-br from-orange-300 to-amber-500">
    <div className="relative z-10 flex h-full flex-col justify-between p-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block">
          <img
            src={caterorData?.data?.image}
            alt="Logo"
            className="mx-auto h-12 w-12 rounded-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
        <h3
          className="text-base font-bold text-black"
          style={{fontFamily: "'Cinzel', serif"}}
        >
          {caterorData?.data?.user?.fullname}
        </h3>
        <p
          className="text-[12px] text-black"
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          Premium Catering Services
        </p>
      </div>
      {/* Event Info */}
      <div className="mb-2 text-center">
        <h2
          className="text-sm font-semibold text-black"
          style={{fontFamily: "'Cinzel', serif"}}
        >
          {SubEventData?.data?.subevent?.name}
        </h2>
        <p
          className="text-[11px] text-black"
          style={{fontFamily: "'Cormorant Garamond', serif"}}
        >
          {SubEventData?.data?.subevent?.address}
        </p>
        <p className="text-[10px] text-black">
          {SubEventData?.data?.subevent?.date
            ? new Date(SubEventData.data.subevent.date).toLocaleDateString(
                'en-In',
                {year: 'numeric', month: 'long', day: '2-digit'},
              )
            : ''}
          {SubEventData?.data?.subevent?.time
            ? ', ' +
              new Date(SubEventData.data.subevent.time).toLocaleTimeString(
                'en-US',
                {hour: '2-digit', minute: '2-digit', hour12: true},
              )
            : ''}
        </p>
      </div>
      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div
          data-qr-target="true"
          className="rounded border-2 border-amber-600 bg-white p-2 shadow-lg"
        >
          <QRCode
            value={`https://menubook.cc/qr/${SubEventData?.data?.subevent?.id}`}
            size={80}
          />
        </div>
        <p
          className="mt-1 text-center text-[10px] text-black"
          style={{fontFamily: "'Marcellus', serif"}}
        >
          Scan for Menu
        </p>
      </div>
      {/* Contact Info */}
      <div className="rounded-lg">
        <div className="mx-10 flex justify-center gap-1">
          <p
            className="text-[10px] text-black"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            {caterorData?.data?.user?.phoneNumber}
          </p>
        </div>
        <div className="mx-10 gap-1">
          <p
            className="text-center text-[10px] leading-snug text-black"
            style={{fontFamily: "'Cormorant Garamond', serif"}}
          >
            {caterorData?.data?.address}
          </p>
        </div>
      </div>
      {/* Footer */}
      <div
        className="text-center text-[10px] text-black"
        style={{fontFamily: "'Marcellus', serif"}}
      >
        ✦ Premium Services ✦
      </div>
    </div>
  </div>
);

// --- Main Component ---
const QrCardStaticDesign: React.FC<props> = ({subEventId, SubEventData}) => {
  const {data: designs} = useGetQrDesign();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {mutateAsync: saveDesign} = useSaveQrDesign();
  const {user} = useAuthContext();
  const {data: caterorData} = useGetCaterorById(user?.caterorId ?? '');
  const qrRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- MANUAL FIX: Adding 'Green' to the manual list ---
  const combinedDesigns = useMemo(() => {
    const apiDesigns = designs?.data || [];
    const manualDesigns = [];

    // Check for Classic
    if (!apiDesigns.some((d: any) => d.colour?.toLowerCase() === 'classic')) {
      manualDesigns.push({
        id: 'manual-classic-id',
        colour: 'classic',
        image: '',
      });
    }

    // Check for Gold Dark
    if (!apiDesigns.some((d: any) => d.colour?.toLowerCase() === 'gold_dark')) {
      manualDesigns.push({
        id: 'manual-gold-dark-id',
        colour: 'gold_dark',
        image: '',
      });
    }

    // Check for Green
    if (!apiDesigns.some((d: any) => d.colour?.toLowerCase() === 'green')) {
      manualDesigns.push({id: 'manual-green-id', colour: 'green', image: ''});
    }

    return [...apiDesigns, ...manualDesigns];
  }, [designs]);

  const handleImageSelect = (id: string) => {
    setSelectedImage(id);
    if (!id.startsWith('manual-')) {
      saveDesign({designId: id!, id: subEventId});
    } else {
      console.log('Selected local design (not saved to DB yet)');
    }
  };

  const handleBack = () => {
    router.history.back();
  };
  const downloadQR = async () => {
    try {
      const selectedDesignElement = document.querySelector(
        `[data-design-id="${selectedImage}"]`,
      );
      if (!selectedDesignElement) return;

      // The Green component uses an image, others use react-qr-code with data-qr-target
      const qrElement =
        selectedDesignElement.querySelector('[data-qr-target="true"]') ||
        selectedDesignElement.querySelector('img[alt="QR Code"]');

      if (!qrElement) {
        console.error('QR Code element not found.');
        return;
      }

      const canvas = await html2canvas(qrElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      // Event information
      const eventName = SubEventData?.data?.subevent?.name || 'N/A';
      const qrUrl = `${import.meta.env.VITE_QR_BASE_URL}/qr/${SubEventData?.data?.subevent?.id}`;

      // Get image dimensions for window sizing
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate window size (QR code is usually square, so we'll make a square window)
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      const maxSize = Math.min(screenWidth, screenHeight) * 0.7; // 70% of smaller screen dimension

      // Calculate window dimensions (make it square or slightly rectangular based on content)
      let windowWidth = Math.min(imgWidth + 100, maxSize);
      let windowHeight = Math.min(imgHeight + 200, maxSize + 100); // Extra height for controls

      // Ensure minimum size
      windowWidth = Math.max(windowWidth, 600);
      windowHeight = Math.max(windowHeight, 700);

      // Create the print window
      const printWindow = window.open(
        '',
        'qrPrintWindow',
        `width=${Math.round(windowWidth)},height=${Math.round(windowHeight)},scrollbars=yes,resizable=yes,toolbar=no,location=no,menubar=no`,
      );

      if (!printWindow) {
        alert('Please allow popups for this site to generate print preview');
        return;
      }

      printWindow.document.write(`<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>QR Code Print Preview - ${eventName}</title>
      <style>
        html, body { 
          margin: 0; 
          padding: 0; 
          font-family: Arial, sans-serif; 
          color: #000; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          background: #f0f0f0;
          height: 100%;
          overflow: hidden;
        }
        
        .print-header {
          background: #0D47A1;
          color: white;
          padding: 10px 20px;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          border-bottom: 2px solid #1E3A8A;
        }
        
        .print-header h2 {
          margin: 0;
          font-size: 16px;
        }
        
        .print-header .subtitle {
          font-size: 11px;
          opacity: 0.9;
          margin-top: 3px;
        }
        
        .content-wrapper {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: calc(100% - 120px);
          overflow: auto;
        }
        
        .qr-container {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          border: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 100%;
        }
        
        .qr-image {
          max-width: 400px;
          max-height: 400px;
          width: auto;
          height: auto;
          border: 1px solid #eee;
          padding: 10px;
          background: white;
        }
        
        .print-controls {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          padding: 10px 20px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
        
        .btn {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 100px;
        }
        
        .btn-primary {
          background: #0D47A1;
          color: white;
        }
        
        .btn-primary:hover {
          background: #1E3A8A;
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #545b62;
          transform: translateY(-1px);
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background: #218838;
          transform: translateY(-1px);
        }
        
        .info-panel {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-top: 15px;
          font-size: 12px;
          width: 100%;
          max-width: 500px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          padding-bottom: 5px;
          border-bottom: 1px dashed #ddd;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: bold;
          color: #495057;
        }
        
        .info-value {
          color: #212529;
          text-align: right;
          max-width: 70%;
          word-break: break-word;
        }
        
        .url-box {
          background: #e3f2fd;
          border: 1px solid #bbdefb;
          border-radius: 4px;
          padding: 12px;
          margin: 15px 0;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          width: 100%;
          max-width: 500px;
          text-align: center;
        }
        
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-header,
          .print-controls,
          .info-panel,
          .url-box {
            display: none !important;
          }
          
          .content-wrapper {
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .qr-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          
          .qr-image {
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            max-height: 100% !important;
          }
          
          @page {
            margin: 10mm;
            size: A4 portrait;
          }
        }
        
        /* Animation for image load */
        .qr-image {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Loading indicator */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }
        
        .spinner {
          border: 4px solid rgba(0,0,0,0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #0D47A1;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .instructions {
          margin-top: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
          max-width: 500px;
        }
      </style>
    </head>
    <body>
      
      
      <div class="content-wrapper">
        <div class="loading" id="loading">
          <div class="spinner"></div>
          <p style="margin-top: 10px; color: #666;">Loading QR code...</p>
        </div>
        
        <div class="qr-container" id="qrContainer" style="display: none;">
          <img 
            src="${imgData}" 
            alt="QR Code" 
            class="qr-image" 
            id="qrImage"
            onload="document.getElementById('loading').style.display = 'none'; document.getElementById('qrContainer').style.display = 'flex';"
          />
          
          <div class="instructions">
            Scan this QR code to access the event page
          </div>
        </div>
      </div>
      
      <div class="print-controls">
        <button class="btn btn-success" onclick="downloadImage()">
          <svg style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Download PNG
        </button>
        <button class="btn btn-primary" onclick="printNow()">
          <svg style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Now
        </button>
        <button class="btn btn-secondary" onclick="closeWindow()">
          <svg style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Close
        </button>
      </div>

      <script>
        // Function to download as PNG
        function downloadImage() {
          const link = document.createElement('a');
          link.href = '${imgData}';
          link.download = 'qr-code-${eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        // Function to download as PDF
        function downloadPDF() {
          const img = document.getElementById('qrImage');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/png');
          
          // Create PDF
          const pdf = new jsPDF('portrait', 'pt', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const finalWidth = imgWidth * ratio;
          const finalHeight = imgHeight * ratio;
          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;
          
          pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
          pdf.save('qr-code-${eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf');
        }
        
        // Function to print directly
        function printNow() {
          window.print();
        }
        
        // Function to close window
        function closeWindow() {
          window.close();
        }
        
        // Auto-print option (uncomment to enable auto-print)
        // setTimeout(() => {
        //   if (document.getElementById('qrImage').complete) {
        //     printNow();
        //   }
        // }, 1000);
        
        // Auto-close after print
        window.addEventListener('afterprint', function() {
          setTimeout(() => {
            window.close();
          }, 500);
        });
        
        // Add PDF download option if needed
        const downloadBtn = document.querySelector('.btn-success');
        downloadBtn.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          if (confirm('Right-click detected. Would you like to download as PDF instead?')) {
            downloadPDF();
          }
        });
        
        // Double-click for PDF download
        downloadBtn.addEventListener('dblclick', function() {
          if (confirm('Double-click detected. Download as PDF?')) {
            downloadPDF();
          }
        });
        
        // Focus the window
        window.focus();
      </script>
    </body>
    </html>
    `);

      printWindow.document.close();
    } catch (error) {
      console.error('Error generating QR preview:', error);
      alert('Failed to generate QR preview. Please try again.');
    }
  };

  const downloadStandee = async () => {
    try {
      const selectedDesignElement = document.querySelector(
        `[data-design-id="${selectedImage}"]`,
      );
      if (!selectedDesignElement) return;

      // Capture the standee as an image
      const canvas = await html2canvas(selectedDesignElement as HTMLElement, {
        scale: 4,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL('image/png');

      // Event information
      const eventName = SubEventData?.data?.subevent?.name || 'N/A';

      // Get image dimensions for window sizing
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate window size based on image dimensions (max 90% of screen)
      const screenWidth = window.screen.availWidth;
      const screenHeight = window.screen.availHeight;
      const maxWidth = screenWidth * 0.6;
      const maxHeight = screenHeight * 0.6;

      // Calculate window dimensions maintaining aspect ratio
      let windowWidth = imgWidth;
      let windowHeight = imgHeight;

      if (windowWidth > maxWidth) {
        const ratio = maxWidth / windowWidth;
        windowWidth = maxWidth;
        windowHeight = windowHeight * ratio;
      }

      if (windowHeight > maxHeight) {
        const ratio = maxHeight / windowHeight;
        windowHeight = maxHeight;
        windowWidth = windowWidth * ratio;
      }

      // Add some padding for controls
      windowWidth = Math.min(windowWidth + 40, screenWidth * 0.95);
      windowHeight = Math.min(windowHeight + 100, screenHeight * 0.95);

      // Create the print window with calculated dimensions
      const printWindow = window.open(
        '',
        'printWindow',
        `width=${Math.round(windowWidth)},height=${Math.round(windowHeight)},scrollbars=yes,resizable=yes,toolbar=no,location=no,menubar=no`,
      );

      if (!printWindow) {
        alert('Please allow popups for this site to generate print preview');
        return;
      }

      printWindow.document.write(`<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Standee Print Preview - ${eventName}</title>
      <style>
        html, body { 
          margin: 0; 
          padding: 0; 
          font-family: Arial, sans-serif; 
          color: #000; 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          background: #f0f0f0;
          height: 100%;
          overflow: hidden;
        }
        
        .print-header {
          background: #0D47A1;
          color: white;
          padding: 10px 20px;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          border-bottom: 2px solid #1E3A8A;
        }
        
        .print-header h2 {
          margin: 0;
          font-size: 16px;
        }
        
        .print-header .subtitle {
          font-size: 11px;
          opacity: 0.9;
          margin-top: 3px;
        }
        
        .content-wrapper {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: calc(100% - 120px);
          overflow: auto;
        }
        
        .standee-container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          border: 1px solid #ddd;
          max-width: 100%;
        }
        
        .standee-image {
          max-width: 100%;
          height: auto;
          display: block;
          border: 1px solid #eee;
        }
        
        .print-controls {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          padding: 10px 20px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }
        
        .btn {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 100px;
        }
        
        .btn-primary {
          background: #0D47A1;
          color: white;
        }
        
        .btn-primary:hover {
          background: #1E3A8A;
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #545b62;
          transform: translateY(-1px);
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-success:hover {
          background: #218838;
          transform: translateY(-1px);
        }
        
        .info-panel {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-top: 15px;
          font-size: 12px;
          width: 100%;
          max-width: 800px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          padding-bottom: 5px;
          border-bottom: 1px dashed #ddd;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: bold;
          color: #495057;
        }
        
        .info-value {
          color: #212529;
          text-align: right;
          max-width: 70%;
          word-break: break-word;
        }
        
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-header,
          .print-controls,
          .info-panel {
            display: none !important;
          }
          
          .content-wrapper {
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          .standee-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          
          .standee-image {
            border: none !important;
          }
          
          @page {
            margin: 0mm;
            size: A4 portrait;
          }
        }
        
        /* Animation for image load */
        .standee-image {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Loading indicator */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }
        
        .spinner {
          border: 4px solid rgba(0,0,0,0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #0D47A1;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="content-wrapper">
        <div class="loading" id="loading">
          <div class="spinner"></div>
          <p style="margin-top: 10px; color: #666;">Loading standee image...</p>
        </div>
        
        <div class="standee-container" id="standeeContainer" style="display: none;">
          <img 
            src="${imgData}" 
            alt="Standee Design" 
            class="standee-image" 
            id="standeeImage"
            onload="document.getElementById('loading').style.display = 'none'; document.getElementById('standeeContainer').style.display = 'block';"
          />
        </div>
      </div>
      
      <div class="print-controls">
        <button class="btn btn-success" onclick="downloadPDF()">
          <svg style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Download PDF
        </button>
        <button class="btn btn-primary" onclick="printNow()">
          <svg style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
          </svg>
          Print Now
        </button>
        <button class="btn btn-secondary" onclick="closeWindow()">
          <svg style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Close
        </button>
      </div>

      <script>
        // Function to download as PDF
        function downloadPDF() {
          const img = document.getElementById('standeeImage');
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          
          const imgData = canvas.toDataURL('image/png');
          
          // Create PDF
          const pdf = new jsPDF('portrait', 'pt', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const finalWidth = imgWidth * ratio;
          const finalHeight = imgHeight * ratio;
          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;
          
          pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
          pdf.save('standee-design-${eventName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf');
        }
        
        // Function to print directly
        function printNow() {
          window.print();
        }
        
        // Function to close window
        function closeWindow() {
          window.close();
        }
        
        // Auto-print option (uncomment to enable auto-print)
        // setTimeout(() => {
        //   if (document.getElementById('standeeImage').complete) {
        //     printNow();
        //   }
        // }, 1000);
        
        // Auto-close after print
        window.addEventListener('afterprint', function() {
          setTimeout(() => {
            window.close();
          }, 500);
        });
        
        // Load required libraries dynamically
        function loadLibrary(src, callback) {
          if (typeof window.jsPDF === 'undefined' && src.includes('jspdf')) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = callback;
            document.head.appendChild(script);
          } else {
            callback();
          }
        }
        
        // Load jsPDF when needed
        document.querySelector('.btn-success').addEventListener('click', function() {
          loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function() {
            if (typeof window.jsPDF === 'undefined' && typeof window.jspdf !== 'undefined') {
              window.jsPDF = window.jspdf.jsPDF;
            }
          });
        });
        
        // Focus the window
        window.focus();
      </script>
    </body>
    </html>
    `);

      printWindow.document.close();
    } catch (error) {
      console.error('Error generating standee preview:', error);
      alert('Failed to generate standee preview. Please try again.');
    }
  };

  const openLink = () => {
    const url = `${import.meta.env.VITE_QR_BASE_URL}/qr/${SubEventData?.data?.subevent?.id}`;
    window.open(url, '_blank');
  };

  // --- RENDER LOGIC UPDATE ---
  const renderDesignPreview = (item: any) => {
    const color = item.colour?.toLowerCase();
    const commonProps = {caterorData, SubEventData, qrRef};

    switch (color) {
      case 'black':
        return <BlackDesignPreview {...commonProps} />;
      case 'orange':
        return <OrangeDesignPreview {...commonProps} />;
      case 'classic':
      case 'beige':
        return <ClassicDesignPreview {...commonProps} />;
      case 'gold_dark':
        return <GoldDarkDesignPreview {...commonProps} />;
      // Add the new Green case here
      case 'green':
      case 'emerald':
        return <GreenDesign {...commonProps} />;
      default:
        return <DefaultDesignPreview color={item.colour} />;
    }
  };

  return (
    <div className="space-y-4 rounded-lg">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 rounded-lg font-semibold text-black transition-colors hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
      >
        <BiArrowBack className="h-5 w-5" />
        Back
      </button>
      <h1 className="text-gray-800 text-2xl font-bold">
        Select Design Pattern
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {combinedDesigns.map((item: any) => (
          <div
            key={item.id}
            data-design-id={item.id}
            className={`relative mx-auto aspect-[1/2] w-full max-w-[260px] cursor-pointer overflow-hidden transition-all duration-200 ${
              selectedImage === item.id
                ? 'scale-[1.02] shadow-xl ring-2 ring-primary ring-offset-2'
                : 'ring-1 ring-neutral-400 hover:shadow-md'
            }`}
            onClick={() => handleImageSelect(item.id)}
          >
            {renderDesignPreview(item)}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={downloadStandee}
          disabled={!selectedImage}
          className="disabled:bg-gray-400 rounded bg-primary px-4 py-2 text-white hover:bg-primary"
        >
          Download Standee
        </button>
        <button
          onClick={downloadQR}
          disabled={!selectedImage}
          className="disabled:bg-gray-400 rounded bg-primary px-4 py-2 text-white hover:bg-primary"
        >
          Download QR
        </button>
        <button
          onClick={openLink}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary"
        >
          Open Link
        </button>
      </div>
    </div>
  );
};

export default QrCardStaticDesign;
