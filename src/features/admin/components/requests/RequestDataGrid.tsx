import {
  Box,
  Fade,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
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
    // resizable: true,
  }));

  // Custom Loading Component
  const CustomLoadingOverlay = () => (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="100%"
      spacing={2}
    >
      <Box sx={{ width: "60%" }}>
        <LinearProgress color="primary" />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Đang tải dữ liệu...
      </Typography>
    </Stack>
  );

  // Custom No Rows Component
  const CustomNoRowsOverlay = () => {
    const theme = useTheme();
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={2}
      >
        <Box
          component="img"
          src="/empty-state.svg" // Thêm SVG illustration nếu có
          alt="No data"
          sx={{
            width: 120,
            height: 120,
            opacity: 0.5,
            filter: "grayscale(100%)",
          }}
        />
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dữ liệu sẽ xuất hiện ở đây khi có
        </Typography>
      </Stack>
    );
  };
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
          pageSizeOptions={[5, 10, 20, 50]}
          disableColumnResize
          density="comfortable"
          // getRowHeight={() => "auto"}
          slots={{
            loadingOverlay: CustomLoadingOverlay,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
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
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: `2px solid ${theme.palette.divider}`,
              "& .MuiDataGrid-columnHeader": {
                "&:focus": {
                  outline: "none",
                },
                "&:focus-within": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: -2,
                },
              },
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                justifyContent: "center",
              },
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
            "& .MuiDataGrid-columnSeparator": {
              color: theme.palette.divider,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 16px",
              "&:focus": {
                outline: "none",
              },
              "&:focus-within": {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: -2,
              },
            },
            "& .MuiDataGrid-row": {
              transition: "all 0.2s ease-in-out",
              minHeight: "60px !important",
              maxHeight: "none !important",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                transform: "translateY(-1px)",
                boxShadow: `0 2px 8px ${alpha(
                  theme.palette.common.black,
                  0.08
                )}`,
              },
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              },
              "&.even": {
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
                ...theme.applyStyles("dark", {
                  backgroundColor: alpha(theme.palette.grey[900], 0.5),
                }),
              },
              "& .MuiDataGrid-cell": {
                whiteSpace: "normal",
                overflow: "visible",
                lineHeight: "1.5",
              },
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `2px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
            "& .MuiTablePagination-root": {
              "& .MuiTablePagination-selectLabel": {
                fontWeight: 500,
              },
              "& .MuiTablePagination-displayedRows": {
                fontWeight: 500,
                color: theme.palette.text.secondary,
              },
            },
            "& .MuiDataGrid-virtualScroller": {
              "&::-webkit-scrollbar": {
                width: 8,
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                background: alpha(theme.palette.grey[300], 0.3),
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                background: theme.palette.grey[400],
                borderRadius: 4,
                "&:hover": {
                  background: theme.palette.grey[500],
                },
              },
            },
            "& .MuiDataGrid-overlay": {
              backgroundColor: alpha(theme.palette.background.default, 0.9),
              backdropFilter: "blur(4px)",
            },
            "& .MuiDataGrid-sortIcon": {
              color: theme.palette.primary.main,
            },
            "& .MuiDataGrid-menuIcon": {
              "& .MuiSvgIcon-root": {
                color: theme.palette.text.secondary,
              },
            },
            "& .MuiCheckbox-root": {
              color: theme.palette.text.secondary,
              "&.Mui-checked": {
                color: theme.palette.primary.main,
              },
            },
            "&.MuiDataGrid-root--densityCompact": {
              "& .MuiDataGrid-cell": {
                paddingTop: 4,
                paddingBottom: 4,
              },
            },
            "&.MuiDataGrid-root--densityStandard": {
              "& .MuiDataGrid-cell": {
                paddingTop: 8,
                paddingBottom: 8,
              },
            },
          }}
        />
      </Paper>
    </Fade>
  );
}
