//src/shared/components/data-grid/RequestDataGrid.tsx

import React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridToolbar,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridEventListener,
  GridRowParams,
  GridCellParams,
} from "@mui/x-data-grid";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Button,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  ViewColumn as ColumnsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled components
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: "none",
  "& .MuiDataGrid-main": {
    borderRadius: theme.shape.borderRadius,
  },
  // Header styling
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
    fontWeight: 700,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  "& .MuiDataGrid-columnSeparator": {
    color: theme.palette.divider,
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  // Cell styling with center alignment
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
  // Row styling with dynamic height
  "& .MuiDataGrid-row": {
    transition: "all 0.2s ease-in-out",
    minHeight: "60px !important",
    maxHeight: "none !important",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: "translateY(-1px)",
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
    },
    "&.Mui-selected": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
    // Alternating row colors
    "&:nth-of-type(even)": {
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
  // Footer styling
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
  // Scrollbar styling
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
  // Loading overlay
  "& .MuiDataGrid-overlay": {
    backgroundColor: alpha(theme.palette.background.default, 0.9),
    backdropFilter: "blur(4px)",
  },
  // Sort icon
  "& .MuiDataGrid-sortIcon": {
    color: theme.palette.primary.main,
  },
  // Menu icon
  "& .MuiDataGrid-menuIcon": {
    "& .MuiSvgIcon-root": {
      color: theme.palette.text.secondary,
    },
  },
  // Checkbox styling
  "& .MuiCheckbox-root": {
    color: theme.palette.text.secondary,
    "&.Mui-checked": {
      color: theme.palette.primary.main,
    },
  },
  // Density
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
  "&.MuiDataGrid-root--densityComfortable": {
    "& .MuiDataGrid-cell": {
      paddingTop: 12,
      paddingBottom: 12,
    },
  },
}));

// Custom Loading Component
const CustomLoadingOverlay = () => (
  <Stack alignItems="center" justifyContent="center" height="100%" spacing={2}>
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

// Custom Toolbar
const CustomToolbar: React.FC<{
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
}> = ({ onRefresh, onExport, loading }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <GridToolbar />
      <Box sx={{ flexGrow: 1 }} />
      {onRefresh && (
        <Tooltip title="Làm mới">
          <IconButton onClick={onRefresh} disabled={loading} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
      {onExport && (
        <Tooltip title="Xuất Excel">
          <IconButton onClick={onExport} size="small">
            <ExportIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

interface RequestDataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading?: boolean;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  autoHeight?: boolean;
  density?: "compact" | "standard" | "comfortable";
  pageSize?: number;
  pageSizeOptions?: number[];
  onRefresh?: () => void;
  onExport?: () => void;
  onRowClick?: GridEventListener<"rowClick">;
  onSelectionChange?: (selection: GridRowSelectionModel) => void;
  sortModel?: GridSortModel;
  filterModel?: GridFilterModel;
  showToolbar?: boolean;
  showQuickFilter?: boolean;
  getRowClassName?: (params: GridRowParams) => string;
  getCellClassName?: (params: GridCellParams) => string;
  height?: number | string;
  rowHeight?: number;
  getRowHeight?: () => number | "auto";
  sx?: any;
}

export default function RequestDataGrid({
  columns,
  rows,
  loading = false,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  autoHeight = false,
  density = "standard",
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onRefresh,
  onExport,
  onRowClick,
  onSelectionChange,
  sortModel,
  filterModel,
  showToolbar = false,
  showQuickFilter = true,
  getRowClassName,
  getCellClassName,
  height = 600,
  rowHeight = 60,
  getRowHeight = () => "auto",
  sx,
}: RequestDataGridProps) {
  const theme = useTheme();
  const [paginationModel, setPaginationModel] =
    React.useState<GridPaginationModel>({
      pageSize: pageSize,
      page: 0,
    });

  // Enhanced columns with default properties and center alignment
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
    <Fade in timeout={300}>
      <Paper
        elevation={0}
        sx={{
          height: autoHeight ? "auto" : height,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          ...sx,
        }}
      >
        <StyledDataGrid
          rows={rows}
          columns={enhancedColumns}
          loading={loading}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick={disableRowSelectionOnClick}
          autoHeight={autoHeight}
          density={density}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={pageSizeOptions}
          onRowClick={onRowClick}
          onRowSelectionModelChange={onSelectionChange}
          sortModel={sortModel}
          filterModel={filterModel}
          getRowClassName={getRowClassName}
          getCellClassName={getCellClassName}
          getRowHeight={getRowHeight}
          rowHeight={rowHeight}
          slots={{
            toolbar: showToolbar
              ? () => (
                  <CustomToolbar
                    onRefresh={onRefresh}
                    onExport={onExport}
                    loading={loading}
                  />
                )
              : undefined,
            loadingOverlay: CustomLoadingOverlay,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: showQuickFilter,
              quickFilterProps: {
                debounceMs: 500,
                // placeholder: "Tìm kiếm...",
                // sx: {
                //   "& .MuiInputBase-root": {
                //     borderRadius: 2,
                //     backgroundColor: alpha(theme.palette.grey[100], 0.5),
                //     "&:hover": {
                //       backgroundColor: alpha(theme.palette.grey[100], 0.8),
                //     },
                //     "&.Mui-focused": {
                //       backgroundColor: theme.palette.background.paper,
                //       boxShadow: `0 0 0 2px ${alpha(
                //         theme.palette.primary.main,
                //         0.2
                //       )}`,
                //     },
                //   },
                // },
              },
            },
            columnsPanel: {
              sx: {
                "& .MuiDataGrid-panelContent": {
                  borderRadius: 2,
                },
              },
            },
            filterPanel: {
              sx: {
                "& .MuiDataGrid-panelContent": {
                  borderRadius: 2,
                },
              },
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: pageSize,
              },
            },
          }}
          sx={{
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row": {
              cursor: onRowClick ? "pointer" : "default",
            },
          }}
        />
      </Paper>
    </Fade>
  );
}
