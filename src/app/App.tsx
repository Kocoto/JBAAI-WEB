import { Box, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppThemeProvider from "../shared/theme/AppTheme";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <AppThemeProvider>
        <CssBaseline enableColorScheme />
        <Box>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </Box>
      </AppThemeProvider>
    </BrowserRouter>
  );
}

export default App;
