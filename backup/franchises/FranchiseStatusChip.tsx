// src/features/admin/components/franchises/FranchiseStatusChip.tsx

import React from "react";
import { Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";

interface FranchiseStatusChipProps {
  level: number;
}

export default function FranchiseStatusChip({
  level,
}: FranchiseStatusChipProps) {
  const theme = useTheme();

  const getLevelConfig = () => {
    switch (level) {
      case 0:
        return {
          label: "Franchise Cấp 0",
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          stars: 1,
        };
      case 1:
        return {
          label: "Franchise Cấp 1",
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          stars: 2,
        };
      case 2:
        return {
          label: "Franchise Cấp 2",
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          stars: 3,
        };
      default:
        return {
          label: `Franchise Cấp ${level}`,
          color: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          stars: level > 3 ? 3 : level,
        };
    }
  };

  const config = getLevelConfig();

  return (
    <Chip
      label={
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="caption" fontWeight={600}>
            {config.label}
          </Typography>
          <Stack direction="row" spacing={0}>
            {[...Array(3)].map((_, index) => (
              <React.Fragment key={index}>
                {index < config.stars ? (
                  <StarIcon
                    sx={{
                      fontSize: 14,
                      color: config.color,
                    }}
                  />
                ) : (
                  <StarBorderIcon
                    sx={{
                      fontSize: 14,
                      color: alpha(config.color, 0.3),
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Stack>
      }
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.3)}`,
        fontWeight: 600,
        px: 1.5,
        py: 0.5,
        "& .MuiChip-label": {
          px: 0,
        },
      }}
    />
  );
}
