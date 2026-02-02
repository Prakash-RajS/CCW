import  { useState } from "react";
import UserImg from "../../assets/Colabwork/user.png";
import TopBanner from "../../assets/Colabwork/banner.png";
import Rectangle from "../../assets/Colabwork/Rectangle71.png";
import FlagImg from "../../assets/Colabwork/usa-flag.png";
import Portfolio1 from "../../assets/Colabwork/portfolio1.png";
import Portfolio2 from "../../assets/Colabwork/portfolio2.png";
import Portfolio3 from "../../assets/Colabwork/portfolio3.png";
import ReviewUser1 from "../../assets/Colabwork/review-user-1.png";
import ReviewUser2 from "../../assets/Colabwork/review-user-2.png";
import EditIcon from "../../assets/Colabwork/edit-icon.png"; 
import ColHeader from "../../component/ColHeader";
import Footer from "../../component/Footer";

export default function CreatorProfile() {
 const [activeDropdown, setActiveDropdown] = useState(null);
const [MyProjectValue, setMyProjectValue] = useState("My Project");
const [editOpen, setEditOpen] = useState(false);
const [activeModal, setActiveModal] = useState(null);
const [isOpen, setIsOpen] = useState(false);


const [fileName, setFileName] = useState("No file chosen");
const [showEdit, setShowEdit] = useState(false);   // ✅ ADD THIS
const allSkills = [ "User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding", ];

const [selectedSkills, setSelectedSkills] = useState([ "User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding", "Graphics Design", "Logo Design", "Animation", "Branding", ]);

const [showSkillsModal, setShowSkillsModal] = useState(false);

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };
  

  return (
<div className="relative w-full bg-[#F2F2F2] flex justify-center overflow-hidden">

  {/* MOBILE FRAME — ONLY FOR MOBILE */}
  <div className="  w-full  sm:max-w-none  max-sm:w-full  max-sm:bg-white  max-sm:shadow-xl  max-sm:overflow-hidden ">


      {/* ======================= BANNER + HEADER ========================== */}
      <div className="relative w-full h-[582px]  max-sm:h-[260px]">
        <img
          src={TopBanner}
          alt="banner"
          className="absolute inset-0 w-full h-full object-cover blur-[1px]"
        />
      {/* ================= HEADER ================= */}
<div className="fixed top-0 left-0 w-full z-[9999] sm:absolute sm:top-[24px] sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[1280px] sm:px-6">
  <div className="flex items-center justify-between text-white px-4 sm:px-0">
  <ColHeader />
  </div>
</div>
      </div>
      

{/* RESPONSIVE SCALE WRAPPER */}
<div className="origin-top transition-all duration-300 lg:scale-[0.88] xl:scale-100">

  {/* ======================= MAIN CONTENT ========================== */}
<div
  className=" max-w-[1280px] mx-auto mt-[-260px] max-sm:mt-[-60px] pb-24 relative z-10 max-sm:mt-[-140px] max-sm:px-3 max-sm:pb-10 ">




  {/* ===== PROFILE + VERIFICATION ===== */}
<div className=" grid grid-cols-[804px_392px] max-sm:grid-cols-1 max-sm:gap-5 xl:grid-cols-[804px_392px] lg:grid-cols-[680px_320px] max-sm:grid-cols-1 max-sm:gap-6 gap-[31px] lg:gap-[24px] xl:gap-[31px] mt-6 ">


{/* ===== DESKTOP / LAPTOP PROFILE  ===== */}
<div className="hidden sm:block">
  <div className=" bg-white shadow-lg flex gap-6 w-[804px] lg:w-[680px] xl:w-[804px] h-[380px] rounded-[10px] p-6 mb-4 max-sm:flex-col max-sm:w-full max-sm:h-auto max-sm:ml-0 max-sm:p-4  max-sm:rounded-[14px] ">
      {/* LEFT IMAGE + DETAILS */}
<div className="flex flex-col items-start max-sm:flex-row max-sm:gap-4">

<img
  src={Rectangle}
  alt="profile"
  className="w-[218px] h-[219px] rounded-[9px] object-cover
             max-sm:w-[88px] max-sm:h-[88px] max-sm:rounded-full"
/>


        {/* LOCATION */}
        <div className="flex items-center gap-2 mt-3">
          <img
            src={FlagImg}
            alt="flag"
            className="w-[18px] h-[12px] object-cover rounded-sm"
          />
          <span className="text-[14px] font-medium">
            Chicago, USA
          </span>
        </div>

        {/* TIME */}
        <div className="flex items-center gap-2 mt-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="1.5" />
            <path
              d="M12 6v6l4 2"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[14px] font-medium">
            It&apos;s currently 7:45 PM here
          </span>
        </div>

        {/* JOINED */}
        <div className="flex items-center gap-2 mt-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="#000"
              strokeWidth="1.5"
            />
            <path
              d="M8 2v4M16 2v4M3 10h18"
              stroke="#000"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[14px] font-medium">
            Joined December 5, 2020
          </span>
        </div>
      </div>

      {/* RIGHT CONTENT */}
<div className="flex-1 max-sm:w-full">
<div className="flex justify-between max-sm:flex-col max-sm:gap-2">
          <div>
            <h2 className="text-[22px] font-semibold">Pradeep</h2>

            <p
              style={{
                fontFamily: "Montserrat",
                fontWeight: 500,
                fontSize: "14px",
                color: "#2A1E1780",
              }}
            >
              User Experience Designer, Graphic Designer
            </p>

            {/* BADGES */}
<div className="flex gap-3 mt-2 flex-wrap max-sm:gap-2">

              {/* RATING */}
              <svg width="140" height="40" viewBox="0 0 140 40">
                <path d="M10 3L12.7 9.5H19.5L14 13.8L16.2 20L10 16L3.8 20L6 13.8L0.5 9.5H7.3L10 3Z" fill="#5B2D8B"/>
                <path d="M30 3L32.7 9.5H39.5L34 13.8L36.2 20L30 16L23.8 20L26 13.8L20.5 9.5H27.3L30 3Z" fill="#5B2D8B"/>
                <path d="M50 3L52.7 9.5H59.5L54 13.8L56.2 20L50 16L43.8 20L46 13.8L40.5 9.5H47.3L50 3Z" fill="#5B2D8B"/>
                <path d="M70 3L72.7 9.5H79.5L74 13.8L76.2 20L70 16L63.8 20L66 13.8L60.5 9.5H67.3L70 3Z" fill="#5B2D8B"/>
                <path d="M90 3L92.7 9.5H99.5L94 13.8L96.2 20L90 16L83.8 20L86 13.8L80.5 9.5H87.3L90 3Z" fill="#E6E0EC"/>
                <text x="10" y="35" fontSize="12" fill="#3A2A1A">
                  4/5 <tspan opacity="0.6">(12 Reviews)</tspan>
                </text>
              </svg>

              {/* RATE */}
              <svg width="90" height="18">
                <circle cx="9" cy="9" r="9" fill="#6A3EA1"/>
                <text x="9" y="13" textAnchor="middle" fontSize="12" fill="#fff">$</text>
                <text x="24" y="13" fontSize="12" fill="#2A1E17">40 USD / Hr</text>
              </svg>

              {/* PROJECTS */}
              <svg width="155" height="18">
                <circle cx="9" cy="9" r="9" fill="#6A3EA1"/>
                <text x="24" y="13" fontSize="12" fill="#2A1E17">
                  50 projects completed
                </text>
              </svg>
            </div>
          </div>
          
<button
  onClick={() => setEditOpen(true)}
  className=" h-[29px] px-[6px] py-[20px] !border border-[#51218F] rounded-[100px] text-[#6A3EA1] text-[14px] font-semibold font-['Montserrat'] flex items-center justify-center gap-[10px] hover:bg-[#6A3EA1]/10 transition ">
  Edit Profile
</button>

{editOpen && (
  <div className="fixed inset-0 bottom-380 z-[999] flex items-center justify-center bg-black/40 ">

    {/* MODAL BOX */}
    <div className="bg-white rounded-[16px] shadow-xl w-[820px] p-8">

      {/* NAME */}
      <input
        type="text"
        defaultValue="Pradeep"
        className="
          w-full
          !border border-gray-300
          rounded-[12px]
          px-4 py-3
          text-[22px]
          font-semibold
          mb-4
          focus:outline-none
        "
      />

      {/* ROLE */}
      <input
        type="text"
        defaultValue="User Experience Designer, Graphic Designer"
        className="
          w-full
          !border border-gray-300
          rounded-[12px]
          px-4 py-3
          text-[16px]
          mb-6
          focus:outline-none
        "
      />

      {/* HOURLY RATE */}
      <p className="text-[14px] font-semibold mb-2">Hourly Rate</p>

      <div className="flex items-center gap-3 mb-6">

        {/* RATE INPUT */}
        <div className="flex items-center !border border-gray-300 rounded-[12px] px-3 py-2 h-[48px]">

          {/* DOLLAR SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            className="mr-2"
          >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>

        <input
  type="number"
  defaultValue="50.00"
  className="w-[160px] pl-25 focus:outline-none text-[14=6px]"
/>

        </div>

        <span className="text-gray-500 text-[14px]">/hr</span>
      </div>

      {/* DESCRIPTION */}
      <textarea
        rows={6}
        readOnly
        value={`I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have experience designing dashboards, landing pages, mobile app screens, and component libraries. I always aim to blend creativity with usability, ensuring that every design delivers a smooth and engaging user experience.`}
        className="
          w-full
          !border border-gray-300
          rounded-[12px]
          px-4 py-3
          text-[14px]
          leading-[22px]
          focus:outline-none
          mb-8
          resize-none
          cursor-default
        "
      />

      {/* ACTION BUTTONS */}
      <div className="flex gap-6">
        <button
          className="
            bg-[#51218F]
            text-white
            px-12 py-3
            rounded-full
            font-semibold
            hover:opacity-90
            transition
          "
        >
          Save
        </button>

        <button
          onClick={() => setEditOpen(false)}
          className="
            !border border-gray-400
            px-12 py-3
            rounded-full
            font-semibold
            hover:bg-gray-100
            transition
          "
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}




        </div>

<p className="mt-5 text-black text-[14px] leading-[22px] font-medium font-['Montserrat']">
  I have one year of experience in UI Design, during which I have worked on
  creating modern, user-friendly interfaces for both web and mobile
  applications. My work focuses on clean layouts, consistent visual styles,
  and intuitive user flows. I am skilled in using design tools such as Figma
  and Adobe XD, and I have experience designing dashboards, landing pages,
  mobile app screens, and component libraries. I always aim to blend
  creativity with usability, ensuring that every design delivers a smooth
  and engaging user experience.
</p>
      </div>
    </div>

</div>


{/* ===== MOBILE PROFILE ( ===== */}
<div className="block sm:hidden bg-white rounded-[16px] shadow-lg p-4 mb-4">

  {/* TOP ROW */}
  <div className="flex gap-3">

    {/* PROFILE IMAGE */}
    <img
      src={Rectangle}
      className="w-[82px] h-[132px] rounded-2 object-cover"
      alt="profile"
    />

    <div className="flex-1">
        {/* Header */}
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-[20px] font-semibold text-[#2A1E17]">Pradeep</h3>

    {/* Add profile Button */}
    <button
          onClick={() => setEditOpen(true)}
      className="!border border-[#51218F] text-[#51218F] text-[15px] px-3 py-[3px] rounded-full"
    >
          Edit Profile
    </button>
    
  </div>
  <p className="text-[12px] text-[#6B6B6B] leading-tight mt-[2px]">
            I am Looking for Designer, Graphic Designer
          </p>


  {/* ================= BADGES ================= */}
<div className="flex items-center gap-2 mt-1 text-[12px] text-[#3A2A1A]">

  {/* RATING */}
  <div className="flex flex-col leading-tight">
    <span className="text-[#5B2D8B] text-[14px]">★★★★☆</span>
    <span className="text-[#3A2A1A] opacity-60 text-[11px]">(12 Reviews)</span>
  </div>

  {/* RATE */}
  <div className="flex items-center gap-2">
    <span className="w-[14px] h-[14px] rounded-full bg-[#6A3EA1] text-white flex items-center justify-center text-[10px]">$</span>
    <span>40 USD / Hr</span>
  </div>

  {/* PROJECTS */}
  <div className="flex items-center gap-2">
    <span className="w-[14px] h-[14px] rounded-full bg-[#6A3EA1]"></span>
    <span>50 projects completed</span>
  </div>

</div>

      {/* ================= META INFO ================= */}
      <div className="flex gap-3 mt-2 text-[11px] text-[#6B6B6B]">
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B6B6B" strokeWidth="1.5" />
            <path d="M8 2v4M16 2v4M3 10h18" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Joined December 5, 2020</span>
        </div>
      </div>

    </div>
  </div>

  {/* DESCRIPTION */}
  <p className="mt-3 text-[12px] leading-[18px] text-[#3A2A1A]">
    I have one year of experience in UI Design, during which I have worked on creating
    modern, user-friendly interfaces for both web and mobile applications. My work
    focuses on clean layouts, consistent visual styles, and intuitive user flows. I am
    skilled in using design tools such as Figma and Adobe XD, and I have experience
    designing dashboards, landing pages, mobile app screens, and component libraries.
  </p>

</div>

{editOpen && (
  <div className="fixed inset-0 block sm:hidden  z-[999] flex items-center justify-center bg-black/40 ">

    {/* MODAL BOX */}
    <div className="bg-white rounded-[16px] shadow-xl w-[820px] p-8">

      {/* NAME */}
      <input
        type="text"
        defaultValue="Pradeep"
        className="
          w-full
          !border border-gray-300
          rounded-[12px]
          px-4 py-3
          text-[22px]
          font-semibold
          mb-4
          focus:outline-none
        "
      />

      {/* ROLE */}
      <input
        type="text"
        defaultValue="User Experience Designer, Graphic Designer"
        className="
          w-full
          !border border-gray-300
          rounded-[12px]
          px-4 py-3
          text-[16px]
          mb-6
          focus:outline-none
        "
      />

      {/* HOURLY RATE */}
      <p className="text-[14px] font-semibold mb-2">Hourly Rate</p>

      <div className="flex items-center gap-3 mb-6">

        {/* RATE INPUT */}
        <div className="flex items-center !border border-gray-300 rounded-[12px] px-3 py-2 h-[48px]">

          {/* DOLLAR SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            className="mr-2"
          >
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
          </svg>

        <input
  type="number"
  defaultValue="50.00"
  className="w-[160px] pl-25 focus:outline-none text-[14=6px]"
/>

        </div>

        <span className="text-gray-500 text-[14px]">/hr</span>
      </div>

      {/* DESCRIPTION */}
      <textarea
        rows={6}
        readOnly
        value={`I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have experience designing dashboards, landing pages, mobile app screens, and component libraries. I always aim to blend creativity with usability, ensuring that every design delivers a smooth and engaging user experience.`}
        className="
          w-full
          !border border-gray-300
          rounded-[12px]
          px-4 py-3
          text-[14px]
          leading-[22px]
          focus:outline-none
          mb-8
          resize-none
          cursor-default
        "
      />

      {/* ACTION BUTTONS */}
      <div className="flex gap-6">
        <button
          className="
            bg-[#51218F]
            text-white
            px-12 py-3
            rounded-full
            font-semibold
            hover:opacity-90
            transition
          "
        >
          Save
        </button>

        <button
          onClick={() => setEditOpen(false)}
          className="
            !border border-gray-400
            px-12 py-3
            rounded-full
            font-semibold
            hover:bg-gray-100
            transition
          "
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
 </div>
  

 {/* RIGHT FIXED COLUMN */}
<div className="absolute top-0 left-[835px] max-sm:static max-sm:w-full lg:left-[705px] xl:left-[835px] w-[392px] lg:w-[320px] xl:w-[392px] space-y-6 shrink-0">

  {/* VERIFICATION */}
  <div className="bg-white rounded-xl shadow p-6 w-full">
    <h4 className="text-[18px] font-semibold mb-3">Verification</h4>

    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <span className="text-[18px] text-[#3A2A1A] font-medium">Phone Verified</span>
      </div>
      <span className="text-[#6A3EA1] font-medium cursor-pointer">Verify</span>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-[18px] text-[#3A2A1A] font-medium">Email Verified</span>
      </div>
      <span className="text-[#6A3EA1] font-medium cursor-pointer">Verify</span>
    </div>
  </div>

  {/* SKILLS */}
  <div className="bg-white rounded-xl shadow p-5 w-full">
    <div className="flex justify-between items-center mb-3">
      <h4 className="text-[18px] font-semibold">Skills Required</h4>

    <button
  onClick={() => setShowSkillsModal(true)}
  className="!border border-[#51218F] px-4 py-1 rounded-full text-[#51218F] text-[13px]"
>
  Edit Skills
</button>

    </div>

    <div className="h-[1px] bg-black/10 my-4" />

    <ul className="space-y-4 text-[16px] font-medium">
      <li>User Interface Design</li>
      <li>Graphics Design</li>
      <li>Logo Design</li>
      <li>Animation</li>
      <li>Branding</li>
    </ul>

    <p className="text-[#6A3EA1] mt-6 cursor-pointer text-sm">See more</p>
  </div>

</div>


{/* ================= TOP SKILLS POPUP ================= */}
{showSkillsModal && (
  <>

    {/* ================= DESKTOP MODAL ================= */}
    <div className="hidden md:flex mb-[104%] fixed inset-0 z-[99999] bg-black/40 items-center justify-center">

      <div className="relative bg-white w-[820px] rounded-[16px] p-10 shadow-2xl">

        <h2 className="text-[22px] font-semibold mb-6">Top Skills</h2>

        <div className="!border border-gray-300 rounded-[10px] p-4 flex items-center justify-between">

          <div className="flex flex-wrap gap-3">
            {["User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding"].map(skill => (
              <span
                key={skill}
                className="px-4 py-[6px] bg-[#CFCFCF] rounded-full text-[13px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>

          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="#5B2D8B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex gap-6 mt-8">
          <button onClick={() => setShowSkillsModal(false)} className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold">
            Save
          </button>

          <button onClick={() => setShowSkillsModal(false)} className="!border border-black px-14 py-3 rounded-full font-semibold">
            Cancel
          </button>
        </div>

      </div>
    </div>

    {/* ================= MOBILE MODAL ================= */}
    <div className="md:hidden fixed bottom-100 inset-0 z-[99999] bg-black/40 flex items-end justify-center">

      <div className="bg-white w-full rounded-t-[24px] p-6 shadow-2xl">

        <h2 className="text-[20px] font-semibold mb-4 text-center">Top Skills</h2>

        <div className="!border border-gray-300 rounded-[10px] p-4 flex flex-wrap gap-3 justify-center mb-6">

          {["User Interface Design", "Graphics Design", "Logo Design", "Animation", "Branding"].map(skill => (
            <span
              key={skill}
              className="px-4 py-[6px] bg-[#CFCFCF] rounded-full text-[13px] font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShowSkillsModal(false)} className="flex-1 bg-[#51218F] text-white py-3 rounded-full font-semibold">
            Save
          </button>

          <button onClick={() => setShowSkillsModal(false)} className="flex-1 !border border-black py-3 rounded-full font-semibold">
            Cancel
          </button>
        </div>

      </div>
    </div>

  </>
)}


  

  {/* ================= PORTFOLIO (LEFT) ================= */}
<div
  className="bg-white shadow-lg hidden lg:block
             w-[804px] lg:w-[680px] xl:w-[804px]
             h-[337px]
             rounded-[10px]
             p-6"
>

  {/* HEADER */}
  <div className="flex justify-between items-center">
    <h3 className="text-[18px] font-semibold text-[#3A2A1A]">
      My Portfolio
    </h3>

    <div className="flex items-center gap-[10px]">
      {/* DELETE ICON */}
      <button className="hover:opacity-70 transition">
        <svg
          width="14"
          height="15.0783"
          viewBox="0 0 14 15.0783"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 4.2H13" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5.2 1.8H8.8" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M3 4.2V13.2C3 14 3.6 14.6 4.4 14.6H9.6C10.4 14.6 11 14 11 13.2V4.2"
            stroke="#3A2A1A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M5.5 7.2V11.2" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8.5 7.2V11.2" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

       {/* EDIT PORTFOLIO BUTTON */}
  <button
  onClick={() => setActiveModal("portfolio")}
  className="h-[29px] px-[36px] !border border-[#51218F] rounded-full text-[#6A3EA1]"
>
  Edit Portfolio
</button>



      {/* ================= POPUP ================= */}
{activeModal === "portfolio" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 mb-280">
    <div
      className="
        bg-white
        w-[700px]
        h-[650px]
        rounded-[20px]
        p-10
        shadow-xl
        overflow-y-auto
      "
    >

      {/* TITLE */}
      <h2 className="text-[28px] font-semibold mb-2">
        Add Portfolio
      </h2>

      {/* WORK NAME */}
      <div className="mb-2">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Work Name
        </label>
        <input
          type="text"
          className="w-full h-[32px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
        />
      </div>

      {/* MEDIA */}
      <div className="mb-2">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Media
        </label>
        <input
          type="text"
          className="w-full h-[32px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
        />
      </div>

      {/* FILE UPLOAD */}
      <div className="mb-6">
        <div className="w-full h-[70px] !border border-gray-300 rounded-[12px] flex items-center px-4 gap-4">

          <label
            htmlFor="portfolioFile"
            className="px-6 py-2 !border rounded-full cursor-pointer text-sm"
          >
            Choose File
          </label>

          <input
            id="portfolioFile"
            type="file"
            className="hidden"
            onChange={(e) =>
              setFileName(e.target.files?.[0]?.name || "No file chosen")
            }
          />

          <span className="text-sm text-gray-500">
            {fileName}
          </span>
        </div>
      </div>

      {/* WORK LINK */}
      <div className="mb-2">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Work link
        </label>
        <input
          type="text"
          className="w-full h-[52px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
        />
      </div>

      {/* WORK DESCRIPTION */}
      <div className="mb-1">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Work Description
        </label>
        <textarea
          rows={4}
          className="w-full !border border-gray-300 rounded-[12px] px-1 py-[0] focus:outline-none"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-6">
        <button
          onClick={() => setActiveModal(null)}
          className="
            bg-[#51218F]
            text-white
            px-14
            py-3
            rounded-full
            font-semibold
            hover:opacity-90
            transition
          "
        >
          Save
        </button>

        <button
          onClick={() => setActiveModal(null)}
          className="
            !border border-black/10
            
            px-14
            py-3
            rounded-full
            font-semibold
            hover:bg-gray-100
            transition
          "
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


    </div>
  </div>

  {/* DIVIDER */}
  <div className="h-[1px] bg-black/10 my-4" />
{/* PORTFOLIO GRID */}
<div className="grid grid-cols-3 gap-4">

  {[Portfolio1, Portfolio2, Portfolio3].map((img, index) => (
    <div key={index} className="relative rounded-[10px] overflow-hidden">

      <img
        src={img}
        className="h-[174px] w-full object-cover"
        alt="portfolio"
      />

{/* ✏️ EDIT ICON */}
<div
  onClick={() => setShowEdit(true)}
  className="
    absolute top-3 right-3
    w-[46px] h-[46px]
    rounded-full
    bg-gradient-to-br from-[#7C3AED] to-[#2B0F4C]
    flex items-center justify-center
    shadow-[0_10px_30px_rgba(124,58,237,0.45)]
    cursor-pointer
    hover:scale-105
    transition
  "
>
  <img
    src={EditIcon}
    alt="edit"
    className="w-[42px] h-[42px] object-contain"
  />
</div>


{/* ================= PORTFOLIO EDIT POPUP ================= */}
{showEdit && (
  <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center mb-280 ">

    <div className="bg-white w-[720px] rounded-[22px] p-10 shadow-xl relative">

      {/* ❌ Close Button */}
      <div
        onClick={() => setShowEdit(false)}
        className="absolute top-6 right-6 cursor-pointer text-gray-500 hover:text-black text-xl"
      >
        ✕
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
      
        <h2 className="text-[24px] font-semibold">Edit Portfolio</h2>
      </div>

      {/* Work Name */}
      <label className="block text-sm mb-2">Input Label - Work Name</label>
      <input className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" />

      {/* Media */}
      <label className="block text-sm mb-2">Input Label - Media</label>
      <input className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" />

      {/* File */}
      <div className="w-full h-[64px] !border rounded-[10px] flex items-center px-4 gap-4 mb-6">
        <label className="!border px-5 py-2 rounded-full cursor-pointer text-sm">
          Choose File
          <input type="file" className="hidden" />
        </label>
        <span className="text-gray-500 text-sm">No file chosen</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => setShowEdit(false)}
          className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold"
        >
          Save
        </button>

        <button
          onClick={() => setShowEdit(false)}
          className="!border px-14 py-3 rounded-full font-semibold"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}

      {index === 0 && (
        <div className="ml-8 mt-4 w-[213px] h-[17px] bg-white rounded-[4px] flex items-center px-2">
          <p className="text-[12px] font-semibold text-[#000000] whitespace-nowrap">
            TIME TROVE- BEST WATCHES
          </p>
        </div>
      )}
    </div>
  ))}
  

</div>




  
  {/* VIEW ALL */}
  <p className="text-center mt- text-[#6A3EA1] text-[14px] font-medium cursor-pointer">
    View All
  </p>
  
</div>

{/* ================= MOBILE PORTFOLIO ================= */}
<div className="block lg:hidden bg-white rounded-[14px] shadow mt-5 px-4 py-5">

  {/* Header */}
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-[15px] font-semibold text-[#2A1E17]">My Portfolio</h3>

    {/* Add Portfolio Button */}
    <button
      onClick={() => setActiveModal("portfolio")}
      className="!border border-[#51218F] text-[#51218F] text-[12px] px-3 py-[3px] rounded-full"
    >
      Add Portfolio
    </button>
  </div>

  {/* Images */}
  <div className="flex gap-3 overflow-x-auto pb-2">
    {[Portfolio1, Portfolio2, Portfolio3].map((img, i) => (
      <div key={i} className="relative min-w-[130px] h-[95px] rounded-[10px] overflow-hidden">

        <img src={img} className="w-full h-full object-cover" />
        

        {/* ✏️ Edit icon — OPENS EDIT POPUP */}
        <div
          onClick={() => setShowEdit(true)}
          className="absolute top-1 right-1 w-[28px] h-[28px] bg-[#51218F] text-white rounded-full flex items-center justify-center"
        >
          <img src={EditIcon} className="w-[18px] h-[18px]" />
        </div>
        

      </div>
    ))}
  </div>

  <p className="text-center mt-3 text-[#6A3EA1] text-[12px] font-medium cursor-pointer">
    View All
  </p>
</div>

      {/* ================= POPUP  PORTFOLIO  ================= */}
{activeModal === "portfolio" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 mb-2 block lg:hidden">
    <div
      className="
        bg-white
        w-[700px]
        h-[650px]
        rounded-[20px]
        p-10
        shadow-xl
        overflow-y-auto
      "
    >

      {/* TITLE */}
      <h2 className="text-[28px] font-semibold mb-2">
        Add Portfolio
      </h2>

      {/* WORK NAME */}
      <div className="mb-2">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Work Name
        </label>
        <input
          type="text"
          className="w-full h-[32px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
        />
      </div>

      {/* MEDIA */}
      <div className="mb-2">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Media
        </label>
        <input
          type="text"
          className="w-full h-[32px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
        />
      </div>

      {/* FILE UPLOAD */}
      <div className="mb-6">
        <div className="w-full h-[70px] !border border-gray-300 rounded-[12px] flex items-center px-4 gap-4">

          <label
            htmlFor="portfolioFile"
            className="px-6 py-2 !border rounded-full cursor-pointer text-sm"
          >
            Choose File
          </label>

          <input
            id="portfolioFile"
            type="file"
            className="hidden"
            onChange={(e) =>
              setFileName(e.target.files?.[0]?.name || "No file chosen")
            }
          />

          <span className="text-sm text-gray-500">
            {fileName}
          </span>
        </div>
      </div>

      {/* WORK LINK */}
      <div className="mb-2">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Work link
        </label>
        <input
          type="text"
          className="w-full h-[52px] !border border-gray-300 rounded-[12px] px-4 focus:outline-none"
        />
      </div>

      {/* WORK DESCRIPTION */}
      <div className="mb-1">
        <label className="block text-[14px] font-medium mb-2">
          Input Label - Work Description
        </label>
        <textarea
          rows={4}
          className="w-full !border border-gray-300 rounded-[12px] px-1 py-[0] focus:outline-none"
        />
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-6">
        <button
          onClick={() => setActiveModal(null)}
          className="
            bg-[#51218F]
            text-white
            px-14
            py-3
            rounded-full
            font-semibold
            hover:opacity-90
            transition
          "
        >
          Save
        </button>

        <button
          onClick={() => setActiveModal(null)}
          className="
            !border border-black/10
            
            px-14
            py-3
            rounded-full
            font-semibold
            hover:bg-gray-100
            transition
          "
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
{/* ================= PORTFOLIO EDIT POPUP ================= */}
{showEdit && (
  <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center mb-2 block lg:hidden ">

    <div className="bg-white w-[720px] rounded-[22px] p-10 shadow-xl relative">

      {/* ❌ Close Button */}
      <div
        onClick={() => setShowEdit(false)}
        className="absolute top-6 right-6 cursor-pointer text-gray-500 hover:text-black text-xl"
      >
        ✕
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
      
        <h2 className="text-[24px] font-semibold">Edit Portfolio</h2>
      </div>

      {/* Work Name */}
      <label className="block text-sm mb-2">Input Label - Work Name</label>
      <input className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" />

      {/* Media */}
      <label className="block text-sm mb-2">Input Label - Media</label>
      <input className="w-full h-[44px] !border rounded-[10px] px-4 mb-5" />

      {/* File */}
      <div className="w-full h-[64px] !border rounded-[10px] flex items-center px-4 gap-4 mb-6">
        <label className="!border px-5 py-2 rounded-full cursor-pointer text-sm">
          Choose File
          <input type="file" className="hidden" />
        </label>
        <span className="text-gray-500 text-sm">No file chosen</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-6">
        <button
          onClick={() => setShowEdit(false)}
          className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold"
        >
          Save
        </button>

        <button
          onClick={() => setShowEdit(false)}
          className="!border px-14 py-3 rounded-full font-semibold"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}







{/* ================= DESKTOP REVIEWS ================= */}
<div
  className="hidden sm:block bg-white shadow-lg mt-6"
  style={{
    width: "802px",
    height: "367px",
    borderRadius: "10px",
    padding: "24px",
  }}
>
  <h3 className="text-[18px] font-semibold text-[#3A2A1A] mb-4">
    Reviews
  </h3>

  <div className="w-full h-[1px] bg-black/10 mb-6"></div>

  <div className="flex gap-[21px]">

    {/* CARD 1 */}
    <div
      className="flex flex-col"
      style={{
        width: "348px",
        height: "206px",
        background: "#F3F3F3",
        border: "0.5px solid #00000033",
        borderRadius: "4px",
        padding: "14px",
      }}
    >
      <div className="flex items-start gap-3">
        <img src={ReviewUser1} className="w-[32px] h-[32px] rounded-full" />

        <div>
          <p className="text-[14px] text-[#6B6B6B] leading-[20px] mb-3">
            Great experience working with this freelancer. The work was delivered on time with excellent quality and clear communication throughout the project. Very professional and easy to collaborate with. Highly recommended!
          </p>

          <p className="text-[14px] font-semibold text-[#3A2A1A]">
            Joe Samurya
          </p>

          <p className="text-[12px] text-[#6B6B6B]">
            UI Developer
          </p>
        </div>
      </div>
    </div>

    {/* CARD 2 */}
    <div
      className="flex flex-col"
      style={{
        width: "348px",
        height: "206px",
        background: "#F3F3F3",
        border: "0.5px solid #00000033",
        borderRadius: "4px",
        padding: "14px",
      }}
    >
      <div className="flex items-start gap-3">
        <img src={ReviewUser2} className="w-[32px] h-[32px] rounded-full" />

        <div>
          <p className="text-[14px] text-[#6B6B6B] leading-[20px] mb-3">
            The freelancer did an amazing job and understood the requirements perfectly. The final output was creative, polished, and exceeded my expectations. Quick responses and smooth workflow. Would definitely work together again!
          </p>

          <p className="text-[14px] font-semibold text-[#3A2A1A]">
            Jaya Surya
          </p>

          <p className="text-[12px] text-[#6B6B6B]">
            Web Developer
          </p>
        </div>
      </div>
    </div>

  </div>

  <p className="text-center mt-6 text-[#6A3EA1] text-[14px] font-medium cursor-pointer">
    View All
  </p>
</div>
{/* ================= MOBILE REVIEWS ================= */}
<div className="block sm:hidden bg-white shadow-lg mt-4 rounded-[12px] p-4">

  {/* HEADER */}
  <h3 className="text-[16px] font-semibold text-[#3A2A1A] mb-3">
    Reviews
  </h3>

  <div className="w-full h-[1px] bg-black/10 mb-4"></div>

  {/* REVIEW CARD */}
  <div className="bg-[#F3F3F3] border border-black/10 rounded-[8px] p-3 mb-3">

    <div className="flex items-start gap-3">
      <img
        src={ReviewUser1}
        className="w-[34px] h-[34px] rounded-full object-cover"
        alt=""
      />

      <div>
        <p className="text-[13px] text-[#6B6B6B] leading-[18px] mb-2">
          Great experience working with this freelancer. The work was delivered
          on time with excellent quality and clear communication throughout the
          project. Very professional and easy to collaborate with. Highly
          recommended!
        </p>

        <p className="text-[13px] font-semibold text-[#3A2A1A]">
          Joe Sam
        </p>

        <p className="text-[12px] text-[#6B6B6B]">
          UI Developer
        </p>
      </div>
    </div>
  </div>

  {/* REVIEW CARD */}
  <div className="bg-[#F3F3F3] border border-black/10 rounded-[8px] p-3 mb-4">

    <div className="flex items-start gap-3">
      <img
        src={ReviewUser2}
        className="w-[34px] h-[34px] rounded-full object-cover"
        alt=""
      />

      <div>
        <p className="text-[13px] text-[#6B6B6B] leading-[18px] mb-2">
          The freelancer did an amazing job and understood the requirements
          perfectly. The final output was creative, polished, and exceeded my
          expectations. Quick responses and smooth workflow. Would definitely
          work together again!
        </p>

        <p className="text-[13px] font-semibold text-[#3A2A1A]">
          Jaya Surya
        </p>

        <p className="text-[12px] text-[#6B6B6B]">
          Web Developer
        </p>
      </div>
    </div>
  </div>

  {/* VIEW ALL */}
  <p className="text-center text-[#6A3EA1] text-[13px] font-medium cursor-pointer">
    View All
  </p>
</div>



{/* ================= DESKTOP WORK EXPERIENCE ================= */}
<div className="hidden lg:block bg-white shadow-lg mt-6"
  style={{ width: "802px", height: "304px", borderRadius: "10px", padding: "24px" }}
>
{/* HEADER */}
<div className="flex justify-between items-center mb-4">
  <h3 className="text-[18px] font-semibold text-[#3A2A1A]">
    Work Experience
  </h3>

  <div className="flex items-center gap-3">
    {/* DELETE ICON */}
    <button className="hover:opacity-70 transition">
      <svg
        width="14"
        height="15"
        viewBox="0 0 14 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 4H13"
          stroke="#3A2A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5 1H9"
          stroke="#3A2A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 4V12C3 13.1046 3.89543 14 5 14H9C10.1046 14 11 13.1046 11 12V4"
          stroke="#3A2A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6 7V11M8 7V11"
          stroke="#3A2A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>

     {/* EDIT EXPERIENCE BUTTON */}
      <button
  onClick={() => setActiveModal("experience")}
  className="!border border-[#6A3EA1] text-[#6A3EA1] px-4 py-1 rounded-full"
>
  Edit Experience
</button>


{/* ================= GLOBAL POPUP ================= */}
{activeModal === "experience" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
    <div className="bg-white w-[900px] max-w-[95vw] rounded-[20px] p-6 md:p-10 shadow-xl">

      {/* ===== YOUR POPUP CONTENT (UNCHANGED) ===== */}

      {/* COMPANY NAME */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="20" height="20" fill="none" stroke="black" strokeWidth="1.5">
          <circle cx="10" cy="6" r="3" />
          <path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        </svg>

        <input type="text" placeholder="Enter company name"
          className="w-full h-[56px] !border border-gray-300 rounded-[14px] pl-12 pr-4 focus:outline-none"
        />
      </div>

      {/* ROLE */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="1.5">
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" />
        </svg>

        <input type="text" placeholder="Enter Role or Job Title"
          className="w-full h-[56px] !border border-gray-300 rounded-[14px] pl-12 pr-4 focus:outline-none"
        />
      </div>

      {/* DATES */}
      <div className="flex gap-6 mb-6 !border border-gray-300 rounded-[14px]">
        <input type="date" className="w-full h-[56px] border rounded-[14px] px-4" />
        <input type="date" className="w-full h-[56px] border rounded-[14px] px-4" />
      </div>

      {/* DESCRIPTION */}
      <textarea rows={5} readOnly
        className="w-full border rounded-[14px] px-5 py-4 mb-8"
        value="I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly  interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have  experience designing dashboards, landing pages, mobile app screens, and component libraries. I always experience."
      />

      {/* ACTIONS */}
      <div className="flex gap-6">
        <button onClick={() => setActiveModal(null)} className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold">
          Save
        </button>

        <button onClick={() => setActiveModal(null)} className="!border px-14 py-3 rounded-full font-semibold">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}



  </div>
</div>


  {/* DIVIDER */}
  <div className="w-full h-[1px] bg-black/10 mb-4"></div>

  {/* CONTENT */}
  <div>
    <p className="text-[14px] font-semibold text-[#3A2A1A]">
      User Experience Designer | TCS
    </p>

    <p className="text-[12px] text-[#6B6B6B] mt-1">
      2019 – 2021
    </p>

    <p className="text-[14px] leading-[22px] text-[#3A2A1A] mt-4 max-w-[740px]">
      I have one year of experience in UI Design, during which I have worked on
      creating modern, user-friendly interfaces for both web and mobile
      applications. My work focuses on clean layouts, consistent visual styles,
      and intuitive user flows. I am skilled in using design tools such as
      Figma and Adobe XD, and I have experience designing dashboards, landing
      pages, mobile app screens, and component libraries. I always aim to blend
      creativity with usability, ensuring that every design delivers a smooth
      and engaging user experience.
    </p>
  </div>

  {/* VIEW ALL */}
  <p className="text-center mt-6 text-[#6A3EA1] text-[14px] font-medium cursor-pointer">
    View All
  </p>
</div>
{/* ================= MOBILE WORK EXPERIENCE ================= */}
<div className="block lg:hidden bg-white rounded-[14px] shadow mt-5 px-4 py-5">

  <div className="flex justify-between items-center border-b pb-2 mb-3">
    <h3 className="text-[15px] font-semibold text-[#2A1E17]">Work Experience</h3>

    <div className="flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
        <path d="M3 6h18M8 6V4h8v2M6 6v14h12V6" />
      </svg>

      <button
        onClick={() => setActiveModal("experience")}
        className="!border border-[#6A3EA1] text-[#6A3EA1] text-[12px] px-3 py-[3px] rounded-full"
      >
        Edit Experience
      </button>
    </div>
  </div>

  <p className="text-[13px] font-semibold text-[#3A2A1A]">
    User Experience Designer | TCS
  </p>

  <p className="text-[11px] text-[#777] mt-1">2019–2021</p>

  <p className="text-[12px] leading-[18px] text-[#3A2A1A] mt-3">
    I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly  interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have  experience designing dashboards, landing pages, mobile app screens, and component libraries. I always experience.
  </p>

  <p className="text-center mt-4 text-[#6A3EA1] text-[12px] font-medium cursor-pointer">
    View All
  </p>
</div>
{/* ================= GLOBAL POPUP ================= */}
{activeModal === "experience" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
    <div className="bg-white w-[900px] max-w-[95vw] rounded-[20px] p-6 md:p-10 shadow-xl">

      {/* ===== YOUR POPUP CONTENT (UNCHANGED) ===== */}

      {/* COMPANY NAME */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="20" height="20" fill="none" stroke="black" strokeWidth="1.5">
          <circle cx="10" cy="6" r="3" />
          <path d="M3 18c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        </svg>

        <input type="text" placeholder="Enter company name"
          className="w-full h-[56px] !border border-gray-300 rounded-[14px] pl-12 pr-4 focus:outline-none"
        />
      </div>

      {/* ROLE */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="1.5">
          <circle cx="9" cy="9" r="6" />
          <path d="M14 14l4 4" />
        </svg>

        <input type="text" placeholder="Enter Role or Job Title"
          className="w-full h-[56px] !border border-gray-300 rounded-[14px] pl-12 pr-4 focus:outline-none"
        />
      </div>

      {/* DATES */}
      <div className="flex gap-6 mb-6 !border border-gray-300 rounded-[14px]">
        <input type="date" className="w-full h-[56px] border rounded-[14px] px-4" />
        <input type="date" className="w-full h-[56px] border rounded-[14px] px-4" />
      </div>

      {/* DESCRIPTION */}
      <textarea rows={5} readOnly
        className="w-full !border rounded-[14px] px-5 py-4 mb-8"
        value="I have one year of experience in UI Design, during which I have worked on creating modern, user-friendly  interfaces for both web and mobile applications. My work focuses on clean layouts, consistent visual styles, and intuitive user flows. I am skilled in using design tools such as Figma and Adobe XD, and I have  experience designing dashboards, landing pages, mobile app screens, and component libraries. I always experience."
      />

      {/* ACTIONS */}
      <div className="flex gap-6">
        <button onClick={() => setActiveModal(null)} className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold">
          Save
        </button>

        <button onClick={() => setActiveModal(null)} className="!border px-14 py-3 rounded-full font-semibold">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}




{/* ================= MY EDUCATION ================= */}
<div
  className="bg-white hidden lg:block shadow-lg mt-6"
  style={{
    width: "802px",
    height: "242px",
    borderRadius: "10px",
    padding: "24px",
  }}
>
  {/* HEADER */}
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-[18px] font-semibold text-[#3A2A1A]">
      My Education
    </h3>

    <div className="flex items-center gap-3">
      {/* DELETE ICON */}
      <button className="hover:opacity-70 transition">
        <svg
          width="14"
          height="15"
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 4H13" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5 1H9" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M3 4V12C3 13.1046 3.89543 14 5 14H9C10.1046 14 11 13.1046 11 12V4"
            stroke="#3A2A1A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6 7V11M8 7V11"
            stroke="#3A2A1A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
  {/* EDIT EXPERIENCE BUTTON */}
      <button
  onClick={() => setActiveModal("education")}
  className="!border border-[#6A3EA1] text-[#6A3EA1] px-4 py-1 rounded-full"
>
  Edit Education
</button>


      {/* ================= POPUP ================= */}
 {activeModal === "education" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
    <div className="bg-white w-[900px] rounded-[20px] p-10 shadow-xl">

      {/* UNIVERSITY NAME */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2"
          width="20"
          height="20"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        >
          <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2" />
        </svg>

        <input
          placeholder="University Name"
          className="w-full h-[56px] !border border-gray-300 rounded-[14px] pl-12 pr-4 focus:outline-none"
        />
      </div>

      {/* FIELD OF STUDY */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2"
          width="20"
          height="20"
          fill="none"
          stroke="black"
          strokeWidth="1.5"
        >
          <path d="M4 5h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H4z" />
          <path d="M20 5h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6z" />
        </svg>

        <input
          placeholder="Enter Field of study"
          className="w-full h-[56px] !border border-gray-300 rounded-[14px] pl-12 pr-4 focus:outline-none"
        />
      </div>

      {/* DATES */}
      <div className="flex gap-6 mb-8 !border border-gray-300 rounded-[14px]">

        {/* START DATE */}
        <div
          className="relative w-[220px] cursor-pointer"
          onClick={(e) => e.currentTarget.querySelector("input")?.showPicker()}
        >
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            width="20"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="14" height="14" rx="2" />
            <path d="M3 8h14M7 2v4M13 2v4" />
          </svg>

          <span className="absolute left-12 top-1/2 -translate-y-1/2 text-[14px] text-gray-500 pointer-events-none">
            Start Date
          </span>

          <input
            type="date"
            className="
              w-full h-[56px]
              border border-gray-300
              rounded-[14px]
              pl-12 pr-4
              text-transparent
              focus:text-gray-700
              bg-transparent
              focus:outline-none
              cursor-pointer
            "
            onChange={(e) => {
              e.target.previousSibling.previousSibling.style.display = "none";
              e.target.classList.remove("text-transparent");
            }}
          />
        </div>

        {/* END DATE */}
        <div
          className="relative w-[220px] cursor-pointer"
          onClick={(e) => e.currentTarget.querySelector("input")?.showPicker()}
        >
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            width="20"
            height="20"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="14" height="14" rx="2" />
            <path d="M3 8h14M7 2v4M13 2v4" />
          </svg>

          <span className="absolute left-12 top-1/2 -translate-y-1/2 text-[14px] text-gray-500 pointer-events-none">
            End Date
          </span>

          <input
            type="date"
            className="
              w-full h-[56px]
              border border-gray-300
              rounded-[14px]
              pl-12 pr-4
              text-transparent
              focus:text-gray-700
              bg-transparent
              focus:outline-none
              cursor-pointer
            "
            onChange={(e) => {
              e.target.previousSibling.previousSibling.style.display = "none";
              e.target.classList.remove("text-transparent");
            }}
          />
        </div>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-6">
        <button
          onClick={() => setActiveModal(null)}
          className="bg-[#51218F] text-white px-14 py-3 rounded-full font-semibold"
        >
          Save
        </button>

        <button
          onClick={() => setActiveModal(null)}
          className="!border border-gray-400 px-14 py-3 rounded-full font-semibold"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


    </div>
  </div>

  {/* DIVIDER */}
  <div className="w-full h-[1px] bg-black/10 mb-4"></div>

  {/* EDUCATION CONTENT */}
  <div>
    <p className="text-[14px] font-semibold text-[#3A2A1A] mb-1">
      Master in Design | MIT
    </p>

    <p className="text-[12px] text-[#6B6B6B] mb-3">
      2019 – 2021
    </p>

    <p
      className="text-[#3A2A1A]"
      style={{
        fontFamily: "Montserrat",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "22px",
        letterSpacing: "0%",
        width: "620px",
      }}
    >
      Sri Ramakrishna College Of Arts and Science Nava India Lakshmi mill Road
      Coimbatore.
    </p>
  </div>

  {/* VIEW ALL */}
  <p className="text-center mt-6 text-[#6A3EA1] text-[14px] font-medium cursor-pointer">
    View All
  </p>
</div>
   
 {/* ================= MOBILE MY EDUCATION ================= */}
<div className="block lg:hidden bg-white rounded-[16px] shadow mt-5 px-4 py-5">

  {/* HEADER */}
  <div className="flex justify-between items-center border-b pb-2 mb-3">
    <h3 className="text-[15px] font-semibold text-[#2A1E17]">My Education</h3>

    <button
      onClick={() => setActiveModal("education")}
      className="!border border-[#6A3EA1] text-[#6A3EA1] text-[12px] px-3 py-[3px] rounded-full"
    >
      Edit Education
    </button>
  </div>

  <p className="text-[13px] font-semibold text-[#3A2A1A] mb-1">
    Master in Design | MIT
  </p>

  <p className="text-[11px] text-[#777] mb-3">
    2019 – 2021
  </p>

  <p className="text-[12px] leading-[18px] text-[#3A2A1A]">
    Sri Ramakrishna College Of Arts and Science Nava India Lakshmi mill Road
    Coimbatore.
  </p>

  <p className="text-center mt-4 text-[#6A3EA1] text-[12px] font-medium cursor-pointer">
    View All
  </p>

</div>



{/* ================= GLOBAL POPUP ================= */}
{activeModal === "education" && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 block lg:hidden">
    <div className="bg-white w-[380px] sm:w-[420px] rounded-[16px] p-6 shadow-xl">

      {/* University Name */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" fill="none" stroke="#555" strokeWidth="1.5">
          <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
        <input
          placeholder="University Name"
          className="w-full h-[44px] !border border-gray-300 rounded-full pl-11 pr-4 text-[14px] outline-none"
        />
      </div>

      {/* Field of Study */}
      <div className="relative mb-5">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" fill="none" stroke="#555" strokeWidth="1.5">
          <path d="M4 5h6a4 4 0 0 1 4 4v10a4 4 0 0 0-4-4H4z" />
          <path d="M20 5h-6a4 4 0 0 0-4 4v10a4 4 0 0 1 4-4h6z" />
        </svg>
        <input
          placeholder="Enter Field of study"
          className="w-full h-[44px] !border border-gray-300 rounded-full pl-11 pr-4 text-[14px] outline-none"
        />
      </div>

      {/* Dates */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 h-[40px] !border border-gray-300 rounded-full text-[13px] text-gray-500 flex items-center justify-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="1.5">
            <rect x="3" y="4" width="14" height="14" rx="2" />
            <path d="M3 8h14M7 2v4M13 2v4" />
          </svg>
          Start Date
        </button>

        <button className="flex-1 h-[40px] !border border-gray-300 rounded-full text-[13px] text-gray-500 flex items-center justify-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#555" strokeWidth="1.5">
            <rect x="3" y="4" width="14" height="14" rx="2" />
            <path d="M3 8h14M7 2v4M13 2v4" />
          </svg>
          End Date
        </button>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveModal(null)}
          className="flex-1 h-[40px] bg-[#51218F] text-white rounded-full text-[14px] font-semibold"
        >
          Save
        </button>

        <button
          onClick={() => setActiveModal(null)}
          className="flex-1 h-[40px] !border border-gray-400 rounded-full text-[14px] font-semibold"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}



        

</div>


<div className="-mx-4">
  <Footer />
</div>
</div>
</div>
 </div> 

  );
}


















   












