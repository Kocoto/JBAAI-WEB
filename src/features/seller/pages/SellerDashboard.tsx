// src/features/seller/pages/SellerDashboard.tsx

import React from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthProvider";
import { DashboardLayout } from "../../../shared/components/layout/DashboardLayout";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddBoxIcon from "@mui/icons-material/AddBox";

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();

  const sellerStats = [
    {
      title: "Total Sales",
      value: "$45,320",
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: "#2e7d32",
      change: "+18%",
    },
    {
      title: "Active Orders",
      value: "156",
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: "#1565c0",
      change: "+23",
    },
    {
      title: "Products",
      value: "89",
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: "#6a1b9a",
      change: "+5",
    },
    {
      title: "Pending Shipments",
      value: "34",
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      color: "#e65100",
      change: "-12",
    },
  ];

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Seller Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.username || user?.email}! Manage your store
              and track sales.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddBoxIcon />}
            sx={{ bgcolor: "#2e7d32" }}
          >
            Add New Product
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {sellerStats.map((stat, index) => (
            <Grid size={{ xs: 12, md: 3, sm: 6 }} key={index}>
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

        {/* Seller-specific sections */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Sales Overview
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
                  Sales chart will be displayed here
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  • Order #1234 - $120.00 - Processing
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • Order #1233 - $85.50 - Shipped
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • Order #1232 - $200.00 - Delivered
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  • Order #1231 - $45.00 - Processing
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};
