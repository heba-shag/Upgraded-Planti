import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from '../components';

// أنواع العناصر القابلة للسحب
const ItemTypes = {
  TASK: 'task',
};

// مكون المهمة (Task)
const Task = ({ id, content, index, moveTask }) => {
  const [, ref] = useDrag({
    type: ItemTypes.TASK,
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveTask(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} style={taskStyle}>
      {content}
    </div>
  );
};

// مكون العمود (Column)
const Column = ({ title, tasks, moveTask }) => {
  return (
    <div style={columnStyle}>
      <h3>{title}</h3>
      {tasks.map((task, index) => (
        <Task
          key={task.id}
          id={task.id}
          content={task.content}
          index={index}
          moveTask={moveTask}
        />
      ))}
    </div>
  );
};

// المكون الرئيسي
const Kanban = () => {
  const [tasks, setTasks] = useState({
    'todo': [
      { id: 'task-1', content: 'Task 1' },
      { id: 'task-2', content: 'Task 2' },
    ],
    'in-progress': [
      { id: 'task-3', content: 'Task 3' },
    ],
    'done': [
      { id: 'task-4', content: 'Task 4' },
    ],
  });

  // دالة لتحريك المهام بين الأعمدة
  const moveTask = (fromIndex, toIndex, fromColumn, toColumn) => {
    const newTasks = { ...tasks };
    const [movedTask] = newTasks[fromColumn].splice(fromIndex, 1);
    newTasks[toColumn].splice(toIndex, 0, movedTask);
    setTasks(newTasks);
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Kanban" />
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex' }}>
          <Column
            title="To Do"
            tasks={tasks.todo}
            moveTask={(fromIndex, toIndex) =>
              moveTask(fromIndex, toIndex, 'todo', 'todo')
            }
          />
          <Column
            title="In Progress"
            tasks={tasks['in-progress']}
            moveTask={(fromIndex, toIndex) =>
              moveTask(fromIndex, toIndex, 'in-progress', 'in-progress')
            }
          />
          <Column
            title="Done"
            tasks={tasks.done}
            moveTask={(fromIndex, toIndex) =>
              moveTask(fromIndex, toIndex, 'done', 'done')
            }
          />
        </div>
      </DndProvider>
    </div>
  );
};

// التنسيقات
const columnStyle = {
  margin: '8px',
  padding: '8px',
  width: '250px',
  minHeight: '500px',
  backgroundColor: '#f4f5f7',
  borderRadius: '4px',
};

const taskStyle = {
  padding: '8px',
  margin: '8px 0',
  backgroundColor: '#fff',
  borderRadius: '4px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  cursor: 'move',
};

export default Kanban;