//src/shared/components/data-grid/RequestDataGrid.tsx

import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";

interface RequestDataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean; // Thêm prop loading để hiển thị trạng thái tải
  // Thêm các props khác nếu cần, ví dụ: onAccept, onApprove
}

export default function RequestDataGrid({
  columns,
  rows,
  loading,
}: RequestDataGridProps) {
  return (
    <DataGrid
      checkboxSelection={false}
      rows={rows}
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 20 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: "outlined",
              size: "small",
            },
            columnInputProps: {
              variant: "outlined",
              size: "small",
              sx: { mt: "auto" },
            },
            operatorInputProps: {
              variant: "outlined",
              size: "small",
              sx: { mt: "auto" },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: "outlined",
                size: "small",
              },
            },
          },
        },
      }}
    />
  );
}
