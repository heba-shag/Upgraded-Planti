import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Box, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  TextField, 
  Typography, 
  Button as MuiButton, 
  FormControl, 
  InputLabel, 
  Chip, 
  MenuItem, 
  CircularProgress
} from '@mui/material';
import { Header } from '../../components';
import { BsArrowDown, BsArrowUp, BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import { BiDownload, BiCheckCircle, BiXCircle } from 'react-icons/bi';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';
import Select from 'react-dropdown-select';

const fertilizerTypes = [
  { value: 0, label: "Foliar Fertilization" },
  { value: 1, label: "Drip Fertilization" }
];

const FertilizerToLand = () => {
  // States
  const [fertilizerLand, setFertilizerLand] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [lands, setLands] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tempData, setTempData] = useState({});
  const [newData, setNewData] = useState({
    landIds: [],
    type: 0,
    date: new Date().toISOString().split('T')[0],
    mixes: [{ quantity: '', fertilizerId: '' }]
  });
  const [expandedRows, setExpandedRows] = useState({});
  const [runUseEffect, setRun] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Context and API config
  const userNow = useStateContext();
  const token = userNow.auth.token;
  const isDev = process.env.NODE_ENV === 'development';
  
  const APIS = {
    baseFertilizerLandUrl: isDev ? process.env.REACT_APP_API_FERTILIZERLAND_URL : process.env.REACT_APP_API_FERTILIZERLAND_URL,
    getAllFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/Add`,
    deleteFertilizerLand: (id) => `${APIS.baseFertilizerLandUrl}/Remove?id=${id}`,
    updateFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/Update`,
    excelFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/ExportExcel`,

    baseLandUrl: isDev ? process.env.REACT_APP_API_LAND_URL : process.env.REACT_APP_API_LAND_URL,
    getAllLand: () => `${APIS.baseLandUrl}/GetAll?justChildren=${true}`,

    baseFertilizerUrl: isDev ? process.env.REACT_APP_API_FERTILIZER_URL : process.env.REACT_APP_API_FERTILIZER_URL,
    getAllFertilizer: () => `${APIS.baseFertilizerUrl}/GetAll?pageSize=1000000000&pageNum=0`,

    baseCuttingLandUrl: isDev ? process.env.REACT_APP_API_CUTTINGLAND_URL : process.env.REACT_APP_API_CUTTINGLAND_URL,
    getAllCuttingLand: () => `${APIS.baseCuttingLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [landRes, fertilizerRes, fertilizerLandRes] = await Promise.all([
          axios.get(APIS.getAllCuttingLand(), { headers: { Authorization: token } }),
          axios.get(APIS.getAllFertilizer(), { headers: { Authorization: token } }),
          axios.get(APIS.getAllFertilizerLand(), { headers: { Authorization: token } })
        ]);

        setLands(landRes.data.data || landRes.data);
        setFertilizers(fertilizerRes.data.data);
        setFertilizerLand(fertilizerLandRes.data.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        showNotification('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [runUseEffect]);

  // Prepare rows for DataGrid
  const prepareRows = () => {
    if (!fertilizerLand) return [];

    const groupedData = fertilizerLand.reduce((acc, current) => {
      const date = new Date(current.date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(...current.fertilizerLand);
      return acc;
    }, {});

    const rows = [];
    Object.entries(groupedData).forEach(([date, items]) => {
      const parentId = `parent-${date}`;
      rows.push({
        id: parentId,
        date,
        isParent: true,
        childCount: items.length
      });

      if (expandedRows[parentId]) {
        items.forEach((item, index) => {
          rows.push({
            id: `${parentId}-child-${index}`,
            parentId,
            date: '',
            fertilizerTitle: item.fertilizer?.title || 'Unknown',
            landTitle: item.land?.title || 'Unknown',
            quantity: item.quantity,
            type: item.type === 0 ? "Foliar" : "Drip",
            isParent: false,
            originalData: item
          });
        });
      }
    });

    // Add new row button
    rows.push({
      id: 'add-new-row',
      isAddNew: true
    });

    return rows;
  };

  // Edit functions
  const handleEdit = (rowData) => {
    setEditingRow(rowData.id);
    setTempData({
      ...rowData.originalData,
      landId: rowData.originalData.land?.id,
      fertilizerId: rowData.originalData.fertilizer?.id,
      type: rowData.originalData.type
    });
    setEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setTempData({});
    setEditModalOpen(false);
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      const { id, ...dataToSend } = tempData;
      await axios.post(`${APIS.updateFertilizerLand()}?id=${id}`, dataToSend, {
        headers: { Authorization: token }
      });
      
      setRun(prev => prev + 1);
      setEditModalOpen(false);
      showNotification('Fertilization updated successfully');
    } catch (err) {
      console.error(err);
      showNotification('Failed to update fertilization', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete function
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      setLoading(true);
      await axios.delete(APIS.deleteFertilizerLand(id), {
        headers: { Authorization: token }
      });
      setRun(prev => prev + 1);
      showNotification('Fertilization deleted successfully');
    } catch (err) {
      console.error(err);
      showNotification('Failed to delete fertilization', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Add functions
  const handleAddSubmit = async () => {
    try {
      setLoading(true);
      const dataToSend = {
        date: newData.date,
        type: newData.type,
        landIds: newData.landIds.map(id => parseInt(id)),
        mixes: newData.mixes.map(mix => ({
          quantity: parseFloat(mix.quantity),
          fertilizerId: parseInt(mix.fertilizerId)
        }))
      };

      await axios.post(APIS.addFertilizerLand(), dataToSend, {
        headers: { Authorization: token }
      });

      setAddModalOpen(false);
      setNewData({
        landIds: [],
        date: new Date().toISOString().split('T')[0],
        type: 0,
        mixes: [{ quantity: '', fertilizerId: '' }]
      });
      setRun(prev => prev + 1);
      showNotification('Fertilization added successfully');
    } catch (err) {
      console.error(err);
      showNotification('Failed to add fertilization', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMix = () => {
    setNewData(prev => ({
      ...prev,
      mixes: [...prev.mixes, { quantity: '', fertilizerId: '' }]
    }));
  };

  const handleRemoveMix = (index) => {
    if (newData.mixes.length <= 1) return;
    setNewData(prev => ({
      ...prev,
      mixes: prev.mixes.filter((_, i) => i !== index)
    }));
  };

  const handleMixChange = (index, field, value) => {
    const updatedMixes = [...newData.mixes];
    updatedMixes[index][field] = value;
    setNewData(prev => ({ ...prev, mixes: updatedMixes }));
  };

  const handleLandChange = (event) => {
    const { value } = event.target;
    setNewData(prev => ({
      ...prev,
      landIds: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // Columns configuration
  const columns = [
    {
      field: 'expand',
      headerName: '',
      width: 60,
      renderCell: (params) => {
        if (params.row.isParent) {
          return (
            <IconButton
              size="small"
              onClick={() => {
                setExpandedRows(prev => ({
                  ...prev,
                  [params.row.id]: !prev[params.row.id]
                }));
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {expandedRows[params.row.id] ? <BsArrowUp /> : <BsArrowDown />}
            </IconButton>
          );
        }
        return null;
      }
    },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'fertilizerTitle', headerName: 'Fertilizer', width: 150 },
    { field: 'landTitle', headerName: 'Land', width: 150 },
    { field: 'type', headerName: 'Type', width: 120 },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 120,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      renderCell: (params) => {
        if (params.row.isParent || params.row.isAddNew) return null;
        
        return (
          <Box display="flex" >
            <IconButton 
              onClick={() => handleEdit(params.row)}
              size="small"
              disabled={loading}
              sx={{ 
                color: 'primary.main',
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
                '&:disabled': {
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              <BsPencil size={14} />
            </IconButton>
            <IconButton 
              onClick={() => handleDelete(params.row.originalData.id)}
              size="small"
              disabled={loading}
              sx={{ 
                color: 'error.main',
                '&:hover': { 
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                },
                '&:disabled': {
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              <BsTrash size={14} />
            </IconButton>
          </Box>
        );
      },
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'addNew',
      headerName: '',
      width: 150,
      renderCell: (params) => {
        if (!params.row.isAddNew) return null;
        
        return (
          <MuiButton
            variant="contained"
            color="primary"
            startIcon={<BsPlus />}
            onClick={() => setAddModalOpen(true)}
            disabled={loading}
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.8125rem'
            }}
          >
            Add New
          </MuiButton>
        );
      },
      sortable: false,
      filterable: false
    }
  ];

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await axios.post(APIS.excelFertilizerLand(), null, {
        headers: { Authorization: token },
        responseType: 'blob'
      });
  
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fertilization_report.xlsx');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('Excel file exported successfully');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showNotification('Failed to export Excel file', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Fertilization Management" />
      
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <BiCheckCircle className="w-6 h-6 mr-2" />
          ) : (
            <BiXCircle className="w-6 h-6 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <MuiButton
          variant="contained"
          color="secondary"
          startIcon={<BiDownload />}
          onClick={handleExportExcel}
          disabled={loading}
          sx={{ 
            mr: 1,
            padding: '6px 12px',
            fontSize: '0.8125rem',
            minWidth: 'auto',
            width: 'fit-content'
          }}
        >
          {loading ? 'Exporting...' : 'Export to Excel'}
        </MuiButton>
      </Box>
      
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={prepareRows()}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbar,
          }}
          loading={loading}
          getRowClassName={(params) => {
            if (params.row.isParent) return 'parent-row';
            if (params.row.isAddNew) return 'add-new-row';
            return 'child-row';
          }}
          sx={{
            '& .parent-row': { 
              backgroundColor: '#f5f5f5', 
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#e0e0e0'
              }
            },
            '& .child-row': { 
              backgroundColor: '#ffffff', 
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            },
            '& .add-new-row': { 
              backgroundColor: '#e8f5e9',
              '&:hover': {
                backgroundColor: '#d0e0d0'
              }
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f0f0f0',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px'
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              fontSize: '0.875rem'
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f0f0f0',
              '&:hover': {
                backgroundColor: '#e0e0e0'
              }
            }
          }}
        />
      </Box>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Fertilization</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="lands-label">Lands</InputLabel>
              <Select
                labelId="lands-label"
                id="lands-select"
                multiple
                value={newData.landIds}
                onChange={handleLandChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const land = lands.find(l => l.land.id == value);
                      return <Chip key={value} label={land?.title || value} />;
                    })}
                  </Box>
                )}
                sx={{
                  '& .MuiSelect-select': {
                    minHeight: 'auto',
                    padding: '10px 14px'
                  }
                }}
              >
                {lands.map((land) => (
                  <MenuItem key={land.land.id} value={land.land.id}>
                    {land.land.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type="date"
              value={newData.date}
              onChange={(e) => setNewData({...newData, date: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            />

            <TextField
              select
              label="Fertilization Type"
              value={newData.type}
              onChange={(e) => setNewData({...newData, type: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              {fertilizerTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </TextField>

            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>Fertilizer Mixes</Typography>
            
            {newData.mixes.map((mix, index) => (
              <Box key={index} sx={{ 
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: 2,
                alignItems: 'center'
              }}>
                <TextField
                  select
                  label="Fertilizer"
                  value={mix.fertilizerId}
                  onChange={(e) => handleMixChange(index, 'fertilizerId', e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '10px 14px'
                    }
                  }}
                >
                  <option value="">Select Fertilizer</option>
                  {fertilizers.map((fert) => (
                    <option key={fert.id} value={fert.id}>{fert.title}</option>
                  ))}
                </TextField>

                <TextField
                  label="Quantity"
                  type="number"
                  value={mix.quantity}
                  onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '10px 14px',
                      textAlign: 'left'
                    }
                  }}
                />

                <IconButton 
                  color="error"
                  onClick={() => handleRemoveMix(index)}
                  disabled={newData.mixes.length <= 1}
                  sx={{
                    backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)'
                    },
                    alignSelf: 'flex-end',
                    marginBottom: '8px'
                  }}
                >
                  <BsTrash />
                </IconButton>
              </Box>
            ))}

            <MuiButton 
              variant="outlined" 
              onClick={handleAddMix}
              startIcon={<BsPlus />}
              sx={{ 
                mt: 1,
                alignSelf: 'flex-start',
                padding: '8px 16px'
              }}
            >
              Add New Mix
            </MuiButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <MuiButton 
            onClick={() => setAddModalOpen(false)}
            disabled={loading}
            sx={{ 
              mr: 1,
              padding: '8px 16px',
              color: 'text.secondary'
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleAddSubmit} 
            color="primary"
            variant="contained"
            disabled={loading || !newData.landIds.length || !newData.mixes.every(m => m.fertilizerId && m.quantity)}
            sx={{
              padding: '8px 16px',
              boxShadow: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
        <DialogTitle>Edit Fertilization</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Land"
              value={tempData.landId || ''}
              onChange={(e) => setTempData({...tempData, landId: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              {lands.map((land) => (
                <option key={land.land.id} value={land.land.id}>{land.land.title}</option>
              ))}
            </TextField>

            <TextField
              select
              label="Fertilizer"
              value={tempData.fertilizerId || ''}
              onChange={(e) => setTempData({...tempData, fertilizerId: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              {fertilizers.map((fert) => (
                <option key={fert.id} value={fert.id}>{fert.title}</option>
              ))}
            </TextField>

            <TextField
              label="Date"
              type="date"
              value={tempData.date ? tempData.date.split('T')[0] : ''}
              onChange={(e) => setTempData({...tempData, date: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            />

            <TextField
              select
              label="Fertilization Type"
              value={tempData.type || 0}
              onChange={(e) => setTempData({...tempData, type: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              {fertilizerTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </TextField>

            <TextField
              label="Quantity"
              type="number"
              value={tempData.quantity || ''}
              onChange={(e) => setTempData({...tempData, quantity: e.target.value})}
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <MuiButton 
            onClick={handleEditCancel}
            disabled={loading}
            sx={{ 
              mr: 1,
              padding: '8px 16px',
              color: 'text.secondary'
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton 
            onClick={handleEditSave} 
            color="primary"
            variant="contained"
            disabled={loading}
            sx={{
              padding: '8px 16px',
              boxShadow: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FertilizerToLand;