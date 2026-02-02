import Header from "../../component/Header";
import Footer from "../../component/Footer";
import HomeBg from "../../assets/AfterSign/HomeBg.png";
import Dp1 from "../../assets/AfterSign/Dp1.jpg";
import Dp2 from "../../assets/AfterSign/Dp2.jpg";
import Dp3 from "../../assets/AfterSign/Dp3.jpg";
import Dp4 from "../../assets/AfterSign/Dp4.jpg";
import HomeSub from "../../assets/AfterSign/HomeSub.png";
import Folder from "../../assets/AfterSign/Folder.png";
import Cloud from "../../assets/AfterSign/Cloud.png";
import Cancel from "../../assets/AfterSign/Cancel.png";
import { useNavigate } from "react-router-dom";
import SavedDraft from "./SavedDraft";
import { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";

const JobCreated = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("discover");
  const [showAllJobsPopup, setShowAllJobsPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSkillsJobId, setExpandedSkillsJobId] = useState(null);
  const [expandedDescJobId, setExpandedDescJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [verifyType, setVerifyType] = useState(null);
  const [otp, setOtp] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [userData, setUserData] = useState(null);

  const avatars = [Dp1, Dp2, Dp3, Dp4];

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        setUserData(res.data);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, []);

  /* ================= FETCH JOBS - UPDATED ================= */
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const me = await api.get("/auth/me");
        const employerId = me.data.id;

        const res = await api.get(`/jobs/my-jobs/${employerId}?status=posted`);
        const rawJobs = res.data.jobs || [];

        // Get user location from auth/me response
        const userLocation = me.data.location || me.data.city || null;

        // Process jobs
        const processedJobs = rawJobs.map((job) => {
          // Parse skills properly
          const parseSkills = (skills) => {
            if (!skills) return [];
            if (Array.isArray(skills)) return skills;
            try {
              return JSON.parse(skills);
            } catch {
              if (typeof skills === 'string') {
                return skills.split(',').map(s => s.trim()).filter(s => s);
              }
              return [];
            }
          };

          const jobSkills = parseSkills(job.skills);

          return {
            ...job,
            skills: jobSkills,
            // Use user location from auth/me
            city: job.city || userData?.city || me.data.city || "",
            country: job.country || userData?.country || me.data.country || "",
            location: userLocation,
            // Use actual data from backend, default to 0 if not available
            rating: job.rating || 0,
            reviews_count: job.reviews_count || 0,
            // Default values
            proposals_count: job.proposals_count || 0,
            hired_count: job.hired_count || 0
          };
        });

        setJobs(processedJobs);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [userData]);

  /* ================= STATISTICS ================= */
  const latestJob = jobs.length > 0 ? jobs[0] : null;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === "posted").length;
  const completedJobs = jobs.filter(j => j.status === "completed").length;
  const cancelledJobs = jobs.filter(j => j.status === "cancelled").length;

  const parseSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    try {
      return JSON.parse(skills);
    } catch {
      if (typeof skills === 'string') {
        return skills.split(',').map(s => s.trim()).filter(s => s);
      }
      return [];
    }
  };

  // Function to render stars with proper styling - UPDATED
  const renderStars = (rating, reviewsCount) => {
    // When there are NO reviews, show EMPTY/GRAY stars
    if (!rating || rating === 0 || reviewsCount === 0) {
      return (
        <span className="text-gray-300 font-semibold">
          {"★".repeat(5)}  {/* Show 5 EMPTY stars */}
        </span>
      );
    }

    // When there ARE reviews, show dark stars based on actual rating
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <span className="font-semibold">
        {/* Filled stars - dark/purple color */}
        <span className="text-[#51218F]">
          {"★".repeat(fullStars)}
        </span>
        {/* Half star if needed */}
        {hasHalfStar && <span className="text-[#51218F]">⭐</span>}
        {/* Empty stars - gray color */}
        <span className="text-gray-300">
          {"★".repeat(emptyStars)}
        </span>
      </span>
    );
  };

  /* ================= HANDLERS ================= */
  const sendOtp = async (type) => {
    try {
      setIsOtpModalOpen(true);
      setVerifyType(type);
      setIsSendingOtp(true);

      if (type === "phone") {
        await api.post("/verification/phone/send-otp");
      } else if (type === "email") {
        await api.post("/verification/email/send-otp");
      }

      alert("OTP sent successfully");
    } catch (error) {
      console.error("OTP send failed", error.response?.data || error.message);
      alert("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!otp) {
        alert("Enter OTP");
        return;
      }

      if (verifyType === "phone") {
        await api.post("/verification/phone/verify-otp", { otp });
      } else {
        await api.post("/verification/email/verify-otp", { otp });
      }

      alert(`${verifyType} verified successfully`);
      setIsOtpModalOpen(false);
      setOtp("");
    } catch (err) {
      console.error("OTP verification failed", err);
      alert("Invalid OTP");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden relative bg-gray-50">
      <section className="w-full flex flex-col items-center justify-start px-4 relative min-w-0">

        {/* ================= BACKGROUND ================= */}
        <div
          className="absolute top-[-104px] left-0 w-full h-[382px] md:h-[582px] z-0"
          style={{
            backgroundImage: `url(${HomeBg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>

        {/* ================= WELCOME ================= */}
        <div className="absolute top-[70px] lg:top-[187px] w-full flex items-center justify-center z-10">
          <h1
            className="text-[20px] lg:text-[48px] leading-tight text-center text-white font-normal"
            style={{ fontFamily: "Milonga" }}
          >
            Welcome back, {userData?.first_name || "User"}
          </h1>
        </div>

        <Header />

        {/* ================= MAIN ================= */}
        <div className="w-full max-w-[1400px] mx-auto mt-[240px] lg:mt-[412px] px-4 flex flex-col lg:flex-row gap-8">

          {/* ================= LEFT ================= */}
          <main className="w-full lg:w-[860px] flex flex-col gap-6">

            {/* ===== POSTED JOB ===== */}
            <div className="w-full rounded-[8px] bg-white shadow-md p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[18px] text-[#2A1E17]">
                  Your Had Posted a Job
                </h3>
                <button
                  onClick={() => setShowAllJobsPopup(true)}
                  className="ring-1 ring-[#51218F] rounded-full px-3 py-1.5 text-[#51218F] text-[10px] font-bold hover:bg-[#51218F] hover:text-white transition"
                >
                  View all jobs
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading...</p>
              ) : !latestJob ? (
                <p className="text-gray-500">You have not posted any job yet.</p>
              ) : (
                <div className="flex justify-between text-[12px]">
                  <div>
                    <p className="font-bold">{latestJob.title}</p>
                    <p className="text-gray-600">
                      {latestJob.budget_type || "Fixed-price"} · Est. Budget:{" "}
                      {latestJob.budget_type === "hourly"
                        ? `$${latestJob.budget_from} – $${latestJob.budget_to}/hr`
                        : latestJob.budget_from
                          ? `$${latestJob.budget_from}`
                          : "Not specified"}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="font-bold">Proposals</p>
                      <p className="text-gray-600">{latestJob.proposals_count}</p>
                    </div>
                    <div>
                      <p className="font-bold">Hired</p>
                      <p className="text-gray-600">{latestJob.hired_count}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== TABS ===== */}
            <div className="relative">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
              <div className="flex">
                {["discover", "saved"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-5 py-3 font-medium ${activeTab === tab
                      ? "text-[#51218F] font-semibold"
                      : "text-gray-600"
                      }`}
                  >
                    {tab === "discover" ? "View All Jobs" : "Saved Draft"}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#51218F]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== DISCOVER ===== */}
            {activeTab === "discover" ? (
              <div className="space-y-5">
                <h3 className="font-semibold text-[15px]">
                  {/* Best matches for you ({jobs.length}) */}
                </h3>

                {jobs.map((job, idx) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-[10px] shadow p-4 relative min-h-[200px]"
                  >
                    <div className="flex gap-3 mb-3">
                      <img
                        src={avatars[idx % avatars.length]}
                        className="w-11 h-11 rounded-full object-cover"
                        alt="Avatar"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-[16px]">{job.title}</h4>

                          {/* <button className="ring-1 ring-[#51218F] rounded-full px-3 py-1.5 text-[#51218F] text-[10px] font-bold hover:bg-[#51218F] hover:text-white transition">
                            Invite
                          </button> */}
                        </div>

                        {/* JOB TYPE */}
                        {job.budget_type && (
                          <p className="text-gray-500 text-[14px] capitalize">
                            {job.budget_type}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PRICE */}
                    <p className="font-bold text-[14px]">
                      {job.budget_type === "hourly" && job.budget_from && job.budget_to ? (
                        <>
                          ${job.budget_from} – ${job.budget_to}
                          <span className="text-[12px] text-gray-500"> / hr</span>
                        </>
                      ) : job.budget_type === "fixed" && job.budget_from ? (
                        <>${job.budget_from}</>
                      ) : (
                        <span className="text-gray-400 text-[13px]">
                          Budget not specified
                        </span>
                      )}
                    </p>

                    {/* DESCRIPTION */}
                    {job.description && (
                      <p className="text-gray-500 text-[12px] mt-2">
                        {job.description.slice(0, 90)}...
                      </p>
                    )}

                    {/* SKILLS */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {(expandedSkillsJobId === job.id
                        ? parseSkills(job.skills)
                        : parseSkills(job.skills).slice(0, 3)
                      ).map((skill, i) => (
                        <span
                          key={i}
                          className="bg-[#51218FD9] text-white text-[9px] px-2 py-0.5 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}

                      {parseSkills(job.skills).length > 3 && (
                        <span
                          onClick={() =>
                            setExpandedSkillsJobId(
                              expandedSkillsJobId === job.id ? null : job.id
                            )
                          }
                          className="text-[#51218F] text-[10px] max-[420px]:text-[9px] cursor-pointer font-semibold"
                        >
                          {expandedSkillsJobId === job.id ? "less" : "more"}
                        </span>
                      )}
                    </div>

                    {/* RATING + LOCATION - UPDATED */}
                    <div className="flex items-center gap-3 mt-3 text-[12px]">
                      {/* RATING STARS - Always show 3 stars */}
                      <span className="flex items-center gap-1">
                        {renderStars(job.rating, job.reviews_count)}
                        <span className="text-gray-500">
                          ({job.reviews_count} Reviews)
                        </span>
                      </span>

                      {/* LOCATION */}
                      {(job.city || job.country) && (
                        <span className="flex items-center gap-1 text-gray-500">
                          📍 {job.city}{job.city && job.country ? ", " : ""}{job.country}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <SavedDraft />
            )}
          </main>

          {/* ================= RIGHT SIDEBAR ================= */}
          <aside className="hidden lg:flex flex-col w-[420px] gap-8">
            <button
              onClick={() => navigate("/finder")}
              className="w-[190px] self-end h-[39px] rounded-full bg-gradient-to-r from-[#51218F] to-[#170929] text-white font-bold text-[12px]"
            >
              Find collaborator
            </button>

            {/* PROFILE */}
            <div className="bg-white rounded-[10px] shadow-lg p-6 text-center">
              <h3 className="font-bold text-[22px]">
                {userData?.first_name || "User"}
              </h3>
              <p className="text-[14px]">
                {userData?.role === "creator" ? "Creator" : "Collaborator"}
              </p>

              <div className="mt-4">
                <div className="flex justify-between font-bold text-[14px]">
                  <span>Set up your account</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-[6px] bg-gray-200 rounded-full mt-2">
                  <div className="h-full bg-[#51218F] w-[75%] rounded-full" />
                </div>
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="w-full mt-6 rounded-full py-3 text-[#51218F] border border-[#51218F] font-bold text-[12px] hover:bg-[#51218F] hover:text-white"
              >
                Complete your profile
              </button>
            </div>

            {/* ================= VERIFICATION ================= */}
            <div className="w-full bg-white rounded-[10px] shadow-lg p-6">
              <h3 className="font-semibold text-[20px] mb-4">Verification</h3>
              <div className="flex flex-col gap-5">
                {/* PHONE */}
                <div className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                  <span>Phone verified</span>
                  <button
                    onClick={() => sendOtp("phone")}
                    className="text-[#51218F] font-medium hover:underline"
                  >
                    Verify
                  </button>
                </div>

                {/* EMAIL */}
                <div className="flex justify-between items-center text-[16px] text-[#2A1E17]">
                  <span>Email verified</span>
                  <button
                    onClick={() => sendOtp("email")}
                    className="text-[#51218F] font-medium hover:underline"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>

            {/* ================= GRADIENT PROMO ================= */}
            <div className="relative">
              <div
                className="w-full h-[98px] rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] overflow-hidden relative"
                style={{
                  background: "linear-gradient(266.38deg, #51218F 4.44%, #020202 100.18%)",
                }}
              >
                <div className="absolute inset-0">
                  <img
                    src={HomeSub}
                    alt=""
                    className="w-full h-full object-cover opacity-30"
                  />
                </div>

                <div className="relative z-10 h-full flex items-center pl-6 pr-24">
                  <div>
                    <div className="font-medium text-[18px] text-white">
                      Get Subscription for getting
                    </div>
                    <div className="font-medium text-[18px] text-white">
                      more revenue in a month
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute w-[65px] h-[65px] lg:w-[102px] lg:h-[102px] top-1/2 right-[-15px] lg:right-[-30px] -translate-y-1/2 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                style={{
                  background: "linear-gradient(180deg, #FFA412 0%, #6C4343 100%)",
                }}
              >
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>

            {/* ================= JOB STATS ================= */}
            <div className="w-full h-[287px] rounded-[10px] bg-white shadow-lg p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[20px] font-medium text-[#2A1E17]">All Job</h3>
                <div className="flex gap-1">
                  <span className="text-[16px]">Total:</span>
                  <span className="font-bold text-[20px]">{totalJobs}</span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-center">
                  <img src={Folder} className="w-5 mr-3" alt="Folder" />
                  <span>Active projects: {activeJobs}</span>
                </div>

                <div className="flex items-center">
                  <img src={Cloud} className="w-5 mr-3" alt="Cloud" />
                  <span>Completed projects: {completedJobs}</span>
                </div>

                <div className="flex items-center">
                  <img src={Cancel} className="w-5 mr-3" alt="Cancel" />
                  <span>Cancelled projects: {cancelledJobs}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllJobsPopup(true)}
                  className="w-[122px] h-[39px] rounded-full border border-[#51218F] text-[#51218F] font-bold hover:bg-[#51218F] hover:text-white"
                >
                  View all
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ================= VIEW ALL JOBS POPUP ================= */}
      {showAllJobsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative bg-white w-full max-w-[760px] max-h-[85vh] rounded-[18px] shadow-2xl flex flex-col">

            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-[22px] font-bold text-[#2A1E17]">
                  All Posted Jobs ({totalJobs})
                </h2>
                <p className="text-[13px] text-gray-500 mt-1">
                  Showing all jobs you have posted
                </p>
              </div>

              <button
                onClick={() => setShowAllJobsPopup(false)}
                className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="px-6 py-6 overflow-y-auto space-y-8">
              {loading ? (
                <div className="text-center text-gray-500 py-12">
                  Loading jobs...
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No jobs found.</p>
                  <button
                    onClick={() => navigate("/post-job")}
                    className="bg-[#51218F] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#3f1872]"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="pb-6 border-b last:border-none">

                    {/* ===== JOB TITLE ===== */}
                    <h3 className="text-[16px] font-semibold text-[#2A1E17]">
                      {job.title}
                    </h3>

                    {/* ===== META LINE ===== */}
                    <p className="text-[13px] text-gray-500 mt-1 flex flex-wrap items-center gap-1">

                      {/* JOB TYPE */}
                      <span>
                        {job.budget_type === "fixed" ? "Fixed-price" : "Hourly"}
                      </span>

                      <span>·</span>

                      {/* EXPERIENCE */}
                      {job.expertise_level && (
                        <>
                          <span className="capitalize">{job.expertise_level}</span>
                          <span>·</span>
                        </>
                      )}

                      {/* BUDGET */}
                      <span>Est. Budget: ${job.budget_from}</span>
                    </p>
                    {/* ===== DESCRIPTION ===== */}
                    {job.description && (
                      <p className="text-[14px] text-gray-600 mt-3 leading-relaxed">
                        {expandedDescJobId === job.id
                          ? job.description
                          : `${job.description.slice(0, 160)}...`}

                        {job.description.length > 160 && (
                          <button
                            onClick={() =>
                              setExpandedDescJobId(
                                expandedDescJobId === job.id ? null : job.id
                              )
                            }
                            className="text-[#51218F] ml-1 font-medium hover:underline"
                          >
                            more
                          </button>
                        )}
                      </p>
                    )}

                    {/* ===== FOOTER ROW ===== */}
                    <div className="flex flex-wrap items-center gap-6 mt-4 text-[13px] text-gray-500">

                      {/* RATE */}
                      <span className="text-[#51218F] font-medium">
                        {job.budget_type === "hourly" ? "$ Hourly Rate" : "$ Fixed Rate"}
                      </span>

                      {/* STARS + REVIEWS - UPDATED */}
                      <span className="flex items-center gap-1">
                        {renderStars(job.rating, job.reviews_count)}
                        <span>
                          ({job.reviews_count} Reviews)
                        </span>
                      </span>

                      {/* LOCATION */}
                      {(job.city || job.country) && (
                        <span className="flex items-center gap-1">
                          📍 {job.city}{job.city && job.country ? ", " : ""}{job.country}
                        </span>
                      )}

                    </div>


                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


      {/* ================= OTP MODAL ================= */}
      {
        isOtpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-[12px] w-full max-w-sm p-6 relative">
              <button
                onClick={() => setIsOtpModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500"
              >
                ✕
              </button>

              <h3 className="text-[18px] font-bold mb-4">
                Verify {verifyType === "phone" ? "Phone" : "Email"}
              </h3>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full border rounded-md px-3 py-2 mb-4"
              />

              <button
                onClick={verifyOtp}
                className="w-full bg-[#51218F] text-white rounded-full py-2 font-semibold hover:opacity-90"
              >
                Verify OTP
              </button>
            </div>
          </div>
        )
      }

      <Footer />
    </div >
  );
};

export default JobCreated;