import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from "@mui/material";
import axios from "axios";
import CountUp from "react-countup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MailIcon from "@mui/icons-material/Mail";
import StorageIcon from "@mui/icons-material/Storage";
import DoneIcon from "@mui/icons-material/Done";
import BlockIcon from "@mui/icons-material/Block";

// ------------------ TYPES ------------------
type QuotaDetail = {
  ledgerId: string;
  franchiseName: string;
  sourceCampaignId: string;
  totalAllocated: number;
  availableQuota: number;
  status: string;
  createdAt: string;
};

type QuotaData = {
  totalActiveQuota: number;
  activeQuotaDetails: QuotaDetail[];
  statistics: {
    totalInvitations: number;
    remainingQuota: number;
  };
};

type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
};

// ------------------ MOCK DATA ------------------
const mockQuotaData: QuotaData = {
  totalActiveQuota: 1123,
  activeQuotaDetails: [
    {
      ledgerId: "686b49edfadd97f3140308a8",
      franchiseName: "Franchise A",
      sourceCampaignId: "686b49edfadd97f3140308a5",
      totalAllocated: 123,
      availableQuota: 123,
      status: "active",
      createdAt: "2025-07-07T04:15:41.921Z",
    },
    {
      ledgerId: "68886742f135515377837b66",
      franchiseName: "Franchise B",
      sourceCampaignId: "68886742f135515377837b62",
      totalAllocated: 1000,
      availableQuota: 1000,
      status: "inactive",
      createdAt: "2025-07-29T06:16:34.701Z",
    },
  ],
  statistics: {
    totalInvitations: 0,
    remainingQuota: 1123,
  },
};

// ------------------ STAT CARD ------------------
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 3,
      background: gradient,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 2,
      transition: "all 0.4s ease",
      "&:hover": {
        background: gradient.split(",").reverse().join(","),
        transform: "translateY(-6px)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
      },
      "& .stat-icon": {
        fontSize: 48,
        transition: "all 0.4s ease",
      },
      "&:hover .stat-icon": {
        transform: "rotate(10deg) scale(1.1)",
        color: "#ffeb3b",
      },
    }}
  >
    {icon}
    <Box>
      <Typography variant="subtitle1" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        <CountUp end={value} duration={1.5} />
      </Typography>
    </Box>
  </Paper>
);

// ------------------ MAIN COMPONENT ------------------
const AllocateQuota: React.FC = () => {
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [form, setForm] = useState({
    franchiseName: "",
    campaignId: "",
    currentQuota: "",
    allocateAmount: "",
    note: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [orderBy, setOrderBy] = useState<keyof QuotaDetail>("franchiseName");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const res = await axios.get("/api/quota-info");
        if (res.data?.data) {
          setQuotaData(res.data.data);
        } else {
          setQuotaData(mockQuotaData);
        }
      } catch {
        setQuotaData(mockQuotaData);
      }
    };
    fetchQuota();
  }, []);

  if (!quotaData) return <Typography>Đang tải dữ liệu...</Typography>;

  const handleFranchiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const franchiseName = e.target.value;
    const campaign = quotaData.activeQuotaDetails.find(
      (item) => item.franchiseName === franchiseName
    );
    setForm({
      ...form,
      franchiseName,
      campaignId: campaign ? campaign.sourceCampaignId : "",
      currentQuota: campaign ? String(campaign.availableQuota) : "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Dữ liệu gửi:", form);
    alert("Quota đã được cấp phát!");
  };

  const handleSort = (property: keyof QuotaDetail) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedHistory = [...quotaData.activeQuotaDetails]
    .filter((item) =>
      item.franchiseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      statusFilter === "all" ? true : item.status === statusFilter
    )
    .sort((a, b) => {
      const valueA = a[orderBy];
      const valueB = b[orderBy];
      if (valueA < valueB) return order === "asc" ? -1 : 1;
      if (valueA > valueB) return order === "asc" ? 1 : -1;
      return 0;
    });

  const paginatedHistory = sortedHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ p: 3, width: "100%" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Cấp phát Quota cho Franchise con
      </Typography>

      {/* Box thống kê */}
      <Grid container spacing={3} mb={4}>
        <Grid sx={{ xs: 12, md: 4 }}>
          <StatCard
            title="Tổng quota hiện tại"
            value={quotaData.totalActiveQuota}
            icon={<CheckCircleIcon className="stat-icon" />}
            gradient="linear-gradient(135deg, #6a11cb, #2575fc)"
          />
        </Grid>
        <Grid sx={{ xs: 12, md: 4 }}>
          <StatCard
            title="Tổng invitations"
            value={quotaData.statistics.totalInvitations}
            icon={<MailIcon className="stat-icon" />}
            gradient="linear-gradient(135deg, #11998e, #38ef7d)"
          />
        </Grid>
        <Grid sx={{ xs: 12, md: 4 }}>
          <StatCard
            title="Quota còn lại"
            value={quotaData.statistics.remainingQuota}
            icon={<StorageIcon className="stat-icon" />}
            gradient="linear-gradient(135deg, #ff512f, #dd2476)"
          />
        </Grid>
      </Grid>

      {/* Form */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          mb: 4,
        }}
      >
        <Grid container spacing={3} direction="column">
          <Grid sx={{ xs: 12 }}>
            <TextField
              select
              label="Chọn Franchise"
              name="franchiseName"
              value={form.franchiseName}
              onChange={handleFranchiseChange}
              fullWidth
            >
              {quotaData.activeQuotaDetails.map((item) => (
                <MenuItem key={item.ledgerId} value={item.franchiseName}>
                  {item.franchiseName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <TextField
              label="Chiến dịch"
              name="campaignId"
              value={form.campaignId}
              onChange={handleChange}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <TextField
              label="Quota hiện tại"
              name="currentQuota"
              value={form.currentQuota}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <TextField
              label="Số quota cấp phát"
              name="allocateAmount"
              type="number"
              value={form.allocateAmount}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <TextField
              label="Ghi chú"
              name="note"
              value={form.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                },
              }}
            >
              🚀 Cấp phát Quota
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* History */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Lịch sử cấp phát
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid sx={{ xs: 12, md: 6 }}>
            <TextField
              label="Tìm kiếm theo tên Franchise"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Lọc trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Lọc trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { id: "franchiseName", label: "Franchise Name" },
                  { id: "totalAllocated", label: "Total Allocated" },
                  { id: "availableQuota", label: "Available Quota" },
                  { id: "status", label: "Status" },
                  { id: "createdAt", label: "Created At" },
                ].map((headCell) => (
                  <TableCell key={headCell.id}>
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() =>
                        handleSort(headCell.id as keyof QuotaDetail)
                      }
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistory.map((row) => (
                <TableRow key={row.ledgerId}>
                  <TableCell>{row.franchiseName}</TableCell>
                  <TableCell>{row.totalAllocated}</TableCell>
                  <TableCell>{row.availableQuota}</TableCell>
                  <TableCell>
                    <Chip
                      icon={row.status === "active" ? <DoneIcon /> : <BlockIcon />}
                      label={row.status === "active" ? "Active" : "Inactive"}
                      color={row.status === "active" ? "success" : "error"}
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                        textTransform: "capitalize",
                        px: 1,
                        borderRadius: "8px",
                        ...(row.status === "active" && {
                          animation: "pulse 1.5s infinite",
                          "@keyframes pulse": {
                            "0%": {
                              boxShadow: "0 0 0 0 rgba(46, 204, 113, 0.6)",
                            },
                            "70%": {
                              boxShadow:
                                "0 0 0 10px rgba(46, 204, 113, 0)",
                            },
                            "100%": {
                              boxShadow:
                                "0 0 0 0 rgba(46, 204, 113, 0)",
                            },
                          },
                        }),
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {new Date(row.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không tìm thấy kết quả
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={sortedHistory.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Box>
    </Paper>
  );
};

export default AllocateQuota;
