import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import RemediationPage from './pages/RemediationPage';
import ReportPage from './pages/ReportPage';
import ModelComparisonDashboard from './pages/ModelComparisonDashboard';
import NeuralBackground from './components/NeuralBackground';
import { BiasProvider } from './context/BiasContext';
import './index.css';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/remediation" element={<RemediationPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/comparison" element={<ModelComparisonDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BiasProvider>
      <Router>
        <div className="app-container">
          <NeuralBackground />
          <Sidebar />
          <main className="main-content">
            <AnimatedRoutes />
          </main>
        </div>
      </Router>
    </BiasProvider>
  );
}

export default App;
