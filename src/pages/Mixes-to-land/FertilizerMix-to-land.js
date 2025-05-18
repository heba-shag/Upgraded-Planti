import React, { useState, useEffect, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from '../../components';
import Select from "react-select";
import axios from 'axios';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FaTimes, FaFilter, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [allMixes, setAllMixes] = useState([]);
  const [selectedMix, setSelectedMix] = useState(null);
  const [selectedLands, setSelectedLands] = useState([]);
  const [tasks, setTasks] = useState({ 'todo': [], 'done': [] });
  const [landFilter, setLandFilter] = useState(null);
  const [mixFilter, setMixFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddFertilizerDialog, setShowAddFertilizerDialog] = useState(false);
  const [newFertilizer, setNewFertilizer] = useState({
    mixId: null,
    donumNum: 0,
    date: new Date()
  });
  const [filteredLandsByMix, setFilteredLandsByMix] = useState({ todo: [], done: [] });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const UserNow = useStateContext();
  const token = UserNow.auth.token;

  const isDev = process.env.NODE_ENV === 'development';
  
  const showMixLandApi = {
    baseUrl: isDev ? process.env.REACT_APP_API_FERTILIZERLAND_URL : process.env.REACT_APP_API_FERTILIZERLAND_URL,
    getAllLand: () => `${showMixLandApi.baseUrl}/GetMixLands`,
    baseMixUrl: isDev ? process.env.REACT_APP_API_FERTILIZER_URL : process.env.REACT_APP_API_FERTILIZER_URL,
    getAllAppMixes: () => `${showMixLandApi.baseMixUrl}/GetAllFertilizerApplicableMix`,
    getAllMixes: () => `${showMixLandApi.baseMixUrl}/GetAllMixes?pageSize=100000000&pageNum=0`,
    baseAddMixUrl: isDev ? process.env.REACT_APP_API_FERTILIZERSTORE_URL : process.env.REACT_APP_API_FERTILIZERSTORE_URL,
    addMix: () => `${showMixLandApi.baseAddMixUrl}/UpdateStoreForMix`
  };

  const getAddMixLandApi = (mixId) => ({
    baseUrl: isDev ? process.env.REACT_APP_API_FERTILIZERLAND_URL : process.env.REACT_APP_API_FERTILIZERLAND_URL,
    addMixLand: () => `${getAddMixLandApi(mixId).baseUrl}/AddMixLands?mixId=${mixId}`,
    deleteMixLand: () => `${getAddMixLandApi(mixId).baseUrl}/RemoveMixLand`
  });

  useEffect(() => {
    fetchLands();
    fetchMixes();
    fetchAllMixes();
  }, []);

  useEffect(() => {
    if (selectedMix) {
      const todoLands = tasks.todo.filter(task => 
        !tasks.done.some(doneTask => 
          doneTask.landId === task.landId && doneTask.mixId === selectedMix.value
        )
      );
      
      const doneLands = tasks.done.filter(task => 
        task.mixId === selectedMix.value
      );

      setFilteredLandsByMix({
        todo: todoLands,
        done: doneLands
      });
    } else {
      setFilteredLandsByMix({
        todo: tasks.todo,
        done: tasks.done
      });
    }
  }, [selectedMix, tasks]);

  const fetchLands = async () => {
    try {
      const res = await axios.get(showMixLandApi.getAllLand(), {
        headers: { Authorization: token }
      });
      setLands(res.data);
      updateTasks(res.data);
    } catch (err) {
      console.error('Tarlalar alınırken hata:', err);
      setError(err.response?.data?.errorMessage || 'Tarlalar yüklenemedi');
    }
  };

  const fetchMixes = async () => {
    try {
      const res = await axios.get(showMixLandApi.getAllAppMixes(), {
        headers: { Authorization: token }
      });
      setMixes(res.data);
    } catch (err) {
      console.error('Uygulanabilir gübre karışımları alınırken hata:', err);
      setError(err.response?.data?.errorMessage || 'Uygulanabilir gübre karışımları yüklenemedi');
    }
  };

  const fetchAllMixes = async () => {
    try {
      const res = await axios.get(showMixLandApi.getAllMixes(), {
        headers: { Authorization: token }
      });
      setAllMixes(res.data.data);
    } catch (err) {
      console.error('Tüm gübre karışımları alınırken hata:', err);
      setError(err.response?.data?.errorMessage || 'Tüm gübre karışımları yüklenemedi');
    }
  };

  const updateTasks = (landsData) => {
    const todoTasks = [];
    const doneTasks = [];

    landsData.forEach(land => {
      todoTasks.push({
        id: land.id,
        content: land.title,
        color: null,
        landId: land.id,
        type: 'land',
        originalContent: land.title
      });

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
    setError(null);
  };

  const toggleLandSelection = (landId) => {
    setSelectedLands(prev =>
      prev.includes(landId)
        ? prev.filter(id => id !== landId)
        : [...prev, landId]
    );
  };

  const moveToDone = async () => {
    if (!selectedMix) {
      setError('Lütfen önce bir gübre seçin');
      return;
    }
    if (selectedLands.length === 0) {
      setError('Lütfen en az bir tarla seçin');
      return;
    }
    
    try {
      setIsSubmitting(true);
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
          todo: prev.todo.filter(t => !selectedLands.includes(t.id)),
          done: [...prev.done, ...movedTasks]
        };
      });

      setSelectedLands([]);
      setError(null);
      fetchLands();
    } catch (err) {
      console.error('Tamamlananlara taşınırken hata:', err);
      setError(err.response?.data?.errorMessage || 'Gübre tarlalara atanamadı');
      fetchLands();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFromDone = async (taskId) => {
    try {
      setIsSubmitting(true);
      const task = tasks.done.find(t => t.id === taskId);
      if (!task) return;

      await axios.delete(
        `${getAddMixLandApi(task.mixId).deleteMixLand()}?mixLandId=${taskId}`,
        {
          headers: { Authorization: token }
        }
      );

      setTasks(prev => ({
        todo: [...prev.todo, {
          id: task.landId,
          content: task.originalContent,
          color: null,
          landId: task.landId,
          type: 'land',
          originalContent: task.originalContent
        }],
        done: prev.done.filter(t => t.id !== taskId)
      }));

      fetchLands();
    } catch (err) {
      console.error('Tamamlananlardan kaldırılırken hata:', err);
      setError(err.response?.data?.errorMessage || 'Gübre ataması kaldırılamadı');
      fetchLands();
    } finally {
      setIsSubmitting(false);
    }
  };

  const arrayMove = (arr, fromIndex, toIndex) => {
    const newArr = [...arr];
    const [moved] = newArr.splice(fromIndex, 1);
    newArr.splice(toIndex, 0, moved);
    return newArr;
  };

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

  const handleAddFertilizer = () => {
    setShowAddFertilizerDialog(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setShowAddFertilizerDialog(false);
    setNewFertilizer({
      mixId: null,
      donumNum: 0,
      date: new Date()
    });
    setError(null);
  };

  const handleSaveFertilizer = async () => {
    if (!newFertilizer.mixId) {
      setError('Lütfen bir gübre karışımı seçin');
      return;
    }
    if (!newFertilizer.donumNum || newFertilizer.donumNum <= 0) {
      setError('Lütfen geçerli bir dönüm sayısı girin (0\'dan büyük)');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedMix = allMixes.find(m => m.id === newFertilizer.mixId);
      
      const payload = {
        mixId: selectedMix.id,
        donumNum: parseFloat(newFertilizer.donumNum),
        date: newFertilizer.date.toISOString().split('T')[0]
      };

      await axios.post(
        `${showMixLandApi.addMix()}?mixId=${payload.mixId}&donumNum=${payload.donumNum}&date=${payload.date}`,
        null,
        { headers: { Authorization: token } }
      );

      fetchMixes();
      handleCloseDialog();
      setError(null);
    } catch (err) {
      console.error('Gübre kaydedilirken hata:', err);
      setError(err.response?.data?.errorMessage || 'Gübre kaydedilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Uygulama" title="Gübre Karışım Yönetimi" />
      
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderRadius: '4px',
          border: '1px solid #ef9a9a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <Button 
            style={{ color: '#d32f2f', minWidth: 'auto' }} 
            onClick={() => setError(null)}
          >
            <FaTimes />
          </Button>
        </div>
      )}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <Select
            options={mixes.map(mix => ({
              value: mix.fertilizerMixDto.id,
              label: mix.fertilizerMixDto.title,
              color: mix.fertilizerMixDto.color
            }))}
            value={selectedMix}
            onChange={handleMixSelect}
            placeholder="Gübre seçin..."
            isClearable
            required
          />
        </div>
        
        <Button 
          variant="outlined" 
          startIcon={<FaPlus />}
          onClick={handleAddFertilizer}
          disabled={isSubmitting}
          sx={{
            minWidth: '180px',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          Gübre Ekle
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<FaFilter />}
          onClick={() => setShowFilters(!showFilters)}
          disabled={isSubmitting}
          sx={{
            minWidth: '120px',
            padding: '8px 16px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.5)'
            }
          }}
        >
          Filtreler
        </Button>
        
        {selectedMix && (
          <Button 
            variant="contained" 
            onClick={moveToDone}
            disabled={selectedLands.length === 0 || !selectedMix || isSubmitting}
            sx={{
              minWidth: '220px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                backgroundColor: '#1976d2'
              }
            }}
          >
            {isSubmitting ? 'İşleniyor...' : `Tamamlandı olarak işaretle (${selectedLands.length})`}
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
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Select
              options={uniqueLandNames.map(name => ({ value: name, label: name }))}
              value={landFilter ? { value: landFilter, label: landFilter } : null}
              onChange={(option) => setLandFilter(option?.value || null)}
              placeholder="Tarlaya göre filtrele..."
              isClearable
              isDisabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <Select
              options={uniqueMixNames.map(name => ({ value: name, label: name }))}
              value={mixFilter ? { value: mixFilter, label: mixFilter } : null}
              onChange={(option) => setMixFilter(option?.value || null)}
              placeholder="Gübreye göre filtrele..."
              isClearable
              isDisabled={isSubmitting}
            />
          </div>
          <Button 
            variant="outlined"
            onClick={() => {
              setLandFilter(null);
              setMixFilter(null);
            }}
            disabled={isSubmitting}
            sx={{
              minWidth: '120px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.5)'
              }
            }}
          >
            Filtreleri Temizle
          </Button>
        </div>
      )}
      
      <Dialog open={showAddFertilizerDialog} onClose={!isSubmitting ? handleCloseDialog : null}>
        <DialogTitle>Gübre Uygulama Ekleme</DialogTitle>
        <DialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
            <Select
              options={allMixes.map(mix => ({
                value: mix.id,
                label: mix.title,
                color: mix.color
              }))}
              value={allMixes.find(m => m.id === newFertilizer.mixId) ? {
                value: newFertilizer.mixId,
                label: allMixes.find(m => m.id === newFertilizer.mixId).title,
                color: allMixes.find(m => m.id === newFertilizer.mixId).color
              } : null}
              onChange={(option) => setNewFertilizer({
                ...newFertilizer,
                mixId: option ? option.value : null
              })}
              placeholder="Gübre karışımı seçin..."
              isClearable
              required
              isDisabled={isSubmitting}
            />
            
            <TextField
              label="Dönüm"
              type="number"
              value={newFertilizer.donumNum}
              onChange={(e) => setNewFertilizer({
                ...newFertilizer,
                donumNum: e.target.value
              })}
              fullWidth
              inputProps={{ min: 0, step: 0.1 }}
              disabled={isSubmitting}
            />
            
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(0, 0, 0, 0.6)' }}>
                Uygulama Tarihi
              </label>
              <DatePicker
                selected={newFertilizer.date}
                onChange={(date) => setNewFertilizer({
                  ...newFertilizer,
                  date: date || new Date()
                })}
                dateFormat="yyyy-MM-dd"
                className="react-datepicker-wrapper"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={isSubmitting}
            sx={{
              minWidth: '100px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.5)'
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleSaveFertilizer} 
            color="primary" 
            variant="contained"
            disabled={!newFertilizer.mixId || !newFertilizer.donumNum || isSubmitting}
            sx={{
              minWidth: '100px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                backgroundColor: '#1976d2'
              }
            }}
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <Column
            title="Yapılacaklar"
            tasks={selectedMix ? filteredLandsByMix.todo : filteredTasks.todo}
            moveTask={(fromIndex, toIndex) => {
              const sourceArray = selectedMix ? filteredLandsByMix.todo : filteredTasks.todo;
              const movedItem = sourceArray[fromIndex];
              const originalIndex = tasks.todo.findIndex(t => t.id === movedItem.id);
              setTasks(prev => ({
                ...prev,
                todo: arrayMove(prev.todo, originalIndex, toIndex)
              }));
            }}
            selectedItems={selectedLands}
            onToggleSelect={toggleLandSelection}
            showCheckboxes={true}
            actionButton={
              selectedMix && (
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  Şu gübreyle uygulanacak tarlalar: <strong>{selectedMix.label}</strong>
                </div>
              )
            }
            filterComponent={
              <span style={{ fontSize: '0.8em', color: '#666' }}>
                {selectedMix ? filteredLandsByMix.todo.length : filteredTasks.todo.length} / {tasks.todo.length}
              </span>
            }
          />
          
          <Column
            title="Tamamlananlar"
            tasks={selectedMix ? filteredLandsByMix.done : filteredTasks.done}
            moveTask={(fromIndex, toIndex) => {
              const sourceArray = selectedMix ? filteredLandsByMix.done : filteredTasks.done;
              const movedItem = sourceArray[fromIndex];
              const originalIndex = tasks.done.findIndex(t => t.id === movedItem.id);
              setTasks(prev => ({
                ...prev,
                done: arrayMove(prev.done, originalIndex, toIndex)
              }));
            }}
            onRemove={handleRemoveFromDone}
            filterComponent={
              <span style={{ fontSize: '0.8em', color: '#666' }}>
                {selectedMix ? filteredLandsByMix.done.length : filteredTasks.done.length} / {tasks.done.length}
              </span>
            }
          />
        </div>
      </DndProvider>
    </div>
  );
};

export default FertilizerMixToLand;