import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom' 
import Steplogo1 from "../../assets/Landing/Steplogo1.png";
import Steplogo2 from "../../assets/Landing/Steplogo2.png";
import Steplogo3 from "../../assets/Landing/Steplogo3.png";
import Steplogo4 from "../../assets/Landing/Steplogo4.png";
import Content1 from "../../assets/Landing/Content1.jpg";
import Content2 from "../../assets/Landing/Content2.jpg";

const Steps = () => {
  const stepRefs = useRef([]);
  const hasAnimatedRef = useRef([]); 
  const navigate = useNavigate(); 

  const handleStepClick = () => {
    navigate('/signup', { state: { returnTo: 'steps-section' } }); // Pass section info
  };

  useEffect(() => {
    hasAnimatedRef.current = new Array(stepRefs.current.length).fill(false);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = stepRefs.current.indexOf(entry.target);
          
          if (entry.isIntersecting) {
            entry.target.classList.remove('step-visible');
            void entry.target.offsetWidth;
            entry.target.classList.add('step-visible');
            hasAnimatedRef.current[index] = true;
          } else {
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
    // Add this wrapper div with the ID
    <div id="steps-section">
      <style>{`
        .step-card {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
          transition: transform 0.7s ease-out, opacity 0.7s ease-out;
          cursor: pointer;
        }
        
        .step-card:hover {
          transform: scale(1.02);
          transition: transform 0.3s ease;
        }
        
        .step-card:nth-child(odd) {
          transform: translateX(-100px);
          opacity: 0;
        }
        
        .step-card:nth-child(even) {
          transform: translateX(100px);
          opacity: 0;
        }
        
        .step-card.step-visible:nth-child(odd) {
          transform: translateX(0);
          opacity: 1;
        }
        
        .step-card.step-visible:nth-child(even) {
          transform: translateX(0);
          opacity: 1;
        }
        
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

        /* Fix for 1024px text hiding */
        @media screen and (min-width: 1024px) and (max-width: 1279px) {
          .step-card .content-number {
            font-size: 180px !important;
            left: 140px !important;
          }
          .step-card .step-content {
            left: 300px !important;
            right: 20px !important;
            width: auto !important;
          }
          .step-card .step-content h3 {
            font-size: 24px !important;
          }
          .step-card .step-content p {
            font-size: 15px !important;
          }
          .step-card .step-icon {
            width: 60px !important;
            height: 60px !important;
            left: 50px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
          .step-card[style*="rotate(-180deg)"] .step-icon {
            transform: translateY(-50%) rotate(180deg) !important;
          }
        }
      `}</style>
      
      <section className="w-full flex flex-col items-center justify-start pt-[12px] md:pt-[40px] px-4 relative overflow-hidden">

        {/* Dynamic proportional max-width added for 2xl */}
        <div className="w-full max-w-[1200px] 2xl:max-w-[83.3vw] mb-1 px-4 mt-8 2xl:mt-[2.2vw] mx-auto">
          <div className="flex flex-col gap-2 2xl:gap-[0.5vw] transform -translate-y-5 md:translate-y-0 text-center md:text-left">
            <h2 className="poppins-font font-bold text-1xl md:text-4xl lg:text-[32px] 2xl:text-[2.2vw] leading-[140%] bg-gradient-to-r from-[#51218F] to-[#170929] bg-clip-text text-transparent md:text-left">
              Steps to get started
            </h2>

            <p className="font-inter font-normal text-[10px] text-base md:text-lg 2xl:text-[1.25vw] leading-[140%] text-[#030303] max-w-[771px] 2xl:max-w-[53.5vw] mx-auto md:mx-0 md:text-left">
              Here are the steps to follow in the creative collaborator
            </p>
          </div>
        </div>

        {/* Dynamic proportional gaps and max-width added for 2xl */}
        <div className="flex flex-col gap-4 2xl:gap-[1.1vw] mt-1 md:mt-4 2xl:mt-[1vw] w-full max-w-[1278px] 2xl:max-w-[88.75vw] px-4">
          
          {/* Div 1 - Step 1 */}
          <div 
            ref={(el) => stepRefs.current[0] = el}
            onClick={handleStepClick}
            className="step-card relative rounded-[50px] md:rounded-[100px] 2xl:rounded-[7vw] mx-auto w-full max-w-[330px] md:max-w-full h-[80px] md:h-[161px] 2xl:h-[11.2vw]"
            style={{ background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)' }}
          >
            {/* Step logo */}
            <div className="step-icon absolute opacity-100 w-[24px] h-[24px] xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px] left-[8px] xs:left-[10px] sm:left-[14px] top-1/2 -translate-y-1/2 md:w-[80px] md:h-[80px] md:left-[78px] md:top-[40.5px] 2xl:w-[5.5vw] 2xl:h-[5.5vw] 2xl:left-[5.4vw] 2xl:top-[2.8vw] md:translate-y-0">
              <img src={Steplogo1} alt="Step 1" className="w-full h-full object-contain" />
            </div>

            {/* Number "1" */}
            <div 
              className="content-number absolute font-outfit font-bold flex items-center justify-center text-[70px] xs:text-[85px] sm:text-[106px] left-[35px] xs:left-[45px] sm:left-[60px] top-1/2 -translate-y-1/2 w-[35px] xs:w-[40px] sm:w-[44px] h-[55px] xs:h-[65px] sm:h-[70px] md:text-[220px] 2xl:text-[15.2vw] md:left-[196px] 2xl:left-[13.6vw] md:top-1/2 md:-translate-y-1/2 md:w-[86px] 2xl:w-[6vw] md:h-[200px] 2xl:h-[13.8vw]"
              style={{
                backgroundImage: `url(${Content1})`, backgroundSize: 'cover', backgroundPosition: 'center', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}
            >
              1
            </div>

            {/* Content */}
            <div className="step-content absolute flex flex-col justify-center left-[80px] xs:left-[95px] sm:left-[115px] right-[8px] xs:right-[10px] sm:right-[14px] gap-[1px] xs:gap-[2px] md:left-[348px] 2xl:left-[24.1vw] md:w-[774px] 2xl:w-[53.7vw] md:gap-[6px] 2xl:gap-[0.4vw]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              <h3 className="poppins-font font-semibold text-white text-[10px] xs:text-[11px] sm:text-[13px] leading-[13px] xs:leading-[14px] sm:leading-[16px] md:text-[32px] 2xl:text-[2.2vw] md:leading-[140%]">
                Create your Profile
              </h3>
              <p className="font-inter text-white text-[7px] xs:text-[8px] sm:text-[9px] leading-[10px] xs:leading-[11px] sm:leading-[13px] md:text-[20px] 2xl:text-[1.4vw] md:leading-[140%]">
                Sign up as a Creator or Talent and build your professional profile showcasing your skills, portfolio, and interests.
              </p>
            </div>
          </div>

          {/* Div 2 - Step 2 */}
          <div 
            ref={(el) => stepRefs.current[1] = el}
            onClick={handleStepClick}
            className="step-card relative rounded-[50px] md:rounded-[100px] 2xl:rounded-[7vw] mx-auto w-full max-w-[330px] md:max-w-full h-[80px] md:h-[161px] 2xl:h-[11.2vw]"
            style={{ background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)', transform: 'rotate(-180deg)' }}
          >
            {/* Step icon */}
            <div className="step-icon absolute opacity-100 w-[26px] h-[26px] xs:w-[30px] xs:h-[30px] sm:w-[36px] sm:h-[36px] left-[12px] xs:left-[15px] sm:left-[20px] top-1/2 -translate-y-1/2 md:w-[80px] md:h-[80px] md:left-[78px] md:top-[40.5px] 2xl:w-[5.5vw] 2xl:h-[5.5vw] 2xl:left-[5.4vw] 2xl:top-[2.8vw] md:translate-y-0" style={{ transform: 'rotate(180deg)' }}>
              <img src={Steplogo2} alt="Step 2" className="w-full h-full object-contain" />
            </div>

            {/* Number 2 */}
            <div 
              className="content-number absolute font-outfit font-bold flex items-center justify-center text-[74px] xs:text-[90px] sm:text-[106px] left-[50px] xs:left-[60px] sm:left-[78px] top-1/2 -translate-y-1/2 w-[40px] xs:w-[45px] sm:w-[50px] h-[65px] xs:h-[70px] sm:h-[80px] md:text-[220px] 2xl:text-[15.2vw] md:left-[196px] 2xl:left-[13.6vw] md:top-1/2 md:-translate-y-1/2 md:w-[126px] 2xl:w-[8.7vw] md:h-[200px] 2xl:h-[13.8vw]"
              style={{
                backgroundImage: `url(${Content2})`, backgroundSize: 'cover', backgroundPosition: 'center', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', transform: 'rotate(180deg)'
              }}
            >
              2
            </div>

            {/* Content */}
            <div className="step-content absolute flex flex-col justify-center left-[105px] xs:left-[120px] sm:left-[145px] right-[12px] xs:right-[15px] sm:right-[20px] gap-[1px] xs:gap-[2px] md:left-[348px] 2xl:left-[24.1vw] md:w-[774px] 2xl:w-[53.7vw] md:gap-[6px] 2xl:gap-[0.4vw]" style={{ top: '50%', transform: 'translateY(-50%) rotate(180deg)' }}>
              <h3 className="poppins-font font-semibold text-white text-right text-[11px] xs:text-[12px] sm:text-[14px] leading-[14px] xs:leading-[15px] sm:leading-[18px] md:text-[32px] 2xl:text-[2.2vw] md:leading-[140%]">
                Discover and connect
              </h3>
              <p className="font-inter text-white text-right text-[7px] xs:text-[8px] sm:text-[10px] leading-[10px] xs:leading-[12px] sm:leading-[14px] md:text-[20px] 2xl:text-[1.4vw] md:leading-[140%]">
                Explore creators, talents, and ongoing projects that match your interests. Send invites or apply to collaborate with others.
              </p>
            </div>
          </div>

          {/* Div 3 - Step 3 */}
          <div 
            ref={(el) => stepRefs.current[2] = el}
            onClick={handleStepClick}
            className="step-card relative rounded-[50px] md:rounded-[100px] 2xl:rounded-[7vw] mx-auto w-full max-w-[330px] md:max-w-full h-[80px] md:h-[161px] 2xl:h-[11.2vw]"
            style={{ background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)', transform: 'rotate(0deg)' }}
          >
            {/* Step logo */}
            <div className="step-icon absolute opacity-100 w-[24px] h-[24px] xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px] left-[8px] xs:left-[10px] sm:left-[14px] top-1/2 -translate-y-1/2 md:w-[80px] md:h-[80px] md:left-[78px] md:top-[40.5px] 2xl:w-[5.5vw] 2xl:h-[5.5vw] 2xl:left-[5.4vw] 2xl:top-[2.8vw] md:translate-y-0">
              <img src={Steplogo3} alt="Step 3" className="w-full h-full object-contain" />
            </div>

            {/* Number "3" */}
            <div 
              className="content-number absolute font-outfit font-bold flex items-center justify-center text-[70px] xs:text-[85px] sm:text-[106px] left-[35px] xs:left-[45px] sm:left-[60px] top-1/2 -translate-y-1/2 w-[35px] xs:w-[40px] sm:w-[44px] h-[55px] xs:h-[65px] sm:h-[70px] md:text-[220px] 2xl:text-[15.2vw] md:left-[177px] 2xl:left-[12.2vw] md:top-1/2 md:-translate-y-1/2 md:w-[126px] 2xl:w-[8.7vw] md:h-[200px] 2xl:h-[13.8vw]"
              style={{
                backgroundImage: `url(${Content1})`, backgroundSize: 'cover', backgroundPosition: 'center', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}
            >
              3
            </div>

            {/* Content */}
            <div className="step-content absolute flex flex-col justify-center left-[80px] xs:left-[95px] sm:left-[115px] right-[8px] xs:right-[10px] sm:right-[14px] gap-[1px] xs:gap-[2px] md:left-[358px] 2xl:left-[24.8vw] md:w-[774px] 2xl:w-[53.7vw] md:gap-[6px] 2xl:gap-[0.4vw]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
              <h3 className="poppins-font font-semibold text-white text-[10px] xs:text-[11px] sm:text-[13px] leading-[13px] xs:leading-[14px] sm:leading-[16px] md:text-[32px] 2xl:text-[2.2vw] md:leading-[140%]">
                Collaborate Seamlessly
              </h3>
              <p className="font-inter text-white text-[7px] xs:text-[8px] sm:text-[9px] leading-[10px] xs:leading-[11px] sm:leading-[13px] md:text-[20px] 2xl:text-[1.4vw] md:leading-[140%]">
                Use the shared workspace to manage tasks, share files, communicate, and keep your collaboration organized in one place.
              </p>
            </div>
          </div>

          {/* Div 4 - Step 4 */}
          <div 
            ref={(el) => stepRefs.current[3] = el}
            onClick={handleStepClick}
            className="step-card relative rounded-[50px] md:rounded-[100px] 2xl:rounded-[7vw] mx-auto w-full max-w-[330px] md:max-w-full h-[80px] md:h-[161px] 2xl:h-[11.2vw]"
            style={{ background: 'linear-gradient(90deg, #683CA1 0%, #5D2484 49.52%, #391651 100%)', transform: 'rotate(-180deg)' }}
          >
            {/* Step logo */}
            <div className="step-icon absolute opacity-100 w-[24px] h-[24px] xs:w-[28px] xs:h-[28px] sm:w-[32px] sm:h-[32px] left-[8px] xs:left-[10px] sm:left-[14px] top-1/2 -translate-y-1/2 md:w-[80px] md:h-[80px] md:left-[78px] md:top-[40.5px] 2xl:w-[5.5vw] 2xl:h-[5.5vw] 2xl:left-[5.4vw] 2xl:top-[2.8vw] md:translate-y-0" style={{ transform: 'rotate(180deg)' }}>
              <img src={Steplogo4} alt="Step 4" className="w-full h-full object-contain" />
            </div>

            {/* Number "4" */}
            <div 
              className="content-number absolute font-outfit font-bold flex items-center justify-center text-[74px] xs:text-[90px] sm:text-[116px] left-[35px] xs:left-[45px] sm:left-[60px] top-1/2 -translate-y-1/2 w-[35px] xs:w-[40px] sm:w-[44px] h-[55px] xs:h-[65px] sm:h-[70px] md:text-[216px] 2xl:text-[15vw] md:left-[177px] 2xl:left-[12.2vw] md:top-1/2 md:-translate-y-1/2 md:w-[126px] 2xl:w-[8.7vw] md:h-[200px] 2xl:h-[13.8vw]"
              style={{
                backgroundImage: `url(${Content2})`, backgroundSize: 'cover', backgroundPosition: 'center', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', transform: 'rotate(180deg)'
              }}
            >
              4
            </div>

            {/* Content */}
            <div className="step-content absolute flex flex-col justify-center left-[80px] xs:left-[95px] sm:left-[115px] right-[8px] xs:right-[10px] sm:right-[14px] gap-[1px] xs:gap-[2px] md:left-[348px] 2xl:left-[24.1vw] md:w-[774px] 2xl:w-[53.7vw] md:gap-[6px] 2xl:gap-[0.4vw]" style={{ top: '50%', transform: 'translateY(-50%) rotate(180deg)' }}>
              <h3 className="poppins-font font-semibold text-white text-right text-[10px] xs:text-[11px] sm:text-[13px] leading-[13px] xs:leading-[14px] sm:leading-[16px] md:text-[32px] 2xl:text-[2.2vw] md:leading-[140%]">
                Track and Grow
              </h3>
              <p className="font-inter text-white text-right text-[7px] xs:text-[8px] sm:text-[10px] leading-[10px] xs:leading-[11px] sm:leading-[13px] md:text-[20px] 2xl:text-[1.4vw] md:leading-[140%]">
                Monitor project progress, manage fair revenue splits, and build your reputation as you complete successful collaborations.
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default Steps