import React, { useEffect, useState } from 'react';
import { Header } from '../../../components';
import { contextMenuItems, flowersGrid } from '../../../data/dummy';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';

const GetAllFlowers = () => {
  // State declarations
  const [ordersData, setOrdersData] = useState([]);
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingRow, setEditingRow] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showFlowersDropdown, setShowFlowersDropdown] = useState(null);
  const [cuttingLands, setCuttingLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newFlowerForm, setNewFlowerForm] = useState({
    worker: '',
    flowers: [{ count: '', long: '', note: '' }],
    date: new Date().toISOString().split('T')[0],
    cuttingLandId: ''
  });

  const [runUseEffect, setRun] = useState(0);
  const userNow = useStateContext();
  const token = userNow.auth.token;
  const isDev = process.env.NODE_ENV === 'development';

  // API endpoints
  const APIS = {
    baseFlowerUrl: isDev ? process.env.REACT_APP_API_FLOWER_URL: process.env.REACT_APP_API_FLOWER_URL,
    baseCuttingLandUrl: isDev ? process.env.REACT_APP_API_CUTTINGLAND_URL : process.env.REACT_APP_API_CUTTINGLAND_URL,
    getAllFlower: () => `${APIS.baseFlowerUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    getAllCuttingLand: () => `${APIS.baseCuttingLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addFlower: (cuttingLandId) => `${APIS.baseFlowerUrl}/Add?cuttingLandId=${cuttingLandId}`,
    deleteFlower: (id) => `${APIS.baseFlowerUrl}/Remove?id=${id}`,
    updateFlower: (id) => `${APIS.baseFlowerUrl}/Update?id=${id}`,
  };

  // Process flower data to ensure consistent structure
  const processFlowerData = (items) => {
    if (!Array.isArray(items)) return [];
    
    return items.map(item => ({
      ...item,
      flowers: Array.isArray(item.flowers) ? item.flowers : [],
      totalFlowers: Array.isArray(item.flowers) 
        ? item.flowers.reduce((sum, flower) => sum + (Number(flower.count) || 0), 0)
        : 0,
      cuttingLandName: item.cuttingLand?.land.title || 'N/A'
    }));
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch cutting lands
      const landsResponse = await axios.get(APIS.getAllCuttingLand(), {
        headers: { Authorization: token }
      });
      
      if (landsResponse.status !== 200) {
        throw new Error("Failed to fetch cutting lands");
      }
      
      setCuttingLands(landsResponse.data?.data || []);

      // Fetch flowers
      const flowersResponse = await axios.get(APIS.getAllFlower(), {
        headers: { Authorization: token }
      });
      
      if (flowersResponse.status !== 200) {
        throw new Error("Failed to fetch flowers data");
      }
      
      const processedData = processFlowerData(flowersResponse.data?.data?.data || []);
      setOrdersData(processedData);
      setData(processedData);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [runUseEffect, token]);

  // Sorting functionality
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

  // Filtering functionality
  const handleFilter = (key, value) => {
    setFilterConfig({ key, value });
    const filteredData = ordersData.filter((item) =>
      item[key]?.toString().toLowerCase().includes(value.toLowerCase())
    );
    setData(filteredData);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFlowerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle flower details input changes
  const handleFlowerInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFlowers = [...newFlowerForm.flowers];
    updatedFlowers[index] = {
      ...updatedFlowers[index],
      [name]: value
    };
    setNewFlowerForm(prev => ({
      ...prev,
      flowers: updatedFlowers
    }));
  };

  // Add more flower fields
  const handleAddFlowerField = () => {
    setNewFlowerForm(prev => ({
      ...prev,
      flowers: [...prev.flowers, { count: '', long: 0, note: 0 }]
    }));
  };

  // Remove flower field
  const handleRemoveFlowerField = (index) => {
    const updatedFlowers = [...newFlowerForm.flowers];
    updatedFlowers.splice(index, 1);
    setNewFlowerForm(prev => ({
      ...prev,
      flowers: updatedFlowers
    }));
  };

  // Submit flower form
  const handleAddFlowerSubmit = async (e) => {
    e.preventDefault();
    
    if (!newFlowerForm.worker || !newFlowerForm.date || !newFlowerForm.cuttingLandId || 
        newFlowerForm.flowers.some(f => !f.count)) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        date: newFlowerForm.date,
        worker: newFlowerForm.worker,
        flowers: newFlowerForm.flowers.map(f => ({
          count: Number(f.count),
          long: Number(f.long) || 0,
          note: f.note || ''
        }))
      };

      const endpoint = editingRow 
        ? APIS.updateFlower(editingRow.id)
        : APIS.addFlower(newFlowerForm.cuttingLandId);

      const res = await axios.post(endpoint, payload, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
      });

      if (res.status === 200) {
        setRun((prev) => prev + 1);
        setIsAdding(false);
        setEditingRow(null);
        setNewFlowerForm({
          worker: '',
          flowers: [{ count: 0, long: 0, note: '' }],
          date: new Date().toISOString().split('T')[0],
          cuttingLandId: ''
        });
        alert(`Flower record ${editingRow ? 'updated' : 'added'} successfully!`);
      }
    } catch(err) {
      console.error("Error:", err);
      alert(`Error ${editingRow ? 'updating' : 'adding'} flower record: ${err.message}`);
    }
  };

  // Edit flower record
  const handleEdit = (row) => {
    setEditingRow(row);
    setNewFlowerForm({
      worker: row.worker,
      flowers: [...row.flowers],
      date: row.date,
    });
    setIsAdding(true);
  };

  // Delete flower record
  const handleDelete = async(id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    try {
      const res = await axios.delete(APIS.deleteFlower(id), {
        headers: { Authorization: token }
      });
      
      if (res.status === 200) {
        setRun((prev) => prev + 1);
        alert("Record deleted successfully!");
      }
    } catch(err) {
      console.error("Delete Error:", err);
      alert(`Error deleting record: ${err.message}`);
    }
  };


  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Page" title="Flowers Management" />
      
      {/* Add/Edit Flower Modal */}
      {(isAdding || editingRow) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingRow ? 'Edit Flower Record' : 'Add New Flower Record'}
            </h3>
            <form onSubmit={handleAddFlowerSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cutting Land</label>
                  <select
                    name="cuttingLandId"
                    value={newFlowerForm.cuttingLandId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a land</option>
                    {cuttingLands.map(land => (
                      <option key={land.id} value={land.id}>{land.land.title}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Worker Name</label>
                  <input
                    type="text"
                    name="worker"
                    value={newFlowerForm.worker}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newFlowerForm.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Flowers Details</h4>
                {newFlowerForm.flowers.map((flower, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 p-3 border rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Count</label>
                      <input
                        type="number"
                        name="count"
                        min="1"
                        value={flower.count}
                        onChange={(e) => handleFlowerInputChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                      <input
                        type="number"
                        name="long"
                        min="0"
                        value={flower.long}
                        onChange={(e) => handleFlowerInputChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <input
                          type="text"
                          name="note"
                          value={flower.note}
                          onChange={(e) => handleFlowerInputChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      {!editingRow && index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFlowerField(index)}
                          className="ml-2 px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {!editingRow && (
                  <button
                    type="button"
                    onClick={handleAddFlowerField}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
                  >
                    Add More Flowers
                  </button>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingRow(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingRow ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add New Flower Record
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {flowersGrid.map((column, index) => (
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
            {data.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage
            ).map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {flowersGrid.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.field === 'flowers' ? (
                      <div className="relative">
                        <button 
                          onClick={() => setShowFlowersDropdown(showFlowersDropdown === item.id ? null : item.id)}
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          {item.flowers} (View)
                        </button>
                        {showFlowersDropdown === item.id && (
                          <div className="absolute z-10 left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="p-2">
                              <h4 className="font-medium mb-2">Flowers Details</h4>
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="text-left px-2 py-1">Count</th>
                                    <th className="text-left px-2 py-1">Length</th>
                                    <th className="text-left px-2 py-1">Note</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {console.log(item)}
                                  {/* {item.map((flower, idx) => ( */}
                                    <tr >
                                      <td className="px-2 py-1">{item.count}</td>
                                      <td className="px-2 py-1">{item.long}</td>
                                      <td className="px-2 py-1">{item.note}</td>
                                    </tr>
                                  {/* ))} */}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      item[column.field]
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6">
        {Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 mx-1 ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            } rounded-md hover:bg-blue-600 hover:text-white`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GetAllFlowers;