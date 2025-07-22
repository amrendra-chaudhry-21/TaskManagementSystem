import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import "./LoginModel.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import { Paths } from "../../config/LoginBaseAPI";

const LoginModel = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [isError, setIsError] = useState({});
  const [isSuccess, setIsSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsError((prev) => ({ ...prev, [name]: "" }));
    setIsSuccess("");
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Email is Required";
      isValid = false;
    } else if (!formData.emailOrPhone.includes("@")) {
      newErrors.emailOrPhone = "Please enter a valid email address";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }
    setIsError(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await Paths.EndpointsURL.LoginPassword;
      const res = await axios({
        url: response,
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        data: JSON.stringify({
          email: formData.emailOrPhone.toLowerCase(),
          password: formData.password,
        }),
      });
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        login(
          accessToken,
          null,
          user.id || user._id,
          user.name,
          user.email,
          user.teams
        );
        toast.success("Login successful!");
        onClose();
        navigate("/dashboard");
      }
    } catch (error) {
      let errorMessage = "An error occurred during login";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes("email")) {
        setIsError({ emailOrPhone: errorMessage });
      } else if (errorMessage.toLowerCase().includes("password")) {
        setIsError({ password: errorMessage });
      } else {
        setIsError({ general: errorMessage });
      }
    }
  };

  return (
    <>
      <div className={`otp_modal ${isOpen ? "show" : ""}`} onClick={onClose}>
        <div className="otp_modal_content" onClick={(e) => e.stopPropagation()}>
          <div className="otp_modal_header">
            <span className="otp_modal_close" onClick={onClose}>
              &times;
            </span>
          </div>

          <div className="hiring_model_title">
            <h2>Login</h2>
          </div>

          {isSuccess.message && <p className="success">{isSuccess.message}</p>}
          {isError.general && <p className="error">{isError.general}</p>}

          <form onSubmit={handleSubmit}>
            <div className="inputs_data">
              <label htmlFor="emailOrPhone">Email</label>
              <div className="input_form_data">
                <input
                  type="email"
                  placeholder="Enter your email*"
                  name="emailOrPhone"
                  id="emailOrPhone"
                  onChange={handleChange}
                  value={formData.emailOrPhone}
                  autoComplete="email"
                />
                {isError.emailOrPhone && (
                  <p className="error">{isError.emailOrPhone}</p>
                )}
              </div>
              <label htmlFor="password">Password</label>
              <div className="input_form_data">
                <input
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  id="password"
                  onChange={handleChange}
                  value={formData.password}
                  autoComplete="current-password"
                />
                {isError.password && (
                  <p className="error">{isError.password}</p>
                )}
              </div>
              <div className="submit_data">
                <button className="submit_btn" type="submit">
                  Login
                </button>
              </div>
            </div>
          </form>
          <div className="terms_div">
            <p>
              By clicking on Continue, I accept the{" "}
              <b>Terms & Conditions, Privacy Policy & Refund Policy</b>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default LoginModel;
