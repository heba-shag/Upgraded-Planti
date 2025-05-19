import React from 'react';
import { GiReturnArrow } from 'react-icons/gi';

const Header = ({ category, title }) => (
  <div className=" mb-10 flex justify-between">
    
    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
      {title}
    </p>
    <p className="text-2xl text-slate-900">{category}</p>
    {/* <p>{icon}</p> */}
  </div>
);

export default Header;
