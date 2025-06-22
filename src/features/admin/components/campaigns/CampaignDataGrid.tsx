// src/features/admin/components/campaigns/CampaignDataGrid.tsx

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
import CampaignIcon from "@mui/icons-material/Campaign";

interface CampaignDataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  loading: boolean;
  sx?: SxProps;
}

export default function CampaignDataGrid(props: CampaignDataGridProps) {
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
        Đang tải dữ liệu chiến dịch...
      </Typography>
    </Stack>
  );

  // Custom No Rows Component
  const CustomNoRowsOverlay = () => {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={2}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CampaignIcon
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main,
              opacity: 0.5,
            }}
          />
        </Box>
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu chiến dịch
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dữ liệu sẽ xuất hiện ở đây khi có chiến dịch
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
          checkboxSelection={false}
          rows={rows}
          columns={enhancedColumns}
          initialState={{
            pagination: { paginationModel: { pageSize: 20 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableColumnResize
          density="comfortable"
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
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                fontSize: "0.875rem",
              },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              "&:focus": {
                outline: "none",
              },
            },
            "& .MuiDataGrid-row": {
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
              "&.Mui-selected": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                },
              },
            },
            "& .even": {
              backgroundColor: alpha(theme.palette.grey[50], 0.5),
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `2px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
            "& .MuiCheckbox-root": {
              color: theme.palette.primary.light,
              "&.Mui-checked": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            // Responsive styles
            "@media (max-width: 600px)": {
              "& .MuiDataGrid-columnHeader": {
                padding: 1,
              },
              "& .MuiDataGrid-cell": {
                padding: 1,
              },
            },
          }}
        />
      </Paper>
    </Fade>
  );
}
