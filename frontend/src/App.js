// frontend/src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import QuestionnairePage from "./pages/QuestionnairePage";
import ResultsPage from "./pages/ResultsPage";
import ResearchInsightsPage from "./pages/ResearchInsightsPage";
import ReportPage from "./pages/ReportPage";
import EvaluationLabPage from "./pages/EvaluationLabPage";
import DatasetAuditPage from "./pages/DatasetAuditPage";
import DatasetEditorPage from "./pages/DatasetEditorPage";
import DevLabLauncher from "./components/DevLabLauncher";
import ProtectedDevRoute from "./components/ProtectedDevRoute";
import TargetCursor from "./components/TargetCursor";
import "./components/TargetCursor.css";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050608] text-white">
        <TargetCursor />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/report" element={<ReportPage />} />

          <Route path="/research" element={<ResearchInsightsPage />} />
          <Route path="/research-insights" element={<ResearchInsightsPage />} />

          <Route
            path="/evaluation-lab"
            element={
              <ProtectedDevRoute>
                <EvaluationLabPage />
              </ProtectedDevRoute>
            }
          />

          <Route
            path="/dataset-audit"
            element={
              <ProtectedDevRoute>
                <DatasetAuditPage />
              </ProtectedDevRoute>
            }
          />

          <Route
            path="/dataset-editor"
            element={
              <ProtectedDevRoute>
                <DatasetEditorPage />
              </ProtectedDevRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <DevLabLauncher />
      </div>
    </Router>
  );
}

export default App;