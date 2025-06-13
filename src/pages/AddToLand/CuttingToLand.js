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
  FormControl, 
  InputLabel, 
  Chip, 
  MenuItem, 
  CircularProgress
} from '@mui/material';
import { Header } from '../../components';
import {  BsPencil, BsPlus, BsTrash } from 'react-icons/bs';
import {  BiCheckCircle, BiXCircle } from 'react-icons/bi';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';

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
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null
  });
  const [tempData, setTempData] = useState({});
  const [newData, setNewData] = useState({
    landId: 0,
    date: new Date().toISOString().split('T')[0],
    cuttings: [{
      quantity: '',
      cuttingColorId: ''
    }]
  });
  const [runUseEffect, setRun] = useState(0);
  const [addColorModalOpen, setAddColorModalOpen] = useState(false);
  const [newColorData, setNewColorData] = useState({
    cuttingId: '',
    colorId: '',
    code: ''
  });
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
    baseCuttingLandUrl: isDev ? process.env.REACT_APP_API_CUTTINGLAND_URL : process.env.REACT_APP_API_CUTTINGLAND_URL,
    getAllCuttingLand: () => `${APIS.baseCuttingLandUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    addCuttingLand: () => `${APIS.baseCuttingLandUrl}/Add`,
    deleteCuttingLand: (id) => `${APIS.baseCuttingLandUrl}/Remove?id=${id}`,
    updateCuttingLand: () => `${APIS.baseCuttingLandUrl}/Update`,

    baseLandUrl: isDev ? process.env.REACT_APP_API_LAND_URL : process.env.REACT_APP_API_LAND_URL,
    getAllLand: () => `${APIS.baseLandUrl}/GetAll?justChildren=true`,

    baseCuttingUrl: isDev ? process.env.REACT_APP_API_CUTTING_URL : process.env.REACT_APP_API_CUTTING_URL,
    getAllCutting: () => `${APIS.baseCuttingUrl}/GetAll?pageSize=1000000000&pageNum=0`,
    getAllCuttingColor: () => `${APIS.baseCuttingUrl}/GetAllCuttingColor`,
    addCuttingColor: () => `${APIS.baseCuttingUrl}/AddCuttingColor`,

    baseColorUrl: isDev ? process.env.REACT_APP_API_COLOR_URL : process.env.REACT_APP_API_COLOR_URL,
    getAllColor: () => `${APIS.baseColorUrl}/GetAll?pageSize=1000000000&pageNum=0`,
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
        const [landRes, cuttingRes, colorRes, cuttingColorRes, cuttingLandRes] = await Promise.all([
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
        console.error('Veri yüklenirken hata oluştu:', err);
        showNotification('Veri yüklenemedi', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [runUseEffect]);

  // Prepare rows for DataGrid
  const prepareRows = () => {
    const rows = cuttingLand.map((item) => ({
      id: item.id,
      date: new Date(item.date).toLocaleDateString(),
      cuttingColorTitle: item.cuttingColor?.code || 'Bilinmiyor',
      landTitle: item.land?.title || 'Bilinmiyor',
      quantity: item.quantity,
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
      landId: rowData.originalData.land?.id,
      cuttingColorId: rowData.originalData.cuttingColor?.id,
      date: rowData.date,
      note: rowData.originalData.note || ''
    });
    setEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setTempData({});
    setEditModalOpen(false);
  };

  const handleEditSave = async () => {
    if (!tempData.quantity || !tempData.cuttingColorId || !tempData.landId) {
      showNotification('Lütfen zorunlu alanları doldurun (Adet, Fide Renk ve Tarla)', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const { id, ...dataToSend } = tempData;
      await axios.post(`${APIS.updateCuttingLand()}?id=${id}`, {
        ...dataToSend,
        note: dataToSend.note || null
      }, {
        headers: { Authorization: token }
      });
      
      setRun(prev => prev + 1);
      setEditModalOpen(false);
      showNotification('Fide uygulaması başarıyla güncellendi');
    } catch (err) {
      console.error(err);
      showNotification('Fide uygulaması güncellenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete functions
  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(APIS.deleteCuttingLand(deleteConfirm.id), {
        headers: { Authorization: token }
      });
      setRun(prev => prev + 1);
      showNotification('Fide uygulaması başarıyla silindi');
    } catch (err) {
      console.error(err);
      showNotification('Fide uygulaması silinemedi', 'error');
    } finally {
      setLoading(false);
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  // Add functions
  const handleAddSubmit = async () => {
    if (!newData.landId || !newData.date || !newData.cuttings.every(m => m.cuttingColorId && m.quantity)) {
      showNotification('Lütfen tüm zorunlu alanları doldurun (Tarla, Tarih ve Fide bilgileri)', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const dataToSend = {
        date: newData.date,
        landId: newData.landId,
        cuttings: newData.cuttings.map(mix => ({
          quantity: parseFloat(mix.quantity) || 0,
          cuttingColorId: parseInt(mix.cuttingColorId)
        }))
      };

      await axios.post(APIS.addCuttingLand(), dataToSend, {
        headers: { Authorization: token }
      });

      setAddModalOpen(false);
      setNewData({
        landId: 0,
        date: new Date().toISOString().split('T')[0],
        cuttings: [{ quantity: '', cuttingColorId: '' }]
      });
      setRun(prev => prev + 1);
      showNotification('Fide uygulaması başarıyla eklendi');
    } catch (err) {
      console.error(err);
      showNotification('Fide uygulaması eklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMix = () => {
    setNewData(prev => ({
      ...prev,
      cuttings: [...prev.cuttings, { quantity: '', cuttingColorId: '' }]
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
    if (!newColorData.cuttingId || !newColorData.colorId || !newColorData.code) {
      showNotification('Lütfen tüm alanları doldurun', 'error');
      return;
    }
    
    try {
      setLoading(true);
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
      showNotification('Fide rengi başarıyla eklendi');
    } catch (err) {
      console.error(err);
      showNotification('Fide rengi eklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Columns configuration
  const columns = [
    { field: 'date', headerName: 'Tarih', width: 150 },
    { field: 'cuttingColorTitle', headerName: 'Fide Renk Kodu', width: 180 },
    { field: 'landTitle', headerName: 'Tarla', width: 180 },
    { 
      field: 'quantity', 
      headerName: 'Adet', 
      width: 120,
      align: 'center',
      headerAlign: 'center'
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
      <Header title="Fide Tarla Uygulamaları" />
      
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.show} onClose={cancelDelete}>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={cancelDelete} color="primary">
            İptal
          </MuiButton>
          <MuiButton onClick={confirmDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Sil'}
          </MuiButton>
        </DialogActions>
      </Dialog>

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
        <DialogTitle>Yeni Fide Uygulaması Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Tarla"
              value={newData.landId}
              onChange={(e) => setNewData({...newData, landId: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              <option value=""></option>
              {lands.map((land) => (
                <option key={land.id} value={land.id}>{land.title}</option>
              ))}
            </TextField>

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

            <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>Fide Bilgileri</Typography>
            
            {newData.cuttings.map((mix, index) => (
              <Box key={index} sx={{ 
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: 2,
                alignItems: 'center'
              }}>
                <TextField
                  select
                  label="Fide Renk"
                  value={mix.cuttingColorId}
                  onChange={(e) => handleMixChange(index, 'cuttingColorId', e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '10px 14px'
                    }
                  }}
                >
                  <option value=""></option>
                  {cuttingColors.map((cc) => (
                    <option key={cc.id} value={cc.id}>{cc.code}</option>
                  ))}
                </TextField>

                <TextField
                  label="Adet"
                  type="number"
                  value={mix.quantity}
                  onChange={(e) => handleMixChange(index, 'quantity', e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: '10px 14px',
                      textAlign: 'left'
                    }
                  }}
                />

                <IconButton 
                  color="error"
                  onClick={() => handleRemoveMix(index)}
                  disabled={newData.cuttings.length <= 1}
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <MuiButton 
                variant="outlined" 
                onClick={handleAddMix}
                startIcon={<BsPlus />}
                sx={{ 
                  mt: 1,
                  padding: '8px 16px'
                }}
              >
                Fide Ekle
              </MuiButton>
              
              <MuiButton 
                variant="outlined" 
                onClick={handleAddNewColor}
                startIcon={<BsPlus />}
                color="secondary"
                sx={{ 
                  mt: 1,
                  padding: '8px 16px'
                }}
              >
                Yeni Renk Ekle
              </MuiButton>
            </Box>
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
            disabled={loading || !newData.landId || !newData.cuttings.every(m => m.cuttingColorId && m.quantity)}
            sx={{
              padding: '8px 16px',
              boxShadow: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Kaydet'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Add Color Modal */}
      <Dialog open={addColorModalOpen} onClose={handleAddColorCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Fide Rengi Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Fide"
              value={newColorData.cuttingId}
              onChange={(e) => setNewColorData({...newColorData, cuttingId: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              <option value=""></option>
              {cuttings.map((cutting) => (
                <option key={cutting.id} value={cutting.id}>{cutting.title}</option>
              ))}
            </TextField>

            <TextField
              select
              label="Renkler"
              value={newColorData.colorId}
              onChange={(e) => setNewColorData({...newColorData, colorId: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              <option value=""></option>
              {colors.map((color) => (
                <option key={color.id} value={color.id}>{color.title}</option>
              ))}
            </TextField>

            <TextField
              label="Kod"
              value={newColorData.code}
              onChange={(e) => setNewColorData({...newColorData, code: e.target.value})}
              fullWidth
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
            onClick={handleAddColorCancel}
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
            onClick={handleAddColorSubmit} 
            color="primary"
            variant="contained"
            disabled={loading || !newColorData.cuttingId || !newColorData.colorId || !newColorData.code}
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
        <DialogTitle>Fide Uygulamasını Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Tarla"
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
              {lands.map((land) => (
                <option key={land.id} value={land.id}>{land.title}</option>
              ))}
            </TextField>

            <TextField
              select
              label="Fide Renk"
              value={tempData.cuttingColorId || ''}
              onChange={(e) => setTempData({...tempData, cuttingColorId: e.target.value})}
              fullWidth
              SelectProps={{ native: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            >
              {cuttingColors.map((cc) => (
                <option key={cc.id} value={cc.id}>{cc.code}</option>
              ))}
            </TextField>

            <TextField
              label="Tarih"
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
              label="Adet"
              type="number"
              value={tempData.quantity || ''}
              onChange={(e) => setTempData({...tempData, quantity: e.target.value})}
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  padding: '10px 14px'
                }
              }}
            />

            <TextField
              label="Not"
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
            disabled={loading || !tempData.quantity || !tempData.cuttingColorId || !tempData.landId}
            sx={{
              padding: '8px 16px',
              boxShadow: 'none'
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Kaydet'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CuttingToLand;