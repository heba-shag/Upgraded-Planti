import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Header } from '../components';

const Calendar = () => {
  // حالة لتخزين الأحداث
  const [events, setEvents] = useState([
    { title: 'Meeting', start: new Date(2021, 0, 10, 10, 0) },
    { title: 'Lunch', start: new Date(2021, 0, 10, 12, 0) },
  ]);

  // دالة لإضافة حدث جديد عند النقر على تاريخ
  const handleDateClick = (arg) => {
    const title = prompt('Enter event title:'); // فتح نافذة منبثقة لإدخال عنوان الحدث
    if (title) {
      const newEvent = {
        title: title,
        start: arg.date,
        allDay: arg.allDay,
      };
      setEvents([...events, newEvent]); // تحديث قائمة الأحداث
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Calendar" />
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        editable={true}
        selectable={true}
        dateClick={handleDateClick} // تفعيل النقر على التاريخ
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="650px"
      />
    </div>
  );
};

export default Calendar;