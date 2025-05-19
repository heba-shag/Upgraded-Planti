import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Header } from '../../components';
import { useStateContext } from '../../contexts/ContextProvider';
import axios from 'axios';
import { BiArrowFromBottom, BiArrowFromTop } from 'react-icons/bi';
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';

const employeesGrid = [
  { 
    field: 'name',
    headerText: 'Ad',
    width: '150',
    textAlign: 'Center',
  },
  { 
    field: 'isLocal',
    headerText: 'Yerel Mi?',
    width: '170',
    textAlign: 'Center',
  },
  {
    field: 'fullPhoneNumber',
    headerText: 'Telefon Numarası',
    width: '200',
    textAlign: 'Center',
  },
];

const Customers = () => {
  const [editingRow, setEditingRow] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    isLocal: true,
    phoneNumber: "",
    codePhoneNumber: "",
    fullPhoneNumber: ""
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    id: null
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const userNow = useStateContext();
  const token = userNow.auth.token;
  let isDev = process.env.NODE_ENV === 'development';

  // API configuration
  const clientApi = isDev ? {
    baseUrl: process.env.REACT_APP_API_CLIENT_URL,
    deleteClient: (id) => `${clientApi.baseUrl}/Remove?id=${id}`,
    updateClient: (id) => `${clientApi.baseUrl}/Update?id=${id}`,
    getAllClient: () => `${clientApi.baseUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addClient: () => `${clientApi.baseUrl}/Add`,
  } : {
    baseUrl: process.env.REACT_APP_API_CLIENT_URL,
    deleteClient: (id) => `${clientApi.baseUrl}/Remove?id=${id}`,
    updateClient: (id) => `${clientApi.baseUrl}/Update?id=${id}`,
    getAllClient: () => `${clientApi.baseUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addClient: () => `${clientApi.baseUrl}/Add`,
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Fetch customers data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(clientApi.getAllClient(), {
          headers: { Authorization: token },
        });
        // Combine code and phone number for display
        const formattedCustomers = res.data.data.map(customer => ({
          ...customer,
          fullPhoneNumber: `${customer.codePhoneNumber || ''} ${customer.phoneNumber || ''}`.trim()
        }));
        setCustomers(formattedCustomers);
      } catch (err) {
        showNotification("Müşteriler getirilirken hata oluştu", 'error');
        console.error("Müşteriler getirilirken hata oluştu:", err);
      }
    };
    fetchCustomers();
  }, [refreshTrigger, token]);

  // Handle phone number changes
  const handlePhoneNumberChange = (value, isEditing = false) => {
    if (!value) {
      if (isEditing) {
        setEditingRow(prev => ({
          ...prev,
          phoneNumber: '',
          codePhoneNumber: '',
          fullPhoneNumber: ''
        }));
      } else {
        setNewItem(prev => ({
          ...prev,
          phoneNumber: '',
          codePhoneNumber: '',
          fullPhoneNumber: ''
        }));
      }
      return;
    }

    const phoneNumber = parsePhoneNumber(value);
    if (phoneNumber) {
      const code = `+${phoneNumber.countryCallingCode}`;
      const number = phoneNumber.nationalNumber;
      
      if (isEditing) {
        setEditingRow(prev => ({
          ...prev,
          phoneNumber: number,
          codePhoneNumber: code,
          fullPhoneNumber: value
        }));
      } else {
        setNewItem(prev => ({
          ...prev,
          phoneNumber: number,
          codePhoneNumber: code,
          fullPhoneNumber: value
        }));
      }
    }
  };

  // Add new customer
  const handleAdd = async () => {
    if (!newItem.name) {
      showNotification("Lütfen müşteri adını giriniz", 'warning');
      return;
    }
    
    try {
      const res = await axios.post(clientApi.addClient(), {
        name: newItem.name,
        isLocal: newItem.isLocal,
        phoneNumber: newItem.phoneNumber,
        codePhoneNumber: newItem.codePhoneNumber,
      }, { 
        headers: { Authorization: token } 
      });

      if (res.status === 200) {
        setRefreshTrigger(prev => prev + 1);
        setIsAdding(false);
        setNewItem({
          name: '',
          isLocal: true,
          phoneNumber: '',
          codePhoneNumber: '',
          fullPhoneNumber: ''
        });
        showNotification("Müşteri başarıyla eklendi!", 'success');
      }
    } catch(err) {
      showNotification("Müşteri eklenirken hata oluştu", 'error');
      console.error("Müşteri eklenirken hata oluştu:", err);
    }
  };

  // Delete customer confirmation
  const confirmDelete = (id) => {
    setDeleteConfirm({
      open: true,
      id: id
    });
  };

  // Delete customer
  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    
    try {
      const res = await axios.delete(clientApi.deleteClient(deleteConfirm.id), {
        headers: { Authorization: token },
      });
      if (res.status === 200) {
        setRefreshTrigger(prev => prev + 1);
        showNotification("Müşteri başarıyla silindi", 'success');
      }
    } catch (err) {
      showNotification("Müşteri silinirken hata oluştu", 'error');
      console.error("Müşteri silinirken hata oluştu:", err);
    } finally {
      setDeleteConfirm({
        open: false,
        id: null
      });
    }
  };

  // Start editing
  const handleEdit = (row) => {
    setEditingRow({
      ...row.original,
      fullPhoneNumber: `${row.original.codePhoneNumber || ''} ${row.original.phoneNumber || ''}`.trim()
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  // Save edits
  const handleSave = async (item) => {
    if (!editingRow.name) {
      showNotification("Lütfen müşteri adını giriniz", 'warning');
      return;
    }
    
    try {
      const res = await axios.post(clientApi.updateClient(item.id), {
        name: editingRow.name,
        isLocal: editingRow.isLocal,
        phoneNumber: editingRow.phoneNumber,
        codePhoneNumber: editingRow.codePhoneNumber,
      }, {
        headers: { Authorization: token },
      });
      
      if (res.status === 200) {
        setRefreshTrigger(prev => prev + 1);
        setEditingRow(null);
        showNotification("Müşteri başarıyla güncellendi", 'success');
      }
    } catch (err) {
      showNotification("Müşteri güncellenirken hata oluştu", 'error');
      console.error("Müşteri güncellenirken hata oluştu:", err);
    }
  };

  // Table columns
  const columns = useMemo(() => {
    const baseColumns = employeesGrid.map((item) => ({
      header: item.headerText,
      accessorKey: item.field,
      cell: ({ row, getValue }) => {
        if (editingRow?.id === row.original.id) {
          if (item.field === 'fullPhoneNumber') {
            return (
              <PhoneInput
                placeholder="Telefon numarası giriniz"
                defaultCountry="TR"
                value={editingRow.fullPhoneNumber}
                onChange={(value) => handlePhoneNumberChange(value, true)}
                format="international"
                maxLength="15"
                className="w-full border border-gray-300 rounded-md p-1"
              />
            );
          }
          if (item.field === 'isLocal') {
            return (
              <input
                type="checkbox"
                checked={editingRow.isLocal}
                onChange={(e) =>
                  setEditingRow({
                    ...editingRow,
                    isLocal: e.target.checked
                  })
                }
                className="h-4 w-4"
              />
            );
          }
          return (
            <input
              type="text"
              value={editingRow[item.field] || ''}
              onChange={(e) =>
                setEditingRow({
                  ...editingRow,
                  [item.field]: e.target.value
                })
              }
              className="w-full px-2 py-1 border border-gray-300 rounded-md"
            />
          );
        }
        
        // Display values for non-editing rows
        if (item.field === 'isLocal') {
          return row.original.isLocal ? 'Evet' : 'Hayır';
        }
        return getValue();
      },
    }));
  
    return [
      ...baseColumns,
      {
        header: 'İşlemler',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            {editingRow?.id === row.original.id ? (
              <>
                <button 
                  onClick={() => handleSave(row.original)} 
                  className="px-2 py-1 bg-green-500 text-white rounded-md flex justify-center hover:bg-green-600"
                >
                  Kaydet
                </button>
                <button 
                  onClick={handleCancelEdit} 
                  className="px-2 py-1 bg-gray-500 text-white rounded-md flex justify-center hover:bg-gray-600 ml-2"
                >
                  İptal
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleEdit(row)} 
                  className="px-2 py-1 bg-blue-500 text-white rounded-md flex justify-center hover:bg-blue-600"
                >
                  Düzenle
                </button>
                <button 
                  onClick={() => confirmDelete(row.original.id)} 
                  className="px-2 py-1 bg-red-500 text-white rounded-md flex justify-center hover:bg-red-600 ml-2"
                >
                  Sil
                </button>
              </>
            )}
          </div>
        ),
      },
    ];
  }, [editingRow]);

  const data = useMemo(() => customers, [customers]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header title="Müşteriler" />

      <div className="mb-4">
        <input
          type="text"
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Ara..."
          className="p-2 border rounded w-full md:w-1/3"
        />
      </div>

      <div className="mb-4">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4 flex justify-center"
            style={{ width: '200px' }}
          >
            Müşteri Ekle
          </button>
        )}
      </div>

      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2 border-b text-left hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    <span className="ml-2 text-gray-400">
                      {header.column.getIsSorted() === 'asc' ? (
                        <BiArrowFromTop className="w-4 h-4 text-blue-500" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <BiArrowFromBottom className="w-4 h-4 text-blue-500" />
                      ) : (
                        <BiArrowFromBottom className="w-4 h-4 opacity-50 hover:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isAdding && (
            <tr className="hover:bg-gray-50">
              {employeesGrid.map((column, colIndex) => (
                <td key={colIndex} className="p-2 border-b">
                  {column.field === 'fullPhoneNumber' ? (
                    <PhoneInput
                      placeholder="Telefon numarası giriniz"
                      defaultCountry="TR"
                      value={newItem.fullPhoneNumber}
                      onChange={handlePhoneNumberChange}
                      format="international"
                      maxLength="15"
                      className="w-full border border-gray-300 rounded-md p-1"
                    />
                  ) : column.field === 'isLocal' ? (
                    <input
                      type="checkbox"
                      checked={newItem.isLocal}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          isLocal: e.target.checked
                        })
                      }
                      className="h-4 w-4"
                    />
                  ) : (
                    <input
                      type="text"
                      value={newItem[column.field] || ''}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          [column.field]: e.target.value
                        })
                      }
                      placeholder={column.placeholder || ''}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    />
                  )}
                </td>
              ))}
              <td className="p-2 border-b">
                <button
                  onClick={handleAdd}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  İptal
                </button>
              </td>
            </tr>
          )}

          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 border-b">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Önceki
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2">
          <span>
            Sayfa{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </strong>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Göster {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirm.open} 
        onClose={() => setDeleteConfirm({ open: false, id: null })}
      >
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>Bu müşteriyi silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton 
            onClick={() => setDeleteConfirm({ open: false, id: null })}
            color="primary"
          >
            İptal
          </MuiButton>
          <MuiButton 
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Sil
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Customers;