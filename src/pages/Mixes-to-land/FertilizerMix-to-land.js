import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from '../../components';
import Select from "react-select";
import axios from 'axios';
import { Button } from '@mui/material';
import { FaCheckSquare, FaRegCheckSquare, FaTimes, FaFilter } from 'react-icons/fa';
import { useStateContext } from '../../contexts/ContextProvider';

const ItemTypes = {
  TASK: 'task',
};

const getColorStyle = (color) => {
  if(color === 1) return "#e71d36";
  if(color === 2) return "#2a6f97";
  if(color === 3) return "#6a994e";
  if(color === 4) return "#ffd61f";
  if(color === 5) return "#b5838d";
  if(color === 6) return "#f56416";
  return "#ffffff";
};

const Task = ({ 
  id, 
  content, 
  color, 
  index, 
  moveTask, 
  isSelected, 
  onToggleSelect, 
  isCheckable,
  onRemove,
  showOriginalContent
}) => {
  const [, ref] = useDrag({
    type: ItemTypes.TASK,
    item: { id, index },
    canDrag: isCheckable,
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

  const displayContent = showOriginalContent && typeof showOriginalContent === 'string' 
    ? showOriginalContent 
    : content;

  return (
    <div 
      ref={(node) => ref(drop(node))} 
      style={{
        padding: '12px',
        margin: '8px 0',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        backgroundColor: isSelected ? '#e0e0e0' : getColorStyle(color),
        border: `2px solid ${isSelected ? '#333' : getColorStyle(color)}`,
        color: color ? 'white' : 'inherit',
        cursor: isCheckable ? 'pointer' : 'move',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      onClick={() => isCheckable && onToggleSelect(id)}
    >
      <span>{displayContent}</span>
      <div>
        {isSelected && <span style={{ marginRight: '10px' }}>✓</span>}
        {onRemove && (
          <FaTimes
            style={{ cursor: 'pointer' }} 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }} 
          />
        )}
      </div>
    </div>
  );
};

const Column = ({ 
  title, 
  tasks = [], 
  moveTask = () => {}, 
  selectedItems = [], 
  onToggleSelect = () => {}, 
  showCheckboxes = false,
  actionButton = null,
  onRemove = null,
  filterComponent = null
}) => {
  return (
    <div style={{
      margin: '8px',
      padding: '8px',
      width: '350px',
      minHeight: '500px',
      maxHeight: '600px',
      backgroundColor: '#f4f5f7',
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ marginBottom: '10px' }}>{title}</h3>
        {filterComponent}
      </div>
      {actionButton && <div style={{ marginBottom: '10px' }}>{actionButton}</div>}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '5px'
      }}>
        {tasks.map((task, index) => (
          <Task
            key={task.id}
            id={task.id}
            content={task.content}
            color={task.color}
            index={index}
            moveTask={moveTask}
            isSelected={selectedItems.includes(task.id)}
            onToggleSelect={onToggleSelect}
            isCheckable={showCheckboxes}
            onRemove={onRemove}
            showOriginalContent={task.originalContent}
          />
        ))}
      </div>
    </div>
  );
};

const FertilizerMixToLand = () => {
  const [lands, setLands] = useState([]);
  const [mixes, setMixes] = useState([]);
  const [selectedMix, setSelectedMix] = useState(null);
  const [selectedLands, setSelectedLands] = useState([]);
  const [tasks, setTasks] = useState({ 'todo': [], 'done': [] });
  const [landFilter, setLandFilter] = useState(null);
  const [mixFilter, setMixFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const UserNow = useStateContext();
  const token = UserNow.auth.token;

  const isDev = process.env.NODE_ENV === 'development';
  
  const showMixLandApi = {
    baseUrl: isDev ? process.env.REACT_APP_API_FERTILIZERLAND_URL : process.env.REACT_APP_API_FERTILIZERLAND_URL,
    getAllLand: () => `${showMixLandApi.baseUrl}/GetMixLands`,
    baseMixUrl: isDev ? process.env.REACT_APP_API_FERTILIZER_URL : process.env.REACT_APP_API_FERTILIZER_URL,
    getAllMixes: () => `${showMixLandApi.baseMixUrl}/GetAllMixes?pageSize=100000000&pageNum=0`
  };

  const getAddMixLandApi = (mixId) => ({
    baseUrl: isDev ? process.env.REACT_APP_API_FERTILIZERLAND_URL : process.env.REACT_APP_API_FERTILIZERLAND_URL,
    addMixLand: () => `${getAddMixLandApi(mixId).baseUrl}/AddMixLands?mixId=${mixId}`,
    deleteMixLand: () => `${getAddMixLandApi(mixId).baseUrl}/RemoveMixLand`
  });

  useEffect(() => {
    fetchLands();
    fetchMixes();
  }, []);

  const fetchLands = async () => {
    try {
      const res = await axios.get(showMixLandApi.getAllLand(), {
        headers: { Authorization: token }
      });
      setLands(res.data);
      updateTasks(res.data);
    } catch (err) {
      console.error('Error fetching lands:', err);
    }
  };

  const fetchMixes = async () => {
    try {
      const res = await axios.get(showMixLandApi.getAllMixes(), {
        headers: { Authorization: token }
      });
      setMixes(res.data.data);
    } catch (err) {
      console.error('Error fetching mixes:', err);
    }
  };

  const updateTasks = (landsData) => {
    const todoTasks = [];
    const doneTasks = [];

    landsData.forEach(land => {
      // Always add land to todo list
      todoTasks.push({
        id: land.id,
        content: land.title,
        color: null,
        landId: land.id,
        type: 'land',
        originalContent: land.title
      });

      // Add to done list if has mixes
      if (land.fertilizerMixLands && land.fertilizerMixLands.length > 0) {
        land.fertilizerMixLands.forEach(mixLand => {
          doneTasks.push({
            id: mixLand.id,
            content: `${land.title} (${mixLand.fertilizerMix.title})`,
            color: mixLand.fertilizerMix.color,
            landId: land.id,
            mixId: mixLand.fertilizerMix.id,
            type: 'land',
            originalContent: land.title
          });
        });
      }
    });

    setTasks({
      'todo': todoTasks,
      'done': doneTasks
    });
  };

  const handleMixSelect = (selectedOption) => {
    setSelectedMix(selectedOption);
    setSelectedLands([]);
  };

  const toggleLandSelection = (landId) => {
    setSelectedLands(prev =>
      prev.includes(landId)
        ? prev.filter(id => id !== landId)
        : [...prev, landId]
    );
  };

  const moveToDone = async () => {
    if (!selectedMix || selectedLands.length === 0) return;
    
    try {
      const api = getAddMixLandApi(selectedMix.value);
      
      await axios.post(
        api.addMixLand(),
        selectedLands,
        { headers: { Authorization: token } }
      );

      setTasks(prev => {
        const movedTasks = selectedLands.map(landId => {
          const land = lands.find(l => l.id === landId);
          return {
            id: `new-${landId}-${selectedMix.value}-${Date.now()}`,
            content: `${land.title} (${selectedMix.label})`,
            color: selectedMix.color,
            landId: landId,
            mixId: selectedMix.value,
            type: 'land',
            originalContent: land.title
          };
        });

        return {
          todo: [...prev.todo], // Keep all lands in todo
          done: [...prev.done, ...movedTasks]
        };
      });

      setSelectedLands([]);
      fetchLands();
    } catch (err) {
      console.error('Error moving to done:', err);
    }
  };

  const handleRemoveFromDone = async (taskId) => {
    try {
      const task = tasks.done.find(t => t.id === taskId);
      if (!task) return;

      await axios.delete(
        `${getAddMixLandApi(task.mixId).deleteMixLand()}?mixLandId=${taskId}`,
        {
          headers: { Authorization: token }
        }
      );

      setTasks(prev => ({
        todo: [...prev.todo], // Lands remain in todo
        done: prev.done.filter(t => t.id !== taskId)
      }));

      fetchLands();
    } catch (err) {
      console.error('Error removing from done:', err);
    }
  };

  const arrayMove = (arr, fromIndex, toIndex) => {
    const newArr = [...arr];
    const [moved] = newArr.splice(fromIndex, 1);
    newArr.splice(toIndex, 0, moved);
    return newArr;
  };

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    let filtered = { ...tasks };
    
    if (landFilter) {
      const filteredTodo = tasks.todo.filter(task => 
        task.originalContent?.toLowerCase().includes(landFilter.toLowerCase())
      );
      const filteredDone = tasks.done.filter(task => 
        task.originalContent?.toLowerCase().includes(landFilter.toLowerCase())
      );
      filtered = { todo: filteredTodo, done: filteredDone };
    }
    
    if (mixFilter) {
      const filteredDone = filtered.done.filter(task => 
        task.content.toLowerCase().includes(mixFilter.toLowerCase())
      );
      filtered.done = filteredDone;
    }
    
    return filtered;
  }, [tasks, landFilter, mixFilter]);

  const uniqueLandNames = useMemo(() => {
    const names = new Set();
    lands.forEach(land => names.add(land.title));
    return Array.from(names);
  }, [lands]);

  const uniqueMixNames = useMemo(() => {
    const names = new Set();
    tasks.done.forEach(task => {
      const match = task.content.match(/\(([^)]+)\)/);
      if (match) names.add(match[1]);
    });
    return Array.from(names);
  }, [tasks.done]);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="App" title="Fertilizer Management" />
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Select
            options={mixes.map(mix => ({
              value: mix.id,
              label: mix.title,
              color: mix.color
            }))}
            value={selectedMix}
            onChange={handleMixSelect}
            placeholder="Select Fertilizer..."
            isClearable
            required
          />
        </div>
        
        <Button 
          variant="outlined" 
          startIcon={<FaFilter />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
        
        {selectedMix && (
          <Button 
            variant="contained" 
            onClick={moveToDone}
            disabled={selectedLands.length === 0 || !selectedMix}
          >
            Mark as Done ({selectedLands.length})
          </Button>
        )}
      </div>
      
      {showFilters && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          display: 'flex',
          gap: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <Select
              options={uniqueLandNames.map(name => ({ value: name, label: name }))}
              value={landFilter ? { value: landFilter, label: landFilter } : null}
              onChange={(option) => setLandFilter(option?.value || null)}
              placeholder="Filter by Land..."
              isClearable
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select
              options={uniqueMixNames.map(name => ({ value: name, label: name }))}
              value={mixFilter ? { value: mixFilter, label: mixFilter } : null}
              onChange={(option) => setMixFilter(option?.value || null)}
              placeholder="Filter by Fertilizer..."
              isClearable
            />
          </div>
          <Button 
            variant="outlined"
            onClick={() => {
              setLandFilter(null);
              setMixFilter(null);
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
      
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex' }}>
          <Column
            title="To Do"
            tasks={filteredTasks.todo}
            moveTask={(fromIndex, toIndex) =>
              setTasks(prev => ({
                ...prev,
                todo: arrayMove(prev.todo, fromIndex, toIndex)
              }))
            }
            selectedItems={selectedLands}
            onToggleSelect={toggleLandSelection}
            showCheckboxes={true}
            actionButton={
              selectedMix && (
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Select lands to fertilize with: <strong>{selectedMix.label}</strong>
                </div>
              )
            }
            filterComponent={
              <span style={{ fontSize: '0.8em', color: '#666' }}>
                {filteredTasks.todo.length} of {tasks.todo.length}
              </span>
            }
          />
          
          <Column
            title="Done"
            tasks={filteredTasks.done}
            moveTask={(fromIndex, toIndex) =>
              setTasks(prev => ({
                ...prev,
                done: arrayMove(prev.done, fromIndex, toIndex)
              }))
            }
            onRemove={handleRemoveFromDone}
            filterComponent={
              <span style={{ fontSize: '0.8em', color: '#666' }}>
                {filteredTasks.done.length} of {tasks.done.length}
              </span>
            }
          />
        </div>
      </DndProvider>
    </div>
  );
};

export default FertilizerMixToLand;