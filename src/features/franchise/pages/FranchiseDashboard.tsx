// src/features/franchise/pages/FranchiseDashboard.tsx

import React from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthProvider";
import { DashboardLayout } from "../../../shared/components/layout/DashboardLayout";
import StoreIcon from "@mui/icons-material/Store";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export const FranchiseDashboard: React.FC = () => {
  const { user } = useAuth();

  const franchiseStats = [
    {
      title: "Total Revenue",
      value: "$125,430",
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#00695c",
      change: "+22%",
    },
    {
      title: "Branch Locations",
      value: "8",
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
      color: "#c62828",
      change: "+2",
    },
    {
      title: "Total Employees",
      value: "156",
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      color: "#4527a0",
      change: "+12",
    },
    {
      title: "Active Stores",
      value: "7",
      icon: <StoreIcon sx={{ fontSize: 40 }} />,
      color: "#f9a825",
      change: "Active",
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Franchise Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.username || user?.email}! Monitor your
            franchise network performance.
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {franchiseStats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 6 }} key={index}>
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

        {/* Franchise-specific sections */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Branch Performance
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
                  Branch performance comparison chart
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Top Performing Branches
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Branch #1 - Downtown</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Revenue: $45,200 (+15%)
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Branch #3 - Mall Location
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Revenue: $38,500 (+12%)
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Branch #5 - Airport</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Revenue: $32,100 (+8%)
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};
