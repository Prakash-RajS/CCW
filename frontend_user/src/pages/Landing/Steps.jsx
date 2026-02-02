import React, { useEffect, useRef } from 'react'
import Steplogo1 from "../../assets/Landing/Steplogo1.png";
import Steplogo2 from "../../assets/Landing/Steplogo2.png";
import Steplogo3 from "../../assets/Landing/Steplogo3.png";
import Steplogo4 from "../../assets/Landing/Steplogo4.png";
import Content1 from "../../assets/Landing/Content1.jpg";
import Content2 from "../../assets/Landing/Content2.jpg";

const Steps = () => {
  const stepRefs = useRef([]);
  const hasAnimatedRef = useRef([]); // Track which steps have been animated

  useEffect(() => {
    // Initialize the tracking array
    hasAnimatedRef.current = new Array(stepRefs.current.length).fill(false);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = stepRefs.current.indexOf(entry.target);
          
          if (entry.isIntersecting) {
            // Reset animation for each scroll into view
            entry.target.classList.remove('step-visible');
            // Force reflow to restart animation
            void entry.target.offsetWidth;
            // Add the animation class
            entry.target.classList.add('step-visible');
            hasAnimatedRef.current[index] = true;
          } else {
            // Remove animation when out of view
            entry.target.classList.remove('step-visible');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px 0px 50px 0px'
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <>
      <style >{`
        .step-card {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
          transition: transform 0.7s ease-out, opacity 0.7s ease-out;
        }
        
        /* Initial hidden states */
        .step-card:nth-child(odd) {
          transform: translateX(-100px);
          opacity: 0;
        }
        
        .step-card:nth-child(even) {
          transform: translateX(100px);
          opacity: 0;
        }
        
        /* Visible states */
        .step-card.step-visible:nth-child(odd) {
          transform: translateX(0);
          opacity: 1;
        }
        
        .step-card.step-visible:nth-child(even) {
          transform: translateX(0);
          opacity: 1;
        }
        
        /* Reset animation when leaving viewport */
        .step-card:not(.step-visible):nth-child(odd) {
          transform: translateX(-100px);
          opacity: 0;
          transition: transform 0.7s ease-out, opacity 0.7s ease-out;
        }
        
        .step-card:not(.step-visible):nth-child(even) {
          transform: translateX(100px);
          opacity: 0;
          transition: transform 0.7s ease-out, opacity 0.7s ease-out;
        }
        
        .content-number {
          opacity: 1 !important;
        }
        
        .content-text {
          opacity: 1 !important;
        }
      `}</style>
      
    <section className="w-full flex flex-col items-center justify-start pt-[12px] md:pt-[40px] px-4 relative overflow-hidden">


<div
  className="
    w-full
    max-w-[1200px]
    mb-12
    px-4
  "
>
  <div
    className="
      flex
      flex-col
      gap-2

      transform
      -translate-y-5      /* 📱 moved MORE up */
      md:translate-y-0    /* 🖥 desktop unchanged */
    "
  >
    <h2 className="poppins-font font-bold text-3xl md:text-4xl lg:text-[32px] leading-[140%] bg-gradient-to-r from-[#51218F] to-[#170929] bg-clip-text text-transparent">
      Steps to get started
    </h2>

    <p className="font-inter font-normal text-base md:text-lg leading-[140%] text-[#030303] max-w-[771px]">
      Here are the steps to follow in the creative collaborator
    </p>
  </div>
</div>



        {/* Container for the 4 purple gradient divs */}
        <div className="flex flex-col gap-6 mt-8 w-full max-w-[1278px] px-4">
          
{/* Div 1 - Step 1 */}
<div 
  ref={(el) => stepRefs.current[0] = el}
  className="
    step-card
    relative
    rounded-[100px]
    mx-auto

    /* 📱 MOBILE (SAME AS CARD 2) */
    w-[280px]
    h-[86px]

    /* 🖥 DESKTOP (UNCHANGED) */
    md:w-full
    md:h-[161px]
  "
  style={{
    background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)',
  }}
>

  {/* Step logo */}
  <div 
    className="
      absolute
      opacity-100

      /* 📱 MOBILE */
      w-[32px]
      h-[32px]
      left-[14px]
      top-1/2
      -translate-y-1/2

      /* 🖥 DESKTOP */
      md:w-[80px]
      md:h-[80px]
      md:left-[78px]
      md:top-[40.5px]
      md:translate-y-0
    "
  >
    <img 
      src={Steplogo1}
      alt="Step 1"
      className="w-full h-full object-contain"
    />
  </div>

{/* Number "1" */}
<div 
  className="
    content-number
    absolute
    font-outfit
    font-bold
    flex
    items-center
    justify-center

    /* 📱 MOBILE — UNCHANGED */
    text-[56px]
    left-[60px]
    top-1/2
    -translate-y-1/2
    w-[44px]
    h-[70px]

    /* 🖥 DESKTOP — STAYS INSIDE CARD */
    md:text-[227px]
    md:left-[196px]
    md:top-1/2
    md:-translate-y-1/2
    md:w-[86px]
    md:h-[200px]
  "
  style={{
    backgroundImage: `url(${Content1})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }}
>
  1
</div>


  {/* Content */}
  <div
    className="
      absolute
      flex
      flex-col
      justify-center

      /* 📱 MOBILE */
      left-[115px]
      right-[14px]
      gap-[2px]

      /* 🖥 DESKTOP */
      md:left-[348px]
      md:w-[774px]
      md:gap-[6px]
    "
    style={{
      top: '50%',
      transform: 'translateY(-50%)'
    }}
  >
    <h3
      className="
        poppins-font
        font-semibold
        text-white

        /* 📱 MOBILE */
        text-[13px]
        leading-[16px]

        /* 🖥 DESKTOP */
        md:text-[32px]
        md:leading-[140%]
      "
    >
      Create your Profile
    </h3>

    <p
      className="
        font-inter
        text-white

        /* 📱 MOBILE */
        text-[9px]
        leading-[13px]

        /* 🖥 DESKTOP */
        md:text-[20px]
        md:leading-[140%]
      "
    >
      Sign up as a Creator or Talent and build your professional profile showcasing your skills, portfolio, and interests.
    </p>
  </div>

</div>


{/* Div 2 - Step 2 */}
<div 
  ref={(el) => stepRefs.current[1] = el}
  className="
    step-card
    relative
    rounded-[100px]
    mx-auto

    /* 📱 MOBILE (EXTRA SMALL) */
    w-[280px]
    h-[86px]

    /* 🖥 DESKTOP (UNCHANGED) */
    md:w-full
    md:h-[161px]
  "
  style={{
    background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)',
    transform: 'rotate(-180deg)'
  }}
>

  {/* Step icon */}
  <div 
    className="
      absolute
      opacity-100

      /* 📱 MOBILE */
      w-[36px]
      h-[36px]
      left-[20px]
      top-1/2
      -translate-y-1/2

      /* 🖥 DESKTOP */
      md:w-[80px]
      md:h-[80px]
      md:left-[78px]
      md:top-[40.5px]
      md:translate-y-0
    "
    style={{ transform: 'rotate(180deg)' }}
  >
    <img
      src={Steplogo2}
      alt="Step 2"
      className="w-full h-full object-contain"
    />
  </div>

 {/* Number 2 */}
<div 
  className="
    content-number
    absolute
    font-outfit
    font-bold
    flex
    items-center
    justify-center

    /* 📱 MOBILE — NO CHANGE */
    text-[64px]
    left-[78px]
    top-1/2
    -translate-y-1/2
    w-[50px]
    h-[80px]

    /* 🖥 DESKTOP — STAYS INSIDE CARD */
    md:text-[223px]
    md:left-[196px]
    md:top-1/2
    md:-translate-y-1/2
    md:w-[126px]
    md:h-[200px]
  "
  style={{
    backgroundImage: `url(${Content2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    transform: 'rotate(180deg)'
  }}
>
  2
</div>

  {/* Content */}
  <div
    className="
      absolute
      flex
      flex-col
      justify-center

      /* 📱 MOBILE */
      left-[145px]
      right-[20px]
      gap-[2px]

      /* 🖥 DESKTOP */
      md:left-[348px]
      md:w-[774px]
      md:gap-[6px]
    "
    style={{
      top: '50%',
      transform: 'translateY(-50%) rotate(180deg)'
    }}
  >
    <h3
      className="
        poppins-font
        font-semibold
        text-white
        text-right

        /* 📱 MOBILE */
        text-[14px]
        leading-[18px]

        /* 🖥 DESKTOP */
        md:text-[32px]
        md:leading-[140%]
      "
    >
      Discover and connect
    </h3>

    <p
      className="
        font-inter
        text-white
        text-right

        /* 📱 MOBILE */
        text-[10px]
        leading-[14px]

        /* 🖥 DESKTOP */
        md:text-[20px]
        md:leading-[140%]
      "
    >
      Explore creators, talents, and ongoing projects that match your interests.
    </p>
  </div>
</div>


 {/* Div 3 - Step 3 */}
<div 
  ref={(el) => stepRefs.current[2] = el}
  className="
    step-card
    relative
    rounded-[100px]
    mx-auto

    /* 📱 MOBILE (SAME AS STEP 2) */
    w-[280px]
    h-[86px]

    /* 🖥 DESKTOP (UNCHANGED) */
    md:w-full
    md:h-[161px]
  "
  style={{
    background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)',
    transform: 'rotate(0deg)'
  }}
>

  {/* Step logo */}
  <div 
    className="
      absolute
      opacity-100

      /* 📱 MOBILE */
      w-[32px]
      h-[32px]
      left-[14px]
      top-1/2
      -translate-y-1/2

      /* 🖥 DESKTOP */
      md:w-[80px]
      md:h-[80px]
      md:left-[78px]
      md:top-[40.5px]
      md:translate-y-0
    "
  >
    <img 
      src={Steplogo3} 
      alt="Step 3"
      className="w-full h-full object-contain"
    />
  </div>

{/* Number "3" */}
<div 
  className="
    content-number
    absolute
    font-outfit
    font-bold
    flex
    items-center
    justify-center

    /* 📱 MOBILE — UNCHANGED */
    text-[56px]
    left-[60px]
    top-1/2
    -translate-y-1/2
    w-[44px]
    h-[70px]

    /* 🖥 DESKTOP — STAYS INSIDE CARD */
    md:text-[223px]
    md:left-[177px]
    md:top-1/2
    md:-translate-y-1/2
    md:w-[126px]
    md:h-[200px]
  "
  style={{
    backgroundImage: `url(${Content1})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  }}
>
  3
</div>


  {/* Content */}
  <div
    className="
      absolute
      flex
      flex-col
      justify-center

      /* 📱 MOBILE */
      left-[115px]
      right-[14px]
      gap-[2px]

      /* 🖥 DESKTOP */
      md:left-[358px]
      md:w-[774px]
      md:gap-[6px]
    "
    style={{
      top: '50%',
      transform: 'translateY(-50%)'
    }}
  >
    <h3
      className="
        poppins-font
        font-semibold
        text-white

        /* 📱 MOBILE */
        text-[13px]
        leading-[16px]

        /* 🖥 DESKTOP */
        md:text-[32px]
        md:leading-[140%]
      "
    >
      Collaborate Seamlessly
    </h3>

    <p
      className="
        font-inter
        text-white

        /* 📱 MOBILE */
        text-[9px]
        leading-[13px]

        /* 🖥 DESKTOP */
        md:text-[20px]
        md:leading-[140%]
      "
    >
      Use the shared workspace to manage tasks, share files, communicate, and keep your collaboration organized in one place.
    </p>
  </div>
</div>

 {/* Div 4 - Step 4 */}
<div 
  ref={(el) => stepRefs.current[3] = el}
  className="
    step-card
    relative
    rounded-[100px]
    mx-auto

    /* 📱 MOBILE (SAME AS CARD 2) */
    w-[280px]
    h-[86px]

    /* 🖥 DESKTOP (UNCHANGED) */
    md:w-full
    md:h-[161px]
  "
  style={{
    background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)',
    transform: 'rotate(-180deg)'
  }}
>

  {/* Step logo */}
  <div 
    className="
      absolute
      opacity-100

      /* 📱 MOBILE */
      w-[32px]
      h-[32px]
      left-[14px]
      top-1/2
      -translate-y-1/2

      /* 🖥 DESKTOP */
      md:w-[80px]
      md:h-[80px]
      md:left-[78px]
      md:top-[40.5px]
      md:translate-y-0
    "
    style={{ transform: 'rotate(180deg)' }}
  >
    <img 
      src={Steplogo4} 
      alt="Step 4"
      className="w-full h-full object-contain"
    />
  </div>

{/* Number "4" */}
<div 
  className="
    content-number
    absolute
    font-outfit
    font-bold
    flex
    items-center
    justify-center

    /* 📱 MOBILE — UNCHANGED */
    text-[56px]
    left-[60px]
    top-1/2
    -translate-y-1/2
    w-[44px]
    h-[70px]

    /* 🖥 DESKTOP — STAYS INSIDE CARD */
    md:text-[223px]
    md:left-[177px]
    md:top-1/2
    md:-translate-y-1/2
    md:w-[126px]
    md:h-[200px]
  "
  style={{
    backgroundImage: `url(${Content2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    transform: 'rotate(180deg)'
  }}
>
  4
</div>


  {/* Content */}
  <div
    className="
      absolute
      flex
      flex-col
      justify-center

      /* 📱 MOBILE */
      left-[115px]
      right-[14px]
      gap-[2px]

      /* 🖥 DESKTOP */
      md:left-[348px]
      md:w-[774px]
      md:gap-[6px]
    "
    style={{
      top: '50%',
      transform: 'translateY(-50%) rotate(180deg)'
    }}
  >
    <h3
      className="
        poppins-font
        font-semibold
        text-white
        text-right

        /* 📱 MOBILE */
        text-[13px]
        leading-[16px]

        /* 🖥 DESKTOP */
        md:text-[32px]
        md:leading-[140%]
      "
    >
      Track and Grow
    </h3>

    <p
      className="
        font-inter
        text-white
        text-right

        /* 📱 MOBILE */
        text-[9px]
        leading-[13px]

        /* 🖥 DESKTOP */
        md:text-[20px]
        md:leading-[140%]
      "
    >
      Monitor project progress, manage fair revenue splits, and build your reputation as you complete successful collaborations.
    </p>
  </div>
</div>

        </div>
      </section>
    </>
  )
}

export default Steps