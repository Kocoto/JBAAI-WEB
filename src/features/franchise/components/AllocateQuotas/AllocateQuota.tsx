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
import { useTranslation } from "react-i18next";

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
      franchiseName: "franchise0_1",
      sourceCampaignId: "686b49edfadd97f3140308a5",
      totalAllocated: 123,
      availableQuota: 123,
      status: "active",
      createdAt: "2025-07-07T04:15:41.921Z",
    },
    {
      ledgerId: "68886742f135515377837b66",
      franchiseName: "franchise0_1",
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
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
}) => (
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
  const { t } = useTranslation();
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [form, setForm] = useState({
    franchiseName: "",
    campaignId: "",
    ledgerId: "",
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

  if (!quotaData) return <Typography>{t("common.loading")}</Typography>;

  const handleFranchiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const franchiseName = e.target.value;

    const campaign = quotaData.activeQuotaDetails.find(
      (item) => item.franchiseName === franchiseName
    );

    const updatedForm = {
      ...form,
      franchiseName,
      campaignId: campaign ? campaign.sourceCampaignId : "",
      ledgerId: campaign ? campaign.ledgerId : "",
      currentQuota: campaign ? String(campaign.availableQuota) : "",
    };

    setForm(updatedForm);

    // debug logs
    console.log("Franchise selected:", franchiseName);
    console.log("Campaign detail:", campaign);
    console.log("Form patched:", updatedForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.ledgerId || !form.allocateAmount || !form.campaignId) {
        alert(t("franchise.quota.allocate.messages.missingFields"));
        return;
      }

      const payload = {
        childFranchiseUserId: form.ledgerId,
        amountToAllocate: Number(form.allocateAmount),
        sourceLedgerEntryId: form.campaignId,
      };

      console.log("Payload:", payload);

      const res = await axios.post("/api/franchise/quota/allocate", payload);

      alert(t("franchise.quota.allocate.messages.success"));
      console.log("Response:", res.data);
    } catch (err: any) {
      console.error("Allocate quota error:", err);
      alert(
        err.response?.data?.message ||
          t("franchise.quota.allocate.messages.error")
      );
    }
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
      const valueA = a[orderBy] as any;
      const valueB = b[orderBy] as any;
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
        {t("franchise.quota.allocate.title")}
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid sx={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("franchise.quota.allocate.stats.totalAllocated")}
            value={quotaData.totalActiveQuota}
            icon={<CheckCircleIcon className="stat-icon" />}
            gradient="linear-gradient(135deg, #6a11cb, #2575fc)"
          />
        </Grid>
        <Grid sx={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("franchise.quota.allocate.stats.totalInvitations")}
            value={quotaData.statistics.totalInvitations}
            icon={<MailIcon className="stat-icon" />}
            gradient="linear-gradient(135deg, #11998e, #38ef7d)"
          />
        </Grid>
        <Grid sx={{ xs: 12, md: 4 }}>
          <StatCard
            title={t("franchise.quota.allocate.stats.remainingQuota")}
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
              label={t("franchise.quota.allocate.form.franchise")}
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
              label={t("franchise.quota.allocate.form.sourceLedger")}
              name="campaignId"
              value={form.campaignId}
              onChange={handleChange}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <TextField
              label={t("franchise.quota.allocate.form.currentQuota")}
              name="currentQuota"
              value={form.currentQuota}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid sx={{ xs: 12 }}>
            <TextField
              label={t("franchise.quota.allocate.form.allocateAmount")}
              name="allocateAmount"
              type="number"
              value={form.allocateAmount}
              onChange={handleChange}
              fullWidth
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
              🚀 {t("franchise.quota.allocate.form.submit")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* History */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          {t("franchise.quota.allocate.history.title")}
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid sx={{ xs: 12, md: 6 }}>
            <TextField
              label={t("franchise.quota.allocate.history.searchLabel")}
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid sx={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>
                {t("franchise.quota.allocate.history.statusLabel")}
              </InputLabel>
              <Select
                value={statusFilter}
                label={t("franchise.quota.allocate.history.statusLabel")}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">{t("common.all")}</MenuItem>
                <MenuItem value="active">{t("common.status.active")}</MenuItem>
                <MenuItem value="inactive">
                  {t("common.status.inactive")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  {
                    id: "franchiseName",
                    label: t(
                      "franchise.quota.allocate.table.headers.franchiseName"
                    ),
                  },
                  {
                    id: "totalAllocated",
                    label: t(
                      "franchise.quota.allocate.table.headers.totalAllocated"
                    ),
                  },
                  {
                    id: "availableQuota",
                    label: t(
                      "franchise.quota.allocate.table.headers.availableQuota"
                    ),
                  },
                  {
                    id: "status",
                    label: t("franchise.quota.allocate.table.headers.status"),
                  },
                  {
                    id: "createdAt",
                    label: t("common.createdAtHeader"),
                  },
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
                      icon={
                        row.status === "active" ? <DoneIcon /> : <BlockIcon />
                      }
                      label={
                        row.status === "active"
                          ? t("common.status.active")
                          : t("common.status.inactive")
                      }
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
                              boxShadow: "0 0 0 10px rgba(46, 204, 113, 0)",
                            },
                            "100%": {
                              boxShadow: "0 0 0 0 rgba(46, 204, 113, 0)",
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
                    {t("common.noResults")}
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
