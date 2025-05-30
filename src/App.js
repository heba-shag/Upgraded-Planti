import  { useEffect } from 'react';
import {  Routes, Route } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import { Ecommerce} from './pages';
import './App.css';

import { useStateContext } from './contexts/ContextProvider';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import AdminLogIn from './pages/AuthPages/AdminLogin';
import PersistLogin from './PersistLogin';
import ProtectedRoute from './contexts/ProtectedRoutes';
import Customers from './pages/StorageThings/Customers';

import GetAllFertilizer from './pages/Products/Fertilizer/GetAllFertilizers';
import GetAllInsecticide from './pages/Products/Insecticide/GetAllInsecticide';
import GetAllCutting from './pages/Products/Cutting/GetAllCutting';
import GetAllColor from './pages/Products/Color/GetAllColor';
import MainLands from './pages/Lands/MainLands';
import SecLands from './pages/Lands/SecLands';
import ThirdLands from './pages/Lands/ThirdLand';
import FourthLands from './pages/Lands/FourthLands';
import InsecticideToLand from './pages/AddToLand/InsecticideToLand';
import FertilizrToLand from './pages/AddToLand/FertilizerToLand';
import CuttingToLand from './pages/AddToLand/CuttingToLand';
import Flowers from './pages/AddToLand/Flowers';
import FertilizerMix from './pages/Products/Mixes/FertilizerMix';
import FertilizerMixToLand from './pages/Mixes-to-land/FertilizerMix-to-land';
import InsecticideMixToLand from './pages/Mixes-to-land/InsecticideMix-to-land';
import InsecticideMix from './pages/Products/Mixes/InsecticideMix';
import FlowerDepo from './pages/Products/Flowers/FlowersDepo';
import FertilizerDepo from './pages/Products/Fertilizer/FertilizersDepo';
import FertilizerTransaction from './pages/Products/Fertilizer/FertilizerTransaction';
import AddNewUser from './pages/AuthPages/AddnewUser';
import InsecticideDepo from './pages/Products/Insecticide/InsecticideDepo';
import InsecticideTransaction from './pages/Products/Insecticide/InsecticideTransaction';
import Orders from './pages/StorageThings/Orders';

const Layout = ({ children }) => {
  const { activeMenu, themeSettings, setThemeSettings } = useStateContext();

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <div className="fixed right-4 bottom-4" style={{ zIndex: '1000' }}>
        <Popover>
          <PopoverButton
            type="button"
            onClick={() => setThemeSettings(true)}
            style={{ background: 'blue', borderRadius: '50%' }}
            className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
          >
            <FiSettings />
          </PopoverButton>
          <PopoverPanel className="absolute z-10 bg-black text-white text-sm px-2 py-1 rounded">
            Settings
          </PopoverPanel>
        </Popover>
      </div>
      {activeMenu ? (
        <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
          <Sidebar />
        </div>
      ) : (
        <div className="w-0 dark:bg-secondary-dark-bg">
          <Sidebar />
        </div>
      )}
      <div
        className={
          activeMenu
            ? 'dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  '
            : 'bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 '
        }
      >
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
          <Navbar />
        </div>
        <div>
          {themeSettings && (<ThemeSettings />)}
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
};

const App = () => {
  const { setCurrentColor, setCurrentMode, currentMode } = useStateContext();
  
  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode = localStorage.getItem('themeMode');
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === 'Dark' ? 'dark' : ''}>
        <Routes>
          
          <Route path="/" element={<AdminLogIn />} />
          <Route element={<PersistLogin />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/login" element={<AdminLogIn/>} />
              <Route path="/add-new-user" element={<AddNewUser/>} />

              <Route path="/mainPage" element={
                <Layout>
                  <Ecommerce />
                </Layout>
              } />
              <Route path="/Tarlalar" element={
                <Layout>
                  <MainLands />
                </Layout>
              } />
              <Route path="/Tarlalar/:id" element={
                <Layout>
                  <SecLands />
                </Layout>
              } />
              <Route path="/Tarlalar/:id/:id" element={
                <Layout>
                  <ThirdLands />
                </Layout>
              } />
              <Route path="/Tarlalar/:id/:id/:id" element={
                <Layout>
                  <FourthLands />
                </Layout>
              } />
              <Route path="/Gübre" element={
                <Layout>
                  <GetAllFertilizer />
                </Layout>
              } />
              <Route path="/ilaç" element={
                <Layout>
                  <GetAllInsecticide />
                </Layout>
              } />
              <Route path="/Fide" element={
                <Layout>
                  <GetAllCutting />
                </Layout>
              } />
              <Route path="/Renkler" element={
                <Layout>
                  <GetAllColor />
                </Layout>
              } />
              <Route path="/Gübre-mix" element={
                <Layout>
                  <FertilizerMix />
                </Layout>
              } />
              <Route path="/ilaç-mix" element={
                <Layout>
                  <InsecticideMix />
                </Layout>
              } />
              <Route path="/ilaç-oygulama" element={
                <Layout>
                  <InsecticideToLand />
                </Layout>
              } />
              <Route path="/Gübre-oygulama" element={
                <Layout>
                  <FertilizrToLand />
                </Layout>
              } />
              <Route path="/Fide-oygulama" element={
                <Layout>
                  <CuttingToLand />
                </Layout>
              } />
              
              <Route path="/Çiçek" element={
                <Layout>
                  <Flowers />
                </Layout>
              } />
              <Route path="/order" element={
                <Layout>
                  <Orders />
                </Layout>
              } />
              <Route path="/customer" element={
                <Layout>
                  <Customers />
                </Layout>
              } />

              <Route path="/mix-Gübre-oygulama" element={
                <Layout>
                  <FertilizerMixToLand />
                </Layout>
              } />
              <Route path="/mix-ilaç-oygulama" element={
                <Layout>
                  <InsecticideMixToLand />
                </Layout>
              } />
              <Route path="/Gübre-depo" element={
                <Layout>
                  <FertilizerDepo />
                </Layout>
              } />
              <Route path="/Gübre-Stok-işlemleri" element={
                <Layout>
                  <FertilizerTransaction />
                </Layout>
              } />
              <Route path="/ilaç-depo" element={
                <Layout>
                  <InsecticideDepo />
                </Layout>
              } />
              <Route path="/ilaç-Stok-işlemleri" element={
                <Layout>
                  <InsecticideTransaction />
                </Layout>
              } />
              <Route path="/Çiçek-depo" element={
                <Layout>
                  <FlowerDepo />
                </Layout>
              } />
              
              
            </Route>
          </Route>
        </Routes>
    </div>
  );
};

export default App;