import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./ProjectModel.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import { Paths } from "../../config/LoginBaseAPI";

const ProjectModal = ({ isOpen, onClose, fetchProjects }) => {
  const { userInfo } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const isAdmin = () => {
    return userInfo?.teams?.some((team) => team.role === "Admin");
  };

  useEffect(() => {
    const fetchAvailableTeams = async () => {
      if (!isOpen) return;
      setIsLoadingTeams(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(Paths.EndpointsURL.GETAllTeam, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setAvailableTeams(response.data.data.teams || response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load teams list");
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchAvailableTeams();
  }, [isOpen]);

  const handleProjectCreation = async (event) => {
    event.preventDefault();
    if (!projectName || !selectedTeamId) {
      toast.warning("Project name and team selection are required!");
      return;
    }
    if (!isAdmin()) {
      toast.error("Only Admins can create teams!");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        Paths.EndpointsURL.CreateProject,
        {
          name: projectName,
          description: projectDescription,
          teamId: selectedTeamId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Project created successfully!", {
        position: "top-right",
        autoClose: 1000,
        onClose: () => {
          onClose();
          if (fetchProjects) fetchProjects();
          window.location.reload();
        },
      });
    } catch (error) {
      console.log(error.response?.data?.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const preventModalClose = (event) => {
    event.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={preventModalClose}>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="tab-container">
            <button className="tab-button active">Create New Project</button>
          </div>
          <form onSubmit={handleProjectCreation} className="form-grid">
            <div className="custom-registration-container">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="projectTeam">Team *</label>
                  <div className="input-wrapper">
                    <select
                      id="projectTeam"
                      value={selectedTeamId}
                      onChange={(event) =>
                        setSelectedTeamId(event.target.value)
                      }
                      disabled={isLoadingTeams}
                      required
                      className="form-input"
                    >
                      <option value="">Select a team</option>
                      {availableTeams.map((team) => (
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
                  <label htmlFor="projectName">Project Name *</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(event) => setProjectName(event.target.value)}
                      className="form-input"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="projectDescription">Description</label>
                  <div className="input-wrapper">
                    <textarea
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(event) =>
                        setProjectDescription(event.target.value)
                      }
                      className="form-input_1"
                      placeholder="Enter project description"
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
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ProjectModal;
