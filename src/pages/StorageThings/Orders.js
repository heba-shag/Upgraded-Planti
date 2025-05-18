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
  useTheme,
  Checkbox,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import { Header } from '../../components';
import { BsArrowDown, BsArrowUp, BsPencil, BsPlus, BsTrash, BsInfoCircle, BsCheckCircle } from 'react-icons/bs';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';
import axios from 'axios';
import { useStateContext } from '../../contexts/ContextProvider';

const OrderDetailsDropdown = ({ orderDetails = [] }) => {
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
        {orderDetails.length} Ürün
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
        {orderDetails.length > 0 ? (
          orderDetails.map((detail, idx) => (
            <MenuItem key={idx} onClick={handleClose} dense>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1">
                  {detail.flowerStore?.code || 'Bilinmeyen Çiçek'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adet: {detail.count || 'Yok'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uzunluk: {detail.flowerStore?.flowerLong || 'Yok'}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>Ürün bulunamadı</MenuItem>
        )}
      </Menu>
    </div>
  );
};

const Orders = () => {
    // States
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [flowers, setFlowers] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editingStatusRow, setEditingStatusRow] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editStatusModalOpen, setEditStatusModalOpen] = useState(false);
    const [tempData, setTempData] = useState({});
    const [tempStatusData, setTempStatusData] = useState({});
    const [newData, setNewData] = useState({
        number: "",
        isBought: true,
        clientId: 0,
        orderDate: new Date().toISOString().slice(0, 16),
        boughtDate: new Date().toISOString().slice(0, 16),
        flowerOrderDetails: [{
            count: 1,
            code: "",
            long: 0
        }]
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
        baseClientUrl: isDev ? 
            process.env.REACT_APP_API_CLIENT_URL : 
            process.env.REACT_APP_API_CLIENT_URL,
        getAllClient: () => `${APIS.baseClientUrl}/GetAll?pageSize=1000&pageNum=0`,

        baseFlowerUrl: isDev ? 
            process.env.REACT_APP_API_FLOWER_URL : 
            process.env.REACT_APP_API_FLOWER_URL,
        getAllFlower: () => `${APIS.baseFlowerUrl}/GetAllFlowerStore?pageSize=1000&pageNum=0`,

        baseOrderUrl: isDev ? 
            process.env.REACT_APP_API_ORDER_URL : 
            process.env.REACT_APP_API_ORDER_URL,
        getAllOrder: () => `${APIS.baseOrderUrl}/GetAll`,
        addOrder: () => `${APIS.baseOrderUrl}/Add`,
        deleteOrder: (id) => `${APIS.baseOrderUrl}/Remove?id=${id}`,
        updateOrderStatus: (orderId, boughtDate) => 
            `${APIS.baseOrderUrl}/UpdateOrderStatus?orderId=${orderId}&boughtDate=${boughtDate}`,
        updateOrder: () => `${APIS.baseOrderUrl}/UpdateOrder`,
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
                const [ordersRes, clientsRes, flowersRes] = await Promise.all([
                    axios.get(APIS.getAllOrder(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllClient(), { headers: { Authorization: token } }),
                    axios.get(APIS.getAllFlower(), { headers: { Authorization: token } }),
                ]);

                setOrders(ordersRes.data.data || ordersRes.data);
                setClients(clientsRes.data.data || clientsRes.data);
                setFlowers(flowersRes.data.data || flowersRes.data);
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
        const rows = orders.map((order) => ({
            id: order.id,
            number: order.number,
            isBought: order.isBought,
            orderDate: order.orderDate,
            boughtDate: order.boughtDate,
            client: order.client,
            details: order.orderDetails || [],
            originalData: order
        }));

        // Add new row button
        rows.push({
            id: 'add-new-row',
            isAddNew: true,
            originalData: { orderDetails: [] }
        });

        return rows;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Edit order details functions
    const handleEditOrder = (rowData) => {
        if (!rowData || !rowData.originalData) {
            console.error('Düzenleme için geçersiz satır verisi');
            return;
        }

        const originalData = rowData.originalData;
        setEditingRow(rowData.id);
        setTempData({
            id: originalData.id,
            clientId: originalData.client?.id || 0,
            orderDate: originalData.orderDate,
        });
        setEditModalOpen(true);
    };

    const handleEditOrderCancel = () => {
        setEditingRow(null);
        setTempData({});
        setEditModalOpen(false);
    };

    const handleEditOrderSave = async () => {
        try {
            setLoading(true);
            const { id, clientId,orderDate } = tempData;
            await axios.post(APIS.updateOrder(), tempData, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Sipariş başarıyla güncellendi');
        } catch (err) {
            showNotification('Sipariş güncellenirken hata oluştu', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Edit order status functions
    const handleEditStatus = (rowData) => {
        if (!rowData || !rowData.originalData) {
            console.error('Durum düzenleme için geçersiz satır verisi');
            return;
        }

        const originalData = rowData.originalData;
        setEditingStatusRow(rowData.id);
        setTempStatusData({
            id: originalData.id,
            isBought: originalData.isBought,
            boughtDate: originalData.boughtDate || new Date().toISOString().slice(0, 16),
        });
        setEditStatusModalOpen(true);
    };

    const handleEditStatusCancel = () => {
        setEditingStatusRow(null);
        setTempStatusData({});
        setEditStatusModalOpen(false);
    };

    const handleEditStatusSave = async () => {
        try {
            setLoading(true);
            const { id, isBought, boughtDate } = tempStatusData;
            await axios.post(APIS.updateOrderStatus(id, isBought ? boughtDate : null), null,{
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditStatusModalOpen(false);
            showNotification('Sipariş durumu başarıyla güncellendi');
        } catch (err) {
            showNotification('Sipariş durumu güncellenirken hata oluştu', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Delete function
    const handleDelete = (id) => {
        setOrderToDelete(id);
        setDeleteConfirmOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;
    
        try {
            setLoading(true);
            await axios.post(APIS.deleteOrder(orderToDelete),null, {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Sipariş başarıyla silindi');
        } catch (err) {
            showNotification('Sipariş silinirken hata oluştu', 'error');
            console.error(err);
        } finally {
            setLoading(false);
            setDeleteConfirmOpen(false);
            setOrderToDelete(null);
        }
    };

    // Add functions
    const handleAddSubmit = async () => {
        try {
            setLoading(true);
            await axios.post(APIS.addOrder(), newData, {
                headers: { Authorization: token }
            });

            setAddModalOpen(false);
            setNewData({
                number: "",
                isBought: true,
                clientId: 0,
                orderDate: new Date().toISOString().slice(0, 16),
                boughtDate: new Date().toISOString().slice(0, 16),
                flowerOrderDetails: [{
                    count: 1,
                    code: "",
                    long: 0
                }]
            });
            setRun(prev => prev + 1);
            showNotification('Sipariş başarıyla eklendi');
        } catch (err) {
            showNotification('Sipariş eklenirken hata oluştu', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFlowerDetail = () => {
        setNewData(prev => ({
            ...prev,
            flowerOrderDetails: [...prev.flowerOrderDetails, { count: 1, code: "", long: 0 }]
        }));
    };

    const handleRemoveFlowerDetail = (index) => {
        if (newData.flowerOrderDetails.length <= 1) return;
        setNewData(prev => ({
            ...prev,
            flowerOrderDetails: prev.flowerOrderDetails.filter((_, i) => i !== index)
        }));
    };

    const handleFlowerDetailChange = (index, field, value) => {
        const updatedDetails = [...newData.flowerOrderDetails];
        updatedDetails[index][field] = value;
        setNewData(prev => ({ ...prev, flowerOrderDetails: updatedDetails }));
    };

    // Columns configuration
    const columns = [
        { field: 'number', headerName: 'Sipariş No', width: 150 },
        { 
            field: 'isBought', 
            headerName: 'Satın Alındı', 
            width: 120,
            renderCell: (params) => (
                params.value ? 'Evet' : 'Hayır'
            )
        },
        { 
            field: 'orderDate', 
            headerName: 'Sipariş Tarihi', 
            width: 170,
            renderCell: (params) => formatDate(params.value)
        },
        { 
            field: 'boughtDate', 
            headerName: 'Satın Alma Tarihi', 
            width: 170,
            renderCell: (params) => formatDate(params.value)
        },
        { 
            field: 'client', 
            headerName: 'Müşteri', 
            width: 150,
            renderCell: (params) => params.value?.name || '-'
        },
        {
            field: 'details',
            headerName: 'Ürünler',
            width: 170,
            renderCell: (params) => (
                <OrderDetailsDropdown 
                    orderDetails={params.row.originalData?.orderDetails || []} 
                />
            ),
            sortable: false,
            filterable: false
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 200,
            renderCell: (params) => {
                if (params.row.isAddNew) return null;
                
                return (
                    <Box sx={{ 
                        display: 'flex', 
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: 0,
                        margin: 0
                    }}>
                        <Tooltip style={{width:"20%"}} title="Siparişi Düzenle">
                            <IconButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOrder(params.row);
                                }}
                                disabled={loading}
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
                                }}
                            >
                                <BsPencil size={16} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip style={{width:"20%"}} title="Durumu Güncelle">
                            <IconButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStatus(params.row);
                                }}
                                disabled={loading}
                                size="small"
                                sx={{ 
                                    color: theme.palette.success.main,
                                    '&:hover': { 
                                        color: theme.palette.success.dark,
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
                                <BsCheckCircle size={16} />
                            </IconButton>
                        </Tooltip>

                        <Tooltip style={{width:"20%"}} title="Siparişi Sil">
                            <IconButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(params.row.originalData.id);
                                }}
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
                        </Tooltip>

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
            <Header title="Sipariş Yönetimi" />

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
                <DialogTitle>Yeni Sipariş Ekle</DialogTitle>
                <DialogContent>
                    <Box sx={{ 
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <TextField
                            label="Sipariş No"
                            value={newData.number}
                            onChange={(e) => setNewData({...newData, number: e.target.value})}
                            fullWidth
                            margin="normal"
                            sx={{ mb: 2 }}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={newData.isBought}
                                    onChange={(e) => setNewData({
                                        ...newData, 
                                        isBought: e.target.checked,
                                        boughtDate: e.target.checked ? new Date().toISOString().slice(0, 16) : null
                                    })}
                                    color="primary"
                                />
                            }
                            label="Satın Alındı"
                        />

                        <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                            <InputLabel>Müşteri</InputLabel>
                            <Select
                                value={newData.clientId}
                                label="Müşteri"
                                onChange={(e) => setNewData({...newData, clientId: e.target.value})}
                            >
                                <MenuItem value={0}>Müşteri Seçin</MenuItem>
                                {clients.map(client => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Sipariş Tarihi"
                            type="datetime-local"
                            value={newData.orderDate}
                            onChange={(e) => setNewData({...newData, orderDate: e.target.value})}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        {newData.isBought && (
                            <TextField
                                label="Satın Alma Tarihi"
                                type="datetime-local"
                                value={newData.boughtDate}
                                onChange={(e) => setNewData({...newData, boughtDate: e.target.value})}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}

                        <Typography variant="h6" sx={{ mb: 2 }}>Çiçek Detayları</Typography>
                        
                        {newData.flowerOrderDetails.map((detail, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                mb: 2,
                                flexWrap: 'wrap'
                            }}>
                                <FormControl sx={{ flex: 2, minWidth: '200px' }}>
                                    <InputLabel>Çiçek</InputLabel>
                                    <Select
                                        value={detail.code}
                                        label="Çiçek"
                                        onChange={(e) => handleFlowerDetailChange(index, 'code', e.target.value)}
                                    >
                                        <MenuItem value="">Çiçek Seçin</MenuItem>
                                        {flowers.map(flower => (
                                            <MenuItem key={flower.id} value={flower.code}>
                                                {flower.code} - {flower.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Adet"
                                    type="number"
                                    value={detail.count}
                                    onChange={(e) => handleFlowerDetailChange(index, 'count', e.target.value)}
                                    sx={{ flex: 1, minWidth: '120px' }}
                                    inputProps={{ min: 1 }}
                                />

                                <TextField
                                    label="Uzunluk"
                                    type="number"
                                    value={detail.long}
                                    onChange={(e) => handleFlowerDetailChange(index, 'long', e.target.value)}
                                    sx={{ flex: 1, minWidth: '120px' }}
                                    inputProps={{ min: 0 }}
                                />

                                <IconButton 
                                    onClick={() => handleRemoveFlowerDetail(index)}
                                    disabled={newData.flowerOrderDetails.length <= 1}
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
                                onClick={handleAddFlowerDetail}
                                startIcon={<BsPlus />}
                                sx={{ 
                                    px: 3,
                                    py: 1,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Çiçek Ekle
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
                        disabled={loading || !newData.number || !newData.clientId || 
                                 newData.flowerOrderDetails.some(f => !f.code)}
                        sx={{ 
                            px: 3,
                            py: 1
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Order Details Modal */}
            <Dialog open={editModalOpen} onClose={handleEditOrderCancel} maxWidth="md" fullWidth>
                <DialogTitle>Sipariş Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Müşteri</InputLabel>
                            <Select
                                value={tempData.clientId || 0}
                                label="Müşteri"
                                onChange={(e) => setTempData({...tempData, clientId: e.target.value})}
                            >
                                <MenuItem value={0}>Müşteri Seçin</MenuItem>
                                {clients.map(client => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Sipariş Tarihi"
                            type="datetime-local"
                            value={tempData.orderDate || ''}
                            onChange={(e) => setTempData({...tempData, orderDate: e.target.value})}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton 
                        onClick={handleEditOrderCancel} 
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditOrderSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading || !tempData.clientId}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Order Status Modal */}
            <Dialog open={editStatusModalOpen} onClose={handleEditStatusCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Sipariş Durumunu Güncelle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={tempStatusData.isBought || false}
                                    onChange={(e) => setTempStatusData({
                                        ...tempStatusData, 
                                        isBought: e.target.checked,
                                        boughtDate: e.target.checked ? new Date().toISOString().slice(0, 16) : null
                                    })}
                                    color="primary"
                                />
                            }
                            label="Satın Alındı"
                        />

                        {tempStatusData.isBought && (
                            <TextField
                                label="Satın Alma Tarihi"
                                type="datetime-local"
                                value={tempStatusData.boughtDate || ''}
                                onChange={(e) => setTempStatusData({...tempStatusData, boughtDate: e.target.value})}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <MuiButton 
                        onClick={handleEditStatusCancel} 
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
                        İptal
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditStatusSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Güncelle'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Sipariş Silme</DialogTitle>
                <DialogContent>
                    <Typography>Bu siparişi silmek istediğinizden emin misiniz?</Typography>
                </DialogContent>
                <DialogActions>
                    <MuiButton 
                        onClick={() => setDeleteConfirmOpen(false)}
                        color="primary"
                    >
                        Hayır
                    </MuiButton>
                    <MuiButton 
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Evet'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Orders;