import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import StarIcon from "@mui/icons-material/Star";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FranchiseProfile() {
  // Mock data
  const data = {
    franchiseInfo: {
      _id: "685123de5952317a1cdbbac8",
      userId: {
        _id: "6850e5e9088f9d59fe67f789",
        username: "franchise0_1",
        email: "franchise@gmail.com",
        phone: "09012345672",
        role: "franchise",
        status: "active", // đổi sang inactive để test
        type: "premium",
        franchiseName: "FRANCHISE00115",
      },
    },
  };

  const { franchiseInfo } = data;
  const { userId } = franchiseInfo;

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "deactivate">(
    "deactivate"
  );

  const handleOpenDialog = (type: "activate" | "deactivate") => {
    setActionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleConfirmAction = () => {
    setOpenDialog(false);
    alert(
      actionType === "activate"
        ? "✅ Franchise has been activated!"
        : "❌ Franchise has been deactivated!"
    );
    // 👉 chỗ này bạn gọi API backend để update status
  };

  // Status chip
  const renderStatus = (status: string) => {
    const lower = status?.toLowerCase();
    let bgColor = "#666";
    let glow = "";

    if (lower === "active") {
      bgColor = "#4caf50";
      glow = "0 0 10px rgba(76, 175, 80, 0.7)";
    }
    if (lower === "inactive") {
      bgColor = "#f44336";
      glow = "0 0 10px rgba(244, 67, 54, 0.7)";
    }
    if (lower === "pending") {
      bgColor = "#ff9800";
      glow = "0 0 10px rgba(255, 152, 0, 0.7)";
    }

    return (
      <Chip
        label={status.toUpperCase()}
        sx={{
          backgroundColor: bgColor,
          color: "#fff",
          fontWeight: "bold",
          px: 2,
          boxShadow: glow,
        }}
      />
    );
  };

  return (
    <BaseDashboardLayout>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 3,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          style={{ width: "100%", maxWidth: "1000px" }}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Cover banner */}
            <Box
              sx={{
                height: 140,
                background: "linear-gradient(90deg, #1976d2, #42a5f5, #21cbf3)",
              }}
            />
            {/* Avatar */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: -8 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  border: "4px solid white",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
                }}
                src="https://api.dicebear.com/7.x/identicon/svg?seed=franchise"
              />
            </Box>

            <CardContent sx={{ mt: 2 }}>
              {/* Name + Status + Actions */}
              <Box textAlign="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                  {userId.franchiseName}
                </Typography>
                <Box mt={1}>{renderStatus(userId.status)}</Box>
                {/* Action Buttons */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="center"
                  mt={2}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => alert("Edit profile clicked!")}
                  >
                    Edit Profile
                  </Button>
                  {userId.status === "active" ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleOpenDialog("deactivate")}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleOpenDialog("activate")}
                    >
                      Activate
                    </Button>
                  )}
                </Stack>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Grid
                  container
                  spacing={4}
                  sx={{
                    maxWidth: 1000,
                    alignItems: "stretch",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Franchise Info */}
                  <Grid sx={{ xs: 12, md: 5.5 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            background:
                              "linear-gradient(90deg, #2196f3, #21cbf3)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 1,
                          }}
                        >
                          Franchise Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                          <Typography>
                            <strong>Franchise ID:</strong> {franchiseInfo._id}
                          </Typography>
                          <Chip
                            icon={<BadgeIcon />}
                            label={`Role: ${userId.role}`}
                            sx={{
                              borderRadius: 2,
                              fontWeight: "bold",
                              background:
                                "linear-gradient(90deg,#1976d2,#42a5f5)",
                              color: "#fff",
                              boxShadow: "0 3px 8px rgba(25,118,210,0.5)",
                              width: "fit-content",
                            }}
                          />
                          <Chip
                            icon={<StarIcon />}
                            label={`Type: ${userId.type}`}
                            sx={{
                              borderRadius: 2,
                              fontWeight: "bold",
                              background:
                                "linear-gradient(90deg,#9c27b0,#ba68c8)",
                              color: "#fff",
                              boxShadow: "0 3px 8px rgba(156,39,176,0.5)",
                              width: "fit-content",
                            }}
                          />
                        </Stack>
                      </Box>
                    </motion.div>
                  </Grid>

                  {/* Divider giữa 2 cột */}
                  <Grid
                    sx={{
                      display: { xs: "none", md: "flex" },
                      justifyContent: "center",
                    }}
                  >
                    <Divider orientation="vertical" flexItem />
                  </Grid>

                  {/* User Info */}
                  <Grid sx={{ xs: 12, md: 5.5 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            background:
                              "linear-gradient(90deg, #673ab7, #9c27b0)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 1,
                          }}
                        >
                          User Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <PersonIcon color="primary" />
                            <Typography>{userId.username}</Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <EmailIcon color="primary" />
                            <Typography>{userId.email}</Typography>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <PhoneIcon color="primary" />
                            <Typography>{userId.phone}</Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </motion.div>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {actionType === "activate"
            ? "Activate Franchise"
            : "Deactivate Franchise"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === "activate"
              ? "Are you sure you want to activate this franchise?"
              : "Are you sure you want to deactivate this franchise? This action may limit their access."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === "activate" ? "success" : "error"}
            variant="contained"
          >
            {actionType === "activate" ? "Activate" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </BaseDashboardLayout>
  );
}
