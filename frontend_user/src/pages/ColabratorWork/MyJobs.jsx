import ColHeader from "../../component/ColHeader";
import { useNavigate } from "react-router-dom";

import heroBg from "../../assets/Mywork/hero-bg.png";
import manageIcon from "../../assets/Mywork/manageicon.png";
import contactIcon from "../../assets/Mywork/contacticon.jpg";
import jobIcon from "../../assets/Mywork/job.png";

import card1 from "../../assets/Mywork/card5.png";
import flag from "../../assets/Mywork/flag.png";

import card6 from "../../assets/Mywork/card6.png";
import flag1 from "../../assets/Mywork/flag1.png";

import card7 from "../../assets/Mywork/card7.png";
import flag3 from "../../assets/Mywork/flag3.png";

import Footer from "../../component/Footer";

const MyJobs = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-[#f5f6fa]">

    <div className="absolute top-0 left-0 w-full z-50">
          <ColHeader />
        </div>

     {/* ================= HERO ================= */}
<div
  className="relative w-full h-[260px] sm:h-[320px] pt-[100px]"
  style={{
    backgroundImage: `url(${heroBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  <div className="absolute inset-0 bg-black/40" />

  <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12 text-white">

    {/* ===== Back Button ===== */}
    <button
      className="
        flex items-center gap-2
        text-[13px] md:text-[14px]
        opacity-90 hover:opacity-100
        transition mb-2
      "
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="white" strokeWidth="2.5" />
      </svg>
      Back
    </button>

    <h1 className="text-[26px] sm:text-[28px] font-semibold">
      My Jobs
    </h1>
  </div>
</div>


    {/* ================= MAIN ================= */}
<section className="px-0 sm:px-6 md:px-12 -mt-[80px] pb-24 relative z-20">

  {/* ================= MOBILE WRAPPER ================= */}
  <div className="block md:hidden px-4">
    <div className="bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] p-5">

      {/* HEADER ROW — MOBILE */}
      <div className="flex flex-col gap-4 mb-6">

        <div className="flex items-center gap-3">
          <img src={manageIcon} className="w-[28px] h-[28px]" />
          <p className="text-[14px] font-medium text-gray-700">
            Manage your team and active contracts
          </p>
        </div>

        <div className="flex gap-3">
          {[jobIcon, contactIcon].map((icon, i) => (
            <div
              key={i}
              className="
                flex items-center gap-3
                rounded-lg px-3 py-2 flex-1
                bg-white border-2 border-gray-300
              "
            >
              <div className="w-[32px] h-[32px] border border-gray-300 flex items-center justify-center rounded-md">
                <img src={icon} className="w-[20px] h-[20px]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">
                  {i === 0 ? "Total Jobs" : "Contracts"}
                </p>
                <p className="text-[11px] text-gray-500">
                  {i === 0 ? "Active Freelancers" : "All time"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MOBILE JOB LIST ================= */}
      <div className="flex flex-col gap-5">

        {[
          {
            img: card1, name: "James", role: "UX Designer",
            rate: "$10.00", earn: "$36k", skills: ["Web design", "Wireframe", "Prototype"],
            stars: "★★★★★", reviews: "12 Reviews", flag, loc: "Chennai, INDIA"
          },
          {
            img: card6, name: "Sebastian", role: "Graphic Designer",
            rate: "$50.00", earn: "$76k", skills: ["Poster design", "Mobile design", "Photoshop"],
            stars: "★★★★☆", reviews: "12 Reviews", flag: flag1, loc: "Manhattan, USA"
          },
          {
            img: card7, name: "Ezra", role: "UI Designer",
            rate: "$10.00", earn: "$36k", skills: ["Figma", "Social media", "Web design"],
            stars: "★★★★☆", reviews: "12 Reviews", flag: flag3, loc: "Beijing, CHINA"
          }
        ].map((job, i) => (

          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">

              <div className="flex gap-3">
                <img src={job.img} className="w-[44px] h-[44px] rounded-full" />

                <div>
                  <h3 className="text-[15px] font-semibold">{job.name}</h3>
                  <p className="text-[13px] text-gray-500">{job.role}</p>

                  <p className="text-[14px] font-semibold mt-1">
                    {job.rate} <span className="text-gray-500">/ hr</span>
                  </p>

                  <p className="text-[12px] text-gray-500 mt-1">
                    Total earnings <span className="font-semibold">{job.earn}</span>
                  </p>
                </div>
              </div>

              <button className="px-5 py-1.5 text-[13px] rounded-full !border border-[#51218F] text-[#51218F]">
                Message
              </button>
            </div>

            {/* SKILLS */}
            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#6A3FA0] text-white text-[12px]"
                >
                  {s}
                </span>
              ))}
              <span className="text-[#6A3FA0] text-[13px] font-medium">more</span>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center mt-4 text-[12px] text-gray-500">
              <div className="flex items-center gap-1">
                <span className="text-purple-600">{job.stars}</span>
                <span>4/5</span>
                <span>({job.reviews})</span>
              </div>

              <div className="flex items-center gap-2">
                <img src={job.flag} className="w-[16px] h-[11px] rounded-[3px]" />
                <span>{job.loc}</span>
              </div>
            </div>
          </div>

        ))}
      </div>
    </div>
  </div>

  {/* ================= DESKTOP VERSION — UNTOUCHED ================= */}
  <div className="hidden md:block px-6">
{/* ================= MAIN ================= */}
<section className="px-0 sm:px-6 md:px-12 -mt-[80px] pb-24 relative z-20">

  {/* ================= MOBILE WRAPPER ================= */}
  <div className="block md:hidden px-4">
    <div className="bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] p-5">

      {/* HEADER ROW — MOBILE */}
      <div className="flex flex-col gap-4 mb-6">

        <div className="flex items-center gap-3">
          <img src={manageIcon} className="w-[28px] h-[28px]" />
          <p className="text-[14px] font-medium text-gray-700">
            Manage your team and active contracts
          </p>
        </div>

        <div className="flex gap-3">
          {[jobIcon, contactIcon].map((icon, i) => (
            <div
              key={i}
              className="
                flex items-center gap-3
                rounded-lg px-3 py-2 flex-1
                bg-white border-2 border-gray-300
              "
            >
              <div className="w-[32px] h-[32px] border border-gray-300 flex items-center justify-center rounded-md">
                <img src={icon} className="w-[20px] h-[20px]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-800">
                  {i === 0 ? "Total Jobs" : "Contracts"}
                </p>
                <p className="text-[11px] text-gray-500">
                  {i === 0 ? "Active Freelancers" : "All time"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MOBILE JOB LIST ================= */}
      <div className="flex flex-col gap-5">

        {[
          {
            img: card1, name: "James", role: "UX Designer",
            rate: "$10.00", earn: "$36k", skills: ["Web design", "Wireframe", "Prototype"],
            stars: "★★★★★", reviews: "12 Reviews", flag, loc: "Chennai, INDIA"
          },
          {
            img: card6, name: "Sebastian", role: "Graphic Designer",
            rate: "$50.00", earn: "$76k", skills: ["Poster design", "Mobile design", "Photoshop"],
            stars: "★★★★☆", reviews: "12 Reviews", flag: flag1, loc: "Manhattan, USA"
          },
          {
            img: card7, name: "Ezra", role: "UI Designer",
            rate: "$10.00", earn: "$36k", skills: ["Figma", "Social media", "Web design"],
            stars: "★★★★☆", reviews: "12 Reviews", flag: flag3, loc: "Beijing, CHINA"
          }
        ].map((job, i) => (

          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">

              <div className="flex gap-3">
                <img src={job.img} className="w-[44px] h-[44px] rounded-full" />

                <div>
                  <h3 className="text-[15px] font-semibold">{job.name}</h3>
                  <p className="text-[13px] text-gray-500">{job.role}</p>

                  <p className="text-[14px] font-semibold mt-1">
                    {job.rate} <span className="text-gray-500">/ hr</span>
                  </p>

                  <p className="text-[12px] text-gray-500 mt-1">
                    Total earnings <span className="font-semibold">{job.earn}</span>
                  </p>
                </div>
              </div>

  <button
  onClick={() => navigate("/myprojectmessage")}
  className="px-5 py-1.5 text-[13px] rounded-full border border-[#51218F] text-[#51218F] hover:bg-[#51218F]/10 transition"
>
  Message
</button>

            </div>

            {/* SKILLS */}
            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#6A3FA0] text-white text-[12px]"
                >
                  {s}
                </span>
              ))}
              <span className="text-[#6A3FA0] text-[13px] font-medium">more</span>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-center mt-4 text-[12px] text-gray-500">
              <div className="flex items-center gap-1">
                <span className="text-purple-600">{job.stars}</span>
                <span>4/5</span>
                <span>({job.reviews})</span>
              </div>

              <div className="flex items-center gap-2">
                <img src={job.flag} className="w-[16px] h-[11px] rounded-[3px]" />
                <span>{job.loc}</span>
              </div>
            </div>
          </div>

        ))}
      </div>
    </div>
  </div>

  {/* ================= DESKTOP VERSION — UNTOUCHED ================= */}
  <div className="hidden md:block px-6">
  {/* MAIN */}
      <section className="px-4 sm:px-6 md:px-12 -mt-[80px] pb-24 relative z-20">

        <div className="bg-white rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] max-w-[1200px] mx-auto p-6">

          {/* HEADER ROW */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">

            {/* LEFT */}
            <div className="flex items-center gap-4">
              <img src={manageIcon} className="w-[32px] h-[32px]" />
              <p className="text-[15px] font-medium text-gray-700">
                Manage your team and active contracts
              </p>
            </div>

            {/* RIGHT STATS */}
            <div className="flex flex-wrap gap-6">
              {[jobIcon, contactIcon].map((icon, i) => (
                <div
                  key={i}
                  className="
                    flex items-center gap-3
                    rounded-lg px-4 py-3 min-w-[200px]
                    bg-white
                    border-2 border-gray-400
                    ring-2 ring-gray-300 ring-offset-2 ring-offset-white
                  "
                >
                  <div className="w-[36px] h-[36px] border border-gray-400 flex items-center justify-center rounded-md">
                    <img src={icon} className="w-[24px] h-[24px]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-800">
                      {i === 0 ? "Total Jobs" : "Contracts"}
                    </p>
                    <p className="text-[12px] text-gray-500">
                      {i === 0 ? "Active Freelancers" : "All time"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

{/* JOB LIST */}
<div className="flex flex-col gap-6">

  {[{
    img: card1, name: "Sebastian", role: "Graphic Designer",
    rate: "$50.00", earn: "$76k", skills: ["Poster design", "Mobile design", "Photoshop", "Illustrator"],
    stars: "★★★★★", reviews: "17 Reviews", flag, loc: "Manhattan, USA"
  },
  {
    img: card6, name: "Amazon LLC", role: "Video Editor",
    rate: "$40.00", earn: "$56k", skills: ["Video Effects", "Color Grad", "Adds Edits", "Graphics"],
    stars: "★★★★☆", reviews: "12 Reviews", flag: flag1, loc: "Tokyo, Japan"
  },
  {
    img: card7, name: "Ezra", role: "UI Designer",
    rate: "$10.00", earn: "$36k", skills: ["Figma", "Social Media", "Web design", "App design"],
    stars: "★★★★☆", reviews: "12 Reviews", flag: flag3, loc: "Beijing, China"
  }].map((job, i) => (

    <div
      key={i}
      className="
        bg-white rounded-2xl
        shadow-[0_18px_40px_rgba(0,0,0,0.12)]
        p-5 sm:p-6 lg:p-8
        flex flex-col lg:flex-row
        lg:justify-between lg:items-start
        gap-5
      "
    >
      {/* LEFT */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

        <img
          src={job.img}
          className="w-[56px] h-[56px] rounded-full shrink-0"
        />

        <div>
          <h3 className="text-[18px] font-semibold">{job.name}</h3>
          <p className="text-[14px] text-gray-500 mb-3">{job.role}</p>

          <p className="text-[16px] font-semibold mb-1">
            {job.rate} <span className="text-gray-500">/ hr</span>
          </p>

          <p className="text-[14px] text-gray-500 mb-4">
            Total earnings <span className="font-semibold">{job.earn}</span>
          </p>

          {/* SKILLS */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {job.skills.map((s, idx) => (
              <span
                key={idx}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#6A3FA0] text-white text-[13px]"
              >
                {s}
              </span>
            ))}
            <span className="text-[#6A3FA0] text-[14px] font-medium cursor-pointer mt-2">
              more
            </span>
          </div>

          {/* RATING + LOCATION */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-5 text-[14px] text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-purple-600">{job.stars}</span>
              <span>4/5</span>
              <span>({job.reviews})</span>
            </div>

            <div className="flex items-center gap-2">
              <img
                src={job.flag}
                className="w-[18px] h-[12px] rounded-[4px]"
              />
              <span>{job.loc}</span>
            </div>
          </div>
        </div>
      </div>

    <button
  onClick={() => navigate("/myprojectmessage")}
  className="px-5 py-1.5 text-[13px] rounded-full !border border-[#51218F] text-[#51218F] hover:bg-[#51218F]/10 transition"
>
  Message
</button>


    </div>
  ))}
</div>

        </div>
      </section> 
       </div>
</section>
  </div>
</section>


      {/* FOOTER */}
      <div className="-mx-4">
        <Footer />
      </div>
    </div>
  );
};

export default MyJobs;
