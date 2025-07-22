import Header from "../../Components/Header/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import "./Home.css";

const Dashboard = () => {
  return (
    <>
      <Header />
      <div className="main d-flex">
        <div className="sidebarwrapper">
          <Sidebar />
        </div>
        <div className="content">
          <div className="right-content w-100">
            <div className="row dashboardBoxwrapperRow">
              <div className="col-md-8">
                <div className="content_header">
                  <h2>
                    Continue <span>Learning</span>
                  </h2>
                </div>
                <div className="dashboardBoxwrapper d-flex">
                  <div className="dashboardbox">
                    <img
                      src="https://barcosys.com/barcosys/images/logo-dark.svg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
