// src/features/admin/pages/AdminDashboard.tsx

import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useAuth } from "../../auth/context/AuthProvider";
import { DashboardLayout } from "../../../shared/components/layout/DashboardLayout";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const adminStats = [
    {
      title: "Total Users",
      value: "12,543",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      change: "+12%",
    },
    {
      title: "Active Sellers",
      value: "3,721",
      icon: <StorefrontIcon sx={{ fontSize: 40 }} />,
      color: "#388e3c",
      change: "+8%",
    },
    {
      title: "Total Revenue",
      value: "$2.4M",
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      color: "#f57c00",
      change: "+15%",
    },
    {
      title: "Growth Rate",
      value: "23%",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#7b1fa2",
      change: "+5%",
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.username || user?.email}! Here's your system
            overview.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {adminStats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                  border: `1px solid ${stat.color}30`,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.color,
                        fontWeight: "bold",
                        bgcolor: `${stat.color}20`,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Admin-specific sections */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                System Performance
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <Typography color="text.secondary">
                  Performance charts will be displayed here
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  • New seller registration: John Doe
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • System update completed
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • 5 new franchise requests
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};
