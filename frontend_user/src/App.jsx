import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";

import { UserProvider } from "./contexts/UserContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

/* ===================== Landing ===================== */
import Testing from "./pages/Landing/Testing";

/* ===================== Auth ===================== */
import SignUp from "./pages/Authontication/SignUp";
import Login from "./pages/Authontication/Login";
import SignupAc from "./pages/Authontication/SignupAc";
import ForgotPassword from "./pages/Authontication/ForgotPassword";
import OtpRequest from "./pages/Authontication/OtpRequest";
import EnterOtp from "./pages/Authontication/EnterOtp";
import ResetPassword from "./pages/Authontication/ResetPassword";
import ResetSucces from "./pages/Authontication/ResetSucces";

/* ===================== Role Selection ===================== */
import RoleSection from "./pages/AfterSignIn/RoleSection";
import CreatorRoleProfile from "./pages/AfterSignIn/CreatorRoleProfile";
import CreatorRoleSucces from "./pages/AfterSignIn/CreatorRoleSucces";
import CollabretorRoleProfile from "./pages/AfterSignIn/CollabretorRoleProfile";
import CollabretorRoleSucces from "./pages/AfterSignIn/CollabretorRoleSucces";

/* ===================== Creator Pages ===================== */
import Home from "./pages/AfterSignHome/Home";
import JobCreated from "./pages/AfterSignHome/JobCreated";
import Created from "./pages/AfterSignHome/Created";
import CreatorEditProfile from "./pages/AfterSignHome/CreatorEditProfile";
import CreatorProfile from "./pages/profile/CreatorProfile";
import CreatorSucces from "./pages/profile/CreatorSucces";

/* ===================== Collaborator Pages ===================== */
import ColHome from "./pages/AfterSignCol/ColHome";
import CollaboratorProfile from "./pages/profile/CollaboratorProfile";
import CollaboratorSucces from "./pages/profile/CollaboratorSucces";
import MyJobs from "./pages/ColabratorWork/MyJobs";
import Allcontacts from "./pages/ColabratorWork/Allcontacts";

/* ===================== Shared Pages ===================== */
import Finder from "./pages/Finder/Finder";
import UserList from "./pages/Finder/UserList";
import FinderProfile from "./pages/Finder/FinderProfile";
import Profile from "./pages/Finder/Profile";
import Message from "./pages/ColabratorView/Message";
import Subscription from "./pages/Subscription/Subscription";
import ChoosePayment from "./pages/Financials/ChoosePayment";

/* ===================== Finance ===================== */
import Overview from "./pages/ColFinance/Overview";
import Transaction from "./pages/ColFinance/Transaction";

/* ===================== Collaborator View ===================== */
import UX from "./pages/ColabratorView/UX";
// import Proposal from "./pages/colabratorview/Proposal";
import UploadUX from "./pages/ColabratorView/UploadUX";
// import CollabrationHome from "./pages/ColabratorView/CollabrationHome";
import CollabrationFilter from "./pages/ColabratorView/CollabrationFilter";
import CollabrationSaved from "./pages/ColabratorView/CollabrationSaved";
import CollabrationRecent from "./pages/ColabratorView/CollabrationRecent";

/* ===================== My Projects ===================== */
import ActiveContracts from "./pages/MyProject/ActiveContracts";
import EditWork from "./pages/MyProject/EditWork";
import AwatingContracts from "./pages/MyProject/AwatingContracts";
import PendingContracts from "./pages/MyProject/PendingContracts";
import CompletedContracts from "./pages/MyProject/CompletedContracts";
import ProposalsPage from "./pages/MyProject/ProposalsPage";
import Hiredfreelancers from "./pages/MyProject/Hiredfreelancers";
import MyProjectmessage from "./pages/MyProject/myprojectmessage.jsx";
import Pending from "./pages/MyProject/pending.jsx";

/* ===================== Admin ===================== */
import Dashboard from "./pages/Admin/Dashboard";
import User from "./pages/Admin/User";
import AdminSubscription from "./pages/Admin/AdminSubscription";

/* ===================== Misc ===================== */
import CreatorviewProfile from "./pages/ColabProfile/CreatorviewProfile";
import Header from "./component/Header";
import ColHeader from "./component/ColHeader.jsx";

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Toaster position="top-center" />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Testing />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signupac" element={<SignupAc />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-request" element={<OtpRequest />} />
          <Route path="/enter-otp" element={<EnterOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-succes" element={<ResetSucces />} />

          {/* Logged in but role NOT required */}
          <Route element={<ProtectedRoute />}>
            <Route path="/role-section" element={<RoleSection />} />
            <Route path="/creator-role-profile" element={<CreatorRoleProfile />} />
            <Route path="/creator-role-success" element={<CreatorRoleSucces />} />
            <Route path="/collaborator-role-profile" element={<CollabretorRoleProfile />} />
            <Route path="/collaborator-role-success" element={<CollabretorRoleSucces />} />
          </Route>

          {/* Creator only */}
          <Route element={<ProtectedRoute allowedRoles={["creator"]} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/job-created" element={<JobCreated />} />
            <Route path="/created" element={<Created />} />
            <Route path="/creator-edit-profile" element={<CreatorEditProfile />} />
            <Route path="/creator-profile" element={<CreatorProfile />} />
            <Route path="/creator-success" element={<CreatorSucces />} />
          </Route>

          {/* Collaborator only */}
          <Route element={<ProtectedRoute allowedRoles={["collaborator"]} />}>
            <Route path="/col-home" element={<ColHome />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/all-contacts" element={<Allcontacts />} />
            <Route path="/collaborator-profile" element={<CollaboratorProfile />} />
            <Route path="/collaborator-success" element={<CollaboratorSucces />} />
          </Route>

          {/* Shared (both roles) */}
          <Route element={<ProtectedRoute allowedRoles={["creator", "collaborator"]} />}>
            <Route path="/finder" element={<Finder />} />
            <Route path="/user-list" element={<UserList />} />
            <Route path="/finder-profile" element={<FinderProfile />} />
            <Route path="/pro-file" element={<Profile />} />
            <Route path="/message" element={<Message />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/choose-payment" element={<ChoosePayment />} />
            <Route path="/finance-overview" element={<Overview />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/ux" element={<UX />} />
            <Route path="/Uploadux" element={<UploadUX />} />
            {/* <Route path="/Proposal" element={<Proposal />} /> */}
            {/* <Route path="/collabration" element={<CollabrationHome />} /> */}
            <Route path="/collabration-filter" element={<CollabrationFilter />} />
            <Route path="/collabration-recent" element={<CollabrationRecent />} />
            <Route path="/collabration-saved" element={<CollabrationSaved />} />
            <Route path="/activecontracts" element={<ActiveContracts />} />
            <Route path="/editwork" element={<EditWork />} />
            <Route path="/watingcontracts" element={<AwatingContracts />} />
            <Route path="/pendingcontracts" element={<PendingContracts />} />
            <Route path="/completedcontracts" element={<CompletedContracts />} />
            <Route path="/proposalspage" element={<ProposalsPage />} />
            <Route path="/hiredfreelancers" element={<Hiredfreelancers />} />
            <Route path="/myprojectmessage" element={<MyProjectmessage />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/CreatorviewProfile" element={<CreatorviewProfile />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/user" element={<User />} />
            <Route path="/admin/subscription" element={<AdminSubscription />} />
          </Route>

          {/* Debug */}
          <Route path="/header" element={<Header />} />
          <Route path="/colheader" element={<ColHeader />} />

          {/* 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
 