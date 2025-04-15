import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography, Button as MuiButton, MenuItem } from '@mui/material';
import { Header } from '../../components';
import { BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
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

    // Context and API config
    const userNow = useStateContext();
    const token = userNow.auth.token;
    const isDev = process.env.NODE_ENV === 'development';
    
    const APIS = {
        baseFlowerUrl: isDev ? process.env.REACT_APP_API_FLOWER_URL : process.env.REACT_APP_API_FLOWER_URL,
        getAllFlower: () => `${APIS.baseFlowerUrl}/GetAll`,
        deleteFlower: (id) => `${APIS.baseFlowerUrl}/Remove?id=${id}`,
        addFlower: () => `${APIS.baseFlowerUrl}/Add`,
        updateFlower: (id) => `${APIS.baseFlowerUrl}/Update?id=${id}`,

        baseCuttingLandUrl: isDev ? process.env.REACT_APP_API_CUTTINGLAND_URL : process.env.REACT_APP_API_CUTTINGLAND_URL,
        getAllCuttingLand: () => `${APIS.baseCuttingLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    };

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [flowerRes, cuttingLandRes] = await Promise.all([
                    axios.get(APIS.getAllFlower(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllCuttingLand(), { headers: { Authorization: token } })
                ]);
                setFlowers(flowerRes.data.data.data);
                setCuttingLands(cuttingLandRes.data.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Failed to load data');
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
            const { id, ...dataToSend } = tempData;
            await axios.post(APIS.updateFlower(id,dataToSend), null, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            alert('تم التعديل بنجاح');
        } catch (err) {
            console.error(err);
            alert('فشل في التعديل');
        }
    };

    // Delete function
    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        
        try {
            await axios.delete(APIS.deleteFlower(id), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            alert('تم الحذف بنجاح');
        } catch (err) {
            console.error(err);
            alert('فشل في الحذف');
        }
    };

    // Add functions
    const handleAddSubmit = async () => {
        try {
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
            alert('تمت الإضافة بنجاح');
        } catch (err) {
            console.error(err);
            alert('فشل في الإضافة');
        }
    };

    const handleInputChange = (field, value) => {
        setNewData(prev => ({ ...prev, [field]: value }));
    };

    // Columns configuration
    const columns = [
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'worker', headerName: 'Worker', width: 150 },
        { field: 'count', headerName: 'Count', width: 100 },
        { field: 'long', headerName: 'Length', width: 100 },
        { field: 'note', headerName: 'Note', width: 200 },
        { field: 'landTitle', headerName: 'Land', width: 150 },
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
                        >
                            <BsPencil />
                        </IconButton>
                        <IconButton 
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
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
                    >
                        Add New
                    </MuiButton>
                );
            }
        }
    ];

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Flowers Management" />

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
                        '& .add-new-row': { backgroundColor: '#e8f5e9' }
                    }}
                />
            </div>

            {/* Add Modal */}
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Flower Record</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Land"
                            value={newData.cuttingLandId}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewData({...newData, cuttingLandId: e.target.value})}
                        >
                            <MenuItem value="">Select Land</MenuItem>
                            {cuttingLands.map((land) => (
                                <MenuItem key={land.id} value={land.id}>
                                    {land.land?.title || `Land ${land.id}`}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Date"
                            type="date"
                            value={newData.date}
                            onChange={(e) => setNewData({...newData, date: e.target.value})}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Worker"
                            value={newData.worker}
                            onChange={(e) => setNewData({...newData, worker: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Flowers</Typography>
                        
                        {newData.flowers.map((flower, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 2,
                                mb: 3,
                                p: 2,
                                border: '1px solid #eee',
                                borderRadius: 1
                            }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Count"
                                        type="number"
                                        value={flower.count}
                                        onChange={(e) => handleFlowerChange(index, 'count', e.target.value)}
                                        sx={{ flex: 1 }}
                                    />

                                    <TextField
                                        label="Length"
                                        type="number"
                                        value={flower.long}
                                        onChange={(e) => handleFlowerChange(index, 'long', e.target.value)}
                                        sx={{ flex: 1 }}
                                    />

                                    <IconButton 
                                        color="error"
                                        onClick={() => handleRemoveFlower(index)}
                                        disabled={newData.flowers.length <= 1}
                                        sx={{ alignSelf: 'center' }}
                                    >
                                        <BsTrash />
                                    </IconButton>
                                </Box>

                                <TextField
                                    label="Note"
                                    value={flower.note}
                                    onChange={(e) => handleFlowerChange(index, 'note', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Box>
                        ))}

                        <MuiButton 
                            variant="outlined" 
                            onClick={handleAddFlower}
                            startIcon={<BsPlus />}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Add Another Flower
                        </MuiButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setAddModalOpen(false)}>Cancel</MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={!newData.cuttingLandId || !newData.date || !newData.worker}
                    >
                        Save
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>Edit Flower Record</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {/* <TextField
                            select
                            label="Land"
                            value={tempData.cuttingLandId || ''}
                            onChange={(e) => setTempData({...tempData, cuttingLandId: e.target.value})}
                            fullWidth
                            margin="normal"
                        >
                            <MenuItem value="">Select Land</MenuItem>
                            {cuttingLands.map((land) => (
                                <MenuItem key={land.id} value={land.id}>
                                    {land.land?.title || `Land ${land.id}`}
                                </MenuItem>
                            ))}
                        </TextField> */}

                        <TextField
                            label="Date"
                            type="date"
                            value={tempData.date || ''}
                            onChange={(e) => setTempData({...tempData, date: e.target.value})}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Worker"
                            value={tempData.worker || ''}
                            onChange={(e) => setTempData({...tempData, worker: e.target.value})}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Note"
                            value={tempData.note || ''}
                            onChange={(e) => setTempData({...tempData, note: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Long"
                            type='number'
                            value={tempData.long || ''}
                            onChange={(e) => setTempData({...tempData, long: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Count"
                            type='number'
                            value={tempData.long || ''}
                            onChange={(e) => setTempData({...tempData, count: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        {/* {tempData.flowers?.map((flower, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                gap: 2,
                                mb: 3,
                                p: 2,
                                border: '1px solid #eee',
                                borderRadius: 1
                            }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Count"
                                        type="number"
                                        value={flower.count || ''}
                                        onChange={(e) => {
                                            const updatedFlowers = [...tempData.flowers];
                                            updatedFlowers[index].count = e.target.value;
                                            setTempData({...tempData, flowers: updatedFlowers});
                                        }}
                                        sx={{ flex: 1 }}
                                    />

                                    <TextField
                                        label="Length"
                                        type="number"
                                        value={flower.long || ''}
                                        onChange={(e) => {
                                            const updatedFlowers = [...tempData.flowers];
                                            updatedFlowers[index].long = e.target.value;
                                            setTempData({...tempData, flowers: updatedFlowers});
                                        }}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>

                                <TextField
                                    label="Note"
                                    value={flower.note || ''}
                                    onChange={(e) => {
                                        const updatedFlowers = [...tempData.flowers];
                                        updatedFlowers[index].note = e.target.value;
                                        setTempData({...tempData, flowers: updatedFlowers});
                                    }}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                            </Box>
                        ))} */}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleEditCancel}>Cancel</MuiButton>
                    <MuiButton 
                        onClick={handleEditSave} 
                        color="primary"
                        variant="contained"
                    >
                        Save
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Flowers;