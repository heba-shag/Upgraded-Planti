import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Header } from '../components';

const ColorPicker = () => {
  const [color, setColor] = useState('#ffffff');

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Color Picker" />
      <div className="text-center">
        <div
          id="preview"
          style={{
            backgroundColor: color,
            width: '100%',
            height: '100px',
            margin: '20px auto',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        />
        <div className="flex justify-center items-center gap-20 flex-wrap">
          <div>
            <p className="text-2xl font-semibold mt-2 mb-4">Inline Picker</p>
            <HexColorPicker color={color} onChange={setColor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;