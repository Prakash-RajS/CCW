import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import Footer from "../../component/Footer";
import toast from "../../component/Toast";
import BannerImg from "../../assets/myproject/banner.png";

const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName:"",
    lastName:"",
    email:"",
    phone:"",
    message:""
  });

  const [errors,setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone field, restrict to only numbers and max 10 digits
    if (name === "phone") {
      // Allow only digits and limit to 10 characters
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setForm({...form, [name]: numericValue});
      }
      // Don't update if trying to add more than 10 digits
      return;
    }
    
    setForm({...form, [name]: value});
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validate = () => {

    let newErrors = {};

    if(!form.firstName.trim()){
      newErrors.firstName = "First name is required";
    }

    if(!form.lastName.trim()){
      newErrors.lastName = "Last name is required";
    }

    if(!form.email){
      newErrors.email = "Email is required";
    } 
    else if(!/\S+@\S+\.\S+/.test(form.email)){
      newErrors.email = "Enter valid email";
    }

    if(!form.phone){
      newErrors.phone = "Phone number is required";
    } 
    else if(form.phone.length !== 10){
      newErrors.phone = "Enter valid 10 digit number";
    }

    if(!form.message.trim()){
      newErrors.message = "Message is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if(Object.keys(validationErrors).length > 0){
      setErrors(validationErrors);
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to send the message
      // await api.sendContactForm(form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success toast
      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form after successful submission
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
      });
      setErrors({});
      
    } catch (error) {
      // Error toast
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ================= MOBILE VERSION ================= */}
      <div className="block md:hidden">

        {/* HERO */}
        <div
          className="relative w-full h-[260px] bg-cover bg-center"
          style={{ backgroundImage: `url(${BannerImg})` }}
        >
          <div className="absolute top-0 w-full z-20 flex justify-between items-center px-4 py-3">
           <h1 className="font-bold text-[28px] leading-[100%] trochut-font cursor-pointer bg-gradient-to-r from-[#B77BFF] to-[#E0B0FF] text-transparent bg-clip-text">
  Talenta
</h1>
            <button
              onClick={() => navigate(-1)}
              className="w-[80px] h-[32px] rounded-[30px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <span className="text-white font-semibold text-[12px]">
                Back
              </span>
            </button>
          </div>

          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative flex items-center justify-center h-full">
            <h1 className="text-white text-3xl mt-5 font-bold">
              Contact Us
            </h1>
          </div>
        </div>

        {/* CONTACT CARD */}
        <div className="bg-gray-100 rounded-t-3xl -mt-10 relative z-10 p-6 mx-3 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Let’s <span className="text-purple-700">talk</span> with us
            </h2>
            <p className="text-gray-600 text-sm">
              Questions, comments, or suggestions? <br/>
              Simply fill in the form and we’ll be in touch shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FIRST NAME */}
            <div>
              <label className="text-sm font-medium block mb-1">
                First Name
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                  className={`w-full !border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                />
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Last Name
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
                </svg>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter Last Name"
                  className={`w-full !border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                />
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Email
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 4h16v16H4z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  className={`w-full !border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Phone Number
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h3"/>
                </svg>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter 10 digit Phone Number"
                  maxLength={10}
                  className={`w-full !border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Enter 10 digit mobile number
              </p>
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Message
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-3.5 text-gray-400"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h12a4 4 0 0 1 4 4z"/>
                </svg>
                <textarea
                  rows="4"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  className={`w-full !border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                ></textarea>
              </div>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.message}
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-purple-700 to-black transition-all duration-300 hover:scale-105 hover:from-purple-800 hover:to-gray-900 cursor-pointer ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* <Footer/> */}
      </div>

      {/* ================= DESKTOP VERSION ================= */}
      <div className="hidden md:block">
        {/* HERO */}
        <div
          className="relative w-full h-[480px] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${BannerImg})` }}
        >
          <div className="absolute top-0 w-full z-20 flex justify-between items-center px-6 py-4">
            <h1 className="font-bold text-[36px] md:text-[42px] leading-[100%] trochut-font cursor-pointer bg-gradient-to-r from-[#B77BFF] to-[#E0B0FF] text-transparent bg-clip-text">
  Talenta
</h1>
            <button
             onClick={() => navigate(-1)}
              className="w-[100px] h-[38px] md:w-[90px] md:h-[36px] rounded-[30px] cursor-pointer bg-gradient-to-r from-[#030303] to-[#51218F] hover:opacity-90 transition-opacity flex items-center justify-center"
            >
              <span className="text-white font-semibold text-[13px] md:text-[12px]">
                Back
              </span>
            </button>
          </div>

          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-white text-5xl font-bold">
              Contact Us
            </h1>
          </div>
        </div>

        {/* FORM */}
        <div className="max-w-[1100px] mx-auto py-20 px-6">
          <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Let’s <span className="text-purple-700">talk</span> with us
              </h2>
              <p className="text-gray-600 text-lg">
                Questions, comments, or suggestions? <br/>
                Simply fill in the form and we’ll be in touch shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NAME */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* FIRST NAME */}
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    First Name
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-3 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className={`w-full !border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                      placeholder="Enter First Name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                {/* LAST NAME */}
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Last Name
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-3 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="7" r="4"/>
                      <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
                    </svg>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className={`w-full !border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                      placeholder="Enter Last Name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* EMAIL PHONE */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* EMAIL */}
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-3 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 4h16v16H4z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full !border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                      placeholder="Enter Email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Phone Number
                  </label>
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-3 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h3"/>
                    </svg>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter 10 digit Phone Number"
                      maxLength={10}
                      className={`w-full !border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    Enter 10 digit mobile number
                  </p>
                </div>
              </div>

              {/* MESSAGE */}
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Message
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-3 text-gray-400"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a2 2 0 0 1 2-2h12a4 4 0 0 1 4 4z"/>
                  </svg>
                  <textarea
                    rows="5"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    className={`w-full !border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-10 p-3 outline-none focus:border-purple-600`}
                  ></textarea>
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* BUTTON */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-purple-700 to-black transition-all duration-300 hover:scale-105 hover:from-purple-800 hover:to-gray-900 cursor-pointer ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Contact;