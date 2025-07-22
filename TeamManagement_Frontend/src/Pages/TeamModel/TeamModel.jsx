import React, { useState } from "react";
import { X } from "lucide-react";
import "./TeamModel.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import { Paths } from "../../config/LoginBaseAPI";

const TeamModel = ({ isOpen, onClose, fetchTeams }) => {
  const { userInfo } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = () => {
    return userInfo?.teams?.some((team) => team.role === "Admin");
  };

  const handleTeamNameChange = (e) => {
    setTeamName(e.target.value);
  };

  const handleTeamDescriptionChange = (e) => {
    setTeamDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) {
      toast.warning("Team name is required!");
      return;
    }

    if (!isAdmin()) {
      toast.error("Only Admins can create teams!");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        Paths.EndpointsURL.CreateTeam,
        {
          name: teamName,
          description: teamDescription,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Reset form first
      setTeamName("");
      setTeamDescription("");

      // Show success toast
      toast.success("Team created successfully!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => {
          // Close modal and refresh after toast closes
          onClose();
          if (fetchTeams) fetchTeams();
          // If you really want a full page reload:
          window.location.reload();
        },
      });
    } catch (error) {
      console.error("Error creating team:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create team. Please try again.";

      toast.error(errorMessage, {
        position: "top-right",
      });

      if (
        error.response?.status === 401 ||
        errorMessage.includes("Invalid Token")
      ) {
        localStorage.removeItem("accessToken");
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
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
            <button className="tab-button active">Create New Team</button>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <div className="custom-registration-container">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="teamName">Team Name *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="teamName"
                      name="teamName"
                      value={teamName}
                      onChange={handleTeamNameChange}
                      className="form-input"
                      placeholder="Enter team name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="teamDescription">Description</label>
                  <div className="input-wrapper">
                    <textarea
                      id="teamDescription"
                      name="teamDescription"
                      value={teamDescription}
                      onChange={handleTeamDescriptionChange}
                      className="form-input_1"
                      placeholder="Enter team description"
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Team"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default TeamModel;
