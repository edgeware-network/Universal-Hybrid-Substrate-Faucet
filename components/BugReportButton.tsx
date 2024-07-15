// "use client"
// import { useState } from 'react';

// const BugReportButton = () => {
//   const [showForm, setShowForm] = useState(false);

//   const toggleForm = () => {
//     setShowForm(!showForm);
//   };

//   return (
//     <div>
//       <button
//         className="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-colors duration-300"
//         onClick={toggleForm}
//       >
//         Report a Bug
//       </button>
//       {showForm && (
//         <div className="fixed bottom-20 right-4 bg-white p-6 shadow-lg rounded-lg z-50">
//           <form>
//             <h2 className="text-lg font-bold mb-4">Report a Bug</h2>
//             <label className="block mb-2">
//               Name:
//               <input
//                 type="text"
//                 name="name"
//                 className="mt-1 p-2 border border-gray-300 rounded w-full"
//               />
//             </label>
//             <label className="block mb-2">
//               Email:
//               <input
//                 type="email"
//                 name="email"
//                 className="mt-1 p-2 border border-gray-300 rounded w-full"
//               />
//             </label>
//             <label className="block mb-4">
//               Description:
//               <textarea
//                 name="description"
//                 className="mt-1 p-2 border border-gray-300 rounded w-full"
//               ></textarea>
//             </label>
//             <button
//               type="submit"
//               className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300"
//             >
//               Submit
//             </button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BugReportButton;
