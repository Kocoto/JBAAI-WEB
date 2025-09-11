// src/features/admin/components/campaigns/AdminCampaignForm.tsx
import React, { useState, useEffect, useMemo } from "react";
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
  Chip,
  ChipProps,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import InfoIcon from "@mui/icons-material/Info";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import PlaceIcon from "@mui/icons-material/Place";
import EmailIcon from "@mui/icons-material/Email";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BusinessIcon from "@mui/icons-material/Business";
import StarIcon from "@mui/icons-material/Star";

// Hooks & Types
import { useAdminCampaign } from "@/features/admin/hooks/useAdminCampaign";
import { useAdminFranchise } from "@/features/admin/hooks/useAdminFranchise";
import { CreateCampaignPayload } from "@/features/admin/types/campaign.types";
import { useAdminPackage } from "../../hooks/useAdminPackage";
import { useTranslation } from "react-i18next";

interface AdminCampaignFormProps {
  onCancel?: () => void;
  onSuccess?: (campaign: any) => void;
}

interface InfoChipProps {
  icon: React.ReactElement;
  label: string | number;
  color?: ChipProps["color"];
}

// --- Info chip ---
const InfoChip: React.FC<InfoChipProps> = ({
  icon,
  label,
  color = "default",
}) => (
  <Chip
    icon={icon}
    label={label}
    color={color}
    size="small"
    variant="outlined"
    sx={{ borderWidth: 1.5, fontWeight: "medium" }}
  />
);

export default function AdminCampaignForm({
  onCancel,
  onSuccess,
}: AdminCampaignFormProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // set dayjs locale theo ngôn ngữ
  useEffect(() => {
    dayjs.locale(i18n.language?.startsWith("vi") ? "vi" : "en");
  }, [i18n.language]);

  const { createCampaign, isCreating } = useAdminCampaign();
  const { franchiseList, fetchFranchiseList, isLoading } = useAdminFranchise();
  const { packageList, fetchPackageList, isLoadingPackages } =
    useAdminPackage();

  useEffect(() => {
    fetchPackageList();
  }, [fetchPackageList]);

  const [formData, setFormData] = useState<CreateCampaignPayload>({
    campaignName: "",
    franchiseOwnerId: "",
    totalAllocated: 0,
    startDate: dayjs().toISOString(),
    endDate: dayjs().add(30, "day").toISOString(),
    renewalRequirement: 0,
    packageId: "",
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
    setFormData((prev) => ({ ...prev, franchiseOwnerId: event.target.value }));
    if (validationErrors.franchiseOwnerId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.franchiseOwnerId;
        return newErrors;
      });
    }
  };

  // Handle select change for package
  const handlePackageSelectChange = (event: any) => {
    setFormData((prev) => ({ ...prev, packageId: event.target.value }));
    if (validationErrors.packageId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.packageId;
        return newErrors;
      });
    }
  };

  // Handle date changes
  const handleDateChange =
    (field: "startDate" | "endDate") => (value: Dayjs | null) => {
      if (value)
        setFormData((prev) => ({ ...prev, [field]: value.toISOString() }));
    };

  // Validate form (i18n messages)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.campaignName.trim()) {
      errors.campaignName = t(
        "adminCampaignForm.validation.campaignNameRequired"
      );
    }
    if (!formData.packageId) {
      errors.packageId = t("adminCampaignForm.validation.packageRequired");
    }
    if (!formData.franchiseOwnerId) {
      errors.franchiseOwnerId = t(
        "adminCampaignForm.validation.franchiseRequired"
      );
    }
    if (formData.totalAllocated <= 0) {
      errors.totalAllocated = t(
        "adminCampaignForm.validation.totalAllocatedPositive"
      );
    }
    if (formData.renewalRequirement < 0) {
      errors.renewalRequirement = t(
        "adminCampaignForm.validation.renewalRequirementNonNegative"
      );
    }
    const startDate = dayjs(formData.startDate);
    const endDate = dayjs(formData.endDate);
    if (endDate.isBefore(startDate)) {
      errors.endDate = t("adminCampaignForm.validation.endDateAfterStart");
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!validateForm()) return;

    try {
      const campaign = await createCampaign(formData);
      onSuccess?.(campaign);
      navigate("/admin/campaigns");
    } catch (err: any) {
      setError(err?.message || t("adminCampaignForm.error.createFailed"));
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/admin/campaigns");
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={i18n.language?.startsWith("vi") ? "vi" : "en"}
    >
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
            {t("adminCampaignForm.header.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("adminCampaignForm.header.subtitle")}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3} sx={{ height: "100%" }}>
            {/* Campaign Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t("adminCampaignForm.form.labels.campaignName")}
                value={formData.campaignName}
                onChange={handleChange("campaignName")}
                error={!!validationErrors.campaignName}
                helperText={validationErrors.campaignName}
                placeholder={t(
                  "adminCampaignForm.form.placeholders.campaignName"
                )}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CampaignIcon color="action" />
                    </InputAdornment>
                  ),
                  style: { height: "56px" },
                }}
                required
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
              />
            </Grid>

            {/* Package */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                error={!!validationErrors.packageId}
                required
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
              >
                <InputLabel id="package-select-label">
                  {t("adminCampaignForm.form.labels.package")}
                </InputLabel>
                <Select
                  labelId="package-select-label"
                  value={formData.packageId}
                  label={t("adminCampaignForm.form.labels.package")}
                  onChange={handlePackageSelectChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <Inventory2Icon color="action" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 400,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                >
                  {isLoadingPackages ? (
                    <MenuItem disabled>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        p={1}
                      >
                        <CircularProgress size={24} />
                        <Typography>
                          {t("adminCampaignForm.packages.loading")}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ) : packageList.length === 0 ? (
                    <MenuItem disabled>
                      {t("adminCampaignForm.packages.empty")}
                    </MenuItem>
                  ) : (
                    packageList.map((pkg) => (
                      <MenuItem
                        key={pkg._id}
                        value={pkg._id.toString()}
                        sx={{
                          py: 2,
                          borderBottom: "1px ",
                          "&:last-child": { borderBottom: "none" },
                          "&:hover": {
                            backgroundColor: "rgba(0, 123, 255, 0.05)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "rgba(0, 123, 255, 0.1)",
                            fontWeight: "bold",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Box>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary.main"
                              gutterBottom
                            >
                              {pkg.name}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <InfoChip
                                icon={<CalendarTodayIcon fontSize="small" />}
                                label={t(
                                  "adminCampaignForm.package.durationDays",
                                  { count: pkg.duration }
                                )}
                                color="info"
                              />
                              <InfoChip
                                icon={<CategoryIcon fontSize="small" />}
                                label={pkg.type}
                                color="success"
                              />
                              <InfoChip
                                icon={<PlaceIcon fontSize="small" />}
                                label={pkg.location}
                                color="warning"
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {validationErrors.packageId && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 0.5, ml: 2 }}
                  >
                    {validationErrors.packageId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Franchise Owner */}
            <Grid size={{ xs: 12, md: 12 }}>
              <FormControl
                fullWidth
                error={!!validationErrors.franchiseOwnerId}
                required
                sx={{ "& .MuiInputBase-root": { height: "56px" } }}
              >
                <InputLabel id="franchise-select-label">
                  {t("adminCampaignForm.form.labels.franchise")}
                </InputLabel>
                <Select
                  labelId="franchise-select-label"
                  value={formData.franchiseOwnerId}
                  label={t("adminCampaignForm.form.labels.franchise")}
                  onChange={handleSelectChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 400,
                        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
                      },
                    },
                  }}
                >
                  {isLoading ? (
                    <MenuItem disabled>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        p={1}
                      >
                        <CircularProgress size={24} />
                        <Typography>
                          {t("adminCampaignForm.franchises.loading")}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ) : franchiseList.length === 0 ? (
                    <MenuItem disabled>
                      {t("adminCampaignForm.franchises.empty")}
                    </MenuItem>
                  ) : (
                    franchiseList
                      .filter((franchise) => franchise.userId)
                      .map((franchise) => (
                        <MenuItem
                          key={franchise._id}
                          value={franchise.userId._id.toString()}
                          sx={{
                            py: 2,
                            borderBottom: "1px solid rgba(0,0,0,0.08)",
                            "&:last-child": { borderBottom: "none" },
                            "&:hover": {
                              backgroundColor: "rgba(0, 123, 255, 0.05)",
                            },
                            "&.Mui-selected": {
                              backgroundColor: "rgba(0, 123, 255, 0.1)",
                              fontWeight: "bold",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="primary.main"
                                gutterBottom
                              >
                                {franchise.userId.franchiseName}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                              >
                                <InfoChip
                                  icon={<AccountCircleIcon fontSize="small" />}
                                  label={franchise.userId.username}
                                  color="info"
                                />
                                <InfoChip
                                  icon={<EmailIcon fontSize="small" />}
                                  label={franchise.userId.email}
                                  color="success"
                                />
                                <InfoChip
                                  icon={<StarIcon fontSize="small" />}
                                  label={t(
                                    "adminCampaignForm.franchise.level",
                                    {
                                      level: franchise.franchiseLevel,
                                    }
                                  )}
                                  color="warning"
                                />
                              </Stack>
                            </Box>
                            <Box textAlign="right" ml={2}>
                              <InfoChip
                                icon={<BusinessIcon fontSize="small" />}
                                label={t("adminCampaignForm.franchise.chip")}
                                color="primary"
                              />
                            </Box>
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
                label={t("adminCampaignForm.form.labels.totalAllocated")}
                value={formData.totalAllocated}
                onChange={handleChange("totalAllocated")}
                error={!!validationErrors.totalAllocated}
                helperText={
                  validationErrors.totalAllocated ||
                  t("adminCampaignForm.form.helpers.totalAllocated")
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
                label={t("adminCampaignForm.form.labels.renewalRequirement")}
                value={formData.renewalRequirement}
                onChange={handleChange("renewalRequirement")}
                error={!!validationErrors.renewalRequirement}
                helperText={
                  validationErrors.renewalRequirement ||
                  t("adminCampaignForm.form.helpers.renewalRequirement")
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tooltip
                        title={t(
                          "adminCampaignForm.form.tooltips.renewalRequirement"
                        )}
                      >
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
                label={t("adminCampaignForm.form.labels.startDate")}
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
                label={t("adminCampaignForm.form.labels.endDate")}
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
                minRows={3}
                label={t("adminCampaignForm.form.labels.description")}
                placeholder={t(
                  "adminCampaignForm.form.placeholders.description"
                )}
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
              <Stack direction="row" spacing={2} justifyContent="end">
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={isCreating}
                >
                  {t("adminCampaignForm.buttons.cancel")}
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
                    t("adminCampaignForm.buttons.create")
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
