import {createContext, useContext, useState, useEffect} from 'react';

interface Event {
  id: string;
  name: string;
}

interface Invoice {
  eventId: string;
  invoiceNo: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  generateInvoices: (events: Event[]) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const generateInvoices = (events: Event[]) => {
    if (!Array.isArray(events)) return;

    // Sort events by ID for consistent invoice numbers
    const sortedEvents = [...events].sort((a, b) => a.id.localeCompare(b.id));

    const newInvoices = sortedEvents.map((event, index) => ({
      eventId: event.id,
      invoiceNo: (index + 1).toString().padStart(7, '0'),
    }));

    setInvoices(newInvoices);
  };

  useEffect(() => {
    // console.log('Invoices updated:', invoices);
  }, [invoices]);

  return (
    <InvoiceContext.Provider value={{invoices, generateInvoices}}>
      {children}
    </InvoiceContext.Provider>
  );
};
