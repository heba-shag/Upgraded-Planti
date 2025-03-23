import React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { customersData, customersGrid } from '../data/dummy';
import { Header } from '../components';

const Customers = () => {
  // تحويل البيانات إلى تنسيق يتوافق مع MUI DataGrid
  console.log(customersGrid.field)
  const columns = customersGrid.map((item) => ({
    field: item.field,
    headerName: item.headerText,
    width: item.width,
    editable: item.editable,
  }));

  const rows = customersData.map((item, index) => ({
    id: index,
    ...item,
  }));

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Customers" />
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbar,
          }}
          editMode="row"
          experimentalFeatures={{ newEditingApi: true }}
        />
      </div>
    </div>
  );
};

export default Customers;