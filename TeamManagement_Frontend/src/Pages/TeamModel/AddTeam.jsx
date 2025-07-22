import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./TeamModel.css";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import { Paths } from "../../config/LoginBaseAPI";

const AddTeam = ({ isOpen, onClose, fetchTeams }) => {
  const { isAuthenticated, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("Member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAvailableTeams();
      fetchAvailableUsers();
    }
  }, [isOpen, isAuthenticated]);

  const fetchAvailableTeams = async () => {
    if (!isAuthenticated) {
      setError("Please login to view teams");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(Paths.EndpointsURL.GETAllTeam, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setTeams(response.data.data.teams || []);
        setError("");
      } else {
        setError(response.data.message || "Failed to fetch teams");
        if (response.data.message === "Invalid Token!") {
          logout();
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error fetching teams";
      setError(errorMessage);
      if (
        error.response?.status === 401 ||
        errorMessage.includes("Invalid Token")
      ) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(Paths.EndpointsURL.GetALLSignup, {
        headers: {
          "Content-type": "application/json",
        },
      });
      if (response.data.success && response.data.data?.users) {
        const formattedUsers = response.data.data.users.map((user) => ({
          _id: user.id,
          name: user.name,
          email: user.email,
        }));
        setUsers(formattedUsers);
        setError("");
      } else {
        setError("No users found in response");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidObjectId(selectedUser)) {
      toast.error("Please select a valid user");
      return;
    }
    if (!selectedTeam || !selectedUser || !selectedRole) {
      toast.warning("All fields are required!");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("accessToken");
    try {
      console.log("Submitting with:", {
        teamId: selectedTeam,
        userId: selectedUser,
        role: selectedRole,
      });
      const response = await axios.post(
        Paths.EndpointsURL.AddTeamMember,
        {
          teamId: selectedTeam,
          userId: selectedUser,
          role: selectedRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to add member");
      }
      setSelectedTeam("");
      setSelectedUser("");
      setSelectedRole("Member");
      toast.success("Member added successfully!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => {
          onClose();
          if (fetchTeams) fetchTeams();
        },
      });
    } catch (error) {
      console.error("Detailed error:", {
        error,
        response: error.response,
        config: error.config,
      });
      let errorMessage = "Failed to add member. Please try again.";
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
          if (error.response.data.message.includes("already in team")) {
            errorMessage =
              "This user is already a member of the selected team.";
          } else if (error.response.data.message.includes("team limit")) {
            errorMessage = "User has reached the maximum team limit.";
          } else if (error.response.data.message.includes("Invalid Token")) {
            errorMessage = "Session expired. Please login again.";
          }
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (error.response.status === 404) {
          errorMessage = "Team or user not found.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      if (
        error.response?.status === 401 ||
        error.message?.includes("Invalid Token") ||
        error.response?.data?.message?.includes("Invalid Token")
      ) {
        localStorage.removeItem("accessToken");
        logout();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleModalClick}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="tab-container">
          <button className="tab-button active">Add Team Members</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="custom-registration-container">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="team">Select Team *</label>
                <div className="input-wrapper">
                  <select
                    id="team"
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="form-input"
                    required
                    disabled={isLoading || !isAuthenticated}
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="user">Select User *</label>
                <div className="input-wrapper">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={isLoading}
                    className="form-input"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="role">Select Role *</label>
                <div className="input-wrapper">
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="form-input"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || isLoading || !isAuthenticated}
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeam;
