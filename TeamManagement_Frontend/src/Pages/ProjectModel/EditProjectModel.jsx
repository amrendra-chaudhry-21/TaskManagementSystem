import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "./ProjectModel.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import { Paths } from "../../config/LoginBaseAPI";

const EditProjectModal = ({
  isOpen,
  onClose,
  projectToEdit,
  fetchProjects,
}) => {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (isOpen && projectToEdit) {
      setFormData({
        name: projectToEdit.name || "",
        description: projectToEdit.description || "",
      });
      checkLocalPermissions();
    }
  }, [isOpen, projectToEdit, userInfo]);

  const checkLocalPermissions = () => {
    const isAdmin = userInfo?.roles?.includes("Admin");
    const projectTeamId = projectToEdit?.team?._id?.toString();
    const isTeamAdmin = userInfo?.teams?.some(
      (team) => team.team?.toString() === projectTeamId && team.role === "Admin"
    );

    setHasPermission(isAdmin || isTeamAdmin);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPermission) {
      toast.error("Only Admins or team admins can update projects!");
      return;
    }
    if (!formData.name && !formData.description) {
      toast.warning("At least one field must be updated");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${Paths.EndpointsURL.UpdateProject}/${projectToEdit._id}`,
        {
          name: formData.name,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Project updated successfully!");
      await fetchProjects();
      onClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage =
        errorData?.message ||
        errorData?.error?.solution ||
        "Failed to update project";
      toast.error(errorMessage);

      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.reload();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !projectToEdit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="tab-container">
          <button className="tab-button active">Update Project</button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="custom-registration-container">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="name">Project Name *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter project name"
                    disabled={!hasPermission}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="description">Description</label>
                <div className="input-wrapper">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input_1"
                    placeholder="Enter project description"
                    rows="4"
                    disabled={!hasPermission}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="button-group">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || !hasPermission}
            >
              {isSubmitting ? "Updating..." : "Update Project"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EditProjectModal;
