import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";

// This component serves as a dedicated page for the login form.
// It handles two main responsibilities:
// 1. Redirecting already authenticated users away from the login page.
// 2. Providing the necessary `onLogin` prop to the LoginForm component.
const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // This effect ensures that if a user who is already logged in
  // somehow navigates to the /login page, they are immediately
  // redirected to the main dashboard.
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // This function is passed to the LoginForm. After a successful login,
  // the LoginForm will call this, ensuring the user is sent to the dashboard.
  const handleLoginSuccess = () => {
    navigate("/dashboard", { replace: true });
  };

  // Render the LoginForm, passing the required `onLogin` function.
  // This resolves the "onLogin is not a function" TypeError.
  return <LoginForm onLogin={handleLoginSuccess} />;
};

export default LoginPage;
