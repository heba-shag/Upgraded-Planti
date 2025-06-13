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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
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
                showNotification('Veriler yüklenemedi', 'error');
                console.error('Veri çekme hatası:', err);
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
            type: mix.type === 0 ? "Yaprak gübreleme" : "Damlama gübreleme",
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
            1: "Kırmızı",
            2: "Mavi",
            3: "Yeşil",
            4: "Sarı",
            5: "Mor",
            6: "Turuncu"
        };
        return colors[color] || "Bilinmiyor";
    };

    // Edit functions
    const handleEdit = (rowData) => {
        if (!rowData || !rowData.originalData) {
            console.error('Düzenleme için geçersiz satır verisi');
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
            // Validate required fields
            if (!tempData.title) {
                showNotification('Lütfen zorunlu alanları doldurunuz', 'error');
                return;
            }

            setLoading(true);
            const { id, ...dataToSend } = tempData;
            await axios.post(`${APIS.updateFertilizerMix()}?id=${id}&title=${dataToSend.title}&type=${dataToSend.type}&color=${dataToSend.color}`, null,
             {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Gübre karışımı başarıyla güncellendi');
        } catch (err) {
            showNotification(err.response?.data?.errorMessage || 'Gübre karışımı güncellenemedi', 'error');
            console.error(err);
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
            await axios.delete(APIS.deleteFertilizerMix(itemToDelete), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Gübre karışımı başarıyla silindi');
        } catch (err) {
            showNotification(err.response?.data?.errorMessage || 'Gübre karışımı silinemedi', 'error');
            console.error(err);
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
            if (!newData.title || newData.mixes.some(mix => !mix.fertilizerId)) {
                showNotification('Lütfen zorunlu alanları doldurunuz', 'error');
                return;
            }

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
            showNotification('Gübre karışımı başarıyla eklendi');
        } catch (err) {
            showNotification(err.response?.data?.errorMessage || 'Gübre karışımı eklenemedi', 'error');
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
            headerName: 'Ad', 
            flex: 1,
            minWidth: 150 
        },
        { 
            field: 'type', 
            headerName: 'Tür', 
            flex: 1,
            minWidth: 150 
        },
        { 
            field: 'color', 
            headerName: 'Renk', 
            minWidth: 120 
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 170,
            renderCell: (params) => {
                if (params.row.isAddNew) return null;
                
                return (
                    <Box sx={{ 
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        padding: 0,
                        margin: 0
                    }}>
                        <IconButton 
                            style={{width:"20%"}}
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
                            style={{width:"20%"}}
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(params.row.id);
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
                        Yeni Ekle
                    </MuiButton>
                );
            },
            sortable: false,
            filterable: false
        }
    ];

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header title="Gübre Karışımları Yönetimi" />

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
                <DialogTitle>Gübre Karışımı Ekle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Başlık*"
                            value={newData.title}
                            onChange={(e) => setNewData({...newData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Tür*</InputLabel>
                                    <Select
                                        value={newData.type}
                                        label="Tür"
                                        onChange={(e) => setNewData({...newData, type: e.target.value})}
                                    >
                                        <MenuItem value={0}>Yaprak gübreleme</MenuItem>
                                        <MenuItem value={1}>Damlama gübreleme</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Renk*</InputLabel>
                                    <Select
                                        value={newData.color}
                                        label="Renk"
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

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Gübreler*</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={7}>
                                    <FormControl fullWidth>
                                        <InputLabel>Gübre*</InputLabel>
                                        <Select
                                            value={mix.fertilizerId}
                                            label="Gübre"
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
                                        label="Miktar*"
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
                            Gübre Ekle
                        </MuiButton>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <MuiButton 
                        onClick={() => setAddModalOpen(false)} 
                        disabled={loading}
                        sx={{ mr: 1 }}
                        variant="outlined"
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
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
                <DialogTitle>Gübre Karışımını Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Ad*"
                            value={tempData.title || ''}
                            onChange={(e) => setTempData({...tempData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Tür*</InputLabel>
                                    <Select
                                        value={tempData.type || 0}
                                        label="Tür"
                                        onChange={(e) => setTempData({...tempData, type: e.target.value})}
                                    >
                                        <MenuItem value={0}>Yaprak gübreleme</MenuItem>
                                        <MenuItem value={1}>Damlama gübreleme</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Renk*</InputLabel>
                                    <Select
                                        value={tempData.color || 0}
                                        label="Renk"
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
                        variant="outlined"
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteConfirmOpen} 
                onClose={handleDeleteCancel} 
                maxWidth="sm" 
                fullWidth
            >
                <DialogTitle>Silme Onayı</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Bu gübre karışımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <MuiButton 
                        onClick={handleDeleteCancel}
                        disabled={loading}
                        sx={{ mr: 1 }}
                        variant="outlined"
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sil'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FertilizerMix;