import React, { useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { FiLogIn, FiShoppingCart } from 'react-icons/fi';
import { BsChatLeft } from 'react-icons/bs';
import { RiNotification3Line } from 'react-icons/ri';
import { useStateContext } from '../contexts/ContextProvider';
import { Popover } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
    
  <Popover content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
        style={{ background: dotColor }}
        className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
      />
      {icon}
    </button>
  </Popover>
);

const Navbar = () => {
  const { currentColor, activeMenu, setActiveMenu, handleClick, setScreenSize, screenSize } = useStateContext();

  const UserNow = useStateContext();
  const role = UserNow.auth.userDetails.roles.flatMap((role)=>(role.role.id));

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  return (
    <div className="flex justify-between p-2 md:ml-6 md:mr-6 relative">

      <NavButton title="Menu" customFunc={handleActiveMenu} color={currentColor} icon={<AiOutlineMenu />} />
      <div className="flex">
        {/* <NavButton title="Chat" dotColor="#03C9D7" customFunc={() => handleClick('chat')} color={currentColor} icon={<BsChatLeft />} />
        <NavButton title="Notification" dotColor="rgb(254, 201, 15)" customFunc={() => handleClick('notification')} color={currentColor} icon={<RiNotification3Line />} /> */}

        {role[0]===1&&
          <Link to="/add-new-user" >
            <NavButton customFunc={() => handleClick('add-new-user')} color={currentColor} icon={<FaUserPlus />} />
          </Link>}
        <Link to="/login" > <NavButton color={currentColor} icon={<FiLogIn />} /></Link>

        {/* <Link to="/login"><FiLogIn className='icon'/></Link> */}
        {/* {isClicked.cart && (<Cart />)} 
        {isClicked.chat && (<Chat />)}
        {isClicked.notification && (<Notification />)}
        {isClicked.userProfile && (<UserProfile />)} */}
      </div>
    </div>
  );
};

export default Navbar;
