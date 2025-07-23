import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import Header from "../../Components/Header/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PeopleOutlineTwoToneIcon from "@material-ui/icons/PeopleOutlineTwoTone";
import "./Project.css";
import PageHeader from "../../Components/PageHeader/PageHeader";
import { MdDelete, MdEdit } from "react-icons/md";
import axios from "axios";
import { Paths } from "../../config/LoginBaseAPI";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import ProjectModel from "../ProjectModel/ProjectModel";
import EditProjectModel from "../ProjectModel/EditProjectModel";

const Project = () => {
  const { isAuthenticated, userInfo, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isError, setIsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProjects, setTotalProjects] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSelectedProject, setEditSelectedProject] = useState(null);

  const openModal = () => {
    setSelectedProject({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const editOpenModal = (project) => {
    setEditSelectedProject(project);
    setEditModalOpen(true);
  };

  const editCloseModal = () => {
    setEditModalOpen(false);
  };

  const fetchProjects = async () => {
    if (!isAuthenticated) {
      setIsError("Please login to view projects");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(Paths.EndpointsURL.GetProject, {
        params: {
          page: currentPage,
          limit: rowsPerPage,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProjects(response.data.data.projects);
        setTotalProjects(response.data.data.pagination.total);
        setIsError("");
      } else {
        setIsError(response.data.message || "Failed to fetch projects");
        if (response.data.message === "Invalid Token!") {
          logout();
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error fetching projects";
      setIsError(errorMessage);
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

  const hasRole = (role) => {
    return userInfo?.teams?.some((team) => team.role === role);
  };

  const handleError = (error) => {
    console.error("Deletion error:", error);
    if (
      error.response?.status === 401 ||
      error.message?.includes("Invalid Token")
    ) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("accessToken");
      setTimeout(() => window.location.href, 1500);
    } else {
      const errorMsg =
        error.response?.data?.message || "Failed to delete project";
      toast.error(errorMsg);
    }
  };

  const deleteProjectHandler = async (id) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    try {
      if (!hasRole("Admin")) {
        toast.error("Only Admins can delete project!");
        return;
      }
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const deleteUrl = `${Paths.EndpointsURL.DeleteProject}`;
      await axios.delete(deleteUrl, {
        data: { projectId: id },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Project deleted successfully!");
      fetchProjects();
    } catch (error) {
      handleError(error);
    }
  };

  const confirmDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this project?",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancel",
      confirmButtonText: "Confirm",
    });
    return isConfirmed;
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, rowsPerPage, isAuthenticated]);

  const indexOfFirstItem = (currentPage - 1) * rowsPerPage;
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, totalProjects);

  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <>
      <Header />
      <div className="main d-flex">
        <div className="sidebarwrapper">
          <Sidebar />
        </div>
        <div className="content-wrapper">
          <div className="header">
            <PageHeader
              title="Project"
              subTitle="Manage your project"
              icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
            />
          </div>
          <div className="employee-management">
            <div className="search-bar">
              <button className="create-new" onClick={openModal}>
                +Create Project
              </button>
            </div>

            <ProjectModel
              isOpen={modalOpen}
              onClose={closeModal}
              project={selectedProject}
              fetchProjects={fetchProjects}
            />

            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Team</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects?.length > 0 ? (
                  projects.map((project, index) => (
                    <tr key={index}>
                      <td>{truncateText(project.name)}</td>
                      <td>{truncateText(project.description)}</td>
                      <td>{truncateText(project.team?.name)}</td>
                      <td className="button_edit">
                        <button
                          className="delete"
                          onClick={() => deleteProjectHandler(project._id)}
                        >
                          <MdDelete />
                        </button>
                        <button
                          className="edit"
                          onClick={() => editOpenModal(project)}
                        >
                          <MdEdit />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      {isError || "No projects available"}
                    </td>
                  </tr>
                )}
              </tbody>
              <EditProjectModel
                isOpen={editModalOpen}
                onClose={editCloseModal}
                projectToEdit={editSelectedProject}
                fetchProjects={fetchProjects}
              />
            </table>
            <div className="pagination">
              <div className="rows-per-page">
                <label>Rows per page :</label>
                <select
                  className="rows_options"
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </div>
              <span>
                {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, totalProjects)} of {totalProjects}
              </span>
              <div className="all_button">
                <button
                  className="prev"
                  onClick={() => handleChangePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ❮
                </button>
                <button
                  className="next"
                  onClick={() => handleChangePage(currentPage + 1)}
                  disabled={
                    currentPage === Math.ceil(totalProjects / rowsPerPage)
                  }
                >
                  ❯
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Project;
