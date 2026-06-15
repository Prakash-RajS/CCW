import React from 'react'
import Gro from "../../assets/Landing/Gro.png";
import { useNavigate } from "react-router-dom";

const Grow = () => {
  const navigate = useNavigate();

  return (
    <div id="grow-section">
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
            -ml-1 mt-22
            w-[80px] lg:w-[287px] xl:w-[300px] 2xl:w-[600px]
            lg:top-[199px] lg:left-[28px] 2xl:top-[50px] 2xl:left-[38px]
            items-start
            text-left
          "
        >
          {/* Heading - Fixed with clamp only */}
         <h3
  className="
    milonga-regular
    font-normal

    /* <1200px */
    max-[1200px]:text-[clamp(18px,5vw,70px)]

    /* <375px */
    max-[375px]:text-[12px]
    max-[375px]:leading-[105%]
    max-[375px]:tracking-[0px]

    text-[clamp(24px,6vw,118px)]
    leading-[110%]
    tracking-[0.5px]
    text-[#3D1768]
    whitespace-nowrap
  "
>
  Build.
  <br />
  Collaborate.
  <br />
  Grow.
</h3>

          {/* Paragraph - Fixed with clamp only */}
         <p
  className="
    font-kokoro font-normal capitalize

    /* <425px */
    max-[450px]:text-[7px]
    max-[450px]:leading-[115%]
    max-[450px]:max-w-[120px]

    text-[clamp(10px,2.5vw,24px)]
    leading-[130%]
    text-[#3D1768]
    max-w-[210px] lg:max-w-none
  "
>
  Turn idea to reality with creator who match your vision anytime anywhere
</p>
          {/* Button - Fixed with consistent sizing */}
         <button
  onClick={() => navigate("/signup", { state: { returnTo: 'grow-section' } })}
  className="
    mt-1
    cursor-pointer
    font-kokoro font-normal
    flex items-center justify-center
    text-white
    bg-[#4B1E78]
    shadow-[0_4px_14px_rgba(105,59,147,0.4)]
    transition-all duration-300
    hover:bg-[#3D1768]
    hover:shadow-[0_6px_20px_rgba(105,59,147,0.6)]

    /* <450px */
    max-[450px]:min-w-[60px]
    max-[450px]:h-[18px]
    max-[450px]:text-[7px]
    max-[450px]:rounded-[4px]
    max-[450px]:px-1.5

    /* Responsive button sizing */
    min-w-[82px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[120px] xl:min-w-[164px] 2xl:min-w-[200px]
    h-[24px] sm:h-[36px] md:h-[40px] lg:h-[32px] xl:h-[42px] 2xl:h-[55px]
    text-[10px] sm:text-[12px] md:text-[14px] lg:text-[14px] xl:text-[18px] 2xl:text-[24px]
    rounded-[6px] sm:rounded-[8px] lg:rounded-[8px] xl:rounded-[10px] 2xl:rounded-[12px]
    px-2 sm:px-3 md:px-4 lg:px-3 xl:px-5 2xl:px-6
  "
>
  Join Talenta
</button>
        </div>
      </section>
    </div>
  )
}

export default Grow