import React, { useEffect, useState } from 'react';
import { 
  DataGrid, 
  GridToolbar 
} from '@mui/x-data-grid';
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
  Select, 
  MenuItem, 
  Chip, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Menu,
  ListItemText
} from '@mui/material';
import { Header } from '../../../components';
import { BsArrowDown, BsArrowUp, BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';

const FertilizerDetailsDropdown = ({ mixDetails = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <MuiButton
        variant="outlined"
        size="small"
        onClick={handleClick}
        endIcon={open ? <BsArrowUp /> : <BsArrowDown />}
        sx={{ minWidth: '150px' }}
      >
        {mixDetails.length} Fertilizers
      </MuiButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '300px',
            width: '250px',
          },
        }}
      >
        {mixDetails.length > 0 ? (
          mixDetails.map((detail, idx) => (
            <MenuItem key={idx} onClick={handleClose} dense>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1">
                  {detail.fertilizer?.publicTitle || 'Unknown Fertilizer'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {detail.quantity || 'N/A'}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>No fertilizers found</MenuItem>
        )}
      </Menu>
    </div>
  );
};

const FertilizerMix = () => {
    // States
    const [fertilizers, setFertilizers] = useState([]);
    const [mixes, setMixes] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [tempData, setTempData] = useState({});
    const [newData, setNewData] = useState({
        title: "",
        type: 0,
        color: 0,
        mixes: [{ fertilizerId: "", quantity: 0 }]
    });
    const [runUseEffect, setRun] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Context and API config
    const userNow = useStateContext();
    const token = userNow.auth.token;
    const isDev = process.env.NODE_ENV === 'development';
    
    const APIS = {
        baseFertilizerUrl: isDev ? 
            process.env.REACT_APP_API_FERTILIZER_URL : 
            process.env.REACT_APP_API_FERTILIZER_URL,
        getAllFertilizer: () => `${APIS.baseFertilizerUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        getAllFertilizerMix: () => `${APIS.baseFertilizerUrl}/GetAllMixes`,
        addFertilizerMix: () => `${APIS.baseFertilizerUrl}/AddMix`,
        deleteFertilizerMix: (id) => `${APIS.baseFertilizerUrl}/RemoveMix?id=${id}`,
        updateFertilizerMix: (id) => `${APIS.baseFertilizerUrl}/UpdateMix?id=${id}`,
    };

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [fertilizerRes, mixRes] = await Promise.all([
                    axios.get(APIS.getAllFertilizer(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllFertilizerMix(), { headers: { Authorization: token } }),
                ]);

                setFertilizers(fertilizerRes.data.data || fertilizerRes.data);
                setMixes(mixRes.data.data || mixRes.data);
                setError(null);
            } catch (err) {
                setError('Failed to load data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [runUseEffect]);

    // Prepare rows for DataGrid
    const prepareRows = () => {
        const rows = mixes.map((mix) => ({
            id: mix.id,
            title: mix.title,
            type: mix.type === 0 ? "Yaprak gübreleme" : "damlama gübreleme",
            color: getColorName(mix.color),
            details: mix.mixDetails || [],
            originalData: mix
        }));

        // Add new row button
        rows.push({
            id: 'add-new-row',
            isAddNew: true,
            originalData: { mixDetails: [] } // Ensure originalData exists
        });

        return rows;
    };

    // Helper functions
    const getColorName = (color) => {
        const colors = {
            1: "Red",
            2: "Blue",
            3: "Green",
            4: "Yellow",
            5: "Purple",
            6: "Orange"
        };
        return colors[color] || "Unknown";
    };

    // Edit functions
    const handleEdit = (rowData) => {
        setEditingRow(rowData.id);
        setTempData({
            ...rowData.originalData,
            mixes: rowData.originalData.mixDetails?.map(detail => ({
                fertilizerId: detail.fertilizer?.id || "",
                quantity: detail.quantity || 0
            })) || []
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
            await axios.post(APIS.updateFertilizerMix(id), {
                title: dataToSend.title,
                type: dataToSend.type,
                color: dataToSend.color,
                mixes: dataToSend.mixes
            }, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            setSuccess('Done');
        } catch (err) {
            setError('Failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Delete function
    const handleDelete = async (id) => {
        if (!window.confirm('Are you Sure About Delete It?')) return;
        
        try {
            setLoading(true);
            await axios.delete(APIS.deleteFertilizerMix(id), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            setSuccess('Done!');
        } catch (err) {
            setError('Failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Add functions
    const handleAddSubmit = async () => {
        try {
            setLoading(true);
            await axios.post(APIS.addFertilizerMix(), newData, {
                headers: { Authorization: token }
            });

            setAddModalOpen(false);
            setNewData({
                title: "",
                type: 0,
                color: 0,
                mixes: [{ fertilizerId: "", quantity: 0 }]
            });
            setRun(prev => prev + 1);
            setSuccess(' Done!');
        } catch (err) {
            setError('Failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMix = () => {
        setNewData(prev => ({
            ...prev,
            mixes: [...prev.mixes, { fertilizerId: "", quantity: 0 }]
        }));
    };

    const handleRemoveMix = (index, isEdit = false) => {
        if (isEdit) {
            if (tempData.mixes.length <= 1) return;
            setTempData(prev => ({
                ...prev,
                mixes: prev.mixes.filter((_, i) => i !== index)
            }));
        } else {
            if (newData.mixes.length <= 1) return;
            setNewData(prev => ({
                ...prev,
                mixes: prev.mixes.filter((_, i) => i !== index)
            }));
        }
    };

    const handleMixChange = (index, field, value, isEdit = false) => {
        if (isEdit) {
            const updatedMixes = [...tempData.mixes];
            updatedMixes[index][field] = value;
            setTempData(prev => ({ ...prev, mixes: updatedMixes }));
        } else {
            const updatedMixes = [...newData.mixes];
            updatedMixes[index][field] = value;
            setNewData(prev => ({ ...prev, mixes: updatedMixes }));
        }
    };

    // Columns configuration
    const columns = [
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'type', headerName: 'Type', width: 200 },
        { field: 'color', headerName: 'Color', width: 120 },
        {
            field: 'details',
            headerName: 'Fertilizers',
            width: 180,
            renderCell: (params) => (
                <FertilizerDetailsDropdown 
                    mixDetails={params.row.originalData?.mixDetails || []} 
                />
            ),
            sortable: false,
            filterable: false
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                if (params.row.isAddNew) return null;
                
                return (
                    <Box>
                        <IconButton 
                            color="primary"
                            onClick={() => handleEdit(params.row)}
                            disabled={loading}
                        >
                            <BsPencil />
                        </IconButton>
                        <IconButton 
                            color="error"
                            onClick={() => handleDelete(params.row.originalData.id)}
                            disabled={loading}
                        >
                            <BsTrash />
                        </IconButton>
                    </Box>
                );
            }
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
                    >
                        Add New
                    </MuiButton>
                );
            }
        }
    ];

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Fertilizer Mixes Managment" />

            {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
                <Alert severity="success" onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            </Snackbar>

            <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={prepareRows()}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    disableSelectionOnClick
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    getRowClassName={(params) => {
                        if (params.row.isAddNew) return 'add-new-row';
                        return '';
                    }}
                    sx={{
                        '& .add-new-row': { backgroundColor: '#e8f5e9' },
                        '& .MuiDataGrid-cell': {
                            direction: 'ltr',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            direction: 'ltr',
                        }
                    }}
                    loading={loading}
                />
            </div>

            {/* Add Modal */}
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add new Fertilizer Mix</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            value={newData.title}
                            onChange={(e) => setNewData({...newData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={newData.type}
                                label="Type"
                                onChange={(e) => setNewData({...newData, type: e.target.value})}
                            >
                                <MenuItem value={0}>Yaprak gübreleme</MenuItem>
                                <MenuItem value={1}>damlama gübreleme</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Color</InputLabel>
                            <Select
                                value={newData.color}
                                label="Color"
                                onChange={(e) => setNewData({...newData, color: e.target.value})}
                            >
                                {[1,2,3,4,5,6].map(color => (
                                    <MenuItem key={color} value={color}>
                                        {getColorName(color)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>الأسمدة</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <FormControl sx={{ flex: 2 }}>
                                    <InputLabel>Fertilizer</InputLabel>
                                    <Select
                                        value={mix.fertilizerId}
                                        label="Fertilizer"
                                        onChange={(e) => handleMixChange(index, 'fertilizerId', e.target.value)}
                                    >
                                        {fertilizers.map(fert => (
                                            <MenuItem key={fert.id} value={fert.id}>
                                                {fert.publicTitle}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Quantity"
                                    type="number"
                                    value={mix.quantity}
                                    onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                                    sx={{ flex: 1 }}
                                />

                                <IconButton 
                                    color="error"
                                    onClick={() => handleRemoveMix(index)}
                                    disabled={newData.mixes.length <= 1}
                                >
                                    <BsTrash />
                                </IconButton>
                            </Box>
                        ))}

                        <MuiButton 
                            variant="outlined" 
                            onClick={handleAddMix}
                            startIcon={<BsPlus />}
                            sx={{ mt: 2 }}
                        >
                            Add Fertilizer
                        </MuiButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setAddModalOpen(false)} disabled={loading}>
                        Cancel
                    </MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={loading || !newData.title || !newData.mixes.every(m => m.fertilizerId && m.quantity)}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>Edit Fetilizer Mix</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            value={tempData.title || ''}
                            onChange={(e) => setTempData({...tempData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={tempData.type || 0}
                                label="Type"
                                onChange={(e) => setTempData({...tempData, type: e.target.value})}
                            >
                                <MenuItem value={0}>Yaprak gübreleme</MenuItem>
                                <MenuItem value={1}>damlama gübreleme</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Color</InputLabel>
                            <Select
                                value={tempData.color || 0}
                                label="Color"
                                onChange={(e) => setTempData({...tempData, color: e.target.value})}
                            >
                                {[1,2,3,4,5,6].map(color => (
                                    <MenuItem key={color} value={color}>
                                        {getColorName(color)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Fertilizers</Typography>
                        
                        {tempData.mixes?.map((mix, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <FormControl sx={{ flex: 2 }}>
                                    <InputLabel>Fertilizer</InputLabel>
                                    <Select
                                        value={mix.fertilizerId || ''}
                                        label="Fertilizer"
                                        onChange={(e) => handleMixChange(index, 'fertilizerId', e.target.value, true)}
                                    >
                                        {fertilizers.map(fert => (
                                            <MenuItem key={fert.id} value={fert.id}>
                                                {fert.publicTitle}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Quantity"
                                    type="number"
                                    value={mix.quantity || 0}
                                    onChange={(e) => handleMixChange(index, 'quantity', e.target.value, true)}
                                    sx={{ flex: 1 }}
                                />

                                <IconButton 
                                    color="error"
                                    onClick={() => handleRemoveMix(index, true)}
                                    disabled={tempData.mixes?.length <= 1}
                                >
                                    <BsTrash />
                                </IconButton>
                            </Box>
                        ))}

                        <MuiButton 
                            variant="outlined" 
                            onClick={() => setTempData({
                                ...tempData,
                                mixes: [...tempData.mixes, { fertilizerId: "", quantity: 0 }]
                            })}
                            startIcon={<BsPlus />}
                            sx={{ mt: 2 }}
                        >
                            Add Fertilizer
                        </MuiButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleEditCancel} disabled={loading}>
                        Cancel
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading || !tempData.title || !tempData.mixes?.every(m => m.fertilizerId && m.quantity)}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FertilizerMix;