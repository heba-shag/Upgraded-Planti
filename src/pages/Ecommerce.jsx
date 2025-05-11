import React, { useEffect, useState } from 'react';
import { BsCurrencyDollar } from 'react-icons/bs';
import { GoDot } from 'react-icons/go';
import { IoIosMore } from 'react-icons/io';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { Select } from 'antd';

import { Stacked, Pie, Button, LineChart, SparkLine } from '../components';
import { earningData, medicalproBranding, recentTransactions, weeklyStats, dropdownData, SparklineAreaData, ecomPieChartData } from '../data/dummy';
import { useStateContext } from '../contexts/ContextProvider';
import product9 from '../data/product9.jpg';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
const { Option } = Select
const DropDown = ({ currentMode, items = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSelect = (item) => {
    setSelectedItem(item);
    onSelect && onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {selectedItem || 'Items to show'}
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Ecommerce = () => {

  const { currentColor, currentMode } = useStateContext();
  let [flowersAvg,setFlowersAvg]=useState(0);
  let [ordersAvg,setOrdersAvg]=useState(0);
  let [clientAvg,setClientAvg]=useState(0);
  const [fertilizerTransaction, setFertilizerTransaction] = useState([]);
  const [insecticideTransaction, setInsecticideTransaction] = useState([]);
  const [displayCount, setDisplayCount] = useState(8);
  
  const userNow = useStateContext();
  const token = userNow.auth.token;
  let isDev=process.env.NODE_ENV === 'development';
  const showApi = isDev? {
    baseFlowerUrl: process.env.REACT_APP_API_FLOWER_URL,
    getNumOfFlower:()=>{return (`${showApi.baseFlowerUrl}/GetFlowerAverageInDonum`)},

    baseOrderUrl: process.env.REACT_APP_API_ORDER_URL,
    getNumOfOrder:()=>{return (`${showApi.baseOrderUrl}/GetOrderCount`)},

    baseCustomerUrl: process.env.REACT_APP_API_CLIENT_URL,
    getNumOfCustomer:()=>{return (`${showApi.baseCustomerUrl}/GetOrderCount`)},

    fertilizerStoreBaseUrl: process.env.REACT_APP_API_FERTILIZERSTORE_URL,
    getAllFertilizerTransaction: () => `${showApi.fertilizerStoreBaseUrl}/GetFertilizerTransaction?pageSize=1000000000&pageNum=0`,

    insecticideStoreBaseUrl: process.env.REACT_APP_API_INSECTICIDESTORE_URL,
    getAllInsecticideTransaction: () => `${showApi.insecticideStoreBaseUrl}/GetInsecticideTransaction?pageSize=1000000000&pageNum=0`,

  }:{
    baseFlowerUrl: process.env.REACT_APP_API_FLOWER_URL,
    getNumOfFlower:()=>{return (`${showApi.baseFlowerUrl}/GetFlowerAverageInDonum`)},

    baseOrderUrl: process.env.REACT_APP_API_ORDER_URL,
    getNumOfOrder:()=>{return (`${showApi.baseOrderUrl}/GetOrderCount`)},

    baseCustomerUrl: process.env.REACT_APP_API_CLIENT_URL,
    getNumOfCustomer:()=>{return (`${showApi.baseCustomerUrl}/GetOrderCount`)},

    fertilizerStoreBaseUrl: process.env.REACT_APP_API_FERTILIZERSTORE_URL,
    getAllFertilizerTransaction: () => `${showApi.fertilizerStoreBaseUrl}/GetFertilizerTransaction?pageSize=1000000000&pageNum=0`,

    insecticideStoreBaseUrl: process.env.REACT_APP_API_INSECTICIDESTORE_URL,
    getAllInsecticideTransaction: () => `${showApi.insecticideStoreBaseUrl}/GetInsecticideTransaction?pageSize=1000000000&pageNum=0`,
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, clientsRes, flowersRes,fertilizerRes,insecticideRes] = await Promise.all([
          axios.get(showApi.getNumOfOrder(), { headers: { Authorization: token } }),
          axios.get(showApi.getNumOfCustomer(), { headers: { Authorization: token } }),
          axios.get(showApi.getNumOfFlower(), { headers: { Authorization: token } }),
          axios.get(showApi.getAllFertilizerTransaction(), { headers: { Authorization: token } }),
          axios.get(showApi.getAllInsecticideTransaction(), { headers: { Authorization: token } }),

        ]);

        setOrdersAvg(ordersRes.data.data || ordersRes.data);
        setClientAvg(clientsRes.data.data || clientsRes.data);
        setFlowersAvg(flowersRes.data.data || flowersRes.data);
        setFertilizerTransaction(fertilizerRes.data.data || fertilizerRes.data);
        setInsecticideTransaction(insecticideRes.data.data || insecticideRes.data);


      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap lg:flex-nowrap justify-center ">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 hero-pattern bg-no-repeat bg-cover bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Earnings</p>
              <p className="text-2xl">$63,448.78</p>
            </div>   
            <button
              type="button"
              style={{ backgroundColor: currentColor }}
              className="text-2xl opacity-0.9 text-white hover:drop-shadow-xl rounded-full  p-4"
            >
              <BsCurrencyDollar />
            </button>
          </div>
          <div className="mt-6">
            <Button
              color="white"
              bgColor={currentColor}
              text="Download"
              borderRadius="10px"
            />
          </div>
        </div>
        <div className="flex m-3 flex-wrap justify-center gap-1 items-center">
          {earningData.map((item) => (
            <div key={item.title} className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56  p-4 pt-9 rounded-2xl ">
              <button
                type="button"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                {item.icon}
              </button>
              <p className="mt-3">
                <span className="text-lg font-semibold">{item.title==='Customers'?clientAvg:item.title==='Orders'?ordersAvg:flowersAvg}</span>
                {/* <span className={`text-sm text-${item.pcColor} ml-2`}>
                  {item.percentage}
                </span> */}
              </p>
              <p className="text-sm text-gray-400  mt-1">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-10 m-4 flex-wrap justify-center">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Recent Fertilizer Transactions</p>
            <DropDown 
              currentMode={currentMode} 
              items={[2, 4, 6, 8]} 
              onSelect={(selectedNumber) => setDisplayCount(selectedNumber)} 
            />
          </div>
          <div className="mt-10 w-72 md:w-400">
            {fertilizerTransaction.slice(0, displayCount || 8).map((item) => (
              <div key={item.title} className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <div>
                    <p className="text-md font-semibold">{item.fertilizer.publicTitle}</p>
                    <p className="text-sm text-gray-400">{item.fertilizer.npk}</p>
                  </div>
                </div>
                <p className={`text-${item.pcColor}`}>{item.quantityChange}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-5 border-t-1 border-color">
            <div className="mt-3">
              <Link to='/fertilizer-transaction'>
                <Button
                  color="white"
                  bgColor={currentColor}
                  text="See More"
                  borderRadius="10px"
                /> 
              </Link>
            </div>
            <p className="text-gray-400 text-sm">{displayCount || 8} Recent Transactions</p>
          </div>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Recent Insecticide Transactions</p>
            <DropDown 
              currentMode={currentMode} 
              items={[2, 4, 6, 8]} 
              onSelect={(selectedNumber) => setDisplayCount(selectedNumber)} 
            />
          </div>
          <div className="mt-10 w-72 md:w-400">
            {insecticideTransaction.slice(0, displayCount || 8).map((item) => (
              <div key={item.title} className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <div>
                    <p className="text-md font-semibold">{item.insecticide.publicTitle}</p>
                    <p className="text-sm text-gray-400">{item.insecticide.type===0?'liquid':'powder'}</p>
                  </div>
                </div>
                <p className={`text-${item.pcColor}`}>{item.quantityChange}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-5 border-t-1 border-color">
            <div className="mt-3">
              <Link to='/icsecticide-transaction'>
                <Button
                  color="white"
                  bgColor={currentColor}
                  text="See More"
                  borderRadius="10px"
                /> 
              </Link>
            </div>
            <p className="text-gray-400 text-sm">{displayCount || 8} Recent Transactions</p>
          </div>
        </div>
        
      </div>

      <div className="flex flex-wrap justify-center">
        <div className="w-400 bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl p-6 m-3">
          <div className="flex justify-between">
            <p className="text-xl font-semibold">Our Activities</p>
            <button type="button" className="text-xl font-semibold text-gray-500">
              <IoIosMore />
            </button>
          </div>
          <div className="mt-10">
            <img
              className="md:w-96 h-50 "
              src={product9}
              alt=""
            />
            <div className="mt-8">
              <p className="font-semibold text-lg">Planti!</p>
              <p className="text-gray-400 ">By Heba & Taima</p>
              <p className="mt-8 text-sm text-gray-400">
                This is a small project which called 'Planti!',It help agriculture companies to manage its resourses.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Ecommerce;
