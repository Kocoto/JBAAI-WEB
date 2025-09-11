import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, Box, SxProps, Theme } from "@mui/material";

type LanguageSwitcherProps = {
  sx?: SxProps<Theme>; // 👈 thêm prop sx
};

export default function LanguageSwitcher({ sx }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const lang = (i18n.language || "vi").toLowerCase();
  const isVI = lang.startsWith("vi");
  const isEN = lang.startsWith("en");

  const setLanguage = (newLang: "vi" | "en") => {
    if ((newLang === "vi" && isVI) || (newLang === "en" && isEN)) return;
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  const flagSx = (selected: boolean) => ({
    fontSize: "1.5rem",
    transition: "all 120ms ease",
    opacity: selected ? 1 : 0.55,
    filter: selected ? "none" : "grayscale(55%)",
    transform: selected ? "scale(1.06)" : "scale(1)",
    borderRadius: "8px",
    boxShadow: (theme: Theme) =>
      selected ? `0 0 0 2px ${theme.palette.primary.main}66` : "none",
    padding: "2px 4px",
    lineHeight: 1,
  });

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={0.5}
      role="group"
      aria-label="Language switcher"
      sx={sx} // 👈 áp dụng sx từ ngoài
    >
      <Tooltip
        title={isVI ? "Tiếng Việt (đang chọn)" : "Chuyển sang Tiếng Việt"}
      >
        <IconButton
          onClick={() => setLanguage("vi")}
          color="inherit"
          aria-pressed={isVI}
          size="small"
          sx={flagSx(isVI)}
        >
          <span role="img" aria-label="Vietnamese">
            🇻🇳
          </span>
        </IconButton>
      </Tooltip>

      <Tooltip title={isEN ? "English (selected)" : "Switch to English"}>
        <IconButton
          onClick={() => setLanguage("en")}
          color="inherit"
          aria-pressed={isEN}
          size="small"
          sx={flagSx(isEN)}
        >
          <span role="img" aria-label="English">
            🇺🇸
          </span>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
