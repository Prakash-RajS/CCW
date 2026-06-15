import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ToastProvider } from "./component/Toast.jsx";
import ScrollToTop from "./component/ScrollToTop.jsx";

import { UserProvider } from "./contexts/UserContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
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
import SignupOtp from "./pages/Authontication/signup-otp";

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
import Proposal from "./pages/ColabratorView/Proposal";
import UploadUX from "./pages/ColabratorView/UploadUX";
// import CollabrationHome from "./pages/ColabratorView/CollabrationHome";
import CollabrationFilter from "./pages/ColabratorView/CollabrationFilter";
import CollabrationSaved from "./pages/ColabratorView/CollabrationSaved";
import CollabrationRecent from "./pages/ColabratorView/CollabrationRecent";
import AuthCallback from "./pages/Authontication/AuthCallback";

 

/* ===================== My Projects ===================== */
import ActiveContracts from "./pages/MyProject/ActiveContracts";
import EditWork from "./pages/MyProject/EditWork";
import AwatingContracts from "./pages/MyProject/AwatingContracts";
import PendingContracts from "./pages/MyProject/PendingContracts";
import CompletedContracts from "./pages/MyProject/CompletedContracts";
import ProposalsPage from "./pages/MyProject/ProposalsPage";
import Hiredfreelancers from "./pages/MyProject/Hiredfreelancers";
import MyProjectmessage from "./pages/MyProject/myprojectmessage.jsx";
import Pending from "./pages/MyProject/Pending.jsx";
import PendingStatusContracts from "./pages/MyProject/PendingStatusContracts.jsx";
               
 

/* ===================== Admin ===================== */
import Dashboard from "./pages/Admin/Dashboard";
import User from "./pages/Admin/User";
import AdminSubscription from "./pages/Admin/AdminSubscription";
import CollabSubscription from "./pages/Subscription/CollabSubscription";

/* ===================== Misc ===================== */
import CreatorviewProfile from "./pages/ColabProfile/CreatorviewProfile";
import ColabProfile from "./pages/ColabProfile/ColabProfile";
import Header from "./component/Header";
import ColHeader from "./component/ColHeader.jsx";

import PostProject from './pages/FooterContent/PostProject';
import CompleteProject from "./pages/FooterContent/CompleteProject";
import Contact from "./pages/FooterContent/Contact";
import Findwork from "./pages/FooterContent/Findwork";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <ToastProvider />
          <ScrollToTop />

          <Routes>
            {/* Public */}
            <Route path="/" element={<Testing />} />
            <Route path="*" element={<NotFound />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signupac" element={<SignupAc />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-request" element={<OtpRequest />} />
            <Route path="/enter-otp" element={<EnterOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-succes" element={<ResetSucces />} />
            <Route path="/signup-otp" element={<SignupOtp />} />
            <Route path="/auth-callback" element={<AuthCallback />} />

            {/* Logged in but role NOT required */}
            <Route element={<ProtectedRoute />}>
              <Route path="/role-section" element={<RoleSection />} />
              <Route path="/creator-role-profile" element={<CreatorRoleProfile />} />
              <Route path="/collaborator-role-profile" element={<CollabretorRoleProfile />} />
            </Route>

            
            

            {/* Creator only */}
            <Route element={<ProtectedRoute allowedRoles={["creator"]} />}>
              <Route path="/home" element={<Home />} />
              <Route path="/job-created" element={<JobCreated />} />
              <Route path="/created" element={<Created />} />
              <Route path="/creator-edit-profile" element={<CreatorEditProfile />} />
              <Route path="/creator-profile" element={<CreatorProfile />} />
              <Route path="/creator-success" element={<CreatorSucces />} />
              <Route path="/creator-role-success" element={<CreatorRoleSucces />} />
               
            </Route>

            {/* Collaborator only */}
            <Route element={<ProtectedRoute allowedRoles={["collaborator"]} />}>
              <Route path="/col-home" element={<ColHome />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/all-contacts" element={<Allcontacts />} />
              <Route path="/collaborator-profile" element={<CollaboratorProfile />} />
              <Route path="/collaborator-success" element={<CollaboratorSucces />} />
              <Route path="/collaborator-role-success" element={<CollabretorRoleSucces />} />
            </Route>

            {/* Shared (both roles) */}
            <Route element={<ProtectedRoute allowedRoles={["creator", "collaborator"]} />}>
              <Route path="/finder" element={<Finder />} />
              <Route path="/user-list" element={<UserList />} />
              <Route path="/finder-profile/:id" element={<FinderProfile />} />
              <Route path="/pro-file" element={<Profile />} />
              <Route path="/message" element={<Message />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/choose-payment" element={<ChoosePayment />} />
              <Route path="/finance-overview" element={<Overview />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/ux" element={<UX />} />
              <Route path="/Uploadux" element={<UploadUX />} />
              <Route path="/edit-job/:jobId" element={<Created />} />
              <Route path="/proposal" element={<Proposal />} />
              {/* <Route path="/collabration" element={<CollabrationHome />} /> */}
              <Route path="/collabration-filter" element={<CollabrationFilter />} />
              <Route path="/collabration-recent" element={<CollabrationRecent />} />
              <Route path="/collabration-saved" element={<CollabrationSaved />} />
              <Route path="/activecontracts" element={<ActiveContracts />} />
              <Route path="/editwork" element={<EditWork />} />
              <Route path="/awaitingcontracts" element={<AwatingContracts />} />
              <Route path="/pendingcontracts" element={<PendingContracts />} />
              <Route path="/pendingstatuscontracts" element={<PendingStatusContracts />} />
              <Route path="/completedcontracts" element={<CompletedContracts />} />
              <Route path="/proposalspage" element={<ProposalsPage />} />
              <Route path="/hiredfreelancers" element={<Hiredfreelancers />} />
              <Route path="/myprojectmessage" element={<MyProjectmessage />} />
              {/* <Route path="/pending" element={<Pending />} /> */}
              <Route path="/pending/:contractId" element={<Pending />} />
              <Route path="/CreatorviewProfile" element={<CreatorviewProfile />} />
              <Route path="/ColabProfile" element={<ColabProfile />} />
              <Route path="/collab-subscription" element={<CollabSubscription />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/user" element={<User />} />
              <Route path="/admin/subscription" element={<AdminSubscription />} />
            </Route>

            <Route path="/post-project" element={<PostProject />} />
            <Route path="/complete-project" element={<CompleteProject />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/Findwork" element={<Findwork />} />

            {/* Debug */}
            <Route path="/header" element={<Header />} />
            <Route path="/colheader" element={<ColHeader />} />

            {/* 404 */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}