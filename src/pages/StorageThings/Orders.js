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
  Chip, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Menu,
  ListItemText,
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
        {orderDetails.length} Items
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
                  {detail.flowerStore?.code || 'Unknown Flower'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Count: {detail.count || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Length: {detail.flowerStore?.flowerLong || 'N/A'}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleClose}>No items found</MenuItem>
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
                showNotification('Failed to load data', 'error');
                console.error('Error fetching data:', err);
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
            console.error('Invalid row data for editing');
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
            const { id, ...dataToSend } = tempData;
            await axios.post(APIS.updateOrder(), dataToSend, {
                headers: { Authorization: token }
            });
            
            setRun(prev => prev + 1);
            setEditModalOpen(false);
            showNotification('Order details updated successfully');
        } catch (err) {
            showNotification('Failed to update order details', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Edit order status functions
    const handleEditStatus = (rowData) => {
        if (!rowData || !rowData.originalData) {
            console.error('Invalid row data for editing status');
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
            showNotification('Order status updated successfully');
        } catch (err) {
            showNotification('Failed to update order status', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Delete function
    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axios.delete(APIS.deleteOrder(id), {
                headers: { Authorization: token }
            });
            setRun(prev => prev + 1);
            showNotification('Order deleted successfully');
        } catch (err) {
            showNotification('Failed to delete order', 'error');
            console.error(err);
        } finally {
            setLoading(false);
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
            showNotification('Order added successfully');
        } catch (err) {
            showNotification('Failed to add order', 'error');
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
        { field: 'number', headerName: 'Order Number', width: 150 },
        { 
            field: 'isBought', 
            headerName: 'Is Bought', 
            width: 120,
            renderCell: (params) => (
                params.value ? 'Yes' : 'No'
            )
        },
        { 
            field: 'orderDate', 
            headerName: 'Order Tarih', 
            width: 170,
            renderCell: (params) => formatDate(params.value)
        },
        { 
            field: 'boughtDate', 
            headerName: 'Bought Tarih', 
            width: 170,
            renderCell: (params) => formatDate(params.value)
        },
        { 
            field: 'client', 
            headerName: 'Client', 
            width: 150,
            renderCell: (params) => params.value?.name || '-'
        },
        {
            field: 'details',
            headerName: 'Items',
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
            headerName: 'işlemler',
            width: 200,
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
                        <Tooltip title="Edit Order Details">
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

                        <Tooltip title="Update Order Status">
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

                        <Tooltip title="Delete Order">
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
                        Ekleme
                    </MuiButton>
                );
            },
            sortable: false,
            filterable: false
        }
    ];

    return (
        <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
            <Header category="Page" title="Orders Management" />

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
                <DialogTitle> Order Ekleme</DialogTitle>
                <DialogContent>
                    <Box sx={{ 
                        mt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <TextField
                            label="Order Number"
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
                            label="Is Bought"
                        />

                        <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                            <InputLabel>Client</InputLabel>
                            <Select
                                value={newData.clientId}
                                label="Client"
                                onChange={(e) => setNewData({...newData, clientId: e.target.value})}
                            >
                                <MenuItem value={0}>Select Client</MenuItem>
                                {clients.map(client => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Order Date"
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
                                label="Bought Tarih"
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

                        <Typography variant="h6" sx={{ mb: 2 }}>Çiçek Details</Typography>
                        
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
                                        <MenuItem value="">Select Çiçek</MenuItem>
                                        {flowers.map(flower => (
                                            <MenuItem key={flower.id} value={flower.code}>
                                                {flower.code} - {flower.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Adit"
                                    type="number"
                                    value={detail.count}
                                    onChange={(e) => handleFlowerDetailChange(index, 'count', e.target.value)}
                                    sx={{ flex: 1, minWidth: '120px' }}
                                    inputProps={{ min: 1 }}
                                />

                                <TextField
                                    label="Long"
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
                                Çiçek Ekleme
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
                        Cancel
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
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Order Details Modal */}
            <Dialog open={editModalOpen} onClose={handleEditOrderCancel} maxWidth="md" fullWidth>
                <DialogTitle>Edit Order Details</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Client</InputLabel>
                            <Select
                                value={tempData.clientId || 0}
                                label="Client"
                                onChange={(e) => setTempData({...tempData, clientId: e.target.value})}
                            >
                                <MenuItem value={0}>Select Client</MenuItem>
                                {clients.map(client => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Order Tarih"
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
                        Cancel
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditOrderSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading || !tempData.clientId}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Order Status Modal */}
            <Dialog open={editStatusModalOpen} onClose={handleEditStatusCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Update Order Status</DialogTitle>
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
                            label="Is Bought"
                        />

                        {tempStatusData.isBought && (
                            <TextField
                                label="Bought Tarih"
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
                        Cancel
                    </MuiButton>
                    <MuiButton 
                        onClick={handleEditStatusSave} 
                        color="primary"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Update Status'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Orders;