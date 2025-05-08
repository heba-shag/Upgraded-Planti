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
  CircularProgress,
  MenuItem,
  Grid
} from '@mui/material';
import { Header } from '../../components';
import { BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';

const Flowers = () => {
    // States
    const [flowers, setFlowers] = useState([]);
    const [cuttingLands, setCuttingLands] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [tempData, setTempData] = useState({});
    const [newData, setNewData] = useState({
        date: new Date().toISOString().split('T')[0],
        worker: '',
        flowers:[{
            count: 0,
            long: 0,
            note: "",
        }],
        cuttingLandId: ''
    });
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
        baseFlowerUrl: isDev ? process.env.REACT_APP_API_FLOWER_URL : process.env.REACT_APP_API_FLOWER_URL,
        getAllFlower: () => `${APIS.baseFlowerUrl}/GetAll`,
        deleteFlower: (id) => `${APIS.baseFlowerUrl}/Remove?id=${id}`,
        addFlower: () => `${APIS.baseFlowerUrl}/Add`,
        updateFlower: () => `${APIS.baseFlowerUrl}/Update`,

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
                const [flowerRes, cuttingLandRes] = await Promise.all([
                    axios.get(APIS.getAllFlower(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllCuttingLand(), { headers: { Authorization: token } })
                ]);
                setFlowers(flowerRes.data.data.data);
                setCuttingLands(cuttingLandRes.data.data);
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
        if (!flowers || !Array.isArray(flowers)) return [];

        const rows = flowers.map((item) => ({
            id: item.id,
            date: new Date(item.date).toLocaleDateString(),
            note: item.note,
            count: item.count,
            long: item.long,
            worker: item.worker,
            landTitle: item.cuttingLand?.land?.title || 'Unknown',
            originalData: item
        }));

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
            date: rowData.originalData.date.split('T')[0]
        });
        setEditModalOpen(true);
    };

    const handleAddFlower = () => {
        setNewData(prev => ({
            ...prev,
            flowers: [
                ...prev.flowers,
                {
                    count: 0,
                    long: 0,
                    note: "",
                }
            ]
        }));
    };
    
    const handleRemoveFlower = (index) => {
        if (newData.flowers.length <= 1) return;
        setNewData(prev => ({
            ...prev,
            flowers: prev.flowers.filter((_, i) => i !== index)
        }));
    };
    
    const handleFlowerChange = (index, field, value) => {
        const updatedFlowers = [...newData.flowers];
        updatedFlowers[index][field] = value;
        setNewData(prev => ({ ...prev, flowers: updatedFlowers }));
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
            await axios.post(`${APIS.updateFlower()}?id=${id}&count=${dataToSend.count}&long=${dataToSend.long}&worker=${dataToSend.worker}&date=${new Date().toISOString(dataToSend.date)}&note=${dataToSend.note}`, null, { 
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Record updated successfully');
        } catch (err) {
            console.error(err);
            showNotification('Failed to update record', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete function
    const handleDelete = async (id) => {
        
        try {
            setLoading(true);
            await axios.delete(APIS.deleteFlower(id), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Record deleted successfully');
        } catch (err) {
            console.error(err);
            showNotification('Failed to delete record', 'error');
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
                worker: newData.worker,
                flowers: newData.flowers.map(flower => ({
                    count: parseInt(flower.count),
                    long: parseInt(flower.long),
                    note: flower.note,
                }))
            };
    
            await axios.post(`${APIS.addFlower()}?cuttingLandId=${parseInt(newData.cuttingLandId)}`, dataToSend, {
                headers: { Authorization: token }
            });
    
            setAddModalOpen(false);
            setNewData({
                date: new Date().toISOString().split('T')[0],
                worker: '',
                cuttingLandId: '',
                flowers: [{
                    count: 0,
                    long: 0,
                    note: "",
                }]
            });
            setRun(prev => prev + 1);
            showNotification('Record added successfully');
        } catch (err) {
            console.error(err);
            showNotification('Failed to add record', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Columns configuration
    const columns = [
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'worker', headerName: 'Worker', width: 150 },
        { field: 'count', headerName: 'Count', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'long', headerName: 'Length', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'note', headerName: 'Note', width: 200 },
        { field: 'landTitle', headerName: 'Land', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => {
                if (params.row.isAddNew) return null;
                
                return (
                    <Box display="flex">
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
                            onClick={() => handleDelete(params.row.id)}
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

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Flowers Management" />

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
                        if (params.row.isAddNew) return 'add-new-row';
                        return '';
                    }}
                    sx={{
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
                <DialogTitle sx={{ p: 3, fontSize: '1.2rem', fontWeight: 'bold' }}>Add New Flower Record</DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    label="Land"
                                    value={newData.cuttingLandId}
                                    fullWidth
                                    size="medium"
                                    onChange={(e) => setNewData({...newData, cuttingLandId: e.target.value})}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            height: '48px'
                                        }
                                    }}
                                >
                                    <MenuItem value="">Select Land</MenuItem>
                                    {cuttingLands.map((land) => (
                                        <MenuItem key={land.id} value={land.id}>
                                            {land.land?.title || `Land ${land.id}`}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Date"
                                    type="date"
                                    value={newData.date}
                                    onChange={(e) => setNewData({...newData, date: e.target.value})}
                                    fullWidth
                                    size="medium"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            height: '48px'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Worker"
                                    value={newData.worker}
                                    onChange={(e) => setNewData({...newData, worker: e.target.value})}
                                    fullWidth
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            height: '48px'
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>Flowers</Typography>
                        
                        {newData.flowers.map((flower, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 2,
                                p: 2,
                                border: '1px solid #eee',
                                borderRadius: '8px',
                                backgroundColor: '#f9f9f9'
                            }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            label="Count"
                                            type="number"
                                            value={flower.count}
                                            onChange={(e) => handleFlowerChange(index, 'count', e.target.value)}
                                            fullWidth
                                            size="medium"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    height: '48px'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            label="Length"
                                            type="number"
                                            value={flower.long}
                                            onChange={(e) => handleFlowerChange(index, 'long', e.target.value)}
                                            fullWidth
                                            size="medium"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    height: '48px'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
                                        <IconButton 
                                            color="error"
                                            onClick={() => handleRemoveFlower(index)}
                                            disabled={newData.flowers.length <= 1}
                                            sx={{ 
                                                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(244, 67, 54, 0.2)'
                                                },
                                                height: '48px',
                                                width: '48px'
                                            }}
                                        >
                                            <BsTrash size={16} />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Note"
                                            value={flower.note}
                                            onChange={(e) => handleFlowerChange(index, 'note', e.target.value)}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            size="medium"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px'
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <MuiButton 
                            variant="outlined" 
                            onClick={handleAddFlower}
                            startIcon={<BsPlus />}
                            fullWidth
                            sx={{ 
                                py: 1.5,
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                borderColor: '#ddd',
                                '&:hover': {
                                    borderColor: '#bbb'
                                }
                            }}
                        >
                            Add Another Flower
                        </MuiButton>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <MuiButton 
                        onClick={() => setAddModalOpen(false)}
                        disabled={loading}
                        sx={{ 
                            px: 3,
                            py: 1,
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            color: 'text.secondary',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={loading || !newData.cuttingLandId || !newData.date || !newData.worker}
                        sx={{
                            px: 3,
                            py: 1,
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#1976d2',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ p: 3, fontSize: '1.2rem', fontWeight: 'bold' }}>Edit Flower Record</DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Date"
                            type="date"
                            value={tempData.date || ''}
                            onChange={(e) => setTempData({...tempData, date: e.target.value})}
                            fullWidth
                            size="medium"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    height: '48px'
                                }
                            }}
                        />

                        <TextField
                            label="Worker"
                            value={tempData.worker || ''}
                            onChange={(e) => setTempData({...tempData, worker: e.target.value})}
                            fullWidth
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    height: '48px'
                                }
                            }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Count"
                                    type='number'
                                    value={tempData.count || ''}
                                    onChange={(e) => setTempData({...tempData, count: e.target.value})}
                                    fullWidth
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            height: '48px'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Length"
                                    type='number'
                                    value={tempData.long || ''}
                                    onChange={(e) => setTempData({...tempData, long: e.target.value})}
                                    fullWidth
                                    size="medium"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            height: '48px'
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            label="Note"
                            value={tempData.note || ''}
                            onChange={(e) => setTempData({...tempData, note: e.target.value})}
                            fullWidth
                            multiline
                            rows={3}
                            size="medium"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px'
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <MuiButton 
                        onClick={handleEditCancel}
                        disabled={loading}
                        sx={{ 
                            px: 3,
                            py: 1,
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            color: 'text.secondary',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#f5f5f5'
                            }
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
                            px: 3,
                            py: 1,
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#1976d2',
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Flowers;