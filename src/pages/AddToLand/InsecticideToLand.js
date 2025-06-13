import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Chip, MenuItem, Select, InputLabel, FormControl, Box, Dialog, DialogActions, 
  DialogContent, DialogTitle, IconButton, TextField, Typography, Button as MuiButton,
  CircularProgress
} from '@mui/material';
import { Header } from '../../components';
import { BsArrowDown, BsArrowUp, BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import { BiDownload, BiCheckCircle, BiXCircle } from 'react-icons/bi';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';

const InsecticideToLand = () => {
    // States
    const [insecticideLand, setInsecticideLand] = useState([]);
    const [insecticides, setInsecticides] = useState([]);
    const [lands, setLands] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [tempData, setTempData] = useState({});
    const [newData, setNewData] = useState({
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
        deleteIsecticideLand: (id) => `${APIS.baseInsecticideLandUrl}/Remove?id=${id}`,
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
                    type: insect.type || 0
                })));
                setInsecticideLand(insecticideLandRes.data.data);
            } catch (err) {
                console.error('Veri alınırken hata:', err);
                showNotification('Veri yüklenemedi', 'error');
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
                        insecticideTitle: item.insecticide?.title || 'Bilinmiyor',
                        landTitle: item.land?.title || 'Bilinmiyor',
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

    const handleEditSave = async () => {
        try {
            // Validate required fields
            if (!tempData.landId || !tempData.insecticideId || !tempData.date || tempData.liter === '') {
                showNotification('Lütfen zorunlu alanları doldurunuz', 'error');
                return;
            }

            setLoading(true);
            const { id, ...dataToSend } = tempData;
            await axios.post(`${APIS.updateInsecticideLand()}?id=${id}`, dataToSend, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Uygulama başarıyla güncellendi');
        } catch (err) {
            console.error(err);
            showNotification('Uygulama güncellenirken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete functions
    const confirmDelete = (id) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            await axios.delete(APIS.deleteIsecticideLand(itemToDelete), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Uygulama başarıyla silindi');
        } catch (err) {
            console.error(err);
            showNotification('Uygulama silinirken hata oluştu', 'error');
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    // Add functions
    const handleAddSubmit = async () => {
        try {
            // Validate required fields
            if (newData.landIds.length === 0 || !newData.date || 
                newData.mixes.some(mix => !mix.insecticideId || mix.liter === '')) {
                showNotification('Lütfen zorunlu alanları doldurunuz', 'error');
                return;
            }

            setLoading(true);
            const dataToSend = {
                note: newData.note,
                date: newData.date,
                landIds: newData.landIds.map(id => parseInt(id)),
                mixes: newData.mixes.map(mix => ({
                    liter: parseFloat(mix.liter),
                    quantity: mix.quantity ? parseFloat(mix.quantity) : null,
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
            showNotification('Uygulama başarıyla eklendi');
        } catch (err) {
            console.error(err);
            showNotification('Uygulama eklenirken hata oluştu', 'error');
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
        
        if (field === 'insecticideId') {
            const selectedInsecticide = insecticides.find(insect => insect.id === parseInt(value));
            updatedMixes[index].insecticideType = selectedInsecticide?.type || 0;
            
            if (selectedInsecticide?.type === 0) {
                updatedMixes[index].quantity = '';
            }
        }
        
        updatedMixes[index][field] = value;
        setNewData(prev => ({ ...prev, mixes: updatedMixes }));
    };

    const handleLandChange = (selectedOptions) => {
        setNewData(prev => ({
            ...prev,
            landIds: selectedOptions.map(option => option.value)
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
        { field: 'date', headerName: 'Tarih', width: 120 },
        { field: 'insecticideTitle', headerName: 'İlaç', width: 130 },
        { field: 'landTitle', headerName: 'Tarla', width: 130 },
        { field: 'liter', headerName: 'Litre', width: 120, align: 'center', headerAlign: 'center' },
        { field: 'quantity', headerName: 'Miktar', width: 120, align: 'center', headerAlign: 'center' },
        { field: 'note', headerName: 'Notlar', width: 130 },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 170,
            renderCell: (params) => {
                if (params.row.isParent || params.row.isAddNew) return null;
                
                return (
                    <Box sx={{ 
                        display: 'flex', 
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        margin: 0
                    }}>
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
                            onClick={() => confirmDelete(params.row.originalData.id)}
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
                        Yeni Ekle
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
            const response = await axios.post(APIS.excelIsecticideLand(), null, {
                headers: { Authorization: token },
                responseType: 'blob'
            });
        
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ilaç_uygulamaları.xlsx');
            document.body.appendChild(link);
            link.click();
            
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showNotification('Excel başarıyla dışa aktarıldı');
        } catch (err) {
            console.error('Excel dışa aktarılırken hata:', err);
            showNotification('Excel dışa aktarılırken hata oluştu', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header title="Tarlalara İlaç Uygulamaları" />
            
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
                    {loading ? 'Dışa Aktarılıyor...' : 'Excel İndir'}
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
                <DialogTitle>Yeni İlaç Uygulaması Ekle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id="lands-label">Tarlalar*</InputLabel>
                            <Select
                                options={lands.map(land => ({
                                    value: land.land.id,
                                    label: land.land.title
                                }))}
                                values={newData.landIds.map(id => ({
                                    value: id,
                                    label: lands.find(l => l.land.id === id)?.land.title || id
                                }))}
                                onChange={handleLandChange}
                                multi
                                placeholder="Tarla seçin"
                                dropdownHeight="300px"
                                style={{
                                    minHeight: '56px',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(0, 0, 0, 0.23)'
                                }}
                                dropdownHandleRenderer={({ state }) => (
                                    <div style={{ padding: '8px', cursor: 'pointer' }}>
                                        {state.dropdown ? <BsArrowUp /> : <BsArrowDown />}
                                    </div>
                                )}
                            />
                        </FormControl>

                        <TextField
                            label="Tarih*"
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
                            label="Notlar"
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

                        <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>İlaç Karışımları*</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Box key={index} sx={{ 
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr auto',
                                gap: 2,
                                alignItems: 'center'
                            }}>
                                <TextField
                                    select
                                    label="İlaç*"
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
                                    <option value="">İlaç Seçin</option>
                                    {insecticides.map((insect) => (
                                        <option key={insect.id} value={insect.id}>
                                            {insect.title} ({insect.type === 0 ? 'Sıvı' : 'Toz'})
                                        </option>
                                    ))}
                                </TextField>

                                <TextField
                                    label="Litre(ml)*"
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
                                    label="Miktar"
                                    type="number"
                                    value={mix.quantity}
                                    onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                                    fullWidth
                                    disabled={mix.insecticideType === 0}
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
                            Karışım Ekle
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
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            padding: '8px 16px',
                            boxShadow: 'none'
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>İlaç Uygulamasını Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label="Tarla*"
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
                            <option value="">Tarla Seçin</option>
                            {lands.map((land) => (
                                <option key={land.land.id} value={land.land.id}>{land.land.title}</option>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="İlaç*"
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
                            SelectProps={{ native: true }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    padding: '10px 14px'
                                }
                            }}
                        >
                            <option value="">İlaç Seçin</option>
                            {insecticides.map((insect) => (
                                <option key={insect.id} value={insect.id}>
                                    {insect.title} ({insect.type === 0 ? 'Sıvı' : 'Toz'})
                                </option>
                            ))}
                        </TextField>

                        <TextField
                            label="Tarih*"
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
                            label="Litre(ml)*"
                            type="number"
                            value={tempData.liter || ''}
                            onChange={(e) => setTempData({...tempData, liter: e.target.value})}
                            fullWidth
                            sx={{
                                '& .MuiInputBase-input': {
                                    padding: '10px 14px'
                                }
                            }}
                        />

                        <TextField
                            label="Miktar"
                            type="number"
                            value={tempData.quantity || ''}
                            onChange={(e) => setTempData({...tempData, quantity: e.target.value})}
                            fullWidth
                            disabled={tempData.insecticideType === 0}
                            sx={{
                                '& .MuiInputBase-input': {
                                    padding: '10px 14px'
                                },
                                '& .Mui-disabled': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        />

                        <TextField
                            label="Notlar"
                            value={tempData.note || ''}
                            onChange={(e) => setTempData({...tempData, note: e.target.value})}
                            fullWidth
                            multiline
                            rows={3}
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
                        İptal
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
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Silme Onayı</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Bu ilaç uygulamasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <MuiButton 
                        onClick={handleDeleteCancel}
                        disabled={loading}
                        sx={{ 
                            mr: 1,
                            padding: '8px 16px',
                            color: 'text.secondary'
                        }}
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            padding: '8px 16px',
                            boxShadow: 'none'
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sil'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default InsecticideToLand;