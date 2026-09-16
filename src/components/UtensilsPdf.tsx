// import React, { useRef } from "react";
// import { useReactToPrint } from "react-to-print";

// type Utensil = {
//   name: string;
//   givenQuantity?: number;
//   inventory?: number;
// };

// type User = {
//   fullname?: string;
//   address?: string;
//   email?: string;
//   phoneNumber?: string;
// };

// type Props = {
//   user: User;
//   utensils: { data: Utensil[] };
// };

// // 🔹 Component that renders PDF layout
// const UtensilsReport = React.forwardRef<HTMLDivElement, Props>(
//   ({ user, utensils }, ref) => {
//     const utensilList = utensils?.data || [];
//     const mid = Math.ceil(utensilList.length / 2);
//     const leftList = utensilList.slice(0, mid);
//     const rightList = utensilList.slice(mid);

//     const renderTable = (list: Utensil[], offset: number) => (
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           fontSize: "13px",
//           marginBottom: "15px",
//         }}
//       >
//         <thead>
//           <tr>
//             {["Sr.", "Utensil Name", "Given Qty", "Inventory"].map((h) => (
//               <th
//                 key={h}
//                 style={{
//                   border: "1px solid gray",
//                   padding: "6px",
//                   backgroundColor: "#0D47A1",
//                   color: "white",
//                   textAlign: "center",
//                   fontWeight: "bold",
//                 }}
//               >
//                 {h}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {list.map((utensil, idx) => (
//             <tr key={idx}>
//               <td
//                 style={{
//                   border: "1px solid #ddd",
//                   padding: "6px",
//                   textAlign: "center",
//                 }}
//               >
//                 {idx + 1 + offset}
//               </td>
//               <td
//                 style={{
//                   border: "1px solid #ddd",
//                   padding: "6px",
//                   textAlign: "left",
//                 }}
//               >
//                 {utensil.name}
//               </td>
//               <td
//                 style={{
//                   border: "1px solid #ddd",
//                   padding: "6px",
//                   textAlign: "center",
//                 }}
//               >
//                 {utensil.givenQuantity ?? 0}
//               </td>
//               <td
//                 style={{
//                   border: "1px solid #ddd",
//                   padding: "6px",
//                   textAlign: "center",
//                 }}
//               >
//                 {utensil.inventory ?? 0}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     );

//     return (
//       <div
//         ref={ref}
//         style={{
//           width: "800px",
//           padding: "20px",
//           background: "white",
//           fontFamily: "Arial, sans-serif",
//         }}
//       >
//         {/* 🔹 HEADER */}
//         <div style={{ border: "1px solid blue", padding: "10px" }}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "2px",
//               justifyContent: "center",
//             }}
//           >
//             <div style={{ textAlign: "center", flex: "1", color: "black" }}>
//               <h1
//                 style={{
//                   color: "#1565C0",
//                   margin: 0,
//                   fontWeight: 800,
//                   fontSize: "28px",
//                   textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 {user?.fullname}
//               </h1>
//               <div
//                 style={{
//                   background: "#0D47A1",
//                   height: "2px",
//                   margin: "4px auto",
//                   width: "80%",
//                 }}
//               />
//               <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
//                 {user?.address}
//                 <br />
//                 {user?.email && <>इमेल - {user.email}<br /></>}
//                 मो. {user?.phoneNumber}
//                 <br />
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* 🔹 CUSTOMER INFO */}
//         <div style={{ marginTop: "10px", fontSize: "14px" }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               color: "black",
//             }}
//           >
//             <div>भांडी घेणाऱ्याचे नाव: __________________________________________</div>
//             <div>फोन: ____________________________________</div>
//           </div>
//           <div style={{ marginTop: "5px", color: "black" }}>
//             पत्ता: ____________________________________________________________________________
//           </div>
//         </div>

//         {/* 🔹 UTENSILS LIST */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             gap: "10px",
//             marginTop: "20px",
//           }}
//         >
//           <div style={{ width: "50%" }}>{renderTable(leftList, 0)}</div>
//           <div style={{ width: "50%" }}>
//             {renderTable(rightList, leftList.length)}
//           </div>
//         </div>

//         {/* 🔹 FOOTER */}
//         <div style={{ marginTop: "20px" }}>
//           <div
//             style={{
//               marginTop: "5px",
//               color: "black",
//               fontSize: "14px",
//               borderTop: "1px solid blue",
//             }}
//           >
//             अक्षरी रु.: ____________________________________________________________________________
//           </div>

//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginTop: "20px",
//               fontSize: "14px",
//               paddingTop: "5px",
//               color: "black",
//             }}
//           >
//             <div>पावती घेणाऱ्याची सही</div>
//             <div>(टीप: भांडे २४ तासांकरिता बंधनकारक राहील)</div>
//             <div>{user?.fullname} करीता</div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// export default function PDFDownloadButton({ user, utensils }: Props) {
//   const componentRef = useRef<HTMLDivElement>(null);

//   const handlePrint = useReactToPrint({
//     getContent: () => componentRef.current,
//     documentTitle: `UtensilsReport_${new Date().toISOString().split("T")[0]}`,
//   });

//   return (
//     <div>
//       <button onClick={handlePrint}>Download PDF</button>
//       <UtensilsReport ref={componentRef} user={user} utensils={utensils} />
//     </div>
//   );
// }
