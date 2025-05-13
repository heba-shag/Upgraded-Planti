import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {Chip, MenuItem, Select, InputLabel, FormControl, Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography, Button as MuiButton } from '@mui/material';
import { Header } from '../../components';
import { BsArrowDown, BsArrowUp, BsCheck, BsPencil, BsPlus, BsTrash, BsX } from 'react-icons/bs';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';
import { BiDownload, BiCheckCircle, BiXCircle } from 'react-icons/bi';

const InsecticideToLand = () => {
    // States
    const [insecticideLand, setInsecticideLand] = useState([]);
    const [insecticides, setInsecticides] = useState([]);
    const [lands, setLands] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [tempData, setTempData] = useState({});
    const [newData, setNewData] = useState({
        landIds: [],
        date: new Date().toISOString().split('T')[0],
        note: '',
        mixes: [{
            liter: '',
            quantity: '',
            insecticideId: '',
            insecticideType: 0 // 0: fixed quantity, 1: editable quantity
        }]
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
        baseInsecticideLandUrl: isDev ? process.env.REACT_APP_API_INSECTICIDELAND_URL : process.env.REACT_APP_API_INSECTICIDELAND_URL,
        getAllIsecticideLand: () => `${APIS.baseInsecticideLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        addIsecticideLand: () => `${APIS.baseInsecticideLandUrl}/Add`,
        deleteIsecticideLand: (id) => `${APIS.baseInsecticideLandUrl}/Remove`,
        updateInsecticideLand: () => `${APIS.baseInsecticideLandUrl}/Update`,
        excelIsecticideLand: () => `${APIS.baseInsecticideLandUrl}/ExportExcel`,

        baseInsecticideUrl: isDev ? process.env.REACT_APP_API_INSECTICIDE_URL : process.env.REACT_APP_API_INSECTICIDE_URL,
        getAllInsecticide: () => `${APIS.baseInsecticideUrl}/GetAll?pageSize=1000000000&pageNum=0`,

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
                const [landRes, insecticideRes, insecticideLandRes] = await Promise.all([
                    axios.get(APIS.getAllCuttingLand(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllInsecticide(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllIsecticideLand(), { headers: { Authorization: token } })
                ]);

                setLands(landRes.data.data || landRes.data);
                setInsecticides(insecticideRes.data.data.map(insect => ({
                    ...insect,
                    type: insect.type || 0 // Default to 0 if type is not provided
                })));
                setInsecticideLand(insecticideLandRes.data.data);
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
        if (!insecticideLand) return [];

        const groupedData = insecticideLand.reduce((acc, current) => {
            const date = new Date(current.date).toLocaleDateString();
            if (!acc[date]) acc[date] = [];
            acc[date].push(...current.insecticideLand);
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
                        insecticideTitle: item.insecticide?.title || 'Unknown',
                        landTitle: item.land?.title || 'Unknown',
                        liter: item.liter,
                        quantity: item.quantity,
                        note: item.note,
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
            insecticideId: rowData.originalData.insecticide?.id,
            insecticideType: rowData.originalData.insecticide?.type || 0
        });
        setEditModalOpen(true);
    };

    const handleEditCancel = () => {
        setEditingRow(null);
        setTempData({});
        setEditModalOpen(false);
    };

    const handleLandChange = (event) => {
        const { value } = event.target;
        setNewData(prev => ({
          ...prev,
          landIds: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleEditSave = async () => {
        try {
            setLoading(true);
            const { id, ...dataToSend } = tempData;
            await axios.post(`${APIS.updateInsecticideLand()}?id=${id}`, dataToSend, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Application updated successfully');
        } catch (err) {
            console.error(err);
            showNotification('Failed to update application', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete function
    const handleDelete = async (id) => {
        
        try {
            setLoading(true);
            await axios.delete(`${APIS.deleteIsecticideLand()}?id=${id}`, {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Application deleted successfully');
        } catch (err) {
            console.error(err);
            showNotification('Failed to delete application', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add functions
    const handleAddSubmit = async () => {
        try {
            setLoading(true);
            const dataToSend = {
                note: newData.note,
                date: newData.date,
                landIds: newData.landIds.map(id => parseInt(id)),
                mixes: newData.mixes.map(mix => ({
                    liter: parseFloat(mix.liter),
                    quantity: parseFloat(mix.quantity),
                    insecticideId: parseInt(mix.insecticideId)
                }))
            };

            await axios.post(APIS.addIsecticideLand(), dataToSend, {
                headers: { Authorization: token }
            });

            setAddModalOpen(false);
            setNewData({
                landIds: [],
                date: new Date().toISOString().split('T')[0],
                note: '',
                mixes: [{ 
                    liter: '', 
                    quantity: '', 
                    insecticideId: '',
                    insecticideType: 0 
                }]
            });
            setRun(prev => prev + 1);
            showNotification('Application added successfully');
        } catch (err) {
            console.error(err);
            showNotification('Failed to add application', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMix = () => {
        setNewData(prev => ({
            ...prev,
            mixes: [...prev.mixes, { 
                liter: '', 
                quantity: '', 
                insecticideId: '',
                insecticideType: 0 
            }]
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
        
        // If changing insecticide, update the type as well
        if (field === 'insecticideId') {
            const selectedInsecticide = insecticides.find(insect => insect.id === parseInt(value));
            updatedMixes[index].insecticideType = selectedInsecticide?.type || 0;
            
            // Reset quantity if type is 0 (fixed)
            if (selectedInsecticide?.type === 0) {
                updatedMixes[index].quantity = '';
            }
        }
        
        updatedMixes[index][field] = value;
        setNewData(prev => ({ ...prev, mixes: updatedMixes }));
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
        { field: 'date', headerName: 'Tarih', width: 120 },
        { field: 'insecticideTitle', headerName: 'ilaç', width: 130 },
        { field: 'landTitle', headerName: 'Tarla', width: 130 },
        { field: 'liter', headerName: 'Litre', width: 120, align: 'center', headerAlign: 'center' },
        { field: 'quantity', headerName: 'Sayı', width: 120, align: 'center', headerAlign: 'center' },
        { field: 'note', headerName: 'Notes', width: 130 },
        {
            field: 'actions',
            headerName: 'işlemler',
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
                        Ekleme
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
            const response = await axios.post(APIS.excelIsecticideLand(), {
                headers: { Authorization: token },
                responseType: 'blob' 
            });
        
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'insecticide_applications.xlsx');
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showNotification('Excel exported successfully');
        } catch (err) {
            console.error('Error exporting to Excel:', err);
            showNotification('Failed to export to Excel', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header 
                category="Page" 
                title="Tarlalar ilaç Applications" 
                sx={{ width: 'fit-content' }} 
            />
            
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
                    {loading ? 'Exporting...' : 'Export'}
                </MuiButton>
            </Box>
            <div style={{ height: 600, width: '100%', overflowX: 'auto' }}>
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
                        if (params.row.isParent) return 'parent-row';
                        if (params.row.isAddNew) return 'add-new-row';
                        return 'child-row';
                    }}
                    loading={loading}
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
            </div>

            {/* Add Modal */}
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Ekleme</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="lands-label">Tarla</InputLabel>
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
                            label="Tarih"
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
                            label="Notes"
                            value={newData.note}
                            onChange={(e) => setNewData({...newData, note: e.target.value})}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{
                                '& .MuiInputBase-input': {
                                    padding: '10px 14px'
                                }
                            }}
                        />

                        <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>Insecticides Mixes</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Box key={index} sx={{ 
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr auto',
                                gap: 2,
                                alignItems: 'center'
                            }}>
                                <TextField
                                    select
                                    label="ilaç"
                                    value={mix.insecticideId}
                                    onChange={(e) => handleMixChange(index, 'insecticideId', e.target.value)}
                                    fullWidth
                                    SelectProps={{ native: true }}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            padding: '10px 14px'
                                        }
                                    }}
                                >
                                    <option value=""></option>
                                    {insecticides.map((insect) => (
                                        <option key={insect.id} value={insect.id}>
                                            {insect.title} ({insect.type === 0 ? 'Liquid' : 'Powder'})
                                        </option>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Litre"
                                    type="number"
                                    value={mix.liter}
                                    onChange={(e) => handleMixChange(index, 'liter', e.target.value)}
                                    fullWidth
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            padding: '10px 14px',
                                            textAlign: 'left'
                                        }
                                    }}
                                />

                                <TextField
                                    label="Sayı"
                                    type="number"
                                    value={mix.quantity}
                                    onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                                    fullWidth
                                    disabled={mix.insecticideType === 0} // Disable if type is 0
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            padding: '10px 14px',
                                            textAlign: 'left'
                                        },
                                        '& .Mui-disabled': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
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
                            Mix Ekleme
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
                        disabled={loading || !newData.landIds.length || !newData.mixes.every(m => m.insecticideId && m.liter && (m.insecticideType === 1 ? m.quantity : true))}
                        sx={{
                            padding: '8px 16px',
                            boxShadow: 'none'
                        }}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>Edit </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Tarla"
                            value={tempData.landId || ''}
                            onChange={(e) => setTempData({...tempData, landId: e.target.value})}
                            fullWidth
                            margin="normal"
                            SelectProps={{ native: true }}
                        >
                            {lands.map((land) => (
                                <option key={land.land.id} value={land.land.id}>{land.land.title}</option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="ilaç"
                            value={tempData.insecticideId || ''}
                            onChange={(e) => {
                                const selectedInsecticide = insecticides.find(insect => insect.id === parseInt(e.target.value));
                                setTempData({
                                    ...tempData, 
                                    insecticideId: e.target.value,
                                    insecticideType: selectedInsecticide?.type || 0
                                });
                            }}
                            fullWidth
                            margin="normal"
                            SelectProps={{ native: true }}
                        >
                            {insecticides.map((insect) => (
                                <option key={insect.id} value={insect.id}>
                                    {insect.title} ({insect.type === 0 ? 'Liquid' : 'Powder'})
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            label="Tarih"
                            type="date"
                            value={tempData.date ? tempData.date.split('T')[0] : ''}
                            onChange={(e) => setTempData({...tempData, date: e.target.value})}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Litre"
                            type="number"
                            value={tempData.liter || ''}
                            onChange={(e) => setTempData({...tempData, liter: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Sayı"
                            type="number"
                            value={tempData.quantity || ''}
                            onChange={(e) => setTempData({...tempData, quantity: e.target.value})}
                            fullWidth
                            margin="normal"
                            disabled={tempData.insecticideType === 0}
                            sx={{
                                '& .Mui-disabled': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        />

                        <TextField
                            label="Notes"
                            value={tempData.note || ''}
                            onChange={(e) => setTempData({...tempData, note: e.target.value})}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
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
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default InsecticideToLand;