import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import Header from "../../Components/Header/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PeopleOutlineTwoToneIcon from "@material-ui/icons/PeopleOutlineTwoTone";
import "./TeamManagement.css";
import PageHeader from "../../Components/PageHeader/PageHeader";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { Paths } from "../../config/LoginBaseAPI";
import { useAuth } from "../../Components/AuthProvider/AuthProvider";
import TeamModel from "../TeamModel/TeamModel";
import AddTeam from "../TeamModel/AddTeam";

const TeamManagement = () => {
  const { isAuthenticated, userInfo, logout } = useAuth();
  const [teams, setTeams] = useState([]);
  const [isError, setIsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTeams, setTotalTeams] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTeam, setAddTeam] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSelectedTeam, setEditSelectedTeam] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSelectedTeam, setViewSelectedTeam] = useState({});

  const openModal = () => {
    setSelectedTeam({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const openAddModal = () => {
    setAddTeam({});
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const viewOpenModal = (team) => {
    setViewSelectedTeam(team);
    setViewModalOpen(true);
  };

  const viewCloseModal = () => {
    setViewModalOpen(false);
  };

  const editOpenModal = (team) => {
    setEditSelectedTeam(team);
    setEditModalOpen(true);
  };

  const editCloseModal = () => {
    setEditModalOpen(false);
  };
  const fetchTeams = async () => {
    if (!isAuthenticated) {
      setIsError("Please login to view teams");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(Paths.EndpointsURL.GETAllTeam, {
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
        setTeams(response.data.data.teams);
        setTotalTeams(response.data.data.pagination.total);
        setIsError("");
      } else {
        setIsError(response.data.message || "Failed to fetch teams");
        if (response.data.message === "Invalid Token!") {
          logout();
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error fetching teams";
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

  const updatePaginatedData = (page, rows) => {
    const startIndex = (page - 1) * rows;
    const paginatedData = allTeams.slice(startIndex, startIndex + rows);
    setTeams(paginatedData);
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
      setTimeout(() => (window.location.href = "/login"), 1500);
    } else {
      const errorMsg = error.response?.data?.message || "Failed to delete team";
      toast.error(errorMsg);
    }
  };

  const deleteTeamHandler = async (id) => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;
    try {
      if (!hasRole("Admin")) {
        toast.error("Only Admins can delete teams!");
        return;
      }
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      const deleteUrl = `${Paths.EndpointsURL.DeleteTeamMember}/${id}`;
      await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Team deleted successfully!");
      if (fetchTeams) fetchTeams();
      if (typeof navigate === "function") {
        setTimeout(() => navigate(0), 1000);
      } else {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const confirmDelete = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this team?",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      confirmButtonColor: "#3085d6",
      cancelButtonText: "Cancel",
      confirmButtonText: "Confirm",
    });
    return isConfirmed;
  };

  useEffect(() => {
    fetchTeams();
  }, [currentPage, rowsPerPage, isAuthenticated]);

  const indexOfFirstItem = (currentPage - 1) * rowsPerPage;
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, totalTeams);

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
              title="Team Management"
              subTitle="Manage your teams"
              icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
            />
          </div>
          <div className="employee-management">
            <div className="search-bar">
              <button className="create-new" onClick={() => openModal()}>
                +Create Team
              </button>
              <br />
              <button className="add-new" onClick={() => openAddModal()}>
                +Add Team
              </button>
            </div>

            <AddTeam
              isOpen={addModalOpen}
              onClose={closeAddModal}
              person={addTeam}
            />
            <TeamModel
              isOpen={modalOpen}
              onClose={closeModal}
              person={selectedTeam}
            />

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams?.length > 0 ? (
                  teams.map((team, index) => (
                    <tr key={index}>
                      <td>{truncateText(team.name)}</td>
                      <td>{truncateText(team.description)}</td>
                      <td className="button_edit">
                        <button
                          className="delete"
                          onClick={() => deleteTeamHandler(team._id)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      {isError || "No teams available"}
                    </td>
                  </tr>
                )}
              </tbody>
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
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalTeams)}{" "}
                of {totalTeams}
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
                  disabled={currentPage === Math.ceil(totalTeams / rowsPerPage)}
                >
                  ❯
                </button>
              </div>
            </div>
            {isError && !teams.length && (
              <p className="error-message">{isError}</p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default TeamManagement;
