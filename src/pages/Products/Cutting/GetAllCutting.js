import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import { cuttingsGrid } from '../../../data/dummy';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';

const GetAllCutting = () => {
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
    type: '',
    age: '',
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  let [runUseEffect, setRun] = useState(0);
  let userNow = useStateContext();
  let token = userNow.auth.token;
  let isDev = process.env.NODE_ENV === 'development';

  const APIS = isDev ? {
    baseCuttingUrl: process.env.REACT_APP_API_CUTTING_URL,
    getAllCutting: () => `${APIS.baseCuttingUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addCutting: () => `${APIS.baseCuttingUrl}/Add`,
    deleteCutting: () => `${APIS.baseCuttingUrl}/Remove`,
    updateCutting: () => `${APIS.baseCuttingUrl}/Update`,
  } : {
    baseCuttingUrl: process.env.REACT_APP_API_CUTTING_URL,
    getAllCutting: () => `${APIS.baseCuttingUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addCutting: () => `${APIS.baseCuttingUrl}/Add`,
    deleteCutting: () => `${APIS.baseCuttingUrl}/Remove`,
    updateCutting: () => `${APIS.baseCuttingUrl}/Update`,
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  useEffect(() => {
    axios.get(APIS.getAllCutting(), {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      if (res.status !== 200) {
        throw Error("Veriler alınamadı");
      }
      setOrdersData(res.data.data);
      setData(res.data.data);
    })
    .catch(err => {
      console.log(err);
      showNotification('Veri alınamadı', 'error');
    });
  }, [runUseEffect]);

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

  const handleAdd = async () => {
    if (!newItem.title || !newItem.type || !newItem.age) {
      showNotification('Lütfen tüm zorunlu alanları doldurun', 'error');
      return;
    }
    try {
      let res = await axios.post(`${APIS.addCutting()}?title=${newItem.title}&type=${newItem.type}&age=${newItem.age}`, null, {
        headers: {
          Authorization: token,
        },
      });
      if (res.status === 200) {
        setRun((prev) => prev + 1);
        setIsAdding(false);
        setNewItem({
          title: '',
          type: '',
          age: '',
        });
        showNotification('Öğe başarıyla eklendi!');
      }
    } catch(err) {
      console.log(err);
      showNotification(err.response?.data?.errorMessage || 'Öğe eklenemedi', 'error');
    }
  };

  const handleDelete = async(id) => {
    try {
      let res = await axios.delete(`${APIS.deleteCutting()}?id=${id}`, {
        headers: {
          Authorization: token,
        },
      });
      if (res.status === 200) {
        setRun((prev) => prev + 1);
        showNotification('Öğe başarıyla silindi!');
      }
    } catch(err) {
      console.log(err);
      showNotification(err.response?.data?.errorMessage || 'Öğe silinemedi', 'error');
    }
  };

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleSave = async(item) => {
    if (!editingRow.title || !editingRow.type || !editingRow.age) {
      showNotification('Lütfen tüm zorunlu alanları doldurun', 'error');
      return;
    }
    try {
      let res = await axios.post(`${APIS.updateCutting()}?id=${item.id}&title=${editingRow.title}&type=${editingRow.type}&age=${editingRow.age}`, null, {
        headers: {
          Authorization: token,
        },
      });
      if (res.status === 200) {
        setRun((prev) => prev + 1);
        setEditingRow(null);
        showNotification('Öğe başarıyla güncellendi!');
      }
    } catch(err) {
      console.log(err);
      showNotification(err.response?.data?.errorMessage || 'Öğe güncellenemedi', 'error');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      <Header title="Fideler" />
  
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {cuttingsGrid.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-between">
                    <span>{column.headerText}</span>
                    <button
                      onClick={() => handleSort(column.field)}
                      className="ml-2 p-1 hover:bg-gray-200 rounded w-8"
                    >
                      {sortConfig.key === column.field && sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrele"
                    onChange={(e) => handleFilter(column.field, e.target.value)}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </th>
              ))}
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                {cuttingsGrid.map((column, colIndex) => (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    {editingRow?.id === item.id ? (
                      <button
                        onClick={() => handleSave(item)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 w-16 flex justify-center transition-colors"
                      >
                        Kaydet
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-16 flex justify-center transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 w-16 flex justify-center transition-colors"
                        >
                          Sil
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {isAdding && (
              <tr className="hover:bg-gray-50 transition-colors duration-200">
                {cuttingsGrid.map((column, colIndex) => (
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={handleAdd}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 w-16 transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 w-16 flex justify-center transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            <tr>
              <td colSpan={cuttingsGrid.length + 1} className="px-6 py-4 text-center">
                {!isAdding && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-40 transition-colors"
                  >
                    Yeni Ekle
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
            className={`px-4 py-2 mx-1 w-10 ${
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

export default GetAllCutting;