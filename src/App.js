import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';

import { Navbar, Footer, Sidebar, ThemeSettings } from './components';
import { Ecommerce, Orders, Calendar, Employees, Stacked, Pyramid, Customers, Kanban, Line, Area, Bar, Pie, Financial, ColorPicker, ColorMapping, Editor } from './pages';
import './App.css';

import { useStateContext } from './contexts/ContextProvider';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import AdminLogIn from './pages/AdminLogin';
import PersistLogin from './PersistLogin';
import ProtectedRoute from './contexts/ProtectedRoutes';

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogIn />} />
          <Route element={<PersistLogin />}>
            <Route element={<ProtectedRoute />}>
              <Route path="/ecommerce" element={
                <Layout>
                  <Ecommerce />
                </Layout>
              } />
              <Route path="/orders" element={
                <Layout>
                  <Orders />
                </Layout>
              } />
              <Route path="/employees" element={
                <Layout>
                  <Employees />
                </Layout>
              } />
              <Route path="/customers" element={
                <Layout>
                  <Customers />
                </Layout>
              } />
              <Route path="/kanban" element={
                <Layout>
                  <Kanban />
                </Layout>
              } />
              <Route path="/editor" element={
                <Layout>
                  <Editor />
                </Layout>
              } />
              <Route path="/calendar" element={
                <Layout>
                  <Calendar />
                </Layout>
              } />
              <Route path="/color-picker" element={
                <Layout>
                  <ColorPicker />
                </Layout>
              } />
              <Route path="/line" element={
                <Layout>
                  <Line />
                </Layout>
              } />
              <Route path="/area" element={
                <Layout>
                  <Area />
                </Layout>
              } />
              <Route path="/bar" element={
                <Layout>
                  <Bar />
                </Layout>
              } />
              <Route path="/pie" element={
                <Layout>
                  <Pie />
                </Layout>
              } />
              <Route path="/financial" element={
                <Layout>
                  <Financial />
                </Layout>
              } />
              <Route path="/color-mapping" element={
                <Layout>
                  <ColorMapping />
                </Layout>
              } />
              <Route path="/pyramid" element={
                <Layout>
                  <Pyramid />
                </Layout>
              } />
              <Route path="/stacked" element={
                <Layout>
                  <Stacked />
                </Layout>
              } />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;