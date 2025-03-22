import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useStateContext } from '../../contexts/ContextProvider';

const Doughnut = ({ id, data, legendVisiblity, height }) => {
  const { currentMode } = useStateContext();

  // تحديد الألوان للشرائح
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div id={id} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="70%"
            fill="#8884d8"
            paddingAngle={0}
            dataKey="y"
            nameKey="x"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          {legendVisiblity && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Doughnut;