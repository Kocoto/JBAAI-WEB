import React from "react";
import {
  alpha,
  Box,
  Fade,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";

export default function AdminCampaignList() {
  const theme = useTheme();
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Fade in timeout={600}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
              }}
            >
              <CampaignIcon
                sx={{ color: theme.palette.primary.main, fontSize: 32 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Quản lý chiến dịch
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem xét và quản lý các chiến dịch
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Box>
  );
}
