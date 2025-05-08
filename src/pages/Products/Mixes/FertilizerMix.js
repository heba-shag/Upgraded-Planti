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
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Header } from '../../../components';
import { BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';

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
    const [notification, setNotification] = useState({
      show: false,
      message: '',
      type: 'success',
    });

    // Context and API config
    const userNow = useStateContext();
    const token = userNow.auth.token;
    const isDev = process.env.NODE_ENV === 'development';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const APIS = {
        baseFertilizerUrl: isDev ? 
            process.env.REACT_APP_API_FERTILIZER_URL : 
            process.env.REACT_APP_API_FERTILIZER_URL,
        getAllFertilizer: () => `${APIS.baseFertilizerUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        getAllFertilizerMix: () => `${APIS.baseFertilizerUrl}/GetAllMixes`,
        addFertilizerMix: () => `${APIS.baseFertilizerUrl}/AddMix`,
        deleteFertilizerMix: (id) => `${APIS.baseFertilizerUrl}/RemoveMix?id=${id}`,
        updateFertilizerMix: () => `${APIS.baseFertilizerUrl}/UpdateMix`,
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
                const [fertilizerRes, mixRes] = await Promise.all([
                    axios.get(APIS.getAllFertilizer(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllFertilizerMix(), { headers: { Authorization: token } }),
                ]);

                setFertilizers(fertilizerRes.data.data || fertilizerRes.data);
                setMixes(mixRes.data.data || mixRes.data);
            } catch (err) {
                showNotification('Failed to load data', 'error');
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
            originalData: mix,
            isAddNew: false
        }));

        // Add new row button
        rows.push({
            id: 'add-new-row',
            isAddNew: true,
            originalData: { mixDetails: [] }
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
        if (!rowData || !rowData.originalData) {
            console.error('Invalid row data for editing');
            return;
        }

        const originalData = rowData.originalData;
        
        setEditingRow(rowData.id);
        setTempData({
            id: originalData.id,
            title: originalData.title || '',
            type: originalData.type || 0,
            color: originalData.color || 0,
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
            await axios.post(`${APIS.updateFertilizerMix()}?id=${id}&title=${dataToSend.title}&type=${dataToSend.type}&color=${dataToSend.color}`, null,
             {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Fertilizer mix updated successfully');
        } catch (err) {
            showNotification(err.response?.data?.errorMessage || 'Failed to update fertilizer mix', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Delete function
    const handleDelete = async (id) => {
        
        try {
            setLoading(true);
            await axios.delete(APIS.deleteFertilizerMix(id), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Fertilizer mix deleted successfully');
        } catch (err) {
            showNotification(err.response?.data?.errorMessage || 'Failed to delete fertilizer mix', 'error');
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
            showNotification('Fertilizer mix added successfully');
        } catch (err) {
            showNotification(err.response?.data?.errorMessage || 'Failed to add fertilizer mix', 'error');
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

    // Columns configuration
    const columns = [
        { 
            field: 'title', 
            headerName: 'Title', 
            flex: 1,
            minWidth: 150 
        },
        { 
            field: 'type', 
            headerName: 'Type', 
            flex: 1,
            minWidth: 150 
        },
        { 
            field: 'color', 
            headerName: 'Color', 
            minWidth: 120 
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => {
                if (params.row.isAddNew) return null;
                
                return (
                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                        padding: 0,
                        margin: 0
                    }}>
                        <IconButton 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(params.row);
                            }}
                            disabled={loading}
                            size="small"
                            sx={{ 
                                color: theme.palette.primary.main,
                                padding: '4px',
                                margin: 0,
                                minWidth: '24px',
                                minHeight: '24px',
                                '&:hover': {
                                    color: theme.palette.primary.dark,
                                    backgroundColor: 'transparent',
                                }
                            }}
                        >
                            <BsPencil style={{ fontSize: '1rem' }} />
                        </IconButton>
                        <IconButton 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(params.row.id);
                            }}
                            disabled={loading}
                            size="small"
                            sx={{ 
                                color: theme.palette.error.main,
                                padding: '4px',
                                margin: 0,
                                minWidth: '24px',
                                minHeight: '24px',
                                '&:hover': {
                                    color: theme.palette.error.dark,
                                    backgroundColor: 'transparent',
                                }
                            }}
                        >
                            <BsTrash style={{ fontSize: '1rem' }} />
                        </IconButton>
                    </Box>
                );
            },
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            headerAlign: 'center',
            align: 'center',
            cellClassName: 'actions-cell'
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
                        size="small"
                        sx={{ 
                            textTransform: 'none',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            padding: '6px 12px'
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

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Fertilizer Mixes Management" />

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

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            <Box sx={{ 
                height: '70vh',
                width: '100%',
                '& .MuiDataGrid-root': {
                    border: 'none',
                },
                '& .MuiDataGrid-cell': {
                    borderBottom: 'none',
                    '&:focus': {
                        outline: 'none'
                    }
                },
                '& .MuiDataGrid-cell:focus-within': {
                    outline: 'none'
                },
                '& .add-new-row': {
                    backgroundColor: '#e8f5e9',
                },
            }}>
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
                    loading={loading}
                    autoHeight={false}
                />
            </Box>

            {/* Add Modal */}
            <Dialog 
                open={addModalOpen} 
                onClose={() => setAddModalOpen(false)} 
                maxWidth="md" 
                fullWidth
                fullScreen={isMobile}
            >
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

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                        </Grid>

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Fertilizers</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={7}>
                                    <FormControl fullWidth>
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
                                </Grid>
                                <Grid item xs={8} sm={3}>
                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        value={mix.quantity}
                                        onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={4} sm={2}>
                                    <IconButton 
                                        color="error"
                                        onClick={() => handleRemoveMix(index)}
                                        disabled={newData.mixes.length <= 1}
                                        sx={{ ml: 1 }}
                                    >
                                        <BsTrash />
                                    </IconButton>
                                </Grid>
                            </Grid>
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
                <DialogActions sx={{ p: 2 }}>
                    <MuiButton 
                        onClick={() => setAddModalOpen(false)} 
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
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
            <Dialog 
                open={editModalOpen} 
                onClose={handleEditCancel} 
                maxWidth="sm" 
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle>Edit Fertilizer Mix</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Title"
                            value={tempData.title || ''}
                            onChange={(e) => setTempData({...tempData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <MuiButton 
                        onClick={handleEditCancel} 
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading || !tempData.title}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FertilizerMix;