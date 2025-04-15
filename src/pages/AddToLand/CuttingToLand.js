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
const CuttingToLand = () => {
    // States
    const [cuttingLand, setCuttingLand] = useState([]);
    const [cuttings, setCuttings] = useState([]);
    const [colors, setColors] = useState([]);
    const [cuttingColors, setCuttingColors] = useState([]);
    const [lands, setLands] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [tempData, setTempData] = useState({});
    const [newData, setNewData] = useState({
        landId: 0,
        date: new Date().toISOString().split('T')[0],
        cuttings: [{
            quantity: '',
            cuttingColorId: ''
        }]
    });
    const [expandedRows, setExpandedRows] = useState({});
    const [runUseEffect, setRun] = useState(0);
    const [addColorModalOpen, setAddColorModalOpen] = useState(false);
    const [newColorData, setNewColorData] = useState({
        cuttingId: '',
        colorId: '',
        code: ''
    });

    // Context and API config
    const userNow = useStateContext();
    const token = userNow.auth.token;
    const isDev = process.env.NODE_ENV === 'development';
    
    const APIS = {
        baseCuttingLandUrl: isDev ? process.env.REACT_APP_API_CUTTINGLAND_URL : process.env.REACT_APP_API_CUTTINGLAND_URL,
        getAllCuttingLand: () => `${APIS.baseCuttingLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        addCuttingLand: () => `${APIS.baseCuttingLandUrl}/Add`,
        deleteCuttingLand: (id) => `${APIS.baseCuttingLandUrl}/Remove`,
        updateCuttingLand: () => `${APIS.baseCuttingLandUrl}/Update`,

        baseLandUrl: isDev ? process.env.REACT_APP_API_LAND_URL : process.env.REACT_APP_API_LAND_URL,
        getAllLand: () => `${APIS.baseLandUrl}/GetAll?justChildren=true&isActive=true`,

        baseCuttingUrl: isDev ? process.env.REACT_APP_API_CUTTING_URL : process.env.REACT_APP_API_CUTTING_URL,
        getAllCutting: () => `${APIS.baseCuttingUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        getAllCuttingColor:()=>{return (`${APIS.baseCuttingUrl}/GetAllCuttingColor`)},
        addCuttingColor:()=>{return(`${APIS.baseCuttingUrl}/AddCuttingColor`)},

        baseColorUrl:isDev?process.env.REACT_APP_API_COLOR_URL: process.env.REACT_APP_API_COLOR_URL,
        getAllColor:()=>{return (`${APIS.baseColorUrl}/GetAll?pageSize=1000000000&pageNum=0`)},

    };

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [landRes, cuttingRes, colorRes,cuttingColorRes,cuttingLandRes] = await Promise.all([
                    axios.get(APIS.getAllLand(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllCutting(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllColor(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllCuttingColor(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllCuttingLand(), { headers: { Authorization: token } })
                ]);

                setLands(landRes.data);
                setCuttings(cuttingRes.data.data);
                setColors(colorRes.data.data);
                setCuttingColors(cuttingColorRes.data);
                setCuttingLand(cuttingLandRes.data.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Failed to load data');
            }
        };

        fetchData();
    }, [runUseEffect]);
// console.log(cuttingLand);
    // Prepare rows for DataGrid (without grouping by date)
    const prepareRows = () => {
        const rows = cuttingLand.flatMap((item, index) => {
            console.log(item.id);
            // إذا كانت البيانات مسطحة
            return {
                
                id: `${item.id}-${index}`,
                date: new Date(item.date).toLocaleDateString(),
                cuttingColorTitle: item.cuttingColor?.code || 'Unknown',
                landTitle: item.land?.title || 'Unknown',
                quantity: item.quantity,
                originalData: item
            };
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
            cuttingColorId: rowData.originalData.cuttingColor?.id,
            date: rowData.date
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
            await axios.post(`${APIS.updateCuttingLand()}?id=${id}`, dataToSend, {
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
            await axios.delete(`${APIS.deleteCuttingLand()}?id=${id}`, {
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
                landId: newData.landId,
                cuttings: newData.cuttings.map(mix => ({
                    quantity: parseFloat(mix.quantity),
                    cuttingColorId: parseInt(mix.cuttingColorId)
                }))
            };

            await axios.post(`${APIS.addCuttingLand()}`, dataToSend, {
                headers: { Authorization: token }
            });

            setAddModalOpen(false);
            setNewData({
                landId: 0,
                date: new Date().toISOString().split('T')[0],
                cuttings: [{ quantity: 0, cuttingColorId: 0 }]
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
            cuttings: [...prev.cuttings, { quantity: 0, cuttingColorId: 0 }]
        }));
    };

    const handleRemoveMix = (index) => {
        if (newData.cuttings.length <= 1) return;
        setNewData(prev => ({
            ...prev,
            cuttings: prev.cuttings.filter((_, i) => i !== index)
        }));
    };

    const handleMixChange = (index, field, value) => {
        const updatedMixes = [...newData.cuttings];
        updatedMixes[index][field] = value;
        setNewData(prev => ({ ...prev, cuttings: updatedMixes }));
    };

    // Add new color functions
    const handleAddNewColor = () => {
        setAddColorModalOpen(true);
    };

    const handleAddColorCancel = () => {
        setAddColorModalOpen(false);
        setNewColorData({
            cuttingId: '',
            colorId: '',
            code: ''
        });
    };

    const handleAddColorSubmit = async () => {
        try {
            await axios.post(APIS.addCuttingColor(), newColorData, {
                headers: { Authorization: token }
            });
            
            // Refresh cutting colors
            const res = await axios.get(APIS.getAllCuttingColor(), { headers: { Authorization: token } });
            setCuttingColors(res.data);
            
            setAddColorModalOpen(false);
            setNewColorData({
                cuttingId: '',
                colorId: '',
                code: ''
            });
            alert('تمت إضافة اللون بنجاح');
        } catch (err) {
            console.error(err);
            alert('فشل في إضافة اللون');
        }
    };

    // Columns configuration
    const columns = [
        { field: 'date', headerName: 'Date', width: 150 },
        { field: 'cuttingColorTitle', headerName: 'Cutting Color', width: 150 },
        { field: 'landTitle', headerName: 'Land', width: 150 },
        { field: 'quantity', headerName: 'Quantity', width: 100 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
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

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Cutting to Land Applications" />

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
                <DialogTitle>Add New Application</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Land"
                            value={newData.landId}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewData({...newData, landId: e.target.value})}
                            sx={{ flex: 2 }}
                            SelectProps={{ native: true }}
                        >
                            <option value=""></option>
                            {lands.map((land) => (
                                <option key={land.id} value={land.id}>{land.title}</option>
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

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Cuttings</Typography>
                        
                        {newData.cuttings.map((mix, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <TextField
                                    select
                                    label="Cutting Color"
                                    value={mix.cuttingColorId}
                                    onChange={(e) => handleMixChange(index, 'cuttingColorId', e.target.value)}
                                    sx={{ flex: 2 }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {cuttingColors.map((cc) => (
                                        <MenuItem key={cc.id} value={cc.id}>{cc.code}</MenuItem>
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
                                    disabled={newData.cuttings.length <= 1}
                                >
                                    <BsTrash />
                                </IconButton>
                            </Box>
                        ))}

                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <MuiButton 
                                variant="outlined" 
                                onClick={handleAddMix}
                                startIcon={<BsPlus />}
                            >
                                Add New Cutting
                            </MuiButton>
                            
                            <MuiButton 
                                variant="outlined" 
                                onClick={handleAddNewColor}
                                startIcon={<BsPlus />}
                                color="secondary"
                            >
                                Add New Color
                            </MuiButton>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setAddModalOpen(false)}>Cancel</MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={!newData.landId || !newData.cuttings.every(m => m.cuttingColorId && m.quantity)}
                    >
                        Save
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Add Color Modal */}
            <Dialog open={addColorModalOpen} onClose={handleAddColorCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Cutting Color</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Cutting"
                            value={newColorData.cuttingId}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewColorData({...newColorData, cuttingId: e.target.value})}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {cuttings.map((cutting) => (
                                <MenuItem key={cutting.id} value={cutting.id}>{cutting.title}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Color"
                            value={newColorData.colorId}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewColorData({...newColorData, colorId: e.target.value})}
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            {colors.map((color) => (
                                <MenuItem key={color.id} value={color.id}>{color.title}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Code"
                            value={newColorData.code}
                            fullWidth
                            margin="normal"
                            onChange={(e) => setNewColorData({...newColorData, code: e.target.value})}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleAddColorCancel}>Cancel</MuiButton>
                    <MuiButton 
                        onClick={handleAddColorSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={!newColorData.cuttingId || !newColorData.colorId || !newColorData.code}
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
                                <option key={land.id} value={land.id}>{land.title}</option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Cutting Color"
                            value={tempData.cuttingColorId || ''}
                            onChange={(e) => setTempData({...tempData, cuttingColorId: e.target.value})}
                            fullWidth
                            margin="normal"
                            SelectProps={{ native: true }}
                        >
                            {cuttingColors.map((cc) => (
                                <option key={cc.id} value={cc.id}>{cc.code}</option>
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

export default CuttingToLand;