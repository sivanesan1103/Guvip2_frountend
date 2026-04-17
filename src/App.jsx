import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import QuizListPage from "./pages/QuizListPage";
import QuizTakePage from "./pages/QuizTakePage";
import ResultPage from "./pages/ResultPage";
import MyResultsPage from "./pages/MyResultsPage";
import AdminNewQuizPage from "./pages/AdminNewQuizPage";
import AdminQuestionsPage from "./pages/AdminQuestionsPage";
import AdminResultsPage from "./pages/AdminResultsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import { useAuth } from "./context/AuthContext";

function RoleHomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <Navigate to={role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/quizzes" element={<AdminNewQuizPage />} />
        <Route path="/admin/quizzes/:quizId/questions" element={<AdminQuestionsPage />} />
        <Route path="/admin/results" element={<AdminResultsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={["PARTICIPANT"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quizzes" element={<QuizListPage />} />
        <Route path="/my-results" element={<MyResultsPage />} />
        <Route path="/quiz/:quizId" element={<QuizTakePage />} />
        <Route path="/result/:resultId" element={<ResultPage />} />
      </Route>

      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
}
