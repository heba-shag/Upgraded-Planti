import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { mainLandsGrid } from '../../data/dummy';
import { Header } from '../../components';
import { useStateContext } from '../../contexts/ContextProvider';
import axios from 'axios';
import { BiArrowFromBottom, BiArrowFromTop, BiCheckCircle, BiXCircle } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';

const MainLands = () => {
    const [editingRow, setEditingRow] = useState(null);
    const [mainLand, setMainLand] = useState([]);
    const [runUseEffect, setRun] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
      title: '',
      location: '',
      size: 0,
    });
    const [notification, setNotification] = useState({
      show: false,
      message: '',
      type: 'success',
    });

    const userNow = useStateContext();
    const token = userNow.auth.token;
    const isDev = process.env.NODE_ENV === 'development';

    const APIS = isDev ? {
      baseLandUrl: process.env.REACT_APP_API_LAND_URL,
      getAllLand: () => `${APIS.baseLandUrl}/GetAll`,
      addLand: () => `${APIS.baseLandUrl}/Add`,
      deleteLand: () => `${APIS.baseLandUrl}/Remove`,
      updateLand: () => `${APIS.baseLandUrl}/Update`,
    } : {
      baseLandUrl: process.env.REACT_APP_API_LAND_URL,
      getAllLand: () => `${APIS.baseLandUrl}/GetAll`,
      addLand: () => `${APIS.baseLandUrl}/Add`,
      deleteLand: () => `${APIS.baseLandUrl}/Remove`,
      updateLand: () => `${APIS.baseLandUrl}/Update`,
    };

    const showNotification = (message, type = 'success') => {
      setNotification({ show: true, message, type });
      setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
    };

    useEffect(() => {
      axios.get(APIS.getAllLand(), {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          throw Error("Couldn't fetch data for that resource");
        }
        setMainLand(res.data);
      })
      .catch(err => {
        console.log(err);
        showNotification('Failed to fetch data', 'error');
      });
    }, [runUseEffect]);

    const handleAdd = async () => {
      if (!newItem.title || !newItem.size || !newItem.location) {
        showNotification('Please fill all required fields', 'error');
        return;
      }
      try {
        let res = await axios.post(`${APIS.addLand()}`, {
          title: newItem.title,
          location: newItem.location,
          size: newItem.size
        }, {
          headers: {
            Authorization: token,
          },
        });
        if (res.status === 200) {
          setRun((prev) => prev + 1);
          setIsAdding(false);
          setNewItem({
            title: '',
            location: '',
            size: 0,
          });
          showNotification('Item added successfully!');
        }
      } catch(err) {
        console.log(err);
        showNotification('Failed to add item', 'error');
      }
    };

    const handleDelete = async(id) => {
      try {
        let res = await axios.delete(`${APIS.deleteLand()}?id=${id}`, {
          headers: {
            Authorization: token,
          },
        });
        if (res.status === 200) {
          setRun((prev) => prev + 1);
          showNotification('Item deleted successfully!');
        }
      } catch {
        console.log("none");
        showNotification('Failed to delete item', 'error');
      }
    };

    const handleEdit = (row) => {
      setEditingRow({...row.original});
    };

    const handleCancelEdit = () => {
      setEditingRow(null);
    };

    const handleSave = async (item) => {
      if (!editingRow.title || !editingRow.location || !editingRow.size) {
        showNotification('Please fill all required fields', 'error');
        return;
      }
      
      try {
        let res = await axios.post(`${APIS.updateLand()}?id=${item.id}`, {
          title: editingRow.title,
          location: editingRow.location,
          size: editingRow.size
        }, {
          headers: {
            Authorization: token,
          },
        });
        
        if (res.status === 200) {
          setRun((prev) => prev + 1);
          setEditingRow(null);
          showNotification('Item updated successfully!');
        }
      } catch (err) {
        console.log(err);
        showNotification('Error updating item', 'error');
      }
    };

    const columns = useMemo(() => {
      const baseColumns = mainLandsGrid.map((item) => ({
        header: item.headerText,
        accessorKey: item.field,
        cell: ({ row, getValue }) => {
          if (editingRow?.id === row.original.id) {
            return (
              <input
                type={item.field === 'size' ? 'tel' : 'text'}
                value={(editingRow[item.field] || '')}
                onChange={(e) =>
                  setEditingRow({
                    ...editingRow,
                    [item.field]: item.field === 'size' ? parseInt(e.target.value) || 0 : e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            );
          }
          return getValue();
        },
      }));
    
      return [
        ...baseColumns,
        {
          header: 'Actions',
          accessorKey: 'actions',
          cell: ({ row }) => {
            return (
              <div className="flex space-x-3 ">
                {editingRow?.id === row.original.id ? (
                  <>
                    <button
                      onClick={() => handleSave(row.original)}
                      className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm w-16"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm w-16"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm w-16"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.original.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm w-16"
                    >
                      Delete
                    </button>
                    <NavLink to={`${row.original.id}`}>
                      <button
                        className="px-2 py-1 bg-green-200 text-green-800 rounded-md hover:bg-green-300 transition-colors text-sm w-16"
                      >
                        Details
                      </button>
                    </NavLink>
                  </>
                )}
              </div>
            );
          },
        },
      ];
    }, [editingRow]);

  const data = useMemo(() => mainLand, [mainLand]);

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
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl relative">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <BiCheckCircle className="w-6 h-6 mr-2" />
          ) : (
            <BiXCircle className="w-6 h-6 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <Header category="Page" title="Main Lands" />

      <div className="mb-4">
        <input
          type="text"
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="p-2 border rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-center mb-6">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-48 text-center"
          >
            Add New Item
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 border-b text-left hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center ">
                      <span className="font-medium">
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
                {mainLandsGrid.map((column, colIndex) => (
                  <td key={colIndex} className="p-3 border-b">
                    <input
                      type={column.field === 'size' ? 'number' : 'text'}
                      value={newItem[column.field] || ''}
                      onChange={(e) =>
                        setNewItem({ 
                          ...newItem, 
                          [column.field]: column.field === 'size' ? parseInt(e.target.value) || 0 : e.target.value 
                        })
                      }
                      placeholder={column.placeholder || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                ))}
                <td className="p-3 border-b">
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={handleAdd}
                      className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm w-16"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm w-16"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="p-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default MainLands;