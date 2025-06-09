import { Box, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline enableColorScheme />
      <Box>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

export default App;
