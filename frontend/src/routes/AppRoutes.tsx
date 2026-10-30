import { Route, Routes } from 'react-router-dom';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import LogoutPage from '../pages/auth/LogoutPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import HomePage from '../pages/public/HomePage';
import NotFoundPage from '../pages/public/NotFoundPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import CropAnalysisPage from '../pages/analytics/CropAnalysisPage';
import DistrictExplorerPage from '../pages/analytics/DistrictExplorerPage';
import DataQualityPage from '../pages/analytics/DataQualityPage';


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/crop-analysis" element={<CropAnalysisPage />} />
      <Route path="/district-explorer" element={<DistrictExplorerPage />} />
      <Route path="/data-quality" element={<DataQualityPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />


    </Routes>
  );
}