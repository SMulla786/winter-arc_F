// import React, {useEffect, useRef, useState} from 'react';
// import waiterCallingImg from '../../assets/images/addson1.png';
// import voiceOrderingImg from '../../assets/images/addson2.png';
// import CaptaionOrderingImg from '../../assets/images/addson3.png';
// import KitchenDisplayIMG from '../../assets/images/addson4.png';
// import BusinessWebsiteIMG from '../../assets/images/addson5.png';
// import LoyaltyWalletIMG from '../../assets/images/addson6.png';
// import DynamicReportsIMG from '../../assets/images/addson7.png';
// import OnlineOrderIMG from '../../assets/images/addson8.png';

// const FeatureSection = () => {
//   const [activeLink, setActiveLink] = useState('#menu-event');
//   const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

//   const sectionIds = [
//     '#menu-event',
//     '#costing-billing',
//     '#inventory',
//     '#accounts-reports',
//     '#marketing-growth',
//   ];

//   // Refs for each section
//   const sectionRefs = useRef({});

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             setActiveLink(`#${entry.target.id}`);
//           }
//         });
//       },
//       {threshold: 0.4}, // Lower threshold to trigger earlier
//     );

//     sectionIds.forEach((id) => {
//       const section = document.querySelector(id);
//       if (section) {
//         observer.observe(section);
//         sectionRefs.current[id] = section;
//       }
//     });

//     return () => {
//       sectionIds.forEach((id) => {
//         if (sectionRefs.current[id]) {
//           observer.unobserve(sectionRefs.current[id]);
//         }
//       });
//     };
//   }, []);

//   const handleClick = (href) => {
//     setActiveLink(href);
//     setIsMobileNavOpen(false);

//     const element = document.querySelector(href);
//     if (element) {
//       const yOffset = -80; // Adjust for sticky header
//       const y =
//         element.getBoundingClientRect().top + window.pageYOffset + yOffset;

//       window.scrollTo({
//         top: y,
//         behavior: 'smooth',
//       });
//     }
//   };

//   const toggleMobileNav = () => {
//     setIsMobileNavOpen(!isMobileNavOpen);
//   };

//   return (
//     <section className="tabin">
//       {/* Sticky Nav Tabs - Hidden on mobile, visible on tablet and desktop */}
//       <div className="sticky top-0 z-20 hidden bg-white shadow-md lg:top-20 lg:block lg:shadow-none">
//         <div className="bg-white py-2">
//           <div className="flex justify-center px-4 sm:px-6 lg:px-8">
//             <ul className="border-gray-200 flex flex-col justify-center space-y-2 rounded-lg border p-4 font-poppins lg:flex-row lg:flex-wrap lg:space-x-4 lg:space-y-0 lg:rounded-full lg:p-2">
//               {[
//                 {href: '#menu-event', label: 'Menu'},
//                 {href: '#costing-billing', label: 'Billing'},
//                 {href: '#inventory', label: 'Inventory'},
//                 {href: '#accounts-reports', label: 'Reports'},
//                 {href: '#marketing-growth', label: 'Growth'},
//               ].map((tab) => (
//                 <li
//                   key={tab.href}
//                   className={`rounded-lg px-4 py-2 lg:rounded-full ${
//                     activeLink === tab.href ? 'bg-blue-50' : 'hover:bg-gray-50'
//                   }`}
//                 >
//                   <button
//                     className={`font-bold ${
//                       activeLink === tab.href ? 'text-blue-500' : 'text-black'
//                     }`}
//                     onClick={() => handleClick(tab.href)}
//                   >
//                     {tab.label}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* CUSTOMER SERVICE */}
//       <div
//         className="tabin_details flex min-h-screen items-center py-8"
//         id="menu-event"
//       >
//         <div className="container mx-auto px-4">
//           <div className="tabin_content">
//             <div className="section_heading mb-12 text-center">
//               <span className="titel_tag font-dmsans text-sm font-semibold text-blue-700 md:text-base">
//                 Menu & Event Finalization
//               </span>
//               <h4 className="titel_name mt-2 font-poppins text-2xl font-semibold text-black md:text-4xl">
//                 Serve smarter, not harder
//               </h4>
//               <p className="titel_dec text-gray-600 mx-auto mt-2 max-w-2xl font-dmsans">
//                 Delight diners with a sleek, interactive menu that's easy to
//                 browse, quick to update, and built for a modern dining
//                 experience.
//               </p>
//             </div>

//             <div className="flex flex-col items-center gap-16 md:gap-24 lg:flex-row lg:justify-center">
//               {/* Card 1 */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/waiter-calling-system" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={waiterCallingImg}
//                     alt="Waiter calling system"
//                     className="h-64 w-full rounded-md object-contain shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Menu Selection
//                   </h4>
//                   <p className="text-gray-600 mt-2 line-clamp-3 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Customers can easily browse the menu and place orders
//                     directly from their mobile phones by scanning the QR code.
//                     Our system ensures a seamless ordering experience.
//                   </p>
//                 </div>
//               </div>

//               {/* Card 2 */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/voice-ordering-kiosk" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={voiceOrderingImg}
//                     alt="Event Stages"
//                     className="h-64 w-full rounded-md object-contain shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-2xl font-semibold text-black md:text-2xl">
//                     Event Stages
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Track bookings through every stage: Inquiry → Finalized →
//                     Preparation → Paid. Stay organized with automated reminders
//                     and never miss a step in the event planning process.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* OPERATIONS */}
//       <div
//         className="tabin_details flex min-h-screen items-center py-8"
//         id="costing-billing"
//       >
//         <div className="container mx-auto px-4">
//           <div className="tabin_content">
//             <div className="section_heading mb-8 text-center">
//               <span className="titel_tag font-dmsans text-sm font-semibold text-blue-700 md:text-base">
//                 Costing & Billing
//               </span>
//               <h4 className="titel_name mt-2 font-poppins text-2xl font-semibold text-black md:text-4xl">
//                 Showcase and update your menu with ease
//               </h4>
//               <p className="titel_dec text-gray-600 mx-auto mt-2 max-w-2xl font-dmsans">
//                 Digitize your menu to make updates instant, highlight seasonal
//                 specials, and give customers an engaging browsing experience.
//               </p>
//             </div>

//             <div className="flex flex-col items-center gap-16 md:gap-24 lg:flex-row lg:justify-center">
//               {/* Captain App */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/waiter-calling-system" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={CaptaionOrderingImg}
//                     alt="MENUBOOK INCOME & EXPENDITURE"
//                     className="h-64 w-full rounded-md object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Event Costing
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Automatically calculate costs for raw materials, labour, and
//                     transport. Our system ensures accuracy and saves time by
//                     eliminating manual calculations and blueucing errors.
//                   </p>
//                 </div>
//               </div>

//               {/* KDS */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/voice-ordering-kiosk" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={KitchenDisplayIMG}
//                     alt="Package List"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Billing & Quotation
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Efficiently track pending payments, manage vendor and
//                     customer accounts, and generate detailed financial reports
//                     instantly. Our system provides a clear overview of your
//                     making informed business decisions.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CRM */}
//       <div
//         className="tabin_details flex min-h-screen items-center py-8"
//         id="inventory"
//       >
//         <div className="container mx-auto px-4">
//           <div className="tabin_content">
//             <div className="section_heading mb-8 text-center">
//               <span className="titel_tag font-dmsans text-sm font-semibold text-blue-700 md:text-base">
//                 Raw Material & Inventory
//               </span>
//               <h4 className="titel_name mt-2 font-poppins text-2xl font-semibold text-black md:text-4xl">
//                 Raw Material & Inventory Management
//               </h4>
//               <p className="titel_dec text-gray-600 mx-auto mt-2 max-w-2xl font-dmsans">
//                 Foster strong relationships with your customers to boost loyalty
//                 and satisfaction.
//               </p>
//             </div>

//             <div className="flex flex-col items-center gap-16 md:gap-24 lg:flex-row lg:justify-center">
//               {/* Business website */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/waiter-calling-system" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={BusinessWebsiteIMG}
//                     alt="Payment Report"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     AI Calculator
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Our AI-poweblue calculator helps you accurately estimate
//                     requirements and costs for events. It considers historical
//                     data, current trends, and menu specifics to provide precise.
//                   </p>
//                 </div>
//               </div>

//               {/* Loyalty wallet */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/voice-ordering-kiosk" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={LoyaltyWalletIMG}
//                     alt="Payment Details"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Inventory Management
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Efficiently manage your inventory with real-time tracking of
//                     stock levels, automated alerts for low stock, and detailed
//                     reports on inventory usage. Our system helps in blueucing
//                     waste etc.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ANALYTICS */}
//       <div
//         className="tabin_details flex min-h-screen items-center py-8"
//         id="accounts-reports"
//       >
//         <div className="container mx-auto px-4">
//           <div className="tabin_content">
//             <div className="section_heading mb-8 text-center">
//               <span className="titel_tag font-dmsans text-sm font-semibold text-blue-700 md:text-base">
//                 Accounts & Reports
//               </span>
//               <h4 className="titel_name mt-2 font-poppins text-2xl font-semibold text-black md:text-4xl">
//                 Track Menu Performance & Boost Sales
//               </h4>
//               <p className="titel_dec text-gray-600 mx-auto mt-2 max-w-2xl font-dmsans">
//                 Analyze which dishes are selling best, identify underperforming
//                 items, and optimize your menu for maximum profitability.
//               </p>
//             </div>

//             <div className="flex flex-col items-center gap-16 md:gap-24 lg:flex-row lg:justify-center">
//               {/* Online order */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/waiter-calling-system" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={OnlineOrderIMG}
//                     alt="Add-on Services Management"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-6 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Payments Tracking
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Get automated reminders for pending customer payments and
//                     easily record advances and balances. Our system ensures that
//                     no payment is missed and provides a clear view of your
//                     accounts receivable.
//                   </p>
//                 </div>
//               </div>

//               {/* Dynamic reports */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/voice-ordering-kiosk" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={DynamicReportsIMG}
//                     alt="Event & Booking Calendar"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Vendor & Customer Accounts
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Manage all your accounts in one place, including vendors,
//                     manpower suppliers, Maharajs, and customers. Get clear,
//                     detailed reports of outstanding balances and transactions.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MARKETING */}
//       <div
//         className="tabin_details flex min-h-screen items-center py-8"
//         id="marketing-growth"
//       >
//         <div className="container mx-auto px-4">
//           <div className="tabin_content">
//             <div className="section_heading mb-8 text-center">
//               <span className="titel_tag font-dmsans text-sm font-semibold text-blue-700 md:text-base">
//                 Marketing & Growth
//               </span>
//               <h4 className="mt-2 font-poppins text-2xl font-semibold text-black md:text-4xl">
//                 Track Menu Performance & Boost Sales
//               </h4>
//               <p className="text-gray-600 mx-auto mt-2 max-w-2xl font-dmsans">
//                 Analyze which dishes are selling best, identify underperforming
//                 items, and optimize your menu for maximum profitability.
//               </p>
//             </div>

//             <div className="flex flex-col items-center gap-16 md:gap-24 lg:flex-row lg:justify-center">
//               {/* QR Menu */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/waiter-calling-system" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={OnlineOrderIMG}
//                     alt="Add-on Services Management"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-6 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     QR Menu
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Utilize QR codes to provide customers with easy access to
//                     your digital menu. This contactless solution enhances
//                     customer experience, blueuces printing costs, and allows for
//                     instant menu updates.
//                   </p>
//                 </div>
//               </div>

//               {/* Website Builder */}
//               <div className="flex w-full max-w-4xl flex-col items-center text-center sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
//                 <a href="/voice-ordering-kiosk" className="block w-full">
//                   <img
//                     loading="lazy"
//                     src={DynamicReportsIMG}
//                     alt="Event & Booking Calendar"
//                     className="h-64 w-full rounded-2xl object-cover shadow-lg sm:h-72 md:h-[280px] lg:h-[320px] xl:h-[360px]"
//                   />
//                 </a>
//                 <div className="mt-4 text-left">
//                   <h4 className="font-dmsans text-xl font-semibold text-black md:text-2xl">
//                     Website Builder
//                   </h4>
//                   <p className="text-gray-600 mt-2 font-dmsans text-lg leading-relaxed sm:text-base md:text-lg lg:text-xl">
//                     Build a professional catering website with our easy-to-use
//                     website builder. Showcase your services, menus, and
//                     testimonials to attract new clients.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FeatureSection;

import React, {useEffect, useRef, useState} from 'react';
import waiterCallingImg from '../../assets/images/addson1.png';
import voiceOrderingImg from '../../assets/images/addson2.png';
import CaptaionOrderingImg from '../../assets/images/addson3.png';
import KitchenDisplayIMG from '../../assets/images/addson4.png';
import BusinessWebsiteIMG from '../../assets/images/addson5.png';
import LoyaltyWalletIMG from '../../assets/images/addson6.png';
import DynamicReportsIMG from '../../assets/images/addson7.png';
import OnlineOrderIMG from '../../assets/images/addson8.png';

const FeatureSection = () => {
  const [activeLink, setActiveLink] = useState('#menu-event');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const sectionIds = [
    '#menu-event',
    '#costing-billing',
    '#inventory',
    '#accounts-reports',
    '#marketing-growth',
  ];

  // Refs for each section
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(`#${entry.target.id}`);
          }
        });
      },
      {threshold: 0.4},
    );

    sectionIds.forEach((id) => {
      const section = document.querySelector(id);
      if (section) {
        observer.observe(section);
        sectionRefs.current[id] = section;
      }
    });

    return () => {
      sectionIds.forEach((id) => {
        if (sectionRefs.current[id]) {
          observer.unobserve(sectionRefs.current[id]);
        }
      });
    };
  }, []);

  const handleClick = (href) => {
    setActiveLink(href);
    setIsMobileNavOpen(false);

    const element = document.querySelector(href);
    if (element) {
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <section className="from-gray-50 relative bg-gradient-to-b to-white">
      {/* Sticky Nav Tabs - Hidden on mobile, visible on tablet and desktop */}
      <div className="sticky top-0 z-20 hidden bg-white shadow-md lg:top-20 lg:block lg:shadow-none">
        <div className="bg-white py-2">
          <div className="flex justify-center px-4 sm:px-6 lg:px-8">
            <ul className="border-gray-200 font-poppins flex flex-col justify-center space-y-2 rounded-lg border p-4 lg:flex-row lg:flex-wrap lg:space-x-4 lg:space-y-0 lg:rounded-full lg:p-2">
              {[
                {href: '#menu-event', label: 'Menu'},
                {href: '#costing-billing', label: 'Billing'},
                {href: '#inventory', label: 'Inventory'},
                {href: '#accounts-reports', label: 'Reports'},
                {href: '#marketing-growth', label: 'Growth'},
              ].map((tab) => (
                <li
                  key={tab.href}
                  className={`rounded-lg px-4 py-2 lg:rounded-full ${
                    activeLink === tab.href ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    className={`font-bold ${
                      activeLink === tab.href ? 'text-blue-500' : 'text-black'
                    }`}
                    onClick={() => handleClick(tab.href)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CUSTOMER SERVICE */}
      <div className="py-16 lg:py-24" id="menu-event">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Menu & Event Finalization
            </span>
            <h2 className="text-gray-900 mb-6 mt-4 text-3xl font-bold md:text-4xl">
              Serve smarter, not harder
            </h2>
            <p className="text-gray-600 mx-auto max-w-3xl text-lg">
              Delight diners with a sleek, interactive menu that's easy to
              browse, quick to update, and built for a modern dining experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            {/* Card 1 */}
            <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  loading="lazy"
                  src={waiterCallingImg}
                  alt="Waiter calling system"
                  className="h-64 w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Menu Selection
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers can easily browse the menu and place orders directly
                  from their mobile phones by scanning the QR code. Our system
                  ensures a seamless ordering experience.
                </p>
                <button className="mt-4 flex items-center font-semibold text-blue-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  loading="lazy"
                  src={voiceOrderingImg}
                  alt="Event Stages"
                  className="h-64 w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Event Stages
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Track bookings through every stage: Inquiry → Finalized →
                  Preparation → Paid. Stay organized with automated reminders
                  and never miss a step in the event planning process.
                </p>
                <button className="mt-4 flex items-center font-semibold text-blue-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONS */}
      <div className="bg-white py-16 lg:py-24" id="costing-billing">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              Costing & Billing
            </span>
            <h2 className="text-gray-900 mb-6 mt-4 text-3xl font-bold md:text-4xl">
              Showcase and update your menu with ease
            </h2>
            <p className="text-gray-600 mx-auto max-w-3xl text-lg">
              Digitize your menu to make updates instant, highlight seasonal
              specials, and give customers an engaging browsing experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            {/* Captain App */}
            <div className="bg-gray-50 group rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  loading="lazy"
                  src={CaptaionOrderingImg}
                  alt="MENUBOOK INCOME & EXPENDITURE"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Event Costing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Automatically calculate costs for raw materials, labour, and
                  transport. Our system ensures accuracy and saves time by
                  eliminating manual calculations and reducing errors.
                </p>
                <button className="mt-4 flex items-center font-semibold text-green-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* KDS */}
            <div className="bg-gray-50 group rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-md">
                <img
                  loading="lazy"
                  src={KitchenDisplayIMG}
                  alt="Package List"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Billing & Quotation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Efficiently track pending payments, manage vendor and customer
                  accounts, and generate detailed financial reports instantly.
                  Our system provides a clear overview for making informed
                  business decisions.
                </p>
                <button className="mt-4 flex items-center font-semibold text-green-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRM */}
      <div className="py-16 lg:py-24" id="inventory">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
              Raw Material & Inventory
            </span>
            <h2 className="text-gray-900 mb-6 mt-4 text-3xl font-bold md:text-4xl">
              Raw Material & Inventory Management
            </h2>
            <p className="text-gray-600 mx-auto max-w-3xl text-lg">
              Foster strong relationships with your customers to boost loyalty
              and satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            {/* Business website */}
            <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  loading="lazy"
                  src={BusinessWebsiteIMG}
                  alt="Payment Report"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  AI Calculator
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI-powered calculator helps you accurately estimate
                  requirements and costs for events. It considers historical
                  data, current trends, and menu specifics to provide precise
                  calculations.
                </p>
                <button className="mt-4 flex items-center font-semibold text-purple-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loyalty wallet */}
            <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  loading="lazy"
                  src={LoyaltyWalletIMG}
                  alt="Payment Details"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Inventory Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Efficiently manage your inventory with real-time tracking of
                  stock levels, automated alerts for low stock, and detailed
                  reports on inventory usage. Our system helps in reducing
                  waste.
                </p>
                <button className="mt-4 flex items-center font-semibold text-purple-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="bg-white py-16 lg:py-24" id="accounts-reports">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              Accounts & Reports
            </span>
            <h2 className="text-gray-900 mb-6 mt-4 text-3xl font-bold md:text-4xl">
              Track Menu Performance & Boost Sales
            </h2>
            <p className="text-gray-600 mx-auto max-w-3xl text-lg">
              Analyze which dishes are selling best, identify underperforming
              items, and optimize your menu for maximum profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            {/* Online order */}
            <div className="bg-gray-50 group rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  loading="lazy"
                  src={OnlineOrderIMG}
                  alt="Add-on Services Management"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Payments Tracking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Get automated reminders for pending customer payments and
                  easily record advances and balances. Our system ensures that
                  no payment is missed and provides a clear view of your
                  accounts receivable.
                </p>
                <button className="mt-4 flex items-center font-semibold text-amber-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dynamic reports */}
            <div className="bg-gray-50 group rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  loading="lazy"
                  src={DynamicReportsIMG}
                  alt="Event & Booking Calendar"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Vendor & Customer Accounts
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage all your accounts in one place, including vendors,
                  manpower suppliers, Maharajs, and customers. Get clear,
                  detailed reports of outstanding balances and transactions.
                </p>
                <button className="mt-4 flex items-center font-semibold text-amber-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MARKETING */}
      <div className="py-16 lg:py-24" id="marketing-growth">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
              Marketing & Growth
            </span>
            <h2 className="text-gray-900 mb-6 mt-4 text-3xl font-bold md:text-4xl">
              Track Menu Performance & Boost Sales
            </h2>
            <p className="text-gray-600 mx-auto max-w-3xl text-lg">
              Analyze which dishes are selling best, identify underperforming
              items, and optimize your menu for maximum profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
            {/* QR Menu */}
            <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  loading="lazy"
                  src={OnlineOrderIMG}
                  alt="Add-on Services Management"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  QR Menu
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Utilize QR codes to provide customers with easy access to your
                  digital menu. This contactless solution enhances customer
                  experience, reduces printing costs, and allows for instant
                  menu updates.
                </p>
                <button className="mt-4 flex items-center font-semibold text-pink-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Website Builder */}
            <div className="group rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
              <div className="mb-6 overflow-hidden rounded-xl">
                <img
                  loading="lazy"
                  src={DynamicReportsIMG}
                  alt="Event & Booking Calendar"
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-gray-900 mb-3 text-2xl font-bold">
                  Website Builder
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Build a professional catering website with our easy-to-use
                  website builder. Showcase your services, menus, and
                  testimonials to attract new clients.
                </p>
                <button className="mt-4 flex items-center font-semibold text-pink-600 group-hover:underline">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
