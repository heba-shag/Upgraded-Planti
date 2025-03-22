import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { lineCustomSeries, LinePrimaryXAxis, LinePrimaryYAxis } from '../../data/dummy';
import { useStateContext } from '../../contexts/ContextProvider';

const LineChartt = () => {
  const { currentMode } = useStateContext();

  // تحويل البيانات إلى التنسيق المطلوب من قبل Recharts
  const chartData = lineCustomSeries[0].dataSource.map((item) => ({
    x: item.x,
    y: item.yval,
  }));

  return (
    <div style={{ width: '100%', height: '420px' }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          background={currentMode === 'Dark' ? '#33373E' : '#fff'}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" {...LinePrimaryXAxis} />
          <YAxis {...LinePrimaryYAxis} />
          <Tooltip />
          <Legend />
          {lineCustomSeries.map((series, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey="yval"
              stroke={series.fill}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartt;