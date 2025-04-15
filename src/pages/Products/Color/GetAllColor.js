import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import { colorsGrid, contextMenuItems, cuttingsGrid } from '../../../data/dummy';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';

const GetAllColor = () => {
  // تعريف الـ state
  let [ordersData, setOrdersData] = useState([]);
  const [data, setData] = useState(ordersData);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingRow, setEditingRow] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    code: '',
  });

  let [runUseEffect, setRun] = useState(0);
  let userNow = useStateContext();
  let token = userNow.auth.token;
  let isDev = process.env.NODE_ENV === 'development';

  // تعريف الـ APIs
  const APIS = isDev ? {
    baseColorUrl: process.env.REACT_APP_API_COLOR_URL,
    getAllColor: () => `${APIS.baseColorUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addColor: () => `${APIS.baseColorUrl}/Add`,
    deleteColor: () => `${APIS.baseColorUrl}/Remove`,
    updateColor: () => `${APIS.baseColorUrl}/Update`,
  } : {
    baseColorUrl: process.env.REACT_APP_API_COLOR_URL,
    getAllColor: () => `${APIS.baseColorUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addColor: () => `${APIS.baseColorUrl}/Add`,
    deleteColor: () => `${APIS.baseColorUrl}/Remove`,
    updateColor: () => `${APIS.baseColorUrl}/Update`,
  };

  // جلب البيانات
  useEffect(() => {
    axios.get(APIS.getAllColor(), {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      if (res.status !== 200) {
        throw Error("Couldn't fetch data for that resource");
      }
      setOrdersData(res.data.data);
      setData(res.data.data);
    })
    .catch(err => {
      console.log(err);
    });
  }, [runUseEffect]);

  // وظائف الفرز والتصفية
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const handleFilter = (key, value) => {
    setFilterConfig({ key, value });
    const filteredData = ordersData.filter((item) =>
      item[key]?.toString().toLowerCase().includes(value.toLowerCase())
    );
    setData(filteredData);
  };

  // وظائف التصدير
  const handleExportToExcel = () => {
    console.log('Exporting to Excel...');
  };

  const handleExportToPdf = () => {
    console.log('Exporting to PDF...');
  };

  // وظائف CRUD
  const handleAdd = async () => {
    if (!newItem.title || !newItem.code) {
        alert("Please fill all required fields");
        return;
    }
    try {
      let res = await axios.post(`${APIS.addColor()}?title=${newItem.title}&code=${newItem.code}`,null, {
        headers: {
          Authorization: token,
        },
      });
      if (res.status === 200) {
        setRun((prev) => prev + 1);
        setIsAdding(false);
        setNewItem({
          title: '',
          code: '',
        });
      }
    } catch(err) {
      console.log(err);
    }
    alert("Item added successfully!");
  };

  const handleDelete = async(id) => {
    try {
      let res = await axios.delete(`${APIS.deleteColor()}?id=${id}`, {
        headers: {
          Authorization: token,
        },
      });
      if (res.status === 200) {
        setRun((prev) => prev + 1);
      }
    } catch {
      console.log("none");
    }
    alert("Item deleted successfully!");
  };

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleSave = async(item) => {
    if (!editingRow.title || !editingRow.code ) {
        alert("Please fill all required fields");
        return;
    }
    try {
    let res = await axios.post(`${APIS.updateColor()}?id=${item.id}&title=${editingRow.title}&code=${editingRow.code}`,null, {
        headers: {
        Authorization: token,
        },
    });
    if (res.status === 200) {
        setRun((prev) => prev + 1);
        setEditingRow(null);
    }
    } catch(err) {
    console.log(err);
    }
    alert("Item edited successfully!");
  };

  // التصفح بين الصفحات
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
        <Header category="Page" title="Colors" />
        <div className="flex justify-end space-x-4 mb-4">
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Export to Excel
          </button>
          <button
            onClick={handleExportToPdf}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Export to PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {colorsGrid.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.headerText}</span>
                      <button
                        onClick={() => handleSort(column.field)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded"
                      >
                        {sortConfig.key === column.field && sortConfig.direction === 'ascending' ? '↑' : '↓'}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Filter"
                      onChange={(e) => handleFilter(column.field, e.target.value)}
                      className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((item, index) => (
  
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  {colorsGrid.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  
                      {editingRow?.id === item.id ? (
                        <input
                          type="text"
                          value={editingRow[column.field]}
                          onChange={(e) =>
                            setEditingRow({ ...editingRow, [column.field]: e.target.value })
                          }
                          
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      ) : (
                        item[column.field]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow?.id === item.id ? (
                      <button
                        onClick={()=>handleSave(item)}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                
              ))}
              {isAdding && (
                <tr className="hover:bg-gray-50 transition-colors duration-200">
                  {colorsGrid.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="text"
                        value={newItem[column.field]}
                        onChange={(e) =>
                          setNewItem({ ...newItem, [column.field]: e.target.value })
                        }
                        placeholder={column.placeholder} 
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
    
              {/* زر إظهار سطر الإضافة */}
              <tr>
                <td colSpan={colorsGrid.length + 1} className="px-6 py-4 text-center">
                  {!isAdding && (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add New Item
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 mx-1 ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              } rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
};

export default GetAllColor;