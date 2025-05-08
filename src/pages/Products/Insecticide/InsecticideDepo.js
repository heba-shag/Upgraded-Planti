import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';

const InsecticideDepo = () => {
  const [insecticideDepot, setInsecticideDepot] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [runUseEffect, setRun] = useState(0);
  
  const userNow = useStateContext();
  const token = userNow.auth.token;
  const isDev = process.env.NODE_ENV === 'development';

  const APIS = {
    baseUrl: isDev ? process.env.REACT_APP_API_INSECTICIDESTORE_URL : process.env.REACT_APP_API_INSECTICIDESTORE_URL,
    getAllInsecticideStore: () => `${APIS.baseUrl}/GetAllInsecticideStore?pageSize=1000000000&pageNum=0`,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(APIS.getAllInsecticideStore(), {
          headers: {
            Authorization: token,
          },
        });
        if (res.status === 200) {
          setInsecticideDepot(res.data.data);
          setData(res.data.data);
          setFilteredData(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching insecticide store:", err);
      }
    };
    fetchData();
  }, [runUseEffect]);

  const getNestedValue = (obj, path) => {
    if (!path) return obj;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
  };

  const getTypeDisplay = (type) => {
    return type === 0 ? 'Liquid' : 'Powder';
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const columns = [
    { field: 'insecticide.title', headerText: 'Scientific Name', placeholder: 'Filter Scientific Name' },
    { field: 'insecticide.publicTitle', headerText: 'Title', placeholder: 'Filter Title' },
    { field: 'totalQuantity', headerText: 'Total Count', placeholder: 'Filter total count' },
    { field: 'insecticide.type', headerText: 'Type', placeholder: 'Filter type' },
    { field: 'insecticide.description', headerText: 'Description', placeholder: 'Filter description' },
  ];

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Page" title="Insecticide Depot" />

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
                  
                  if (column.field === 'insecticide.type') {
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
    </div>
  );
};

export default InsecticideDepo;