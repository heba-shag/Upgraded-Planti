import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { stackedCustomSeries, stackedPrimaryXAxis, stackedPrimaryYAxis } from '../../data/dummy';
import { useStateContext } from '../../contexts/ContextProvider';

const Stacked = ({ width, height }) => {
  const { currentMode } = useStateContext();

  // تحويل البيانات إلى التنسيق المطلوب من قبل Recharts
  const chartData = stackedCustomSeries[0].dataSource.map((item, index) => {
    const dataPoint = { x: item.x };
    stackedCustomSeries.forEach((series) => {
      dataPoint[series.name] = series.dataSource[index].y;
    });
    return dataPoint;
  });

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          background={currentMode === 'Dark' ? '#33373E' : '#fff'}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" {...stackedPrimaryXAxis} />
          <YAxis {...stackedPrimaryYAxis} />
          <Tooltip />
          <Legend />
          {stackedCustomSeries.map((series, index) => (
            <Bar
              key={index}
              dataKey={series.name}
              stackId="a"
              fill={series.fill}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Stacked;