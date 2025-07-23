import { Link } from "react-router-dom";
import "./Header.css";
import user from "/images/NNL-Brochure-icons-03.webp";
import { MdMenuOpen } from "react-icons/md";
import { Button } from "@mui/material";
import SearchBox from "../SearchBox/SearchBox";
import { FaRegBell } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Logout from "@mui/icons-material/Logout";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider/AuthProvider";

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpennotificationDrop, setisOpennotificationDrop] = useState(false);
  const openMyAcc = Boolean(anchorEl);
  const openNotifications = Boolean(isOpennotificationDrop);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOpenMyAccDrop = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMyAccDrop = () => {
    setAnchorEl(null);
  };

  const handleOpennotificationsDrop = () => {
    setisOpennotificationDrop(true);
  };

  const handleClosenotificationsDrop = () => {
    setisOpennotificationDrop(false);
  };

  const { logout } = useAuth();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <>
      <header className="d-flex align-items-center">
        <div className="container-fluid w-100">
          <div className="row d-flex align-items-center">
            <div className="col-sm-2 section1">
              <Link to={"/"}>
                <img
                  src="https://barcosys.com/barcosys/images/logo-dark.svg"
                  alt="logo"
                  className="logo"
                />
              </Link>
            </div>

            <div className="col-sm-3 d-flex align-items-center section2">
              <Button className="rounded-circle mr-3" onClick={toggleSidebar}>
                <MdMenuOpen />
              </Button>
              <SearchBox />
            </div>

            <div className="col-sm-7 d-flex align-items-center justify-content-end section3">
              <div className="dropdownwrapper position-relative">
                <Button
                  className="rounded-circle mr-3"
                  onClick={handleOpennotificationsDrop}
                >
                  <FaRegBell />
                </Button>
                <Menu
                  anchorEl={isOpennotificationDrop}
                  className="notifications dropdown_list"
                  id="notifications"
                  open={openNotifications}
                  onClose={handleClosenotificationsDrop}
                  onClick={handleClosenotificationsDrop}
                >
                  <div className="head pl-3 pb-0">
                    <h4>Orders(12)</h4>
                  </div>
                  <Divider className="mb-1" />

                  <MenuItem onClick={handleCloseMyAccDrop}>
                    <div className="d-flex">
                      <div>
                        <div className="userImg">
                          <span className="rounded-circle">
                            <img src={user} alt="" />
                          </span>
                        </div>
                      </div>

                      <div className="dropdowninfo">
                        <h4>
                          <span>
                            <b>Amrendra Chaudhary </b>
                            added to his favorite list
                            <b> Leather belt steve madan </b>
                          </span>
                        </h4>
                        <p className="text-sky mb-0">few seconds ago</p>
                      </div>
                    </div>
                  </MenuItem>

                  <div className="pl-3 pr-3 w-100">
                    <Button className="btn-blue w-100">
                      View all notifications
                    </Button>
                  </div>
                </Menu>
              </div>

              <div className="myaccwrapper">
                <Button
                  className="myacc d-flex align-items-center"
                  onClick={handleOpenMyAccDrop}
                >
                  <div className="userImg">
                    <span className="rounded-circle">
                      <img src={user} alt="" />
                    </span>
                  </div>

                  <div className="userInfo">
                    <h4>{userInfo?.name || "User"}</h4>
                    <p className="mb-0">
                      {userInfo?.email || "feedback@nursingnextlive.in"}
                    </p>
                  </div>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={openMyAcc}
                  onClose={handleCloseMyAccDrop}
                  onClick={handleCloseMyAccDrop}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={handleCloseMyAccDrop}>
                    <ListItemIcon>
                      <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    My account
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
