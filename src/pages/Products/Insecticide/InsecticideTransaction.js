import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';
import { MdOutlineAddTask } from 'react-icons/md';

const InsecticideTransaction = () => {
  const [insecticideTransaction, setInsecticideTransaction] = useState([]);
  const [insecticides, setInsecticides] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [addConfirmation, setAddConfirmation] = useState(false);
  const [showDonemessage, setShowDoneMessage] = useState(false);
  const [runUseEffect, setRun] = useState(0);
  
  const [formData, setFormData] = useState({
    insecticideId: "",
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    isAdd: true
  });
  
  const userNow = useStateContext();
  const token = userNow.auth.token;
  const isDev = process.env.NODE_ENV === 'development';

  const APIS = {
    insecticideStoreBaseUrl: isDev ? process.env.REACT_APP_API_INSECTICIDESTORE_URL : process.env.REACT_APP_API_INSECTICIDESTORE_URL,
    getAllInsecticideTransaction: () => `${APIS.insecticideStoreBaseUrl}/GetInsecticideTransaction?pageSize=1000000000&pageNum=0`,
    getAllInsecticide: () => `${APIS.insecticideStoreBaseUrl}/GetAllInsecticideStore?pageSize=1000000000&pageNum=0`,
    updateInsecticideTransaction: (insecticideId, quantity, date, isAdd) => 
      `${APIS.insecticideStoreBaseUrl}/UpdateStore?insecticideId=${insecticideId}&quantity=${quantity}&date=${date}&isAdd=${isAdd}`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, insecticidesRes] = await Promise.all([
          axios.get(APIS.getAllInsecticideTransaction(), { headers: { Authorization: token } }),
          axios.get(APIS.getAllInsecticide(), { headers: { Authorization: token } })
        ]);
        
        if (transactionsRes.status === 200) {
          setInsecticideTransaction(transactionsRes.data.data);
          setData(transactionsRes.data.data);
          setFilteredData(transactionsRes.data.data);
        }
        
        if (insecticidesRes.status === 200) {
          setInsecticides(insecticidesRes.data.data);
        }
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      }
    };
    fetchData();
  }, [runUseEffect]);

  const getNestedValue = (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
  };

  const getTypeDisplay = (type) => {
    return type === 0 ? 'Sıvı ilaç' : 'Toz ilaç';
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      const valueA = getNestedValue(a, key);
      const valueB = getNestedValue(b, key);
      
      if (valueA === null) return 1;
      if (valueB === null) return -1;
      if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
      if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleFilter = (key, value) => {
    setFilterConfig({ key, value });
    const filtered = data.filter(item => {
      const itemValue = String(getNestedValue(item, key) || '');
      return itemValue.toLowerCase().includes(value.toLowerCase());
    });
    setFilteredData(filtered);
  };

  const addFunction = async () => {
    try {
      const { insecticideId, quantity, date, isAdd } = formData;
      const response = await axios.post(
        APIS.updateInsecticideTransaction(insecticideId, quantity, date, isAdd), 
        null, 
        { headers: { Authorization: token } }
      );
      
      if (response.status === 200) {
        setAddConfirmation(false);
        setRun(prev => prev + 1);
        setShowDoneMessage(true);
        setTimeout(() => setShowDoneMessage(false), 2000);
        setFormData({
          insecticideId: "",
          quantity: 0,
          date: new Date().toISOString().split('T')[0],
          isAdd: true
        });
      }
    } catch (error) {
      console.error("İşlem ekleme hatası:", error);
    }
  };

  const cancelFunction = () => {
    setAddConfirmation(false);
    setFormData({
      insecticideId: "",
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      isAdd: true
    });
  };

  const handleAddClick = () => {
    setAddConfirmation(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const columns = [
    { field: 'date', headerText: 'Tarih', placeholder: 'Tarih filtrele' },
    { field: 'insecticide.title', headerText: 'Bilimsel Adı', placeholder: 'Bilimsel ad filtrele' },
    { field: 'insecticide.publicTitle', headerText: 'Ad', placeholder: 'Ad filtrele' },
    { field: 'quantityChange', headerText: 'Miktar Değişimi', placeholder: 'Miktar filtrele' },
    { field: 'insecticide.type', headerText: 'Tür', placeholder: 'Tür filtrele' },
    { field: 'insecticide.description', headerText: 'Açıklama', placeholder: 'Açıklama filtrele' },
    { field: 'isAdd', headerText: 'Ekleme mi?', placeholder: 'İşlem türü filtrele' },
  ];

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header title="İlaç Stok İşlemleri" />
      
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex justify-center items-center"
          style={{ width: '200px' }}
        >
          <MdOutlineAddTask className="mr-2" />
          Stok İşlemi Ekle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-between">
                    <span>{column.headerText}</span>
                    <button
                      onClick={() => handleSort(column.field)}
                      className="ml-2 p-1 hover:bg-gray-200 rounded w-6 h-6 flex items-center justify-center"
                    >
                      {sortConfig.key === column.field && sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={column.placeholder}
                    onChange={(e) => handleFilter(column.field, e.target.value)}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                {columns.map((column, colIndex) => {
                  const value = getNestedValue(item, column.field);
                  let displayValue = value;
                  
                  if (column.field === 'isAdd') {
                    displayValue = value ? 'Evet' : 'Hayır';
                  } else if (column.field === 'insecticide.type') {
                    displayValue = getTypeDisplay(value);
                  }
                  
                  return (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {displayValue !== null && displayValue !== undefined ? displayValue : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 space-x-1">
        {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`w-8 h-8 flex items-center justify-center text-sm ${
              currentPage === i + 1 
                ? 'bg-blue-500 text-white font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } rounded-md transition-colors duration-200`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {addConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Stok İşlemi Ekle</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">İlaç</label>
              <select
                name="insecticideId"
                value={formData.insecticideId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">İlaç seçin</option>
                {insecticides.map(insecticide => (
                  <option key={insecticide.insecticide.id} value={insecticide.insecticide.id}>
                    {insecticide.insecticide.publicTitle} ({insecticide.insecticide.title})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Miktar</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isAdd"
                name="isAdd"
                checked={formData.isAdd}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAdd" className="ml-2 block text-sm text-gray-700">
                Stok Ekleme mi?
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelFunction}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                İptal
              </button>
              <button
                onClick={addFunction}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!formData.insecticideId}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {showDonemessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          İşlem başarıyla tamamlandı!
        </div>
      )}
    </div>
  );
};

export default InsecticideTransaction;