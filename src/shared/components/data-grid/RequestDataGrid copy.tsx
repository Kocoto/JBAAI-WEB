import { Fade, Paper } from "@mui/material";
import { DataGrid, GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import { SxProps } from "@mui/system";

interface RequestDataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading: boolean;
  sx?: SxProps;
}
export default function RequestDataGrid(props: RequestDataGridProps) {
  const theme = useTheme();
  const { columns, rows, loading, sx } = props;
  const height = 600;
  const autoHeight = false;
  const enhancedColumns: GridColDef[] = columns.map((col) => ({
    ...col,
    headerAlign: col.headerAlign || "center",
    align: col.align || "center",
    disableColumnMenu: false,
    sortable: col.sortable !== false,
    resizable: true,
    ...col,
  }));
  return (
    <Fade in={!loading} timeout={700}>
      <Paper
        elevation={3}
        sx={{
          height: autoHeight ? "auto" : height,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          ...sx,
        }}
      >
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={enhancedColumns}
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
      </Paper>
    </Fade>
  );
}
