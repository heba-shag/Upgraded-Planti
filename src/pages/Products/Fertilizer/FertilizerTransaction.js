import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';
import { MdOutlineAddTask } from 'react-icons/md';

const FertilizerTransaction = () => {
  const [fertilizerTransaction, setFertilizerTransaction] = useState([]);
  const [fertilizers, setFertilizers] = useState([]); // New state for fertilizers list
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [codeFilter, setCodeFilter] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [addConfirmation, setAddConfirmation] = useState(false);
  const [showDonemessage, setShowDoneMessage] = useState(false);
  const [runUseEffect, setRun] = useState(0);
  
  // New state for add form
  const [formData, setFormData] = useState({
    fertilizerId: "",
    quantity: 0,
    date: new Date().toISOString().split('T')[0], // Default to today
    isAdd: true
  });
  
  const userNow = useStateContext();
  const token = userNow.auth.token;
  const isDev = process.env.NODE_ENV === 'development';

  const APIS = {
    fertilizerStoreBaseUrl: isDev ? process.env.REACT_APP_API_FERTILIZERSTORE_URL : process.env.REACT_APP_API_FERTILIZERSTORE_URL,
    getAllFertilizerTransaction: () => `${APIS.fertilizerStoreBaseUrl}/GetFertilizerTransaction?pageSize=1000000000&pageNum=0`,
    getAllFertilizer: () => `${APIS.fertilizerStoreBaseUrl}/GetAllFertilizerStore?pageSize=1000000000&pageNum=0`,
    updateFertilizerTransaction: (fertilizerId, quantity, date, isAdd) => 
      `${APIS.fertilizerStoreBaseUrl}/UpdateStore?fertilizerId=${fertilizerId}&quantity=${quantity}&date=${date}&isAdd=${isAdd}`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const res = await axios.get(APIS.getAllFertilizerTransaction(), {
          headers: {
            Authorization: token,
          },
        });
        
        // Fetch fertilizers list
        const fertilizersRes = await axios.get(APIS.getAllFertilizer(), {
          headers: {
            Authorization: token,
          },
        });
        
        if (res.status === 200) {
          setFertilizerTransaction(res.data.data);
          setData(res.data.data);
          setFilteredData(res.data.data);
        }
        
        if (fertilizersRes.status === 200) {
          setFertilizers(fertilizersRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [runUseEffect]);

  const getNestedValue = (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
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
      const itemValue = String(getNestedValue(item, key) || '').toLowerCase();
      return itemValue.includes(value.toLowerCase());
    });
    setFilteredData(filtered);
  };

  const addFunction = async () => {
    try {
      const { fertilizerId, quantity, date, isAdd } = formData;
      const response = await axios.post(
        APIS.updateFertilizerTransaction(fertilizerId, quantity, date, isAdd), 
        null, 
        {
          headers: {
            Authorization: token
          }
        }
      );
      
      if (response.status === 200) {
        setAddConfirmation(false);
        setRun(prev => prev + 1);
        setShowDoneMessage(true);
        setTimeout(() => setShowDoneMessage(false), 2000);
        // Reset form
        setFormData({
          fertilizerId: "",
          quantity: 0,
          date: new Date().toISOString().split('T')[0],
          isAdd: true
        });
      }
    } catch (error) {
      console.error("Error adding fertilizer transaction:", error);
    }
  };

  const cancelFunction = () => {
    setAddConfirmation(false);
    // Reset form
    setFormData({
      fertilizerId: "",
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
    { field: 'date', headerText: 'Date', placeholder: 'Date' },
    { field: 'fertilizer.title', headerText: 'Scientific Name', placeholder: 'Filter Scientific Name' },
    { field: 'fertilizer.publicTitle', headerText: 'Title', placeholder: 'Filter Title' },
    { field: 'quantityChange', headerText: 'Changes Count', placeholder: 'Filter Changes count' },
    { field: 'fertilizer.npk', headerText: 'NPK', placeholder: 'Filter remained NPK' },
    { field: 'fertilizer.description', headerText: 'Description', placeholder: 'Filter description' },
    { field: 'isAdd', headerText: 'Is Add?', placeholder: 'Filter Is Add' },
  ];

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Page" title="Fertilizer Transaction" />
      
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
        >
          <MdOutlineAddTask className="mr-2" />
          Add Transaction
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
                      className="ml-2 p-1 hover:bg-gray-200 rounded"
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
                    displayValue = value ? 'Yes' : 'No';
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

      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
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

      {addConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Fertilizer Transaction</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer</label>
              <select
                name="fertilizerId"
                value={formData.fertilizerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Fertilizer</option>
                {fertilizers.map(fertilizer => (
                  <option key={fertilizer.fertilizer.id} value={fertilizer.fertilizer.id}>
                    {fertilizer.fertilizer.publicTitle} ({fertilizer.fertilizer.title})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
                Is Addition? (Checked for Yes, Unchecked for No)
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelFunction}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addFunction}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!formData.fertilizerId}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showDonemessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          Operation completed successfully!
        </div>
      )}
    </div>
  );
};

export default FertilizerTransaction;