import React, { useState } from "react";
import TopBanner from "../../assets/AfterSign/HomeBg.png";
import UserImg from "../../assets/Landing/user.png"; 
import BgDiscover from "../../assets/Landing/discover-bg.png"; 
import Img1 from "../../assets/Landing/imgf1.png";
import Img2 from "../../assets/Landing/imgf2.png";
import Img3 from "../../assets/Landing/imgf3.png";
import Footer from "../../component/Footer";
import Header from "../../component/Header";

export default function Finder() {
  const [open, setOpen] = useState(null);
const [niche, setNiche] = useState("Niche");
const [audience, setAudience] = useState("Audience");
const [location, setLocation] = useState("Location");

  return (
      <div className="relative w-full bg-white overflow-hidden">

    {/* ====================================================== */}
    {/* ================= DESKTOP / LAPTOP ================= */}
    {/* ====================================================== */}

    <div className="hidden lg:block">

      <div className="relative w-full bg-white overflow-hidden">

      {/* ================= HERO ================= */}
     <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>
      <header className="relative w-full h-[582px]">
        <img src={TopBanner} className="absolute inset-0 w-full h-full object-cover blur-[1px]" />
<div className="relative w-full overflow-hidden flex justify-center z-30">

  {/* Scaling Container */}
  <div
    className="origin-top"
    style={{
      transform: `scale(${Math.min(window.innerWidth / 1024, 1)})`,
    }}
  >
    
  </div>
</div>


        <div className="absolute inset-0 flex flex-col items-center text-center pt-[230px] text-white">
          <h1 className="w-[1024px] font-milonga text-[48px] leading-[60px]">
            Find the right collaborator for your <br /> next projects
          </h1>

          <p className="mt-4 w-[717px] font-poppins text-[24px]">
            Search creator by Niche, Location, audience, skills and more
          </p>

          <div className="mt-10 flex gap-5 mlx-auto" style={{ width: "90%", maxWidth: "920px", gap: "20px" }}>
            {/* {["Niche", "Audience", "Location", "Search"].map((item, i) => (
              <div
                key={i}
                className="w-[200px] h-[50px] rounded-[24px] border border-white flex items-center px-2 text-white text-[20px]"
                style={{
                  background: "linear-gradient(90deg, rgba(10,10,10,.5), rgba(11,11,11,.4))",
                }}
              >
                {item === "Search" ? (
                  <input placeholder="Search" className="bg-transparent outline-none w-full" />
                ) : (
                  <select className="bg-transparent outline-none w-full">
                    <option>{item}</option>
                  </select>
                )}
              </div>
            ))} */}
             <div
    className="w-[45%] lg:w-[283px] h-[50px] rounded-[24px] border border-white 
               flex items-center justify-between px-[10px] text-white font-poppins text-[6px] lg:text-[20px] "
    style={{
      background: "linear-gradient(90deg, rgba(10,10,10,0.5) 0%, rgba(11,11,11,0.4) 100%)",
    }}
  >
    <select className="custom-select bg-transparent outline-none w-full text-white">
      <option className="bg-[rgba(61,23,104,1)] ">Niche</option>
      <option className="bg-[rgba(61,23,104,1)] ">Fitness</option>
      <option className="bg-[rgba(61,23,104,1)]" >Fashion</option>
      <option className="bg-[rgba(61,23,104,1)]">Technology</option>
    </select>
  </div>

  {/* 2️⃣ AUDIENCE */}
  <div
    className="w-[45%] lg:w-[283px] h-[50px] rounded-[24px] border border-white 
               flex items-center justify-between px-[20px] text-white font-poppins text-[16px] lg:text-[20px]"
    style={{
      background: "linear-gradient(90deg, rgba(10,10,10,0.5) 0%, rgba(11,11,11,0.4) 100%)",
    }}
  >
    <select className="custom-select bg-transparent outline-none w-full text-white">
      <option className="bg-[rgba(61,23,104,1)]">Audience</option>
      <option className="bg-[rgba(61,23,104,1)]">Teens (13–19)</option>
      <option className="bg-[rgba(61,23,104,1)]">Young Adults (20–30)</option>
      <option className="bg-[rgba(61,23,104,1)]">Adults (31–45)</option>
      <option className="bg-[rgba(61,23,104,1)]">Mature Audience (46+)</option>
    </select>
  </div>

  {/* 3️⃣ LOCATION */}
  <div
    className="w-[45%] lg:w-[283px] h-[50px] rounded-[24px] border border-white 
               flex items-center justify-between px-[20px] text-white  font-poppins text-[16px] lg:text-[20px]"
    style={{
      background: "linear-gradient(90deg, rgba(10,10,10,0.5) 0%, rgba(11,11,11,0.4) 100%)",
    }}
  >
    <select className="custom-select bg-transparent outline-none w-full text-white">
      <option className="bg-[rgba(61,23,104,1)] ">Location</option>
      <option className="bg-[rgba(61,23,104,1)]">India</option>
      <option className="bg-[rgba(61,23,104,1)]">USA</option>
      <option className="bg-[rgba(61,23,104,1)]">UK</option>
    </select>
  </div>

  {/* 4️⃣ SEARCH */}
  <div
    className="w-[45%] lg:w-[283px] h-[50px] rounded-[24px] border border-white 
               flex items-center justify-between px-[20px] text-white font-poppins text-[16px] lg:text-[20px]"
    style={{
      background: "linear-gradient(90deg, rgba(10,10,10,0.5) 0%, rgba(11,11,11,0.4) 100%)",
    }}
  >
    <input
      type="text"
      placeholder="Search"
      className="bg-transparent  outline-none text-white w-full placeholder-white/70"
    />

    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         strokeWidth="2" stroke="white" className="w-5 h-5 lg:w-6 lg:h-6 ml-2">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"/>
    </svg>
  </div>
          </div>
        </div>
      </header>

   
      {/* </section> */} */
       <div className="relative w-full h-[110px] mb-[px] bottom-[60px]">
              {/* Lines */}
             <div className="absolute top-[50px] left-0 w-[50%] h-[2px] bg-gradient-to-r from-[#3D1768] to-[#030303]" />
              <div className="absolute top-[50px] right-0 w-[50%] h-[2px] bg-gradient-to-l from-[#3D1768] to-[#030303]" />
     
            
              <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-[80%] max-w-[510px] h-[45px] bg-white rounded-b-full rounded-t-none !border-b-[2px] !border-l-[2px] !border-r-[2px] !border-t-0 border-[#3D1768] shadow-[0px_8px_18px_rgba(0,0,0,0.25)]"></div>
     
              {/* Button */}
              <button
                className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[90%] max-w-[450px] h-[60px] lg:h-[70px] !border border-[#FFFFFF] font-['PT_Serif'] rounded-full text-white text-[24px] lg:text-[32px] font-normal font-['Poppins'] cursor-pointer flex items-center justify-center shadow-[0px_5px_10px_#757575]"
                style={{
                  background: "linear-gradient(90deg, #3D1768 0%, #030303 100%)",
                }}
              >
                Find collaborator
              </button>
            </div>
                <div className="relative w-full h-[200px] mt-[10px] display-flex justify-center items-center">

<div className="absolute top-[-65px] left-1/2 -translate-x-1/2 text-center w-[900px]">

  <h2
    className="text-[60px] leading-[72px] font-milonga text-[#3D1768]"
  >
    Popular creator Niches
  </h2>

  <p
    className="mt-2 text-[16px] leading-[24px] text-[#3D1768] font-poppins"
  >
    Here we find the popular niche from this you can find what you are
  </p>

</div>

</div>
      {/* ================= DISCOVER ================= */}
      <section className="relative w-full mt-[-88px]">


         <div className="relative w-full bg-black overflow-hidden flex justify-center">

  {/* Scaling Wrapper */}
  <div className="origin-top scale-[0.71] lg:scale-[1]">

    {/* Fixed 1440 Canvas */}
    <div className="relative w-[1440px] h-[760px] overflow-hidden">

      <img
        src={BgDiscover}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute top-[280px] right-[380px] text-right text-white w-[600px]">
        <h1 className="font-milonga text-[52px] leading-[68px]">
          Discover the <br /> beauty around <br /> the world
        </h1>

        <p className="mt-6 text-[#E3B649] text-[18px] leading-[32px]">
          Here are popular categories of the <br />
          person who stress free their life
        </p>
      </div>

    </div>
  </div>
</div>

      <div
  className="absolute left-1/2 top-[640px] -translate-x-1/2 z-30 flex gap-[45px]
             scale-[1] max-[1440px]:scale-[0.71] origin-top"
  style={{ padding: "0 50px" }}
>
{[Img1, Img2, Img3].map((img, i) => (
  <div key={i} className="relative w-[340px]">
    <span className="absolute -top-[42px] text-[#FF5C57] text-[28px] font-bold">
      0{i + 1}
    </span>

    <div className="w-[360px] h-[346px] rounded-[22px] overflow-hidden shadow-xl">
      <img src={img} className="w-full h-full object-cover" />
    </div>
  </div>
))}
</div>
        <div className="w-full h-[260px] bg-white"></div>
      </section>

      <div className="mt-[80px]">
        <Footer />
      </div>

    </div>
    </div>

  {/* ====================================================== */}
{/* ======================= MOBILE ====================== */}
{/* ====================================================== */}

<div className="block lg:hidden w-full overflow-hidden bg-white">

  {/* ================= HERO ================= */}
  <div className="relative w-full h-[460px] text-white">

    <img
      src={TopBanner}
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/50" />

    {/* Content */}
<div className="relative z-[80] flex flex-col items-center text-center pt-[110px] px-5">

      <h1 className="text-[24px] leading-[28px] font-milonga">
        Find the right collaborator for your next projects
      </h1>

      <p className="mt-3 text-[13px] leading-[18px] opacity-90">
        Search creator by Niche, Location, audience, skills and more
      </p>

     {/* Filters */}
<div className="mt-6 w-full space-y-3">

  {/* Niche */}
  <div className="relative">
    <button
      onClick={() => setOpen(open === "niche" ? null : "niche")}
      className="w-full h-[44px] rounded-full bg-white text-black px-4 flex items-center justify-between"
    >
      <span>{niche}</span>
      <span>▾</span>
    </button>

    {open === "niche" && (
      <div className="absolute top-[48px] left-0 w-full rounded-[16px] bg-[#3D1768] overflow-hidden shadow-xl z-50">
        {["Niche", "Fitness", "Fashion", "Technology"].map((item) => (
          <div
            key={item}
            onClick={() => { setNiche(item); setOpen(null); }}
            className="px-4 py-2 text-white text-[14px] hover:bg-[#4B167E]"
          >
            {item}
          </div>
        ))}
      </div>
    )}
  </div>

  <div className="flex gap-3">

    {/* Audience */}
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(open === "audience" ? null : "audience")}
        className="w-full h-[44px] rounded-full bg-white text-black px-4 flex items-center justify-between"
      >
        <span>{audience}</span>
        <span>▾</span>
      </button>

      {open === "audience" && (
        <div className="absolute top-[48px] left-0 w-full rounded-[16px] bg-[#3D1768] overflow-hidden shadow-xl z-50">
          {["Audience", "Teens (13–19)", "Young Adults (20–30)", "Adults (31–45)", "Mature Audience (46+)"].map((item) => (
            <div
              key={item}
              onClick={() => { setAudience(item); setOpen(null); }}
              className="px-4 py-2 text-white text-[14px] hover:bg-[#4B167E]"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Location */}
    <div className="relative flex-1">
      <button
        onClick={() => setOpen(open === "location" ? null : "location")}
        className="w-full h-[44px] rounded-full bg-white text-black px-4 flex items-center justify-between"
      >
        <span>{location}</span>
        <span>▾</span>
      </button>

      {open === "location" && (
        <div className="absolute top-[48px] left-0 w-full rounded-[16px] bg-[#3D1768] overflow-hidden shadow-xl z-50">
          {["Location", "India", "USA", "UK"].map((item) => (
            <div
              key={item}
              onClick={() => { setLocation(item); setOpen(null); }}
              className="px-4 py-2 text-white text-[14px] hover:bg-[#4B167E]"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  {/* Search stays same */}
  <div
    className="w-full h-[44px] rounded-full flex items-center justify-between px-5 shadow-md"
    style={{ background: "linear-gradient(90deg, #4B167E 0%, #8A2BE2 100%)" }}
  >
    <input
      placeholder="Search"
      className="flex-1 bg-transparent outline-none text-white text-[14px] placeholder-white/80"
    />
    <div className="w-[28px] h-[28px] flex items-center justify-center rounded-full bg-white">
      🔍
    </div>
  </div>

</div>

    </div>
  </div>

{/* ================= FIND BUTTON ================= */}
<div className="relative w-full mt-[-30px] flex justify-center z-10 overflow-visible">

  <div className="absolute top-[41px] left-0 w-[45%] h-[2px] bg-gradient-to-r from-[#8A2BE2] via-[#5B2D8B] to-transparent"></div>
  <div className="absolute top-[41px] right-0 w-[45%] h-[2px] bg-gradient-to-l from-[#8A2BE2] via-[#5B2D8B] to-transparent"></div>

  {/* Outer White Shell */}
  <div className="absolute bottom-[-12px] w-[54%] h-[66px] rounded-full bg-white shadow-[0_12px_26px_rgba(0,0,0,0.45)]"></div>

  {/* White Border Ring */}
  <div className="absolute bottom-[-6px] w-[50%] h-[56px] rounded-full !border border-white"></div>

  {/* Main Gradient Button */}
  <button
    className="relative w-[48%] h-[50px] rounded-full text-white text-[18px] font-medium tracking-wide shadow-[0_8px_18px_rgba(0,0,0,0.45)]"
    style={{
      background: "linear-gradient(90deg, #4B167E 0%, #8A2BE2 100%)",
    }}
  >
    Find collaborator
  </button>
</div>



{/* ================= POPULAR NICHES ================= */}
<div className="mt-[30px] text-center px-6">

  <h2
    className="text-[21px] font-milonga "
    style={{
      color: "#3D1768",
      textShadow: "0px 3px 6px rgba(61, 23, 104, 0.45)",
    }}
  >
    Popular creator Niches
  </h2>

  <p className="mt-2 text-[12px] text-[#3D1768] leading-[18px]">
    Here we find the popular niche from this you can find what you are
  </p>

</div>

{/* ================= MOBILE DISCOVER ================= */}
<div className="block lg:hidden relative w-full  overflow-visible mt-5">

  {/* Background Area */}
  <div className="relative w-full h-[420px] bg-black overflow-visible">

    <img
      src={BgDiscover}
      alt="discover"
      className="w-full h-auto object-contain"
    />

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/60" />

    {/* Top Right Text */}
    <div className="absolute bottom-[148px] right-[71px] text-right text-white z-10">
      <h2 className="font-milonga text-[22px] leading-[28px]">
        Discover the beauty <br /> around the world
      </h2>

      <p className="mt-[6px] text-[#E3B649] text-[13px] leading-[18px]">
        Here are popular categories of the <br />
        person who stress free their life
      </p>
    </div>

    {/* ================= MOBILE DISCOVER CARDS ================= */}
    <div className="absolute bottom-[-52px] left-0 w-full px-[14px] z-20">

      <div className="grid grid-cols-3 gap-[10px]">

        {[Img1, Img2, Img3].map((img, i) => (
          <div key={i} className="relative">

            <span className="absolute -top-[28px] left-[6px] text-[#FF5C57] text-[20px] font-bold">
              0{i + 1}
            </span>

            <div className="w-full h-[110px] rounded-[14px] overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.55)]">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        ))}

      </div>
    </div>

  </div>

</div>

{/* Footer spacing */}
<div className="mt-[80px]">
  <Footer />
</div>



</div>


  </div>
  );
}





