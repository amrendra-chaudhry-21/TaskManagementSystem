import React, { useState } from "react";
import { X, User, Mail, Lock, ChevronDown } from "lucide-react";
import "./UploadSignup.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Paths } from "../../config/LoginBaseAPI";

const UploadSignup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Paths.EndpointsURL.PostSignup;
      const result = await axios.post(`${response}`, formData, {
        headers: {
          "Content-type": "application/json",
        },
      });
      toast.success("Registration successful!", {
        position: "top-right",
        autoClose: 2000,
      });
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Member",
      });
      setTimeout(() => {
        onClose();
      }, 1000);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
        {
          position: "top-right",
        }
      );
    }
  };

  if (!isOpen) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={handleModalClick}>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="tab-container">
            <button className="tab-button active">User Registration</button>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="two-column-container">
              <div className="form-column">
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <User size={20} />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                      <Mail size={20} />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <Lock size={20} />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Create a password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="role">Role</label>
                    <div className="input-wrapper">
                      <div className="select-wrapper">
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="form-input"
                          required
                        >
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <ChevronDown size={20} className="select-arrow" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="submit-btn">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default UploadSignup;
