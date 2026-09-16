import React, {useState, useRef} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import {useGetCaterorById} from '@/lib/react-query/queriesAndMutations/cateror/dish';
import {useGetSubEventDesign} from '@/lib/react-query/queriesAndMutations/cateror/designselection';
import {useGetSubeventById} from '@/lib/react-query/queriesAndMutations/cateror/event';
import {Route} from '@/routes/_app/_event/qrgenerator.$id';
import {BiArrowBack, BiDownload} from 'react-icons/bi';
import QRCode from 'react-qr-code';
import {useReactToPrint} from 'react-to-print';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import {FaPhone} from 'react-icons/fa';
import orange from '@/assets/images/menucard/orange.png';
import devider from '@/assets/images/menucard/design.png';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    position: 'relative',
    backgroundColor: 'white',
    width: 2160,
    height: 4320,
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 2160,
    height: 4320,
    zIndex: -1,
  },
  section: {
    height: 1440,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 100,
  },
  top: {
    // inherits from section
  },
  welcome: {
    fontSize: 120,
    fontFamily: 'Playfair Display',
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 50,
    letterSpacing: 3,
    textAlign: 'center',
  },
  logo: {
    height: 300,
    width: 300,
    marginBottom: 50,
  },
  name: {
    fontSize: 200,
    fontFamily: 'Bebas Neue',
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 30,
    letterSpacing: 5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  slogan: {
    fontSize: 100,
    fontFamily: 'Crimson Text',
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 60,
    fontFamily: 'Crimson Text',
    color: 'black',
    marginBottom: 50,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  divider: {
    height: 60,
    width: 1000,
    marginVertical: 50,
  },
  services: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  service1: {
    fontSize: 120,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 5,
    textAlign: 'center',
  },
  and: {
    fontSize: 80,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'black',
    marginVertical: 10,
  },
  service2: {
    fontSize: 120,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 5,
    textAlign: 'center',
  },
  middle: {
    // inherits from section
  },
  qrContainer: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  qrBox: {
    borderWidth: 16,
    borderColor: 'white',
    backgroundColor: 'white',
    padding: 60,
  },
  qr: {
    height: 800,
    width: 800,
  },
  menuName: {
    fontSize: 70,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'white',
    marginTop: 80,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  eventName: {
    fontSize: 50,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  bottom: {
    // inherits from section
  },
  businessName: {
    fontSize: 120,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 50,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  phoneIcon: {
    fontSize: 80,
    marginRight: 20,
  },
  phoneText: {
    fontSize: 120,
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    color: 'black',
  },
});

const StandeePDF = ({caterorData, SubEventData, design, BASE_URL}) => {
  const fullname = caterorData?.data?.user?.fullname || 'PRUTHVIRAJ';
  const phoneNumber =
    caterorData?.data?.user?.phoneNumber || '8605891499/9763650653';
  const additionalPhoneNumbers =
    caterorData?.data?.additionalPhoneNumbers || [];
  const menuName = design?.data?.design?.menuName;
  const eventName = SubEventData?.data?.eventName;

  return (
    <Document>
      <Page size={[2160, 4320]} style={styles.page}>
        <Image source={orange} style={styles.backgroundImage} />
        <View style={styles.top}>
          <Text style={styles.welcome}>Welcome To</Text>
          {caterorData?.data?.image && (
            <Image source={caterorData.data.image} style={styles.logo} />
          )}
          <Text style={styles.name}>{fullname}</Text>
          <Text style={styles.slogan}>for unforgettable events</Text>
          <Text style={styles.description}>
            Services designed to bring culinary excellence to your event.
          </Text>
          <Image source={devider} style={styles.divider} />
          <View style={styles.services}>
            <Text style={styles.service1}>
              {SubEventData?.data?.eventType || 'CATERING PLANNER'}
            </Text>
            <Text style={styles.and}>&</Text>
            <Text style={styles.service2}>
              {design?.data?.serviceType || 'EVENT MANAGEMENT'}
            </Text>
          </View>
        </View>
        <View style={styles.middle}>
          <Image source={devider} style={styles.divider} />
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <QRCode
                value={BASE_URL}
                size={800}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </View>
            {menuName && <Text style={styles.menuName}>{menuName}</Text>}
            {eventName && <Text style={styles.eventName}>{eventName}</Text>}
          </View>
          <Image source={devider} style={styles.divider} />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.businessName}>{fullname}</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.phoneRow}>
              <Text style={styles.phoneIcon}>📞</Text>
              <Text style={styles.phoneText}>{phoneNumber}</Text>
            </View>
            {additionalPhoneNumbers.map((phone, index) => (
              <View key={index} style={styles.phoneRow}>
                <Text style={styles.phoneIcon}>📞</Text>
                <Text style={styles.phoneText}>{phone}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const QrCodeDesignOrange = () => {
  const {id} = Route.useParams<{id: string}>();
  const {user} = useAuthContext();
  const {
    data: caterorData,
    isLoading,
    isError,
  } = useGetCaterorById(user?.caterorId ?? '');
  const {data: design} = useGetSubEventDesign(id);
  const {data: SubEventData} = useGetSubeventById(id!);

  const QR_BASE_URL = import.meta.env.VITE_QR_BASE_URL || 'menubook.cc';
  const BASE_URL = `${QR_BASE_URL}/qr/${id || 'default'}`;

  const handleBack = () => window.history.back();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BASE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Ref for print component
  const printRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleQrPrint = useReactToPrint({
    contentRef: qrRef,
    documentTitle: `QR-Scanner-${Math.random().toString(36).substring(7)}`,
    pageStyle: `
       @page {
         size: 3in 3in; /* Square size for QR code */
         margin: 0;
         padding: 0;
       }
       html, body {
         margin: 0;
         padding: 0;
         height: 100%;
         background: #fff;
         -webkit-print-color-adjust: exact !important;
         print-color-adjust: exact !important;
         color-adjust: exact !important;
       }
       .qr-scanner-container {
         width: 3in !important;
         height: 3in !important;
         margin: 0 !important;
         padding: 0;
         box-sizing: border-box;
         display: flex !important;
         align-items: center !important;
         justify-content: center !important;
       }
       @media print {
         body { 
           -webkit-print-color-adjust: exact !important; 
           print-color-adjust: exact !important; 
           background: #fff !important;
         }
         .qr-scanner-container { 
           margin: 0 !important;
           top: 0;
           left: 0;
         }
       }
     `,
  });
  // Print/PDF functionality
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `QR-Standee-${Math.random().toString(36).substring(7)}`,
    pageStyle: `
      @page {
        size: 5.2in 11.5in; /* Matches the standee dimensions for a single long page */
        margin: 0;
        padding: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: #fff; /* Changed to white to avoid extra black space */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      .standee-container {
        width: 5.2in !important;
        height: 11.5in !important;
        background: url(${orange}) no-repeat center/cover;
        color: #fff;
        page-break-inside: avoid;
        page-break-after: avoid;
        margin: 0 !important;
        margin-top: 0 !important;
        padding: 0;
        box-sizing: border-box;
        position: relative;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
          background: #fff !important;
        }
        .standee-container { 
          break-inside: avoid;
          margin: 0 !important;
          margin-top: 0 !important;
          top: 0;
          left: 0;
        }
      }
    `,
  });

  if (isLoading)
    return (
      <div className="to-gray-100 flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50">
        <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-gray-300 mt-4">Loading user data...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
          <div className="mb-4 text-red-500">⚠️</div>
          <h3 className="mb-2 text-xl font-bold text-red-400">
            Error loading user data
          </h3>
          <p className="text-gray-300">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );

  // Dynamic data from API
  const fullname = caterorData?.data?.user?.fullname || 'PRUTHVIRAJ';
  const phoneNumber =
    caterorData?.data?.user?.phoneNumber || '8605891499/9763650653';
  const city = caterorData?.data?.city || 'MIRAJ';
  const businessType = caterorData?.data?.businessType || 'CATERERS';

  return (
    <div className="bg-gray-100 flex min-h-screen flex-col items-center p-4">
      {/* Standee Container - Fixed size for 2.5x5 ft */}
      <div
        className="standee-container relative mx-auto overflow-hidden rounded-lg"
        ref={printRef}
        style={{
          background: `url(${orange})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '550px', // Fixed width for screen display
          height: '1100px', // Fixed height for 2:1 ratio
          aspectRatio: '1/2',
        }}
      >
        <div className="flex h-full flex-col p-8">
          {/* Top Section - 30% */}
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            <h1
              className="mb-2 text-4xl font-bold text-black sm:text-5xl md:text-6xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              Welcome To
            </h1>
            {/* Business Logo */}
            {caterorData?.data?.image && (
              <div className="mb-4 flex justify-center">
                <img
                  src={caterorData.data.image}
                  alt="Business Logo"
                  className="h-20 w-20 object-contain"
                />
              </div>
            )}

            {/* Main Business Name */}
            <div className="space-y-0 text-center">
              <h1
                className="mb-1 text-6xl font-black uppercase text-black"
                style={{
                  fontFamily: '"Bebas Neue", Impact, sans-serif',
                  letterSpacing: '0.12em',
                  fontWeight: '100',
                  lineHeight: '0.9',
                }}
              >
                {fullname}
              </h1>
              {/* <p
                className="text-4xl font-black uppercase text-black"
                style={{
                  fontFamily: '"Bebas Neue", Impact, sans-serif',
                  letterSpacing: '0.1em',
                  fontWeight: '900',
                  lineHeight: '1',
                }}
              >
                {businessType}
              </p> */}
            </div>

            <p
              className="mb-2 text-3xl font-bold text-black-2 shadow-sm sm:text-3xl"
              style={{fontFamily: "'Crimson Text', serif"}}
            >
              for unforgettable events
            </p>
            <p
              className="text-center text-lg text-black-2 sm:text-xl"
              style={{fontFamily: "'Crimson Text', serif"}}
            >
              Services designed to bring culinary excellence to your event.
            </p>

            {/* First Divider */}
            <div className="my-4 flex justify-center">
              <img
                src={devider}
                alt="Divider"
                className="h-4 w-64 object-cover"
              />
            </div>

            {/* Secondary Services */}
            <div className="flex flex-col items-center space-y-2">
              <h3
                className="text-3xl font-bold uppercase tracking-wider text-black"
                style={{
                  fontFamily: 'Times New Roman, serif',
                  letterSpacing: '0.15em',
                }}
              >
                {SubEventData?.data?.eventType || 'CATERING PLANNER'}
              </h3>
              <div className="text-2xl font-bold text-black">
                <span className="text-black">&</span>
              </div>
              <h3
                className="text-3xl font-bold uppercase tracking-wider text-black"
                style={{
                  fontFamily: 'Times New Roman, serif',
                  letterSpacing: '0.15em',
                }}
              >
                {design?.data?.serviceType || 'EVENT MANAGEMENT'}
              </h3>
            </div>
          </div>

          {/* Middle Section - QR Code - 40% */}
          <div className="flex flex-1 flex-col items-center justify-center space-y-6">
            {/* Second Divider */}
            <div className="flex justify-center">
              <img
                src={devider}
                alt="Divider"
                className="h-4 w-64 object-cover"
              />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="rounded-lg border-4 border-white bg-white p-4 shadow-xl">
                <div
                  ref={qrRef}
                  className="qr-scanner-container flex flex-col items-center py-4"
                >
                  <QRCode
                    value={BASE_URL}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>

              {/* Menu Name */}
              {design?.data?.design?.menuName && (
                <p
                  className="mt-4 text-center text-lg font-bold uppercase tracking-wide text-white"
                  style={{fontFamily: 'Times New Roman, serif'}}
                >
                  {design.data.design.menuName}
                </p>
              )}

              {/* Event Name */}
              {SubEventData?.data?.eventName && (
                <p
                  className="text-md mt-2 text-center font-semibold uppercase tracking-wide text-amber-100"
                  style={{fontFamily: 'Times New Roman, serif'}}
                >
                  {SubEventData.data.eventName}
                </p>
              )}
            </div>

            {/* Third Divider */}
            <div className="flex justify-center">
              <img
                src={devider}
                alt="Divider"
                className="h-4 w-64 object-cover"
              />
            </div>
          </div>

          {/* Bottom Section - Contact - 30% */}
          <div className="flex flex-1 flex-col items-center justify-center space-y-4">
            {/* Address */}
            <div
              className="text-center text-3xl font-bold text-black"
              style={{fontFamily: 'Times New Roman, serif'}}
            >
              <div>{fullname}</div>
              {/* <div>{city}</div> */}
            </div>

            {/* Phone Numbers */}
            <div
              className="flex flex-col items-center space-y-2 text-3xl font-bold text-black"
              style={{fontFamily: 'Times New Roman, serif'}}
            >
              <div className="flex items-center space-x-2">
                <FaPhone className="h-5 w-5 text-black" />
                <span>{phoneNumber}</span>
              </div>
              {/* Additional phone numbers */}
              {caterorData?.data?.additionalPhoneNumbers?.map(
                (phone: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FaPhone className="h-5 w-5 text-black" />
                    <span>{phone}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 rounded-lg bg-amber-600 px-6 py-3 text-white hover:bg-amber-700"
        >
          <BiArrowBack className="h-5 w-5" />
          <span className="text-lg">Back</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 rounded-lg bg-amber-800 px-6 py-3 text-white hover:bg-amber-900"
        >
          <BiDownload className="h-5 w-5" />
          <span className="text-lg">Download Standee</span>
        </button>
        <button
          onClick={handleQrPrint}
          className="flex items-center space-x-2 rounded-lg bg-yellow-900 px-6 py-3 text-white hover:bg-yellow-950"
        >
          <BiDownload className="h-5 w-5" />
          <span className="text-lg">Download QR </span>
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 rounded-lg bg-amber-700 px-6 py-3 text-white hover:bg-amber-800"
        >
          <span className="text-lg">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
};

export default QrCodeDesignOrange;
