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
import BusinessIcon from "@mui/icons-material/Business";
import { FranchiseService } from "../../services/franchiseService";
import { useState, useEffect } from "react";

export default function AdminFranchiseList() {
  const theme = useTheme();
  const [franchiseList, setFranchiseList] = useState<any>();
  useEffect(() => {
    const fetchFranchiseList = async () => {
      try {
        const response = await FranchiseService.getFranchiseList();
        setFranchiseList(response);
      } catch (error) {
        console.error("Error fetching franchise list:", error);
      }
    };

    fetchFranchiseList();
  }, []);
  console.log(franchiseList);
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
              <BusinessIcon
                sx={{ color: theme.palette.primary.main, fontSize: 32 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Quản lý Franchise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem xét và quản lý các franchise
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Box>
  );
}
