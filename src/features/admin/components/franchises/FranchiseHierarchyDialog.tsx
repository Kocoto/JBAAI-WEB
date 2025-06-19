// src/features/admin/components/franchises/FranchiseHierarchyDialog.tsx

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  IconButton,
  Skeleton,
  Alert,
  alpha,
  useTheme,
  Collapse,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccountTree as AccountTreeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useAdminFranchise } from "../../hooks/useAdminFranchise";
import { FranchiseHierarchyNode } from "../../types/franchise.types";
import FranchiseStatusChip from "./FranchiseStatusChip";

interface FranchiseHierarchyDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface TreeNodeProps {
  node: FranchiseHierarchyNode;
  level: number;
}

function TreeNode({ node, level }: TreeNodeProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(level < 2);

  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1,
          ml: level * 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderLeft: `4px solid ${
            level === 0
              ? theme.palette.primary.main
              : level === 1
              ? theme.palette.success.main
              : theme.palette.warning.main
          }`,
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <Stack spacing={2}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                {node.franchiseName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {node.franchiseName}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FranchiseStatusChip level={node.level} />
                  <Chip
                    label={`Quota: ${node.totalActiveQuota}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>

            {hasChildren && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transition: "transform 0.2s",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            )}
          </Stack>

          {/* Details */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {node.email}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {node.phone}
                </Typography>
              </Stack>
            </Stack>

            {/* Statistics */}
            {node.statistics && (
              <Stack direction="row" spacing={2}>
                <Chip
                  size="small"
                  label={`Tổng con: ${node.statistics.totalChildren}`}
                  sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                />
                <Chip
                  size="small"
                  label={`Tổng cháu: ${node.statistics.totalDescendants}`}
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                  }}
                />
                <Chip
                  size="small"
                  label={`Quota đã cấp: ${node.statistics.totalQuotaAllocated}`}
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                  }}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Children */}
      {hasChildren && (
        <Collapse in={expanded}>
          {node.children.map((child) => (
            <TreeNode key={child._id} node={child} level={level + 1} />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export default function FranchiseHierarchyDialog({
  open,
  onClose,
  userId,
}: FranchiseHierarchyDialogProps) {
  const theme = useTheme();
  const {
    fetchFranchiseHierarchy,
    franchiseHierarchy,
    isLoadingHierarchy,
    hierarchyError,
  } = useAdminFranchise();

  useEffect(() => {
    if (open && userId) {
      fetchFranchiseHierarchy(userId);
    }
  }, [open, userId, fetchFranchiseHierarchy]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <AccountTreeIcon color="primary" />
            <Typography variant="h6">Cây phân cấp Franchise</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoadingHierarchy ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                height={120}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Stack>
        ) : hierarchyError ? (
          <Alert severity="error">
            <Typography>Có lỗi xảy ra khi tải dữ liệu</Typography>
            <Typography variant="body2">{hierarchyError.message}</Typography>
          </Alert>
        ) : franchiseHierarchy ? (
          <Box>
            {/* Statistics Summary */}
            {franchiseHierarchy.statistics && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Thống kê tổng quan
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tổng số Franchise
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {franchiseHierarchy.statistics.totalFranchises}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tổng Quota hoạt động
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {franchiseHierarchy.statistics.totalActiveQuota}
                    </Typography>
                  </Box>
                  {franchiseHierarchy.statistics.byLevel && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phân bổ theo cấp
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {Object.entries(
                          franchiseHierarchy.statistics.byLevel
                        ).map(([level, count]) => (
                          <Chip
                            key={level}
                            label={`Cấp ${level}: ${count}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Hierarchy Tree */}
            <Box sx={{ overflowX: "auto" }}>
              <TreeNode node={franchiseHierarchy} level={0} />
            </Box>
          </Box>
        ) : (
          <Alert severity="info">Không có dữ liệu phân cấp</Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
