import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Header from "../../Components/Header/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import PeopleOutlineTwoToneIcon from "@material-ui/icons/PeopleOutlineTwoTone";
import "./Signup.css";
import PageHeader from "../../Components/PageHeader/PageHeader";
import axios from "axios";
import UploadSignup from "../SignupModel/UploadSignup";
import { Paths } from "../../config/LoginBaseAPI";

const Signup = () => {
  const [userRegistration, setUserRegistration] = useState([]);
  const [isError, setIsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [allData, setAllData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const openModal = () => {
    setSelectedUser();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const showAllSignup = async () => {
    try {
      const response = await Paths.EndpointsURL.GetALLSignup;
      const result = await axios.get(`${response}`, {
        headers: {
          "Content-type": "application/json",
        },
      });
      const users = result.data.data.users;
      setAllData(users);
      setUserRegistration(users);
      setTotalUsers(users.length);
      updatePaginatedData(1, rowsPerPage);
    } catch (error) {
      setIsError(error.message || "Error fetching users");
    }
  };

  const updatePaginatedData = (page, rows) => {
    const startIndex = (page - 1) * rows;
    const paginatedData = allData.slice(startIndex, startIndex + rows);
    setUserRegistration(paginatedData);
  };

  useEffect(() => {
    showAllSignup();
  }, []);

  useEffect(() => {
    if (allData.length > 0) {
      updatePaginatedData(currentPage, rowsPerPage);
    }
  }, [allData, currentPage, rowsPerPage]);

  const indexOfFirstItem = (currentPage - 1) * rowsPerPage;
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, totalUsers);

  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
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
              title="Signup Users"
              subTitle="All Signup Users"
              icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
            />
          </div>
          <div className="employee-management">
            <div className="search-bar">
              <button className="add-new" onClick={() => openModal()}>
                + Add New
              </button>
            </div>
            <UploadSignup
              isOpen={modalOpen}
              onClose={closeModal}
              person={selectedUser}
            />
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {userRegistration?.length > 0 ? (
                  userRegistration.map((userReg, index) => {
                    const { name, email, teams } = userReg;

                    return (
                      <tr key={index}>
                        <td>{name}</td>
                        <td>{email}</td>
                        <td>{teams?.map((t) => t.role).join(", ")}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No Record Available!
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
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalUsers)}{" "}
                of {totalUsers}
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
                  disabled={currentPage === Math.ceil(totalUsers / rowsPerPage)}
                >
                  ❯
                </button>
              </div>
            </div>
            {isError && <p className="error-message">{isError}</p>}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Signup;
