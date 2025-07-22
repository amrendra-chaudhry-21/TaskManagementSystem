import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./Pages/Dashboard/Home";
import LoginNumber from "./Pages/LoginNumber/LoginNumber";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";
import { AuthProvider } from "./Components/AuthProvider/AuthProvider";
import Signup from "./Pages/Signup/Signup";
import TeamManagement from "./Pages/TeamManagement/TeamManagement";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginNumber />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PrivateRoute>
                <Signup />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-team"
            element={
              <PrivateRoute>
                <TeamManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
