import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

class SparkLine extends React.PureComponent {
  render() {
    const { id, height, width, color, data, type, currentColor } = this.props;

    // تحويل البيانات إلى التنسيق المطلوب من قبل Recharts
    const chartData = data.map((item, index) => ({
      x: index,
      yval: item.yval,
    }));

    return (
      <div id={id} style={{ height, width }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis hide={true} dataKey="x" /> {/* إخفاء المحور X */}
            <YAxis hide={true} /> {/* إخفاء المحور Y */}
            <Tooltip
              formatter={(value) => [`${value}`, 'Value']}
              labelFormatter={(label) => `X: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="yval"
              stroke={currentColor}
              strokeWidth={2}
              dot={{ r: 2.5, fill: currentColor }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default SparkLine;