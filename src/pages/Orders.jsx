import React, { useState } from 'react';
import { Header } from '../components';
import { ordersData, contextMenuItems, ordersGrid } from '../data/dummy';

const Orders = () => {
  const [data, setData] = useState(ordersData);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterConfig, setFilterConfig] = useState({ key: null, value: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // عدد العناصر لكل صفحة
  const [editingRow, setEditingRow] = useState(null); // الصف الذي يتم تعديله

  // وظيفة الفرز
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

  // وظيفة التصفية
  const handleFilter = (key, value) => {
    setFilterConfig({ key, value });
    const filteredData = ordersData.filter((item) =>
      item[key].toString().toLowerCase().includes(value.toLowerCase())
    );
    setData(filteredData);
  };

  // وظيفة التصدير إلى Excel
  const handleExportToExcel = () => {
    console.log('Exporting to Excel...');
    // يمكن استخدام مكتبة مثل `xlsx` لتنفيذ التصدير
  };

  // وظيفة التصدير إلى PDF
  const handleExportToPdf = () => {
    console.log('Exporting to PDF...');
    // يمكن استخدام مكتبة مثل `pdfmake` لتنفيذ التصدير
  };

  // وظيفة الحذف
  const handleDelete = (id) => {
    const updatedData = data.filter((item) => item.OrderID !== id);
    setData(updatedData);
  };

  // وظيفة التعديل
  const handleEdit = (row) => {
    setEditingRow(row);
  };

  // حفظ التعديلات
  const handleSave = () => {
    setEditingRow(null);
    // يمكن إضافة منطق لحفظ التعديلات في قاعدة البيانات
  };

  // التصفح بين الصفحات
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl shadow-lg">
      <Header category="Page" title="Orders" />
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
              {ordersGrid.map((column, index) => (
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
                {ordersGrid.map((column, colIndex) => (
                  
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {editingRow?.OrderID === item.OrderID ? (
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
                    {console.log(item.status)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingRow?.OrderID === item.OrderID ? (
                    <button
                      onClick={handleSave}
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
                        onClick={() => handleDelete(item.OrderID)}
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
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

export default Orders;