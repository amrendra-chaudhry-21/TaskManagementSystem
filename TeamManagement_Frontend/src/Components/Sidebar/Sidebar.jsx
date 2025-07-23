import "./Sidebar.css";
import Button from "@mui/material/Button";
import { RxDashboard } from "react-icons/rx";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const [activeTab] = useState(0);

  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <Link to="/dashboard">
              <Button className={`w-100 ${activeTab === 0 ? "active" : ""}`}>
                <span className="icon">
                  <RxDashboard />
                </span>
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/signup">
              <Button className="w-100">
                <span className="icon">
                  <BsFileEarmarkTextFill />
                </span>
                Signup
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/create-team">
              <Button className="w-100">
                <span className="icon">
                  <BsFileEarmarkTextFill />
                </span>
                Create Team
              </Button>
            </Link>
          </li>

          <li>
            <Link to="/project">
              <Button className="w-100">
                <span className="icon">
                  <BsFileEarmarkTextFill />
                </span>
                Project
              </Button>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
