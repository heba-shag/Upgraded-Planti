import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography, Button as MuiButton, FormControl, InputLabel, Chip, MenuItem } from '@mui/material';
import { Header } from '../../components';
import { BsArrowDown, BsArrowUp, BsCheck, BsPencil, BsPlus, BsTrash, BsX } from 'react-icons/bs';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';
import { BiDownload } from 'react-icons/bi';
import { Select } from 'antd';

let samadType=[
    {value:0,label:"Yaprak gübreleme"},
    {value:1,label:"damlama gübreleme"}
]
const FertilizrToLand = () => {
    // States
    const [fertilizerLand, setFertilizerLand] = useState([]);
    const [fertilizers, setFertilizeres] = useState([]);
    const [lands, setLands] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [tempData, setTempData] = useState({});
    const [newData, setNewData] = useState({
        landIds: [],
        type:0,
        date: new Date().toISOString().split('T')[0],
        mixes: [{
            quantity: '',
            fertilizerId: ''
        }]
    });
    const [expandedRows, setExpandedRows] = useState({});
    const [runUseEffect, setRun] = useState(0);

    // Context and API config
    const userNow = useStateContext();
    const token = userNow.auth.token;
    const isDev = process.env.NODE_ENV === 'development';
    
    const APIS = {
        baseFertilizerLandUrl: isDev ? process.env.REACT_APP_API_FERTILIZERLAND_URL : process.env.REACT_APP_API_FERTILIZERLAND_URL,
        getAllFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        addFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/Add`,
        deleteFertilizerLand: (id) => `${APIS.baseFertilizerLandUrl}/Remove`,
        updateFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/Update`,
        excelFertilizerLand: () => `${APIS.baseFertilizerLandUrl}/ExportExcel`,

        baseLandUrl: isDev ? process.env.REACT_APP_API_LAND_URL : process.env.REACT_APP_API_LAND_URL,
        getAllLand: () => `${APIS.baseLandUrl}/GetAll?justChildren=${true}`,

        baseFertilizerUrl: isDev ? process.env.REACT_APP_API_FERTILIZER_URL : process.env.REACT_APP_API_FERTILIZER_URL,
        getAllFertilizer: () => `${APIS.baseFertilizerUrl}/GetAll?pageSize=1000000000&pageNum=0`,

        baseCuttingLandUrl: isDev ? process.env.REACT_APP_API_CUTTINGLAND_URL : process.env.REACT_APP_API_CUTTINGLAND_URL,
        getAllCuttingLand: () => `${APIS.baseCuttingLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    };

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [landRes, fertilizerRes, fertilizerLandRes] = await Promise.all([
                    axios.get(APIS.getAllCuttingLand(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllFertilizer(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllFertilizerLand(), { headers: { Authorization: token } })
                ]);

                setLands(landRes.data.data || landRes.data);
                setFertilizeres(fertilizerRes.data.data);
                setFertilizerLand(fertilizerLandRes.data.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Failed to load data');
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
                        type: item.type,

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
            fertilizerId: rowData.originalData.fertilizer?.id
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
            const { id, ...dataToSend } = tempData;
            await axios.post(`${APIS.updateFertilizerLand()}?id=${id}`, dataToSend, {
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
            await axios.delete(`${APIS.deleteFertilizerLand()}?id=${id}`, {
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
                type:newData.type,
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
                type:0,
                mixes: [{  quantity: '', fertilizerId: '' }]
            });
            setRun(prev => prev + 1);
            alert('تمت الإضافة بنجاح');
        } catch (err) {
            console.error(err);
            alert('فشل في الإضافة');
        }
    };

    const handleAddMix = () => {
        setNewData(prev => ({
            ...prev,
            mixes: [...prev.mixes, {  quantity: '', fertilizerId: '' }]
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
                        >
                            {expandedRows[params.row.id] ? <BsArrowUp /> : <BsArrowDown />}
                        </IconButton>
                    );
                }
                return null;
            }
        },
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'fertilizerTitle', headerName: 'Fertilizer', width: 150 },
        { field: 'landTitle', headerName: 'Land', width: 150 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'quantity', headerName: 'Quantity', width: 100 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => {
                if (params.row.isParent || params.row.isAddNew) return null;
                
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
                            onClick={() => handleDelete(params.row.originalData.id)}
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

    const handleExportExcel = async () => {
            try {
              const response = await axios.post(APIS.excelFertilizerLand(), {
                headers: { Authorization: token },
                responseType: 'blob' 
              });
          
              // إنشاء رابط تحميل
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'Fertilizer_applications.xlsx');
              document.body.appendChild(link);
              link.click();
              
              // التنظيف
              link.parentNode.removeChild(link);
              window.URL.revokeObjectURL(url);
              
              alert('download success');
            } catch (err) {
              console.error('Error exporting to Excel:', err);
              alert('Failed to exporting Excel');
            }
          };

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Fertilizer Land Applications" />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <MuiButton
                    variant="contained"
                    color="secondary"
                    startIcon={<BiDownload />}
                    onClick={handleExportExcel}
                    sx={{ mr: 1 }}
                >
                    Export to Excel
                </MuiButton>
                
            </Box>
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
                        if (params.row.isParent) return 'parent-row';
                        if (params.row.isAddNew) return 'add-new-row';
                        return 'child-row';
                    }}
                    sx={{
                        '& .parent-row': { backgroundColor: '#f5f5f5', fontWeight: 'bold' },
                        '& .child-row': { backgroundColor: '#ffffff', paddingLeft: '40px' },
                        '& .add-new-row': { backgroundColor: '#e8f5e9' }
                    }}
                />
            </div>

            {/* Add Modal */}
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Application</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth margin="normal">
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
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            select
                            label="Type"
                            value={newData.type}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewData( {...newData, type: e.target.value})}
                            sx={{ flex: 2 }}
                            SelectProps={{ native: true }}
                        >
                            <option value=""></option>
                            {samadType.map((fert) => (
                                <option key={fert.value} value={fert.value}>{fert.label}</option>
                            ))}
                        </TextField>

                        

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Fertilizers Mixes</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <TextField
                                    select
                                    label="Fertilizer"
                                    value={mix.fertilizerId}
                                    onChange={(e) => handleMixChange(index, 'fertilizerId', e.target.value)}
                                    sx={{ flex: 2 }}
                                    SelectProps={{ native: true }}
                                >
                                    <option value=""></option>
                                    {fertilizers.map((fert) => (
                                        <option key={fert.id} value={fert.id}>{fert.title}</option>
                                    ))}
                                </TextField>

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
                            sx={{ mt: 1 }}
                        >
                            Add New Mix
                        </MuiButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setAddModalOpen(false)}>Cancel</MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={!newData.landIds.length|| !newData.mixes.every(m => m.insecticideId  && m.quantity)}
                    >
                        Save
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>Edit Application</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Land"
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
                            label="Fertilizer"
                            value={tempData.fertilizerId || ''}
                            onChange={(e) => setTempData({...tempData, fertilizerId: e.target.value})}
                            fullWidth
                            margin="normal"
                            SelectProps={{ native: true }}
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
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            select
                            label="Type"
                            value={newData.type}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewData( {...newData, type: e.target.value})}
                            sx={{ flex: 2 }}
                            SelectProps={{ native: true }}
                        >
                            <option value=""></option>
                            {samadType.map((fert) => (
                                <option key={fert.value} value={fert.value}>{fert.label}</option>
                            ))}
                        </TextField>

                        <TextField
                            label="Quantity"
                            type="number"
                            value={tempData.quantity || ''}
                            onChange={(e) => setTempData({...tempData, quantity: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        
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

export default FertilizrToLand;