import { useState } from "react";
import LoginModel from "../LoginModel/LoginModel";
import "./LoginNumber.css";
import { TiArrowSortedDown } from "react-icons/ti";
import { Link } from "react-router-dom";

const LoginNumber = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState({});

  const openModal = () => {
    setSelectedFaculty();
    setLoginModalOpen(true);
  };

  const handleLoginModal = () => {
    setLoginModalOpen(false);
  };

  return (
    <>
      <section className="login_section">
        <div className="container-fluid">
          <div className="login_data">
            <div className="login_left">
              <img
                src="https://barcosys.com/barcosys/images/logo-dark.svg"
                alt=""
              />
            </div>
            <div className="login_right" onClick={() => openModal()}>
              <Link>
                <button>
                  Attempt
                  <TiArrowSortedDown className="login_button" />
                </button>
              </Link>
            </div>
          </div>
          <LoginModel
            isOpen={loginModalOpen}
            onClose={handleLoginModal}
            person={selectedFaculty}
          />
        </div>
      </section>
      <section
        className="back_section"
        style={{
          backgroundColor: "#1ca0ec",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></section>
    </>
  );
};

export default LoginNumber;
