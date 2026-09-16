import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

// ==========================================
// 1. Interfaces
// ==========================================

interface Category {
  name: string;
}

interface DishDetails {
  name: string;
  unit: string;
  portionSize: number;
  category: Category;
}

interface DishEntry {
  expected: number;
  dish: DishDetails;
}

export interface SubEventData {
  id: string;
  name: string;
  date: string;
  time: string;
  expectedPeople: number;
  dishes: DishEntry[];
}

// ==========================================
// 2. Helper Functions
// ==========================================

const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ==========================================
// 3. Template Generators
// ==========================================

/**
 * STYLE A: Green/Gold Luxury Template
 * Used when the user selects the "Green" background
 */
const generateGreenLayout = (
  dataList: SubEventData[],
  catererLogo?: string,
  catererName?: string,
) => {
  // Helper function to group dishes by category
  const groupDishesByCategory = (dishes: DishEntry[]) => {
    const grouped: Map<string, DishEntry[]> = new Map();

    dishes.forEach((dishEntry) => {
      const categoryName = dishEntry.dish.category?.name || 'Uncategorized';
      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, []);
      }
      grouped.get(categoryName)!.push(dishEntry);
    });

    // Sort categories alphabetically
    return new Map(
      [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    );
  };

  const eventsHtml = dataList
    .map((e, i) => {
      const groupedDishes = groupDishesByCategory(e.dishes);

      return `
      <div class="pdf-item relative border border-[rgba(191,148,96,.3)] rounded-md p-3 mb-4 bg-black/20 backdrop-blur-[2px]">
        <div class="absolute inset-1 border border-[rgba(191,148,96,.15)] rounded"></div>

        <div class="flex justify-between border-b border-[rgba(191,148,96,.3)] pb-2 mb-3">
          <div>
            <span class="text-[10px] tracking-widest uppercase text-[#BF9460]">Event ${i + 1}</span>
            <h2 class="text-base font-semibold text-white leading-tight">${e.name}</h2>
          </div>
          <div class="text-[10px] text-right leading-snug opacity-90 text-gray-200">
            <div>📅 ${formatDate(e.date)}</div>
            <div>⏰ ${formatTime(e.time)}</div>
            <div>👥 ${e.expectedPeople} Guests</div>
          </div>
        </div>

        ${
          e.dishes.length === 0
            ? `<div class="py-4 text-center opacity-70">No dishes added</div>`
            : Array.from(groupedDishes.entries())
                .map(
                  ([categoryName, categoryDishes]) => `
              <!-- Category Header -->
              <div class="mb-3">
                <div class="flex items-center gap-2 mb-2 pb-1 border-b border-[rgba(191,148,96,.3)]">
                  <span class="text-xs font-bold uppercase tracking-wider text-[#BF9460]">${categoryName}</span>
                  <span class="text-[9px] text-gray-400">(${categoryDishes.length} items)</span>
                </div>
                
                <!-- Items Table - Only Item and Qty columns -->
                <table class="w-full text-[10px] border-collapse">
                  <tbody>
                    ${categoryDishes
                      .map(
                        (d, j) => `
                      <tr class="border-b border-[rgba(191,148,96,.08)]">
                        <td class="py-1.5 w-6 text-[9px] opacity-60 align-top">${j + 1}.</td>
                        <td class="py-1.5 font-medium text-gray-100">${d.dish.name}</td>
                        <td class="py-1.5 text-right opacity-80 whitespace-nowrap">
                          ${d.dish.portionSize} ${d.dish.unit}
                        </td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `,
                )
                .join('')
        }
      </div>`;
    })
    .join('');

  return `
    <div class="relative z-10 w-[680px] p-8 mx-auto text-[#fef3c7]">
      <div class="flex items-center gap-4 border border-[rgba(191,148,96,.3)] p-4 rounded-md mb-6 bg-black/40">
        <div class="w-14 h-14 bg-white border-2 border-[#BF9460] rounded flex items-center justify-center overflow-hidden shrink-0">
          ${
            catererLogo
              ? `<img src="${catererLogo}" class="w-full h-full object-contain" crossorigin="anonymous"/>`
              : `<span class="text-[#BF9460] text-2xl font-bold">${(catererName || 'C')[0]}</span>`
          }
        </div>
        <div>
          <h1 class="text-lg tracking-[0.2em] text-[#BF9460] font-bold uppercase">${catererName || 'CATERING SERVICE'}</h1>
          <div class="text-xs opacity-80 font-light tracking-wide">Premium Event Menu Report</div>
        </div>
      </div>
      <div id="events-list">${eventsHtml}</div>
      <div class="mt-8 text-center text-[10px] opacity-50 border-t border-[rgba(191,148,96,.3)] pt-4">
        Generated on ${new Date().toLocaleDateString()}
      </div>
    </div>`;
};

/**
 * STYLE B: Classic White Template
 * Used when the user selects the "Classic" background
 */
const generateClassicLayout = (
  dataList: SubEventData[],
  catererLogo?: string,
  catererName?: string,
) => {
  // Group dishes by category
  const groupDishesByCategory = (dishes: DishEntry[]) => {
    const grouped: Map<string, DishEntry[]> = new Map();

    dishes.forEach((dishEntry) => {
      const categoryName = dishEntry.dish.category?.name || 'Uncategorized';
      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, []);
      }
      grouped.get(categoryName)!.push(dishEntry);
    });

    return new Map(
      [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    );
  };

  const colors = {
    primary: '#1B365D',
    secondary: '#5A6B82',
    accent: '#F5EFD8',
  };

  const eventsHtml = dataList
    .map((e, i) => {
      const groupedDishes = groupDishesByCategory(e.dishes);

      return `
      <div class="mb-6 border-b border-[#1B365D]/30 pb-6 last:border-0">

        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="text-[9px] font-bold text-[#1B365D] uppercase tracking-widest mb-1 inline-block px-1.5 py-0.5">
              Event ${String(i + 1).padStart(2, '0')}
            </div>
            <h2 class="text-xl font-bold text-[#1B365D] uppercase leading-[1.1]"
                style="font-family: 'Playfair Display', serif; letter-spacing: 0.04em;">
              ${e.name}
            </h2>
          </div>

          <div class="flex gap-2 text-[10px] font-semibold text-[#1B365D]">
            <span class="px-2 py-[3px] inline-flex items-center justify-center leading-none bg-[#F5EFD8] rounded">
              📅 ${formatDate(e.date)}
            </span>
            <span class="px-2 py-[3px] inline-flex items-center justify-center leading-none bg-[#F5EFD8] rounded">
              ⏰ ${formatTime(e.time)}
            </span>
            <span class="px-2 py-[3px] inline-flex items-center justify-center leading-none bg-[#F5EFD8] rounded">
              👥 ${e.expectedPeople} PAX
            </span>
          </div>
        </div>

        ${
          e.dishes.length === 0
            ? `<div class="py-4 text-center italic opacity-60">No dishes selected</div>`
            : Array.from(groupedDishes.entries())
                .map(
                  ([categoryName, categoryDishes]) => `
              <div class="mb-4">
                <!-- Category Header -->
                <div class="flex items-center gap-2 mb-2 pb-1 border-b border-[#1B365D]/20">
                  <span class="text-sm font-bold uppercase tracking-wider text-[#1B365D]">${categoryName}</span>
                  <span class="text-[9px] text-[#5A6B82]">(${categoryDishes.length} items)</span>
                </div>
                
                <!-- Items List - Only Item and Qty -->
                <div class="ml-3">
                  ${categoryDishes
                    .map(
                      (d, j) => `
                    <div class="flex justify-between items-center py-1.5 border-b border-[#1B365D]/8">
                      <div class="flex items-center gap-3">
                        <span class="text-[9px] font-mono opacity-60 w-5">${j + 1}.</span>
                        <span class="text-[11px] font-medium text-[#1B365D]"
                              style="font-family: 'Playfair Display', serif;">
                          ${d.dish.name}
                        </span>
                      </div>
                      <span class="text-[10px] font-mono font-bold tabular-nums text-[#1B365D] whitespace-nowrap">
                        ${d.dish.portionSize}
                        <span class="text-[8px] opacity-60 ml-0.5">${d.dish.unit}</span>
                      </span>
                    </div>
                  `,
                    )
                    .join('')}
                </div>
              </div>
            `,
                )
                .join('')
        }
      </div>`;
    })
    .join('');

  return `
    <div class="relative w-[720px] min-h-[1050px] mx-auto px-10 py-8" style="color:${colors.primary};">

      <div class="flex items-end border-b-2 border-[#1B365D] pb-4 mb-6 pt-8">

        <div class="flex-shrink-0 mr-4"
             style="width:64px;height:64px;border:2px solid #1B365D;">
          ${
            catererLogo
              ? `<img src="${catererLogo}" class="w-full h-full object-cover" crossorigin="anonymous"/>`
              : `<div class="w-full h-full bg-[#D8C9A3]/40"></div>`
          }
        </div>

        <div class="flex-1">
          <h1 class="text-3xl font-bold uppercase leading-[1] mb-1"
              style="font-family:'Playfair Display',serif;letter-spacing:.08em;">
            ${catererName || 'CATERING SERVICES'}
          </h1>
          <p class="italic text-sm text-[#5A6B82]"
             style="font-family:'Crimson Text',serif;">
            Event Manifest & Menu
          </p>
        </div>
      </div>

      <div id="events-list">
        ${eventsHtml}
      </div>

      <div class="pt-4 border-t border-[#1B365D]/30 flex items-center justify-between text-[10px] opacity-70">
        <span class="italic">Exceptional culinary experience</span>
        <span>${new Date().toLocaleDateString()}</span>
      </div>

    </div>`;
};

// ==========================================
// 4. HTML Shell & Page Logic
// ==========================================

const getHtmlShell = (content: string, backgroundUrl: string) => {
  return `
  <html>
  <head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .font-serif { font-family: 'Playfair Display', serif; }
    </style>
  </head>
  <body class="relative font-sans antialiased">
    <div id="pdf-background" class="absolute inset-0 z-0 overflow-hidden">
      <img src="${backgroundUrl}" class="w-full min-h-full object-cover" crossorigin="anonymous"/>
      <div class="absolute inset-0 bg-black/10"></div>
    </div>
    
    <div id="content-container">${content}</div>
  </body>
  </html>`;
};

const adjustForPageBreaks = (doc: Document) => {
  const PAGE_HEIGHT_PX = 1123; // A4 height at 96 DPI
  const TOP_PADDING = 50; // Buffer for new page

  const elements = doc.querySelectorAll('.pdf-item');
  let accumulatingHeight =
    doc.getElementById('content-container')?.offsetTop || 0;

  elements.forEach((el) => {
    const element = el as HTMLElement;
    const height = element.offsetHeight;
    const style = window.getComputedStyle(element);
    const marginBottom = parseInt(style.marginBottom || '0');
    const marginTop = parseInt(style.marginTop || '0');

    // Current start and end page indices
    const startOnPage = Math.floor(accumulatingHeight / PAGE_HEIGHT_PX);
    const endOnPage = Math.floor(
      (accumulatingHeight + height) / PAGE_HEIGHT_PX,
    );

    // If the element crosses a page boundary
    if (startOnPage !== endOnPage) {
      // Calculate space needed to push to next page
      const remainingSpace =
        (startOnPage + 1) * PAGE_HEIGHT_PX - accumulatingHeight;
      const newMarginTop = remainingSpace + TOP_PADDING;

      element.style.marginTop = `${newMarginTop}px`;
      accumulatingHeight += newMarginTop; // Add the whitespace we just created
    }

    accumulatingHeight += height + marginBottom + marginTop;
  });
};

// ==========================================
// 5. Main Export Function
// ==========================================

export const downloadEventPdf = async (
  data: SubEventData[],
  backgroundUrl: string,
  catererName?: string,
  catererLogo?: string,
) => {
  const toastId = 'pdf-gen';
  toast.loading('Generating PDF...', {id: toastId});
  const iframe = document.createElement('iframe');

  try {
    // 1. Determine which layout to use based on the background name
    const isClassic = backgroundUrl.includes('Classic');

    const innerHtml = isClassic
      ? generateClassicLayout(data, catererLogo, catererName)
      : generateGreenLayout(data, catererLogo, catererName);

    const fullHtml = getHtmlShell(innerHtml, backgroundUrl);

    // 2. Setup Invisible Iframe
    iframe.style.cssText =
      'position:fixed; left:-10000px; top:0px; width:794px; height:auto; min-height: 100vh; border:none; z-index: -1;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(fullHtml);
    doc.close();
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
    });

    // 3. Wait for Images
    const images = doc.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }),
    );

    // Buffer for fonts/styles
    await new Promise((r) => setTimeout(r, 500));

    // 4. Smart Page Breaks
    adjustForPageBreaks(doc);

    // 5. Fix Background Height (Post-adjustment)
    const bodyHeight = doc.body.scrollHeight;
    const bgContainer = doc.getElementById('pdf-background');
    if (bgContainer) {
      bgContainer.style.height = `${bodyHeight}px`;
    }
    iframe.style.height = `${bodyHeight}px`;

    // 6. Capture Canvas
    const canvas = await html2canvas(doc.body, {
      scale: 2, // Retina quality
      useCORS: true,
      scrollY: 0,
      windowHeight: bodyHeight,
      height: bodyHeight,
      backgroundColor: null,
    });

    // 7. Generate PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfPageWidth = 210;
    const pdfPageHeight = 297;
    const imgHeightInPdf = (canvas.height * pdfPageWidth) / canvas.width;

    let heightLeft = imgHeightInPdf;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeightInPdf);
    heightLeft -= pdfPageHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      position -= pdfPageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, imgHeightInPdf);
      heightLeft -= pdfPageHeight;
    }

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Dismiss the loading toast
    toast.dismiss(toastId);

    // Show success toast
    toast.success('PDF generated successfully!', {duration: 3000});

    // Open print window
    const printWindow = window.open(
      pdfUrl,
      'pdfPreview',
      'width=1000,height=800,scrollbars=yes',
    );

    if (!printWindow) {
      toast.error('Popups blocked. Check your browser settings.', {
        duration: 4000,
      });
    }

    // Optional: Auto-print when window loads
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }

    // Clean up blob URL after print window is closed (optional)
    // You can add an event listener to revoke the URL when the window closes
    if (printWindow) {
      const checkClosed = setInterval(() => {
        if (printWindow.closed) {
          URL.revokeObjectURL(pdfUrl);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  } catch (err) {
    console.error('PDF Generation Error:', err);
    toast.dismiss(toastId);
    toast.error('Failed to generate PDF', {duration: 4000});
  } finally {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
};
