import React, { useEffect, useMemo, useState } from 'react';
// import { toEnglishNumber } from 'some-number-conversion-library';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import {  mainLandsGrid } from '../../data/dummy';
import { Header } from '../../components';
import { useStateContext } from '../../contexts/ContextProvider';
import axios from 'axios';
import { BiArrowFromBottom, BiArrowFromTop } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';

const SecLands = () => {
    let [editingRow,setEditingRow]=useState(null);
    let [mainLand,setMainLand]=useState([]);
    let [runUseEffect, setRun] = useState(0);
    let [isAdding, setIsAdding] = useState(false);
    let [newItem, setNewItem] = useState({
      title: '',
      location: '',
      size:0,
      parentId:0
    });
    let id=window.location.pathname.split("/").slice(-1)[0];
    let [parent,setParent]=useState({});
    let userNow = useStateContext();
    let token = userNow.auth.token;

    let isDev = process.env.NODE_ENV === 'development';

    // تعريف الـ APIs
    const APIS = isDev ? {
      baseLandUrl: process.env.REACT_APP_API_LAND_URL,
      getAllLand: () => `${APIS.baseLandUrl}/GetById?id=${id}`,
      addLand: () => `${APIS.baseLandUrl}/Add`,
      deleteLand: () => `${APIS.baseLandUrl}/Remove`,
      updateLand: () => `${APIS.baseLandUrl}/Update`,
    } : {
      baseLandUrl: process.env.REACT_APP_API_LAND_URL,
      getAllLand: () => `${APIS.baseLandUrl}/GetById?id=${id}`,
      addLand: () => `${APIS.baseLandUrl}/Add`,
      deleteLand: () => `${APIS.baseLandUrl}/Remove`,
      updateLand: () => `${APIS.baseLandUrl}/Update`,
    };
  
    // جلب البيانات
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
        setParent(res.data);
        setMainLand(res.data.children);
      })
      .catch(err => {
        console.log(err);
      });
    }, [runUseEffect]);

    // وظائف CRUD
    const handleAdd = async () => {
      if (!newItem.title || !newItem.size ||!newItem.location) {
          alert("Please fill all required fields");
          return;
      }
      try {
        let res = await axios.post(`${APIS.addLand()}`,{
            title:newItem.title,
            location:newItem.location,
            size:newItem.size,
            parentId:parent.id,
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
            size:0,
            parentId:0
          });
          alert("Item added successfully!");
        }
      } catch(err) {
        alert(err.response.data.errorMessage);
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
          alert("Item deleted successfully!");

        }
      } catch {
        console.log("none");
      }
    };

    const handleEdit = (row) => {

      setEditingRow({...row.original} );

    }
 

    const handleCancelEdit = () => {
      setEditingRow(null);
    };

    const handleSave = async (item) => {


      if (!editingRow.title || !editingRow.location || !editingRow.size) {
        alert("Please fill all required fields");
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
        }
      } catch (err) {        
        alert(err.response.data.errorMessage);

      }
    };

    const columns = useMemo(() => {
      const baseColumns = mainLandsGrid.map((item) => ({
        header: item.headerText,
        accessorKey: item.field,
        meta: {
            type: item.field === 'size' ? 'tel' : 'text',
          },
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
                className="w-full px-2 py-1 border border-gray-300 rounded-md"
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
          cell: ({ row }) => {
            return (
              <div className="flex space-x-2">
                {editingRow?.id === row.original.id ? (
                  <>
                    <button
                      onClick={() => handleSave(row.original)}
                      className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 ml-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.original.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 ml-2"
                    >
                      Delete
                    </button>
                    <NavLink to={`${row.original.id}`}>
                      <button
                        className="px-2 py-1 bg-green-500 text-black rounded-md hover:bg-green-600 ml-2"
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
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title={`${parent.title}`} />

      <div className="mb-4">
        <input
          type="text"
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add New Item
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
              {mainLandsGrid.map((column, colIndex) => (
                <td key={colIndex} className="p-2 border-b">
                  <input
                    type={column.field === 'size' ? 'tel' : 'text'}
                    value={newItem[column.field] || ''}
                    onChange={(e) =>
                      setNewItem({ 
                        ...newItem, 
                        [column.field]: column.field === 'size' ? parseInt(e.target.value) || 0 : e.target.value 
                      })
                    }
                    placeholder={column.placeholder || ''}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  />
                </td>
              ))}
              <td className="p-2 border-b">
                <button
                  onClick={handleAdd}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Cancel
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

      {/* عناصر التحكم في التصفح */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 bg-gray-200 rounded ml-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div>
          <span>
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>{' '}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="p-2 border rounded"
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

export default SecLands;