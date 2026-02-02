import React, { useEffect, useState } from "react";
import flag from "../../assets/Mywork/flag.png";
import api from "../../utils/axiosConfig";
import { useUser } from "../../contexts/UserContext";

const SavedDraft = () => {
  const { userData } = useUser();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

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


                {/* DESCRIPTION */}
                <p className="text-[14px] md:text-[16px] text-gray-600 mb-4 leading-tight md:pr-8 font-['Montserrat']">
                  {job.description?.length > 180
                    ? `${job.description.slice(0, 180)}...`
                    : job.description}
                  {job.description?.length > 180 && (
                    <span className="text-[#4B1D8C] font-medium cursor-pointer ml-1">
                      more
                    </span>
                  )}
                </p>

                {/* FOOTER */}
                <div className="flex items-center gap-3 md:gap-5 text-[12px] md:text-[14px] text-gray-500 flex-wrap font-['Montserrat']">
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

              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SavedDraft;
