import { Divider, Typography, useTheme } from "@mui/material";
import { useFranchise } from "../../hooks/useFranchise";
import { useEffect, useState } from "react";
import { AllocateQuotaPayload } from "../../types/franchise.type";
import { alpha, Box, Fade, Stack, TextField, Grid, Paper } from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

export default function AllocateQuota() {
  const theme = useTheme();
  const { allocateQuota, childFranchises } = useFranchise();

  const [formData, setFormData] = useState<AllocateQuotaPayload>({
    childFranchiseUserId: "",
    amountToAllocate: 0,
    sourceLedgerEntryId: "",
  });
  console.log(childFranchises);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    allocateQuota(formData);
  };
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Fade in timeout={600}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ md: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CardGiftcardIcon
                sx={{ color: theme.palette.primary.main, fontSize: 36 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                Cấp phát Quota
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Cấp phát Quota cho các Franchise con
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>
      <Fade in timeout={600}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} sx={{ height: "100%" }}>
              <Grid size={{ xs: 12, md: 6 }}></Grid>
            </Grid>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
}
