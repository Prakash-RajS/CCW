import React from 'react'
import { useNavigate } from "react-router-dom";
import Skills from "../../assets/Landing/Skills.png";
import Group1 from "../../assets/Landing/Group1.png";
import Group2 from "../../assets/Landing/Group2.png";
import Group3 from "../../assets/Landing/Group3.png";
import Group4 from "../../assets/Landing/Group4.png";
import Group5 from "../../assets/Landing/Group5.png";
import Group6 from "../../assets/Landing/Group6.png";

const Features = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full h-[800px] flex flex-col items-center justify-start pt-[40px] px-4 relative overflow-hidden">
      
      
      
      <div className="w-full max-w-[1200px] mb-12 px-4">
        <div className="flex flex-col gap-2">
<h2 className="
  poppins-font font-bold
  text-xl sm:text-2xl md:text-4xl lg:text-[32px]
  leading-[140%]
  bg-gradient-to-r from-[#51218F] to-[#170929]
  bg-clip-text text-transparent
">
  Key features
</h2>

<p className="
  font-inter font-normal
  text-sm sm:text-base md:text-lg
  leading-[140%]
  text-[#030303]
  max-w-[771px]
">
  Here are the steps to follow in the creative collaborator
</p>

        </div>
      </div>

<div
  className="
    relative

    /* MOBILE — allow content to show */
    w-full
    min-h-[500px]
    overflow-visible
    px-4

    /* DESKTOP — UNCHANGED */
    lg:w-[1308px]
    lg:h-[418px]
    lg:px-0

    -mt-8
    mx-auto
  "
>

{/* Top Center */}
<div
  className="
    relative
    w-full
    min-h-[220px]
    px-4
    left-0
    translate-x-0
    top-[-32px]

    /* DESKTOP — UNCHANGED */
    lg:w-[503.58px]
    lg:h-[180px]
    lg:left-1/2
    lg:-translate-x-1/2
    lg:-translate-x-80
    lg:top-0

    flex flex-col
    items-center
    justify-center
  "
>

  {/* Heading + Highlight Wrapper */}
  <div className="relative flex justify-center">

    {/* H3 Heading */}
    <h3 
      className="
        poppins-font font-semibold
        text-[16px] sm:text-[24px] lg:text-[28px]
        leading-[135%]
        text-center
        mb-1
        relative z-10
      "
      style={{
        background: 'linear-gradient(90deg, #170929 0%, #170929 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      Start a project
    </h3>

{/* Highlight under heading */}
<div
  className="absolute hidden sm:block"
  style={{
    width: "105px",
    height: "3px",
    bottom: "-2px",              /* 👈 moved UP a little more */
    left: "50%",
    transform: "translateX(-50%) scaleY(0.3)",
    background: "#3D1768",
    borderRadius: "50%",
    filter: "blur(4px)",
    opacity: 0.8,
    zIndex: 0,
  }}
></div>


  </div>





  {/* Paragraph */}
  <p
    className="
      font-inter font-medium
      text-[11px] sm:text-[16px] lg:text-[18px]   /* 👈 mobile reduced */
      leading-[135%]
      text-center
      text-[#030303]
      mb-3
      max-w-[420px]
      z-10
    "
  >
    Creators can easily launch new projects, invite collaborators, and manage every stage from idea to completion with transparent workflows.
  </p>

  {/* Button */}
  <button
    onClick={() => navigate('/login')}
    className="
      w-[132px] sm:w-[176px]
      h-[30px] sm:h-[39px]
      rounded-[12px]
      text-[12px] sm:text-[14px]   /* 👈 mobile text reduced */
      text-white
      font-medium
      poppins-font
      z-10
      transition-all duration-300
      hover:scale-105 hover:shadow-lg
      cursor-pointer
    "
    style={{
      background: 'radial-gradient(50% 50% at 50% 50%, #693B93 0%, #3D1768 100%)',
    }}
  >
    Create a project
  </button>
</div>




{/* Bottom Left */}
<div
  className="
    absolute
    left-0 sm:left-0
    bottom-[180px] sm:bottom-[40px]

    bg-transparent sm:bg-white
    px-0 sm:px-8
    py-0 sm:py-4

    text-[13px] sm:text-base   /* 👈 slightly increased on mobile */

    flex flex-col
    justify-center
  "
>





{/* H3 Heading */}
<h3 
  className="
    poppins-font font-semibold
    text-[12.5px] sm:text-[28px]
    leading-[115%] sm:leading-[140%]
    mb-2 sm:mb-2
    relative

    -translate-y-2 sm:translate-y-0   /* 👈 VISIBLE move up */
  "
  style={{
    background: 'linear-gradient(90deg, #170929 0%, #170929 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}
>
  <span className="block sm:inline">Collaboration</span>
  <span className="block sm:inline">Workspace</span>

  <div
    className="absolute hidden sm:block"
    style={{
      width: "105px",
      height: "3px",
      top: "40px",
      left: "0",
      transform: "scaleY(0.3)",
      background: "#3D1768",
      borderRadius: "50%",
      filter: "blur(4px)",
      opacity: 0.8,
    }}
  ></div>
</h3>



{/* Paragraph */}
<p
  className="
    font-inter font-medium
    text-[11px] sm:text-[18px]      /* desktop unchanged */
    leading-[130%] sm:leading-[140%]
    text-[#030303]
    mb-1 sm:mb-4
  "
>
  {/* Mobile: block → more lines | Desktop: block groups = 4 lines */}
  <span className="block sm:block">Manage your projects</span>
  <span className="block sm:block">in a shared space</span>
  <span className="block sm:block">where teams can chat, share files,</span>
  <span className="block sm:block">assign tasks, and track progress</span>
  <span className="block sm:hidden">all in one organized</span>
  <span className="block sm:hidden">dashboard.</span>
</p>






 {/* Button */}
<button
  onClick={() => navigate('/login')}
  className="
    w-[90px] sm:w-[176px]
    h-[25px] sm:h-[39px]
    rounded-[6px] sm:rounded-[12px]
    text-[9px] sm:text-[14px]
    text-white font-medium poppins-font
    transition-all duration-300
    hover:scale-105 hover:shadow-lg
    cursor-pointer

    translate-y-8 sm:translate-y-0   /* 👈 MORE DOWN on mobile */
  "
  style={{
    background: 'radial-gradient(50% 50% at 50% 50%, #693B93 0%, #3D1768 100%)',
  }}
>
  Start collaborating
</button>


</div>



{/* Bottom Right */}
<div
  className="
    absolute
    right-[-8px] sm:right-0
    bottom-[150px] sm:bottom-[40px]   /* 👈 moved DOWN on mobile */

    bg-transparent sm:bg-white
    pl-4 sm:pl-0
    px-0 sm:px-8
    py-0 sm:py-6

    flex flex-col
    justify-center items-start

    sm:-mr-2
  "
>





{/* H3 Heading */}
<h3 
  className="
    poppins-font font-semibold
    text-[13px] sm:text-[28px]
    leading-[120%] sm:leading-[140%]
    mb-2
    relative

    text-right sm:text-left     /* mobile right, desktop left */
    self-end sm:self-auto       /* 👈 start from right side on mobile */
    sm:-ml-2
  "
  style={{
    background: 'linear-gradient(90deg, #170929 0%, #170929 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}
>
  {/* Mobile: 2 lines | Desktop: normal */}
  <span className="block sm:inline">Revenue Splits</span>
  <span className="block sm:inline">& Payments</span>

  {/* Oval shadow */}
  <div
    className="absolute hidden sm:block"
    style={{
      width: "105px",
      height: "3px",
      top: "40px",
      left: "0%",
      transform: "scaleY(0.3)",
      background: "#3D1768",
      borderRadius: "50%",
      filter: "blur(4px)",
      opacity: 0.8,
    }}
  ></div>
</h3>





{/* Paragraph */}
<p
  className="
    font-inter font-medium
    text-[10px] sm:text-[15px]      /* 👈 reduced text size */
    leading-[130%] sm:leading-[140%]
    text-[#030303]
    mb-3 sm:mb-4

    text-right sm:text-left         /* mobile right, desktop left */
  "
>
  {/* Desktop (exactly 4 lines) */}
  <span className="block sm:block">Automate revenue sharing based on</span>
  <span className="block sm:block">pre-agreed splits. Get paid securely</span>
  <span className="block sm:block">through integrated payment systems,</span>
  <span className="block sm:block">with transparent tracking of transactions.</span>

  {/* Mobile-only extra lines */}
  <span className="block sm:hidden">with complete transparency</span>
  <span className="block sm:hidden">and secure payment processing</span>
  <span className="block sm:hidden">across all revenue channels</span>
  <span className="block sm:hidden">with real-time insights</span>
  <span className="block sm:hidden">and detailed transaction history</span>
</p>



{/* Button */}
<button
  onClick={() => navigate('/login')}
  className="
    ml-auto sm:ml-0            /* 👈 move right on mobile, center on desktop */
    w-[110px] sm:w-[176px]     /* 👈 smaller width on mobile */
    h-[28px] sm:h-[39px]       /* 👈 smaller height on mobile */
    rounded-[8px] sm:rounded-[12px]
    text-[10px] sm:text-[14px]
    text-white font-medium poppins-font
    transition-all duration-300
    hover:scale-105 hover:shadow-lg
    cursor-pointer
  "
  style={{
    background: 'radial-gradient(50% 50% at 50% 50%, #693B93 0%, #3D1768 100%)',
  }}
>
  Set up payments
</button>



</div>



        {/* side images */}
        <div className="absolute w-[44px] h-[44px] top-[150px] left-[144px]">
  <img 
    src={Group1} 
    alt="icon" 
    className="w-full h-full object-contain"
  />
</div>
  {/* side images */}
        <div className="absolute w-[44px] h-[44px] top-[150px] left-[144px]">
  <img 
    src={Group1} 
    alt="icon" 
    className="w-full h-full object-contain"
  />
</div>

   <div className="absolute w-[44px] h-[44px] top-[110px] left-[1034px]">
  <img 
    src={Group2} 
    alt="icon" 
    className="w-full h-full object-contain drop-shadow-xl"
  />
</div>

 <div className="absolute w-[44px] h-[44px] top-[210px] left-[813px]">
  <img 
    src={Group3} 
    alt="icon" 
    className="w-full h-full object-contain drop-shadow-xl"
  />
</div>

<div
  className="
    absolute
    w-[44px] h-[44px]

    top-[120px] left-[260px]        /* 👈 MOBILE → a little RIGHT */
    sm:top-[410px] sm:left-[358px] /* 👈 DESKTOP unchanged */
  "
>
  <img 
    src={Group4} 
    alt="icon" 
    className="w-full h-full object-contain drop-shadow-xl"
  />
</div>


<div className="absolute w-[44px] h-[44px] top-[440px] left-[942px]">

  <img 
    src={Group5} 
    alt="icon" 
    className="w-full h-full object-contain drop-shadow-xl"
  />
</div>

<div className="absolute w-[44px] h-[44px] top-[380px] left-[737px]">
  <img 
    src={Group6} 
    alt="icon" 
    className="w-full h-full object-contain drop-shadow-xl"
  />
</div>


      </div>
{/* Image moved to top */}
<div
  className="
    w-[280px] h-[200px]
    sm:w-[360px] sm:h-[260px]
    lg:w-[600px] lg:h-[400px]
    mx-auto
    flex items-center justify-center

    /* Mobile & tablet – unchanged */
    mt-[-360px] sm:mt-[-420px]

    /* Desktop – FIXED */
    lg:mt-[-260px]
  "
>
  <img
    src={Skills}
    alt="Skills"
    className="max-w-full max-h-full object-contain"
  />
</div>



    </section>
  )
}

export default Features;