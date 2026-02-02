import React from 'react'
import Gro from "../../assets/Landing/Gro.png";
import { useNavigate } from "react-router-dom";

const Grow = () => {
  const navigate = useNavigate();

  return (
    <section
      className="
        w-full
        h-[351px] lg:h-[832px]
        flex
        items-start
        justify-start
        pt-[32px] lg:pt-[40px]
        px-3
        relative
        overflow-hidden
        bg-cover bg-no-repeat bg-center
      "
      style={{ backgroundImage: `url(${Gro})` }}
    >
      {/* Content container */}
<div
  className="
    relative lg:absolute
    flex flex-col
    gap-2 lg:gap-5

    /* 📱 MOBILE: slightly more left */
    -ml-1 mt-12
    w-[240px]

    /* 💻 DESKTOP UNCHANGED */
    lg:w-[457px] lg:h-[446px]
    lg:top-[149px] lg:left-[28px]

    items-start
    text-left
  "
>

        {/* Heading */}
        <h3
          className="
            lancelot-text font-normal
            text-[22px] sm:text-[48px] lg:text-[80px]
            leading-[105%]
            tracking-[0.5px]
            text-[#3D1768]
          "
        >
          Build.
          <br />
          Collaborate.
          <br />
          Grow.
        </h3>

        {/* Paragraph */}
<p
  className="
    font-kokoro font-normal capitalize
    text-[11px] sm:text-[16px] lg:text-[18px]
    leading-[130%]
    text-[#3D1768]
    max-w-[210px]
    lg:max-w-none
  "
>
  <span className="lg:hidden">
    Turn idea to reality
    <br />
    with creator who match
    <br />
    your vision anytime
    <br />
    anywhere
  </span>

  <span className="hidden lg:inline">
    Turn idea to reality with creator who match your vision anytime anywhere
  </span>
</p>

{/* Button */}
<button
  onClick={() => navigate("/login")}
  className="
    mt-1
    cursor-pointer
    font-kokoro font-normal
    flex items-center justify-center

    /* 📱 MOBILE BUTTON (slightly smaller) */
    w-[112px] h-[30px]
    text-[11px]
    rounded-[7px]

    /* 💻 DESKTOP UNCHANGED */
    sm:w-[180px] sm:h-[46px]
    lg:w-[214px] lg:h-[51.69px]
    sm:text-[16px] lg:text-[18px]

    text-white
    bg-[#4B1E78]
    shadow-[0_4px_14px_rgba(105,59,147,0.4)]
  "
>
  Join Talenta
</button>

      </div>
    </section>
  )
}

export default Grow
