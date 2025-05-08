import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';
import { MdOutlineAddTask } from 'react-icons/md';

const FlowerDepo = () => {
  const [flowerDepot, setFlowerDepot] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [codeFilter, setCodeFilter] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStored, setSelectedStored] = useState("");
  const [storedCount, setStoredCount] = useState(0);
  const [addRoleConfirmation, setAddRoleConfirmation] = useState(false);
  const [showDonemessage, setShowDoneMessage] = useState(false);
  const [runUseEffect, setRun] = useState(0);
  
  const userNow = useStateContext();
  const token = userNow.auth.token;
  const isDev = process.env.NODE_ENV === 'development';

  const APIS = {
    baseUrl: isDev ? process.env.REACT_APP_API_FLOWER_URL : process.env.REACT_APP_API_FLOWER_URL,
    getAllFlowerStore: () => `${APIS.baseUrl}/GetAllFlowerStore?pageSize=1000000000&pageNum=0`,
    AddExternalFlower: () => `${APIS.baseUrl}/AddExternalFlower?flowerStoreId=${selectedStored}&count=${storedCount}`,
    AddTrashedFlower: () => `${APIS.baseUrl}/AddTrashedFlower?flowerStoreId=${selectedStored}&trashedCount=${storedCount}`
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(APIS.getAllFlowerStore(), {
          headers: {
            Authorization: token,
          },
        });
        if (res.status === 200) {
          setFlowerDepot(res.data.data);
          setData(res.data.data);
          setFilteredData(res.data.data);
          setCodeFilter(res.data.data.map(code => ({ value: code.code, label: code.code })));
        }
      } catch (err) {
        console.error("Error fetching flower store:", err);
      }
    };
    fetchData();
  }, [runUseEffect]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredData(sortedData);
  };

  const handleFilter = (key, value) => {
    setFilterConfig({ key, value });
    const filtered = data.filter(item =>
      String(item[key]).toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const addFunction = async () => {
    try {
      const response = await axios.post(APIS.AddExternalFlower(), null, {
        headers: {
          Authorization: token
        }
      });
      if (response.status === 200) {
        setAddRoleConfirmation(false);
        setRun(prev => prev + 1);
        setShowDoneMessage(true);
        setTimeout(() => setShowDoneMessage(false), 2000);
      }
    } catch (error) {
      console.error("Error adding external flowers:", error);
    }
  };

  const deleteFunction = async () => {
    try {
      const response = await axios.post(APIS.AddTrashedFlower(), null, {
        headers: {
          Authorization: token
        }
      });
      if (response.status === 200) {
        setAddRoleConfirmation(false);
        setRun(prev => prev + 1);
        setShowDoneMessage(true);
        setTimeout(() => setShowDoneMessage(false), 2000);
      }
    } catch (error) {
      console.error("Error adding trashed flowers:", error);
    }
  };

  const cancelFunction = () => {
    setAddRoleConfirmation(false);
  };

  const handleAddRole = () => {
    setAddRoleConfirmation(true);
  };

  const handleNameChange = (event) => {
    setSelectedStored(event.target.value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const columns = [
    { field: 'code', headerText: 'Code', placeholder: 'Filter code' },
    { field: 'count', headerText: 'Count', placeholder: 'Filter count' },
    { field: 'totalCount', headerText: 'Total Count', placeholder: 'Filter total count' },
    { field: 'remainedCount', headerText: 'Remained Count', placeholder: 'Filter remained count' },
    { field: 'flowerLong', headerText: 'Flower Long', placeholder: 'Filter flower long' },
    { field: 'trashedCount', headerText: 'Trashed Count', placeholder: 'Filter trashed count' },
    { field: 'externalCount', headerText: 'External Count', placeholder: 'Filter external count' }
  ];

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Page" title="Flowers Depot" />
      
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddRole}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
          style={{ width: '150px' }}
        >
          <MdOutlineAddTask className="mr-2" />
          Add new item
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
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item[column.field]}
                  </td>
                ))}
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

      {addRoleConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Flowers</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <select
                value={selectedStored}
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose</option>
                {flowerDepot.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.code}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
              <input
                type="number"
                value={storedCount}
                onChange={(e) => setStoredCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Count..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelFunction}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={deleteFunction}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Add Trashed
              </button>
              <button
                onClick={addFunction}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add External
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

export default FlowerDepo;