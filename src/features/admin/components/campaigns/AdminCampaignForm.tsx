// src/features/admin/components/campaigns/AdminCampaignForm.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";

// Hooks & Types
import { useAdminCampaign } from "@/features/admin/hooks/useAdminCampaign";
import { useAdminFranchise } from "@/features/admin/hooks/useAdminFranchise";
import { CreateCampaignPayload } from "@/features/admin/types/campaign.types";

interface AdminCampaignFormProps {
  onCancel?: () => void;
  onSuccess?: (campaign: any) => void;
}

export default function AdminCampaignForm({
  onCancel,
  onSuccess,
}: AdminCampaignFormProps) {
  const navigate = useNavigate();
  const { createCampaign, isCreating } = useAdminCampaign();
  const { franchiseList, fetchFranchiseList, isLoading } = useAdminFranchise();

  // Form state
  const [formData, setFormData] = useState<CreateCampaignPayload>({
    campaignName: "",
    franchiseOwnerId: "",
    totalAllocated: 0,
    startDate: dayjs().toISOString(),
    endDate: dayjs().add(30, "day").toISOString(),
    renewalRequirement: 0,
    description: "",
  });

  // UI state
  const [error, setError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Load franchises on mount
  useEffect(() => {
    fetchFranchiseList();
  }, [fetchFranchiseList]);

  // Handle text field changes
  const handleChange =
    (field: keyof CreateCampaignPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]:
          field === "totalAllocated" || field === "renewalRequirement"
            ? parseInt(value) || 0
            : value,
      }));
      // Clear validation error for this field
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };

  // Handle select change
  const handleSelectChange = (event: any) => {
    setFormData((prev) => ({
      ...prev,
      franchiseOwnerId: event.target.value,
    }));
    if (validationErrors.franchiseOwnerId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.franchiseOwnerId;
        return newErrors;
      });
    }
  };

  // Handle date changes
  const handleDateChange =
    (field: "startDate" | "endDate") => (value: Dayjs | null) => {
      if (value) {
        setFormData((prev) => ({
          ...prev,
          [field]: value.toISOString(),
        }));
      }
    };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.campaignName.trim()) {
      errors.campaignName = "Tên chiến dịch là bắt buộc";
    }

    if (!formData.franchiseOwnerId) {
      errors.franchiseOwnerId = "Vui lòng chọn franchise";
    }

    if (formData.totalAllocated <= 0) {
      errors.totalAllocated = "Số lượng phân bổ phải lớn hơn 0";
    }

    if (formData.renewalRequirement < 0) {
      errors.renewalRequirement = "Yêu cầu gia hạn không thể âm";
    }

    const startDate = dayjs(formData.startDate);
    const endDate = dayjs(formData.endDate);

    if (endDate.isBefore(startDate)) {
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const campaign = await createCampaign(formData);
      if (onSuccess) {
        onSuccess(campaign);
      }
      // Navigate to campaign list or detail page
      navigate("/admin/campaigns");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tạo chiến dịch");
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin/campaigns");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <CampaignIcon color="primary" />
            Tạo Chiến Dịch Mới
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Điền thông tin để tạo chiến dịch mới cho franchise
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid
            container
            spacing={3}
            sx={{
              height: "100%",
            }}
          >
            {/* Campaign Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tên chiến dịch"
                value={formData.campaignName}
                onChange={handleChange("campaignName")}
                error={!!validationErrors.campaignName}
                helperText={validationErrors.campaignName}
                placeholder="Nhập tên chiến dịch"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CampaignIcon color="action" />
                    </InputAdornment>
                  ),
                  style: { height: "56px" },
                }}
                required
                sx={{
                  "& .MuiInputBase-root": {
                    height: "56px",
                  },
                }}
              />
            </Grid>

            {/* Franchise Owner */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                error={!!validationErrors.franchiseOwnerId}
                required
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
              >
                <InputLabel id="franchise-select-label">Franchise</InputLabel>
                <Select
                  labelId="franchise-select-label"
                  value={formData.franchiseOwnerId}
                  label="Franchise"
                  onChange={handleSelectChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  }
                >
                  {isLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Đang tải...
                    </MenuItem>
                  ) : franchiseList.length === 0 ? (
                    <MenuItem disabled>Không có franchise nào</MenuItem>
                  ) : (
                    franchiseList.map((franchise) => (
                      <MenuItem
                        key={franchise._id}
                        value={franchise.userId._id.toString()}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>
                            {franchise.userId.franchiseName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (Level {franchise.franchiseLevel})
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {validationErrors.franchiseOwnerId && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 2 }}
                  >
                    {validationErrors.franchiseOwnerId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Total Allocated */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Số lượng phân bổ"
                value={formData.totalAllocated}
                onChange={handleChange("totalAllocated")}
                error={!!validationErrors.totalAllocated}
                helperText={
                  validationErrors.totalAllocated ||
                  "Tổng số lượng quota được phân bổ cho chiến dịch"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferIcon color="action" />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0 },
                  style: { height: "56px" },
                }}
                required
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
              />
            </Grid>

            {/* Renewal Requirement */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Tỷ lệ gia hạn (%)"
                value={formData.renewalRequirement}
                onChange={handleChange("renewalRequirement")}
                error={!!validationErrors.renewalRequirement}
                helperText={
                  validationErrors.renewalRequirement ||
                  "Phần trăm người dùng cần quay lại để gia hạn"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip title="Phần trăm người dùng cần quay lại để franchise được gia hạn quota">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: { min: 0, max: 100 },
                  style: { height: "56px" },
                }}
                required
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
              />
            </Grid>

            {/* Start Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Ngày bắt đầu"
                value={dayjs(formData.startDate)}
                onChange={handleDateChange("startDate")}
                minDate={dayjs()}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": { height: "56px" },
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                      style: { height: "56px" },
                    },
                  },
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Ngày kết thúc"
                value={dayjs(formData.endDate)}
                onChange={handleDateChange("endDate")}
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!validationErrors.endDate,
                    helperText: validationErrors.endDate,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="action" />
                        </InputAdornment>
                      ),
                      style: { height: "56px" },
                    },
                  },
                }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                label="Mô tả"
                placeholder="Nhập mô tả chi tiết về chiến dịch..."
                value={formData.description}
                onChange={handleChange("description")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ alignSelf: "flex-start", mt: 1 }}
                    >
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": { minHeight: "56px", height: "auto" },
                }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={isCreating}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isCreating}
                  sx={{ minWidth: 120 }}
                >
                  {isCreating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Tạo chiến dịch"
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </LocalizationProvider>
  );
}
