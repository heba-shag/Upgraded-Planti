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
  Menu,
  useTheme
} from '@mui/material';
import { Header } from '../../../components';
import { BsArrowDown, BsArrowUp, BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';
import axios from 'axios';
import { useStateContext } from '../../../contexts/ContextProvider';

const InsecticideDetailsDropdown = ({ mixDetails = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

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
        sx={{ 
          minWidth: '150px',
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.dark,
            color: theme.palette.primary.dark,
          }
        }}
      >
        {mixDetails.length} ilaç
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
                  {detail.insecticide?.publicTitle || 'Bilinmeyen İlaç'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adet: {detail.quantity || 'Yok'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Litre: {detail.liter || 'Yok'}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>İlaç bulunamadı</MenuItem>
        )}
      </Menu>
    </div>
  );
};

const InsecticideMix = () => {
    // States
    const [insecticides, setInsecticides] = useState([]);
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
        note: '',
        mixes: [{insecticideId: "", liter: 0, quantity: 0, type: 0 }]
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
    
    const APIS = {
        baseInsecticideUrl: isDev ? 
            process.env.REACT_APP_API_INSECTICIDE_URL : 
            process.env.REACT_APP_API_INSECTICIDE_URL,
        getAllInsecticide: () => `${APIS.baseInsecticideUrl}/GetAll?pageSize=1000000000&pageNum=0`,
        getAllInsecticideMix: () => `${APIS.baseInsecticideUrl}/GetAllMixes`,
        addInsecticideMix: () => `${APIS.baseInsecticideUrl}/AddMix`,
        deleteInsecticideMix: (id) => `${APIS.baseInsecticideUrl}/RemoveMix?id=${id}`,
        updateInsecticideMix: () => `${APIS.baseInsecticideUrl}/UpdateMix`,
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
                const [insecticideRes, mixRes] = await Promise.all([
                    axios.get(APIS.getAllInsecticide(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllInsecticideMix(), { headers: { Authorization: token } }),
                ]);

                setInsecticides(insecticideRes.data.data || insecticideRes.data);
                setMixes(mixRes.data.data || mixRes.data);
            } catch (err) {
                showNotification('Veriler yüklenirken hata oluştu', 'error');
                console.error('Veri yükleme hatası:', err);
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
            note: mix.note,
            color: getColorName(mix.color),
            details: mix.mixDetails || [],
            originalData: mix
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
            title: originalData.title,
            note: originalData.note,
            color: originalData.color,
            mixes: originalData.mixDetails?.map(detail => ({
                insecticideId: detail.insecticideId,
                quantity: detail.quantity,
                liter: detail.liter,
                type: detail.insecticide?.type || 0
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
            // Validate required fields
            if (!tempData.title || !tempData.color) {
                showNotification('Lütfen zorunlu alanları doldurunuz', 'error');
                return;
            }

            setLoading(true);
            const { id, ...dataToSend } = tempData;
            await axios.post(`${APIS.updateInsecticideMix()}?id=${id}&title=${dataToSend.title}&note=${dataToSend.note}&color=${dataToSend.color}`, null, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('İlaç karışımı başarıyla güncellendi');
        } catch (err) {
            showNotification('İlaç karışımı güncellenirken hata oluştu', 'error');
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
            await axios.delete(APIS.deleteInsecticideMix(itemToDelete), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('İlaç karışımı başarıyla silindi');
        } catch (err) {
            showNotification('İlaç karışımı silinirken hata oluştu', 'error');
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
            if (!newData.title || !newData.color || newData.mixes.some(mix => !mix.insecticideId)) {
                showNotification('Lütfen zorunlu alanları doldurunuz', 'error');
                return;
            }

            setLoading(true);
            await axios.post(APIS.addInsecticideMix(), newData, {
                headers: { Authorization: token }
            });

            setAddModalOpen(false);
            setNewData({
                title: "",
                note: '',
                color: 0,
                mixes: [{ insecticideId: "", liter: 0, quantity: 0, type: 0 }]
            });
            setRun(prev => prev + 1);
            showNotification('İlaç karışımı başarıyla eklendi');
        } catch (err) {
            showNotification('İlaç karışımı eklenirken hata oluştu', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMix = () => {
        setNewData(prev => ({
            ...prev,
            mixes: [...prev.mixes, { insecticideId: "", liter: 0, quantity: 0, type: 0 }]
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
            
            if (field === 'insecticideId') {
                const selectedInsecticide = insecticides.find(insec => insec.id === value);
                updatedMixes[index].type = selectedInsecticide?.type || 0;
            }
            
            setTempData(prev => ({ ...prev, mixes: updatedMixes }));
        } else {
            const updatedMixes = [...newData.mixes];
            updatedMixes[index][field] = value;
            
            if (field === 'insecticideId') {
                const selectedInsecticide = insecticides.find(insec => insec.id === value);
                updatedMixes[index].type = selectedInsecticide?.type || 0;
            }
            
            setNewData(prev => ({ ...prev, mixes: updatedMixes }));
        }
    };

    // Columns configuration
    const columns = [
        { field: 'title', headerName: 'Ad', width: 200 },
        { field: 'note', headerName: 'Not', width: 200 },
        { field: 'color', headerName: 'Renk', width: 120 },
        {
            field: 'details',
            headerName: 'İlaçlar',
            width: 180,
            renderCell: (params) => (
                <InsecticideDetailsDropdown 
                    mixDetails={params.row.originalData?.mixDetails || []} 
                />
            ),
            sortable: false,
            filterable: false
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
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        margin: 0
                    }}>
                        <IconButton 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(params.row);
                            }}
                            disabled={loading}
                            style={{width:"20%"}}
                            size="small"
                            sx={{ 
                                color: theme.palette.primary.main,
                                '&:hover': { 
                                    color: theme.palette.primary.dark,
                                    backgroundColor: 'transparent',
                                },
                                '&:disabled': {
                                    color: theme.palette.action.disabled
                                },
                                borderRadius: 0,
                                padding: '4px',
                                margin: 0,
                                minWidth: '28px',
                                minHeight: '32px',
                                justifyContent:'start'
                            }}
                        >
                            <BsPencil size={16} />
                        </IconButton>
                        <IconButton 
                            onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(params.row.originalData.id);
                            }}
                            style={{width:"20%"}}
                            disabled={loading}
                            size="small"
                            sx={{ 
                                color: theme.palette.error.main,
                                '&:hover': { 
                                    color: theme.palette.error.dark,
                                    backgroundColor: 'transparent',
                                },
                                '&:disabled': {
                                    color: theme.palette.action.disabled
                                },
                                borderRadius: 0,
                                padding: '4px',
                                margin: 0,
                                minWidth: '28px',
                                minHeight: '32px'
                            }}
                        >
                            <BsTrash size={16} />
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
            <Header title="İlaç Karışım Yönetimi" />

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
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Yeni İlaç Karışımı Ekle</DialogTitle>
                <DialogContent>
                    <Box sx={{ 
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <TextField
                            label="Ad*"
                            value={newData.title}
                            onChange={(e) => setNewData({...newData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            label="Not"
                            value={newData.note}
                            onChange={(e) => setNewData({...newData, note: e.target.value})}
                            fullWidth
                            margin="normal"
                            sx={{ mb: 2 }}
                            multiline
                            rows={2}
                        />

                        <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
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

                        <Typography variant="h6" sx={{ mb: 2 }}>İlaçlar*</Typography>
                        
                        {newData.mixes.map((mix, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                mb: 2,
                                flexWrap: 'wrap'
                            }}>
                                <FormControl sx={{ flex: 2, minWidth: '200px' }}>
                                    <InputLabel>İlaç*</InputLabel>
                                    <Select
                                        value={mix.insecticideId}
                                        label="İlaç"
                                        onChange={(e) => handleMixChange(index, 'insecticideId', e.target.value)}
                                    >
                                        {insecticides.map(insec => (
                                            <MenuItem key={insec.id} value={insec.id}>
                                                {insec.publicTitle} ({insec.type === 0 ? 'Sabit' : 'Değişken'})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Adet"
                                    type="number"
                                    value={mix.quantity}
                                    onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                                    sx={{ 
                                        flex: 1, 
                                        minWidth: '120px',
                                        '& .MuiInputBase-root': {
                                            backgroundColor: mix.type === 0 ? '#f5f5f5' : 'inherit'
                                        }
                                    }}
                                    InputProps={{
                                        readOnly: mix.type === 0,
                                    }}
                                    disabled={mix.type === 0}
                                />

                                <TextField
                                    label="Litre(ml)*"
                                    type="number"
                                    value={mix.liter}
                                    onChange={(e) => handleMixChange(index, 'liter', e.target.value)}
                                    sx={{ flex: 1, minWidth: '120px' }}
                                />

                                <IconButton 
                                    onClick={() => handleRemoveMix(index)}
                                    disabled={newData.mixes.length <= 1}
                                    sx={{
                                        color: theme.palette.error.main,
                                        '&:hover': {
                                            color: theme.palette.error.dark,
                                            backgroundColor: 'transparent',
                                        }
                                    }}
                                >
                                    <BsTrash />
                                </IconButton>
                            </Box>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                            <MuiButton 
                                variant="outlined" 
                                onClick={handleAddMix}
                                startIcon={<BsPlus />}
                                sx={{ 
                                    px: 3,
                                    py: 1,
                                    fontSize: '0.875rem'
                                }}
                            >
                                İlaç Ekle
                            </MuiButton>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <MuiButton 
                        onClick={() => setAddModalOpen(false)} 
                        disabled={loading}
                        sx={{ 
                            mr: 2,
                            px: 3,
                            py: 1
                        }}
                        variant="outlined"
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleAddSubmit} 
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        sx={{ 
                            px: 3,
                            py: 1
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>İlaç Karışımını Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Ad*"
                            value={tempData.title || ''}
                            onChange={(e) => setTempData({...tempData, title: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Not"
                            value={tempData.note || ''}
                            onChange={(e) => setTempData({...tempData, note: e.target.value})}
                            fullWidth
                            margin="normal"
                        />

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

                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>İlaçlar*</Typography>
                        
                        {tempData.mixes?.map((mix, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                mb: 2,
                                flexWrap: 'wrap'
                            }}>
                                <FormControl sx={{ flex: 2, minWidth: '200px' }}>
                                    <InputLabel>İlaç*</InputLabel>
                                    <Select
                                        value={mix.insecticideId}
                                        label="İlaç"
                                        onChange={(e) => handleMixChange(index, 'insecticideId', e.target.value, true)}
                                    >
                                        {insecticides.map(insec => (
                                            <MenuItem key={insec.id} value={insec.id}>
                                                {insec.publicTitle} ({insec.type === 0 ? 'Sabit' : 'Değişken'})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Adet"
                                    type="number"
                                    value={mix.quantity}
                                    onChange={(e) => handleMixChange(index, 'quantity', e.target.value, true)}
                                    sx={{ 
                                        flex: 1, 
                                        minWidth: '120px',
                                        '& .MuiInputBase-root': {
                                            backgroundColor: mix.type === 0 ? '#f5f5f5' : 'inherit'
                                        }
                                    }}
                                    InputProps={{
                                        readOnly: mix.type === 0,
                                    }}
                                    disabled={mix.type === 0}
                                />

                                <TextField
                                    label="Litre(ml)*"
                                    type="number"
                                    value={mix.liter}
                                    onChange={(e) => handleMixChange(index, 'liter', e.target.value, true)}
                                    sx={{ flex: 1, minWidth: '120px' }}
                                />

                                <IconButton 
                                    onClick={() => handleRemoveMix(index, true)}
                                    disabled={tempData.mixes.length <= 1}
                                    sx={{
                                        color: theme.palette.error.main,
                                        '&:hover': {
                                            color: theme.palette.error.dark,
                                            backgroundColor: 'transparent',
                                        }
                                    }}
                                >
                                    <BsTrash />
                                </IconButton>
                            </Box>
                        ))}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                            <MuiButton 
                                variant="outlined" 
                                onClick={() => handleAddMix(true)}
                                startIcon={<BsPlus />}
                                sx={{ 
                                    px: 3,
                                    py: 1,
                                    fontSize: '0.875rem'
                                }}
                            >
                                İlaç Ekle
                            </MuiButton>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton 
                        onClick={handleEditCancel} 
                        disabled={loading}
                        sx={{ mr: 1 }}
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
            <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Silme Onayı</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Bu ilaç karışımını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <MuiButton 
                        onClick={handleDeleteCancel}
                        disabled={loading}
                        sx={{ 
                            mr: 2,
                            px: 3,
                            py: 1
                        }}
                        variant="outlined"
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                        disabled={loading}
                        sx={{ 
                            px: 3,
                            py: 1
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sil'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default InsecticideMix;