// import React, { useMemo, useState, useEffect } from 'react';
// import {
//   useReactTable,
//   getCoreRowModel,
//   getSortedRowModel,
//   getPaginationRowModel,
//   getFilteredRowModel,
//   flexRender,
// } from '@tanstack/react-table';
// import { employeesGrid } from '../../data/dummy';
// import { Header } from '../../components';
// import axios from 'axios';
// import { BiEdit, BiTrash, BiPlusCircle } from 'react-icons/bi';
// import { useNavigate } from 'react-router-dom';
// import { useStateContext } from '../../contexts/ContextProvider';
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

// const Orders = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [deleteId, setDeleteId] = useState("");
//   const [editId, setEditId] = useState("");
//   const [isBoughtDate, setIsBoughtDate] = useState(new Date().toISOString());
//   const [deleteConfirmation, setDeleteConfirmation] = useState(false);
//   const [editConfirmation, setEditConfirmation] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [newClient, setNewClient] = useState({
//     number: "",
//     isBought: true,
//     clientId: 0,
//     orderDate: new Date().toLocaleDateString,
//     boughtDate:  new Date().toLocaleDateString,
//     flowerOrderDetails: [
//         {
//         count: 0,
//         code: "",
//         long: 0
//         }
//     ]
//   });
//   const [addError, setAddError] = useState('');
  
//   const navigate = useNavigate();
//   const UserNow = useStateContext();
//   const token = UserNow.auth.token;

//   // API configuration
//   let isDev=process.env.NODE_ENV === 'development';
//     const flowerOrderApi = isDev? {
//         baseClientUrl: process.env.REACT_APP_API_CLIENT_URL,
//         addClient:()=>{return (`${flowerOrderApi.baseClientUrl}/Add`)},
//         getAllClient:()=>{return (`${flowerOrderApi.baseClientUrl}/GetAll?pageSize=1000000000&pageNum=0`)},

//         baseFlowerUrl: process.env.REACT_APP_API_FLOWER_URL,
//         getAllFlower:()=>{return (`${flowerOrderApi.baseFlowerUrl}/GetAllFlowerStore?pageSize=1000000000&pageNum=0`)},

//         baseOrderUrl: process.env.REACT_APP_API_ORDER_URL,
//         addOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/Add`)} ,
//         deleteOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/Remove?id=${deleteId}`)},
//         UpdateOrderStatus:()=>{return (`${flowerOrderApi.baseOrderUrl}/UpdateOrderStatus?orderId=${editId}&boughtDate=${isBoughtDate}`)},
//         UpdateOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/UpdateOrder`)},
//         getAllOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/GetAll`)},
//     }:{
//         baseClientUrl: process.env.REACT_APP_API_CLIENT_URL,
//         addClient:()=>{return (`${flowerOrderApi.baseClientUrl}/Add`)},
//         getAllClient:()=>{return (`${flowerOrderApi.baseClientUrl}/GetAll?pageSize=1000000000&pageNum=0`)},

//         baseFlowerUrl: process.env.REACT_APP_API_FLOWER_URL,
//         getAllFlower:()=>{return (`${flowerOrderApi.baseFlowerUrl}/GetAllFlowerStore?pageSize=1000000000&pageNum=0`)},

//         baseOrderUrl: process.env.REACT_APP_API_ORDER_URL,
//         addOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/Add`)} ,
//         deleteOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/Remove?id=${deleteId}`)},
//         UpdateOrderStatus:()=>{return (`${flowerOrderApi.baseOrderUrl}/UpdateOrderStatus?orderId=${editId}&boughtDate=${isBoughtDate}`)},
//         UpdateOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/UpdateOrder`)},
//         getAllOrder:()=>{return (`${flowerOrderApi.baseOrderUrl}/GetAll`)},
//     }

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(clientApi.getAllClient(), {
//           headers: {
//             Authorization: token,
//           },
//         });
//         setData(response.data.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [token]);

//   const handleAddPhoneNumber = (value) => {
//     if (!value) {
//       setNewClient(prev => ({...prev, phoneNumber: '', callingNumber: '', phoneInput: ''}));
//       return;
//     }
    
//     const phone = parsePhoneNumberFromString(value);
//     if (phone) {
//       setNewClient(prev => ({
//         ...prev,
//         callingNumber: phone.countryCallingCode,
//         phoneNumber: phone.nationalNumber,
//         phoneInput: value
//       }));
//     } else {
//       console.error('Invalid phone number format');
//       setNewClient(prev => ({...prev, phoneInput: value}));
//     }
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(clientApi.addClient(), {
//         name: newClient.name,
//         isLocal: newClient.isLocal,
//         phoneNumber: newClient.phoneNumber,
//         codePhoneNumber: newClient.callingNumber
//       }, {
//         headers: {
//           Authorization: token,
//         },
//       });

//       if (res.status === 200) {
//         setData([...data, res.data.data]);
//         setIsAddModalOpen(false);
//         setNewClient({
//           name: '',
//           isLocal: false,
//           phoneNumber: '',
//           callingNumber: '',
//           phoneInput: ''
//         });
//         setSuccessMessage("Client added successfully");
//         setTimeout(() => setSuccessMessage(""), 2000);
//       }
//     } catch (err) {
//       setAddError(err.response?.data?.errorMessage || 'Failed to add client');
//     }
//   };

//   const columns = useMemo(() => {
//     return [
//       ...employeesGrid.map((item) => ({
//         header: item.headerText,
//         accessorKey: item.field,
//       })),
//       {
//         header: 'Actions',
//         cell: ({ row }) => (
//           <div className="flex gap-2">
//             <button 
//               onClick={() => handleEdit(row.original.id)}
//               className="text-blue-500 hover:text-blue-700"
//             >
//               <BiEdit size={20} />
//             </button>
//             <button 
//               onClick={() => handleDelete(row.original.id)}
//               className="text-red-500 hover:text-red-700"
//             >
//               <BiTrash size={20} />
//             </button>
//           </div>
//         ),
//       },
//     ];
//   }, []);

//   const handleDelete = (id) => {
//     setDeleteId(id);
//     setDeleteConfirmation(true);
//   };

//   const handleEdit = (id) => {
//     setEditId(id);
//     setEditConfirmation(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       const res = await axios.delete(clientApi.deleteClient(), {
//         headers: {
//           Authorization: token,
//         },
//       });
//       if (res.status === 200) {
//         setData(data.filter(item => item.id !== deleteId));
//         setSuccessMessage("Client deleted successfully");
//         setTimeout(() => setSuccessMessage(""), 2000);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setDeleteConfirmation(false);
//     }
//   };

//   const confirmEdit = async () => {
//     try {
//       const res = await axios.post(clientApi.updateClient(), {}, {
//         headers: {
//           Authorization: token,
//         },
//       });
//       if (res.status === 200) {
//         setData(data.map(item => 
//           item.id === editId ? { ...item, boughtDate: isBoughtDate } : item
//         ));
//         setSuccessMessage("Client updated successfully");
//         setTimeout(() => setSuccessMessage(""), 2000);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setEditConfirmation(false);
//     }
//   };

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     initialState: {
//       pagination: {
//         pageSize: 5,
//       },
//     },
//   });

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
//       <Header category="Page" title="Employees" />

//       {/* Action Buttons */}
//       <div className="flex justify-between mb-4">
//         <div className="w-1/2">
//           <input
//             type="text"
//             value={table.getState().globalFilter || ''}
//             onChange={(e) => table.setGlobalFilter(e.target.value)}
//             placeholder="Search..."
//             className="p-2 border rounded w-full md:w-1/2"
//           />
//         </div>
//         <button
//           onClick={() => setIsAddModalOpen(true)}
//           className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           <BiPlusCircle size={18} />
//           Add New Client
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id} className="border-b">
//                 {headerGroup.headers.map((header) => (
//                   <th
//                     key={header.id}
//                     className="p-2 text-left cursor-pointer hover:bg-gray-50"
//                     onClick={header.column.getToggleSortingHandler()}
//                   >
//                     <div className="flex items-center">
//                       {flexRender(header.column.columnDef.header, header.getContext())}
//                       {{
//                         asc: ' 🔼',
//                         desc: ' 🔽',
//                       }[header.column.getIsSorted()] ?? null}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map((row) => (
//               <tr key={row.id} className="hover:bg-gray-50">
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="p-2 border-b">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Controls */}
//       <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
//         <div className="flex gap-2">
//           <button
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="p-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <button
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="p-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//         <div className="flex items-center gap-4">
//           <span>
//             Page{' '}
//             <strong>
//               {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
//             </strong>
//           </span>
//           <select
//             value={table.getState().pagination.pageSize}
//             onChange={(e) => table.setPageSize(Number(e.target.value))}
//             className="p-2 border rounded"
//           >
//             {[5, 10, 20].map((size) => (
//               <option key={size} value={size}>
//                 Show {size}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Add Client Modal */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg max-w-md w-full">
//             <h3 className="text-lg font-medium mb-4">Add New Client</h3>
            
//             {addError && (
//               <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
//                 {addError}
//               </div>
//             )}
            
//             <form onSubmit={handleAddSubmit}>
//               <div className="mb-4">
//                 <label className="block mb-2">Name:</label>
//                 <input
//                   type="text"
//                   value={newClient.name}
//                   onChange={(e) => setNewClient(prev => ({...prev, name: e.target.value}))}
//                   className="p-2 border rounded w-full"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={newClient.isLocal}
//                     onChange={(e) => setNewClient(prev => ({...prev, isLocal: e.target.checked}))}
//                     className="mr-2"
//                   />
//                   Is Local
//                 </label>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block mb-2">Phone Number:</label>
//                 <input
//                   type="tel"
//                   value={newClient.phoneInput}
//                   onChange={(e) => handleAddPhoneNumber(e.target.value)}
//                   className="p-2 border rounded w-full"
//                   required
//                 />
//               </div>
              
//               <div className="flex justify-end gap-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsAddModalOpen(false);
//                     setAddError('');
//                   }}
//                   className="px-4 py-2 border rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 >
//                   Add Client
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteConfirmation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg max-w-md w-full">
//             <div className='flex justify-center mb-4'>
//               <img src="/recyclebin.png" alt="Delete" className="h-16" />
//             </div>
//             <p className='text-center mb-6'>Are you sure you want to delete this client?</p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => setDeleteConfirmation(false)}
//                 className="px-4 py-2 border rounded"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Confirmation Modal */}
//       {editConfirmation && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-lg max-w-md w-full">
//             <h3 className="text-lg font-medium mb-4 text-center">Update Client</h3>
//             <div className="mb-4">
//               <label className="block mb-2">Bought Date:</label>
//               <input
//                 type="datetime-local"
//                 value={isBoughtDate}
//                 onChange={(e) => setIsBoughtDate(e.target.value)}
//                 className="p-2 border rounded w-full"
//               />
//             </div>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => setEditConfirmation(false)}
//                 className="px-4 py-2 border rounded"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmEdit}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Update
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Message */}
//       {successMessage && (
//         <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
//           {successMessage}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Orders;