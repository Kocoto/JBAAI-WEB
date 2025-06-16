// src/components/dashboard/StatCard.tsx

import React, { useId } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { areaElementClasses } from "@mui/x-charts/LineChart";

/**
 * --- PROPS ĐÃ ĐƯỢC MỞ RỘNG ---
 */
export type StatCardProps = {
  // Dữ liệu cơ bản
  title: string;
  value: string;
  interval: string;
  data: number[]; // Dữ liệu cho biểu đồ

  // Props mới để tăng tính linh hoạt
  trend: "up" | "down" | "neutral";
  trendValue: string; // Ví dụ: "+15.2%" hoặc "-$50"
  xAxisData: string[]; // Mảng các nhãn cho trục X của biểu đồ
  icon?: React.ReactNode; // Icon tùy chọn hiển thị cạnh tiêu đề

  // Prop mới cho trạng thái loading
  isLoading?: boolean;
};

// Component nhỏ để tạo gradient, giữ cho code chính sạch sẽ
function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

/**
 * --- COMPONENT STATCARD ĐÃ ĐƯỢC CẢI TIẾN ---
 */
export default function StatCard({
  title,
  value,
  interval,
  trend,
  data,
  trendValue, // Prop mới
  xAxisData, // Prop mới
  icon, // Prop mới
  isLoading, // Prop mới
}: StatCardProps) {
  const theme = useTheme();

  // Sử dụng useId để tạo ID duy nhất cho gradient, tránh xung đột
  const uniqueGradientId = useId();

  // Logic màu sắc không thay đổi, vẫn dựa trên theme và trend
  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: "success" as const,
    down: "error" as const,
    neutral: "default" as const,
  };

  const color = labelColors[trend];
  const chartColor = trendColors[trend];

  /**
   * --- TRẠNG THÁI LOADING ---
   * Nếu isLoading là true, hiển thị một bộ khung (skeleton) thay vì dữ liệu thật.
   * Điều này mang lại trải nghiệm người dùng tốt hơn khi chờ API.
   */
  if (isLoading) {
    return (
      <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
        <CardContent>
          <Typography variant="subtitle2">
            <Skeleton width="60%" />
          </Typography>
          <Typography variant="h4">
            <Skeleton width="40%" />
          </Typography>
          <Typography variant="caption">
            <Skeleton width="80%" />
          </Typography>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: "100%", flexGrow: 1 }}>
      <CardContent>
        {/* gutterBottom */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}
          <Typography component="h2" variant="subtitle2">
            {title}
          </Typography>
        </Stack>
        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", flexGrow: "1", gap: 1, mt: 1 }}
        >
          <Stack sx={{ justifyContent: "space-between" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              {/* Sử dụng trendValue từ props thay vì giá trị cố định */}
              <Chip size="small" color={color} label={trendValue} />
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: "100%", height: 50 }}>
            <SparkLineChart
              color={chartColor}
              data={data}
              area
              showHighlight
              showTooltip
              xAxis={{
                scaleType: "band",
                data: xAxisData, // Sử dụng xAxisData từ props
              }}
              sx={{
                [`& .${areaElementClasses.root}`]: {
                  fill: `url(#${uniqueGradientId})`,
                },
              }}
            >
              <AreaGradient color={chartColor} id={uniqueGradientId} />
            </SparkLineChart>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
