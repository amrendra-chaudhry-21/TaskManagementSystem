const base = "/jsx";
const baseURL = "http://localhost:7000/api/v1";
const baseRoute = "/";
const imageURL = "https://images.com";

export const Paths = {
  Home: base,
  LearningPath: baseRoute + "Learning",
  EndpointsURL: {
    GetALLSignup: baseURL + "/all-users",
    PostSignup: baseURL + "/signup",
    GETAllTeam: baseURL + "/team",
    CreateTeam: baseURL + "/team/create",
    AddTeamMember: baseURL + "/team/add-member",
    RemoveTeamMember: baseURL + "/team/remove-member",
    UpdateTeam: baseURL + "/team/update",
    DeleteTeamMember: baseURL + "/team/delete",
    GetProject: baseURL + "/project",
    CreateProject: baseURL + "/project/create",
    UpdateProject: baseURL + "/project/update",
    DeleteProject: baseURL + "/project/delete",
    LoginPassword: baseURL + "/login",
    UserLogout: baseURL + "/logout",
  },

  imagePathURL: {
    URL: imageURL,
  },
};
