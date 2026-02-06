import React, { useEffect, useState } from "react";
import flag from "../../assets/Mywork/flag.png";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/userContext";
import { useNavigate } from "react-router-dom";
 
const SavedDraft = () => {
  const { userData } = useUser();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ADDED: track which description is expanded
  const [expandedDescId, setExpandedDescId] = useState(null);
 
  useEffect(() => {
    if (!userData?.id) return;
 
    const fetchDrafts = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/jobs/my-jobs/${userData.id}?status=draft`
        );
        setDrafts(res.data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch drafts", err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchDrafts();
  }, [userData?.id]);

  /* ================= EDIT & DELETE HANDLERS ================= */
  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;

    try {
      await api.delete(`/jobs/${jobId}/delete`);
      setDrafts(drafts.filter(job => job.id !== jobId));
    } catch (err) {
      console.error("Failed to delete draft", err);
    }
  };
 
  return (
    <div className="w-full bg-white rounded-[10px] shadow-[0px_4px_45px_0px_#0000001F] p-1 md:p-6">
 
      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B1D8C]"></div>
        </div>
      )}
 
      {/* EMPTY */}
      {!loading && drafts.length === 0 && (
        <p className="text-center text-gray-500 py-10 font-['Montserrat']">
          No saved drafts yet
        </p>
      )}
 
      {/* LIST */}
      {!loading &&
        drafts.map((job, i) => (
          <div
            key={job.id}
            className={`${i !== 0 ? "pt-6 border-t border-gray-200 mt-6" : ""}`}
          >
            <div className="flex justify-between items-start gap-4 md:gap-6">
              <div className="w-full px-2 md:px-6">
 
                {/* TITLE */}
                <h3 className="font-semibold text-[15px] md:text-[17px] mb-2 text-[#2A1E17] font-['Montserrat']">
                  {job.title}
                </h3>
 
                {/* META + PRICE */}
                <p className="text-[12px] md:text-[14px] text-gray-500 mb-2 font-['Montserrat']">
                  {job.budget_type} · {job.expertise_level} ·{" "}
                  {job.budget_type?.toLowerCase() === "hourly" ? (
                    <>
                      ${job.budget_from} – ${job.budget_to}
                      <span className="text-[11px]"> / hr</span>
                    </>
                  ) : (
                    <>${job.budget_from}</>
                  )}
                  {" · "}
                  <span className="text-gray-400">
                    Posted {job.posted_ago}
                  </span>
                </p>
 
                {/* DESCRIPTION (FIXED) */}
                <p className="text-[14px] md:text-[16px] text-gray-600 mb-4 leading-tight md:pr-8 font-['Montserrat']">
                  {expandedDescId === job.id
                    ? job.description
                    : job.description?.length > 180
                      ? `${job.description.slice(0, 180)}...`
                      : job.description}

                  {job.description?.length > 180 && (
                    <span
                      onClick={() =>
                        setExpandedDescId(
                          expandedDescId === job.id ? null : job.id
                        )
                      }
                      className="text-[#4B1D8C] font-medium cursor-pointer ml-1"
                    >
                      {expandedDescId === job.id ? "Show less" : "more"}
                    </span>
                  )}
                </p>
 
                {/* FOOTER */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center gap-3 md:gap-5 text-[12px] md:text-[14px] text-gray-500 font-['Montserrat']">
                    <span className="text-[#4B1D8C] font-medium">
                      {job.budget_type?.toLowerCase() === "fixed"
                        ? "$ Fixed Rate"
                        : "$ Hourly Rate"}
                    </span>

                    {/* RATING */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#4B1D8C]">
                        {"★".repeat(Math.round(job.rating || 0))}
                        {"☆".repeat(5 - Math.round(job.rating || 0))}
                      </span>
                      <span>
                        {job.rating || 0}/5 ({job.reviews || 0} Reviews)
                      </span>
                    </div>

                    {/* LOCATION */}
                    <div className="flex items-center gap-2">
                      {job.country_code ? (
                        <img
                          src={`https://flagcdn.com/w20/${job.country_code.toLowerCase()}.png`}
                          alt={job.country}
                          className="w-[18px] h-[12px] rounded-[4px] object-cover"
                        />
                      ) : (
                        <img
                          src={flag}
                          alt="flag"
                          className="w-[18px] h-[12px] rounded-[4px] object-cover"
                        />
                      )}
                      <span>
                        {job.city}
                        {job.city && job.country ? ", " : ""}
                        {job.country}
                      </span>
                    </div>
                  </div>

                  {/* Edit and Delete Buttons */}
                        <div className="flex items-center gap-3">
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleEditJob(job.id)}
                            className="w-[25px] h-[25px] rounded-full flex items-center justify-center
                              bg-gradient-to-br from-[#51218F] to-[#2E0F55]
                              hover:opacity-90 transition"
                            title="Edit job"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="w-[25px] h-[25px] rounded-full flex items-center justify-center
                              bg-[#FF3B3B] hover:bg-[#E02E2E] transition"
                            title="Delete job"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};
 
export default SavedDraft;
