// src/shared/pages/UnauthorizedPage.tsx

import React from "react";
import { Box, Container, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthProvider";
import BlockIcon from "@mui/icons-material/Block";

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleGoBack = () => {
    console.log(user?.role);
    // Redirect về dashboard phù hợp với role
    switch (user?.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "franchise":
        navigate("/franchise/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <BlockIcon sx={{ fontSize: 80, color: "error.main", mb: 3 }} />

          <Typography variant="h3" gutterBottom>
            403
          </Typography>

          <Typography variant="h5" gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You don't have permission to access this page.
            {user && (
              <Typography component="span" display="block" sx={{ mt: 1 }}>
                Your role: <strong>{user.role}</strong>
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={handleGoBack}>
              Go to Dashboard
            </Button>

            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
