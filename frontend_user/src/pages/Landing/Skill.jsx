import React, { useState } from 'react';
import Skill1 from "../../assets/Landing/Skill1.png";
import Skill2 from "../../assets/Landing/Skill2.png";
import Skill3 from "../../assets/Landing/Skill3.png";
import Skill4 from "../../assets/Landing/Skill4.png";

const Skill = () => {
  const [activeCategory, setActiveCategory] = useState('Development & IT');

  const LeftArrowSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const RightArrowSVG = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
      <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const categoriesData = {
    'Development & IT': [
      { id: 1, image: Skill1, badgeText: '304k developers', title: 'Web Developers' },
      { id: 2, image: Skill2, badgeText: '250k developers', title: 'Mobile App Developers' },
      { id: 3, image: Skill3, badgeText: '180k developers', title: 'DevOps Engineers' },
      { id: 4, image: Skill4, badgeText: '220k developers', title: 'Data Scientists' },
    ],
    'Design & Creative': [
      { id: 1, image: Skill1, badgeText: '304k designer', title: 'User experience designers' },
      { id: 2, image: Skill2, badgeText: '304k designer', title: 'User interface designers' },
      { id: 3, image: Skill3, badgeText: '304k designer', title: 'Graphics designer' },
      { id: 4, image: Skill4, badgeText: '304k designer', title: 'Animator' },
    ],
    'Sales & Marketing': [
      { id: 1, image: Skill1, badgeText: '304k professionals', title: 'Digital Marketers' },
      { id: 2, image: Skill2, badgeText: '250k professionals', title: 'Sales Managers' },
      { id: 3, image: Skill3, badgeText: '180k professionals', title: 'SEO Specialists' },
      { id: 4, image: Skill4, badgeText: '220k professionals', title: 'Content Strategists' },
    ],
    'Writing & Translation': [
      { id: 1, image: Skill1, badgeText: '304k writers', title: 'Content Writers' },
      { id: 2, image: Skill2, badgeText: '250k writers', title: 'Copywriters' },
      { id: 3, image: Skill3, badgeText: '180k writers', title: 'Technical Writers' },
      { id: 4, image: Skill4, badgeText: '220k writers', title: 'Translators' },
    ],
  };

  const categories = Object.keys(categoriesData);

  const goToPrevCategory = () => {
    const currentIndex = categories.indexOf(activeCategory);
    const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
    setActiveCategory(categories[prevIndex]);
  };

  const goToNextCategory = () => {
    const currentIndex = categories.indexOf(activeCategory);
    const nextIndex = currentIndex === categories.length - 1 ? 0 : currentIndex + 1;
    setActiveCategory(categories[nextIndex]);
  };

const SkillBox = ({ image, alt, badgeText, title, index }) => (
  <div className="flex justify-center w-full">
    <div
      className={`relative
        w-[201px] h-[181px]            /* 📱 MOBILE CARD SIZE ONLY */
        md:w-full md:aspect-auto md:h-[250px]
        rounded-[18px]
        overflow-visible
        mt-14 md:mt-24
        ${
          index % 2 === 0
            ? 'bg-gradient-to-b from-[#693B93] to-[#212431]'
            : 'bg-[#212431]'
        }
      `}
    >
      <div className="absolute w-[90%] aspect-square md:w-[247px] md:h-[247px] rounded-[18px] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-xl">
        <img src={image} alt={alt} className="w-full h-full object-cover" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
        <div className="inline-block px-2 py-0.5 rounded-[4px] bg-[#FFFFFFE5] mb-2 md:mb-3">
          <span className="text-[9px] md:text-[11px] font-bold text-black whitespace-nowrap uppercase">
            {badgeText}
          </span>
        </div>

        <h4 className="font-merriweather font-bold text-[15px] md:text-[24px] leading-tight text-white">
          {title}
        </h4>
      </div>
    </div>
  </div>
);


  return (
    <section className="w-full min-h-[780px] flex flex-col items-center justify-start pt-[40px] px-4 md:px-10 relative bg-white">
      <div className="w-full max-w-[1302px] mx-auto flex flex-col items-center">
        
        <h3 className="w-full max-w-[600px] text-center font-montserrat font-bold text-[28px] md:text-[43px] leading-tight text-[#2A1E17] mb-8">
          Top skills categories
        </h3>
        
{/* Updated Navigation Bar with Divider Highlight */}
<div className="w-full max-w-[950px] relative mb-12">

 {/* CATEGORY NAVIGATION */}
<div className="w-full max-w-[950px] mx-auto mb-12">

  {/* 📱 MOBILE: 2 × 2 GRID */}
<div className="
  grid
  grid-cols-2
  gap-y-2
  gap-x-3
  text-center
  md:hidden

  -mb-6          /* 👈 pulls the next section UP */
">
  {categories.map((category) => (
    <button
      key={category}
      onClick={() => setActiveCategory(category)}
      className={`relative pb-1 text-[16px] font-medium transition-all ${
        activeCategory === category
          ? 'text-[#693B93] font-bold'
          : 'text-[#9CA3AF]'
      }`}
    >


        {category}

        {/* Active underline */}
        {activeCategory === category && (
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-[2px] w-[70%] h-[3px] bg-[#693B93] rounded-full" />
        )}
      </button>
    ))}
  </div>

  {/* 🖥 DESKTOP: ORIGINAL ROW WITH DIVIDER */}
  <div className="hidden md:block relative border-b-2 border-[#E5E7EB]">
    <div className="flex justify-between items-center px-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`relative pb-4 text-[18px] transition-all ${
            activeCategory === category
              ? 'text-[#693B93] font-bold'
              : 'text-[#6D6D6D] hover:text-[#693B93]'
          }`}
        >
          {category}

          {activeCategory === category && (
            <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-[#693B93] rounded-full" />
          )}
        </button>
      ))}
    </div>
  </div>

</div>

{/* ✅ GREY DIVIDER LINE — DESKTOP ONLY */}
<div className="hidden md:block w-full h-[2px] bg-[#D1D5DB] -mt-12 mb-4" />

</div>


<p
  className="
    w-full
    max-w-[550px]
    text-center
    font-montserrat
    font-medium
    text-[16px]
    md:text-[20px]
    leading-relaxed
    text-black

    /* 📱 MOBILE */
    -mt-8
    mb-12

    /* 🖥 DESKTOP */
    md:-mt-6
    md:mb-24
  "
>


  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
</p>

        <div className="w-full px-2 relative">
          <button
            onClick={goToPrevCategory}
            className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 w-[44px] h-[44px] rounded-full bg-gradient-to-b from-[#7B3BCF] to-[#3E1E69] items-center justify-center z-10 hover:shadow-lg transition-all"
          >
            <LeftArrowSVG />
          </button>
          
          <button
            onClick={goToNextCategory}
            className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 w-[44px] h-[44px] rounded-full bg-gradient-to-b from-[#7B3BCF] to-[#3E1E69] items-center justify-center z-10 hover:shadow-lg transition-all"
          >
            <RightArrowSVG />
          </button>
          
<div
  className="
    grid
    grid-cols-2
    lg:grid-cols-4

    gap-x-4
    gap-y-8 md:gap-y-16 lg:gap-y-24

    md:gap-8

    [&>*]:-translate-y-3        /* 👈 MOVE CONTENT UP on mobile */
    sm:[&>*]:translate-y-0     /* 👈 desktop unchanged */
  "
>
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
}

export default Skill;