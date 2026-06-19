import React, { useState } from 'react';
import Skill1 from "../../assets/Landing/Skill1.png";
import Skill2 from "../../assets/Landing/Skill2.png";
import Skill3 from "../../assets/Landing/Skill3.png";
import Skill4 from "../../assets/Landing/Skill4.png";
import Skill5 from "../../assets/Landing/Skill5.png";
import Skill6 from "../../assets/Landing/Skill6.png";
import Skill7 from "../../assets/Landing/Skill7.png";
import Skill8 from "../../assets/Landing/Skill8.png";
import Skill9 from "../../assets/Landing/Skill9.png";
import Skill10 from "../../assets/Landing/Skill10.png";
import Skill11 from "../../assets/Landing/Skill11.png";

const Skill = () => {
  const [activeCategory, setActiveCategory] = useState('Design & Creative');

  const categoriesData = {
    'Development & IT': [
      { id: 1, image: Skill5, badgeText: '220k developers', title: 'Software \nDevelopment' },
      { id: 2, image: Skill6, badgeText: '190k developers', title: 'Artificial \nIntelligence' },
      { id: 3, image: Skill7, badgeText: '60k developers', title: 'Cloud Computing' },
      { id: 4, image: Skill8, badgeText: '102k developers', title: 'Cybersecurity' },
    ],
    'Design & Creative': [
      { id: 1, image: Skill1, badgeText: '304k designer', title: 'User experience\ndesigners' },
      { id: 2, image: Skill3, badgeText: '301k designer', title: 'User interface \ndesigners' },
      { id: 3, image: Skill2, badgeText: '230k designer', title: 'Graphics designer' },
      { id: 4, image: Skill4, badgeText: '265k designer', title: 'Animator' },
    ],
    'Writing & Translation': [
      { id: 1, image: Skill9, badgeText: '30k writers', title: 'Linguistic & Writing \nSkills' },
      { id: 2, image: Skill10, badgeText: '4k writers', title: 'Cultural Competence \n& Localisation' },
      { id: 3, image: Skill11, badgeText: '16k writers', title: 'Technical Skills & \nTools' },
    ],
  };

  const categoryDescriptions = {
    'Development & IT': 'Programs must be written for people to read, and \nonly incidentally for machines to execute.',
    'Design & Creative': 'Design creates culture. Culture shapes values.\nValues determine the future.',
    'Writing & Translation': 'Translation is that which transforms everything so \nthat nothing changes.'
  };

  const categories = Object.keys(categoriesData);

  const SkillBox = ({ image, alt, badgeText, title, index }) => (
    <div
      // Proportional widths, paddings, and max-widths added for 2xl
      className={`relative w-[calc(50%-6px)] xs:w-[calc(50%-8px)] sm:w-[calc(50%-16px)] lg:w-[calc(25%-18px)] xl:w-[calc(25%-24px)] 2xl:w-[calc(25%-1.65vw)] max-w-[320px] 2xl:max-w-[22.2vw] flex flex-col px-2.5 pb-4 xs:px-3 xs:pb-5 sm:px-5 sm:pb-8 2xl:px-[1.5vw] 2xl:pb-[2.5vw] rounded-[16px] sm:rounded-[24px] 2xl:rounded-[1.7vw] shadow-2xl transition-transform hover:-translate-y-2 duration-300 flex-shrink-0
        ${index % 2 === 0
          ? 'bg-gradient-to-b from-[#552A80] to-[#2B283A]' 
          : 'bg-[#2F2F2F]' 
        }
      `}
    >
      {/* Scaled border radii for 2xl images */}
      <div className="w-[90%] sm:w-[94%] mx-auto -mt-[40%] sm:-mt-[48%] aspect-square rounded-[12px] sm:rounded-[20px] 2xl:rounded-[1.4vw] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.4)] relative z-10 bg-gray-200">
        <img src={image} alt={alt} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col items-start mt-4 sm:mt-6 md:mt-8 2xl:mt-[2.2vw] flex-grow">
        {/* Scaled badge padding and margins for 2xl */}
        <div className="inline-block px-1.5 sm:px-2 py-1 sm:py-1 2xl:px-[0.6vw] 2xl:py-[0.3vw] rounded 2xl:rounded-[0.2vw] bg-white mb-1.5 sm:mb-3 2xl:mb-[0.8vw] shadow-sm">
          <span className="text-[7px] xs:text-[8px] sm:text-[11px] 2xl:text-[0.76vw] text-[#555555] font-semibold whitespace-nowrap leading-none block">
            {badgeText}
          </span>
        </div>

        {/* Scaled title text for 2xl */}
        <h4 className="font-merriweather font-serif font-bold text-[12px] xs:text-[14px] sm:text-[18px] xl:text-[20px] 2xl:text-[1.4vw] leading-[1.2] sm:leading-[1.3] text-white text-left whitespace-pre-line">
          {title}
        </h4>
      </div>
    </div>
  );

  return (
    // Scaled section padding for 2xl
    <section className="w-full overflow-x-hidden bg-white py-8 xs:py-12 lg:py-20 2xl:py-[6vw]">
      {/* 2xl Container using 90.4vw to perfectly match the 1440px proportion */}
      <div className="w-full max-w-[1302px] xl:max-w-[1600px] 2xl:max-w-[90.4vw] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-[3vw]">
        
        {/* Scaled text and margins for 2xl heading */}
        <h3 className="text-center font-montserrat font-bold text-[22px] xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-[4.2vw] leading-tight text-[#2A1E17] mb-6 sm:mb-8 lg:mb-12 2xl:mb-[4.2vw]">
          Top skills categories
        </h3>

        <div className="w-full mb-6 sm:mb-8 lg:mb-10 2xl:mb-[4vw]">
          
          {/* Mobile Category Grid (Unchanged) */}
          <div className="flex flex-row justify-between items-center w-full md:hidden mb-6 px-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative pb-1 text-[9px] xs:text-[11px] sm:text-[13px] font-medium transition-all whitespace-nowrap ${
                  activeCategory === category
                    ? 'text-[#693B93] font-bold'
                    : 'text-[#9CA3AF]'
                }`}
              >
                {category}
                {activeCategory === category && (
                  <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-[#693B93] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Desktop Navigation - Scaled max-width and text sizes for 2xl */}
          <div className="hidden md:block relative border-b-2 border-[#E5E7EB] max-w-[800px] 2xl:max-w-[55vw] mx-auto">
            <div className="flex justify-between items-center px-4 2xl:px-[1vw]">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative pb-4 2xl:pb-[1.1vw] text-base lg:text-lg 2xl:text-[1.25vw] font-medium transition-all ${
                    activeCategory === category
                      ? 'text-[#693B93] font-bold'
                      : 'text-[#9CA3AF] hover:text-[#693B93]'
                  }`}
                >
                  {category}
                  {activeCategory === category && (
                    <span className="absolute left-0 right-0 -bottom-[2px] 2xl:-bottom-[0.14vw] h-[3px] 2xl:h-[0.2vw] bg-[#693B93] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scaled text and margins for 2xl description */}
        <p className="w-full max-w-[600px] lg:max-w-[700px] 2xl:max-w-[48vw] mx-auto text-center font-montserrat font-medium text-[11px] xs:text-[13px] sm:text-lg lg:text-xl 2xl:text-[1.4vw] leading-relaxed text-[#222222] mb-4 sm:mb-8 2xl:mb-[3vw] whitespace-pre-line px-2">
          {categoryDescriptions[activeCategory]}
        </p>

        {/* Scaled grid padding and gaps for 2xl */}
        {/* TABLET FIX: sm:pt-[24vw] scales top space with viewport so first-row images clear the description. lg:pt-[136px] keeps laptop unchanged. */}
        <div className="w-full pt-[60px] xs:pt-[70px] sm:pt-[24vw] lg:pt-[136px] 2xl:pt-[9.5vw]">
          {/* TABLET FIX: sm:gap-y-[24vw] scales the row gap with viewport so second-row images never overlap first-row cards. lg:gap-y-24 restores the original laptop spacing. */}
          <div className="flex flex-wrap justify-center gap-x-3 xs:gap-x-4 lg:gap-x-6 xl:gap-x-8 2xl:gap-x-[2.2vw] gap-y-20 xs:gap-y-20 sm:gap-y-[24vw] lg:gap-y-24 2xl:gap-y-[9vw] place-items-center">
            {categoriesData[activeCategory].map((item, idx) => (
              <SkillBox
                key={item.id}
                index={idx}
                image={item.image}
                alt={item.title}
                badgeText={item.badgeText}
                title={item.title}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Skill;