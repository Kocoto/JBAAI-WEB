import * as React from "react";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useDashboardNavigation } from "@/shared/hooks/useDashboardNavigation";
import Link from "@mui/material/Link";

export default function NavbarBreadcrumbs() {
  const { breadcrumbs, navigateTo } = useDashboardNavigation();

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (isLast || !item.path) {
          // Item cuối cùng - hiển thị như text
          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              {item.icon}
              {item.label}
            </Typography>
          );
        }

        // Các item khác - hiển thị như link
        return (
          <Link
            key={index}
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigateTo(item.path!);
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
