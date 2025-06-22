// File: src/features/admin/components/campaigns/CampaignForm.tsx

import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import { useAdminCampaign } from "../../hooks/useAdminCampaign";
import { useAdminFranchise } from "../../hooks/useAdminFranchise";
import { CreateCampaignPayload } from "../../types/campaign.types";
import CustomDatePicker from "@/shared/components/ui/CustomDatePicker"; // Giả sử bạn có component này

// Định nghĩa kiểu dữ liệu cho state của form

const initialState: CreateCampaignPayload = {
  campaignName: "",
  franchiseOwnerId: "",
  totalAllocated: 0,
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  renewalRequirement: 0,
  description: "",
};

export default function CampaignForm() {
  const [formData, setFormData] = useState<CreateCampaignPayload>(initialState);

  // Lấy hàm và state từ các custom hooks
  const { addCampaign, isCreating, createError } = useAdminCampaign();
  const { franchises, loading: franchisesLoading } = useAdminFranchise();
  const navigate = useNavigate();

  // Xử lý thay đổi cho các input thông thường
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Xử lý thay đổi cho ô Select
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi cho DatePicker
  const handleDateChange = (name: keyof FormData, date: Date | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }));
    }
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.franchiseOwner) {
      alert("Vui lòng chọn một franchise.");
      return;
    }
    // Chuyển đổi một vài dữ liệu nếu cần trước khi gửi
    const payload: CampaignCreationData = {
      ...formData,
      kocs: [],
      posts: [],
      target: {
        ageRange: [0, 0],
        gender: "any",
        location: [],
      },
      hashtags: [],
    };
    await addCampaign(payload);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Tạo Chiến Dịch Mới
      </Typography>

      {/* Hiển thị lỗi nếu có */}
      {createError && <Alert severity="error">{createError}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="name"
            label="Tên Chiến Dịch"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="franchise-select-label">Franchise</InputLabel>
            <Select
              labelId="franchise-select-label"
              name="franchiseOwner"
              value={formData.franchiseOwner}
              onChange={handleSelectChange}
              label="Franchise"
            >
              {franchisesLoading ? (
                <MenuItem disabled>Đang tải...</MenuItem>
              ) : (
                franchises.map((f) => (
                  <MenuItem key={f._id} value={f._id}>
                    {f.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="description"
            label="Mô Tả"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomDatePicker
            label="Ngày Bắt Đầu"
            value={formData.startDate}
            onChange={(date) => handleDateChange("startDate", date)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomDatePicker
            label="Ngày Kết Thúc"
            value={formData.endDate}
            onChange={(date) => handleDateChange("endDate", date)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="budget"
            label="Ngân Sách"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Trạng Thái</InputLabel>
            <Select
              labelId="status-select-label"
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              label="Trạng Thái"
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on-hold">On-hold</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button
          onClick={() => navigate(-1)}
          color="inherit"
          disabled={isCreating}
        >
          Hủy
        </Button>
        <Button type="submit" variant="contained" disabled={isCreating}>
          {isCreating ? <CircularProgress size={24} /> : "Lưu Chiến Dịch"}
        </Button>
      </Box>
    </Box>
  );
}
