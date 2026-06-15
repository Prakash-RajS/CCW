import React, { useState } from "react";

const SavedAccount = () => {

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

 const [accounts, setAccounts] = useState([
  { username: "Pradeep567", email: "Pradeep677@gmail.com", date: "Mar 1, 2023", payment: "Bank Transfer" },
  { username: "Pradeep567", email: "Pradeep677@gmail.com", date: "Mar 1, 2023", payment: "Wallet" },
  { username: "Pradeep567", email: "Pradeep677@gmail.com", date: "Mar 1, 2023", payment: "Bank Transfer" },
  { username: "Pradeep567", email: "Pradeep677@gmail.com", date: "Mar 1, 2023", payment: "Bank Transfer" },
  { username: "Pradeep567", email: "Pradeep677@gmail.com", date: "Mar 1, 2023", payment: "Bank Transfer" },
  { username: "Pradeep567", email: "Pradeep677@gmail.com", date: "Mar 1, 2023", payment: "Bank Transfer" },
]);

  // ✅ Filter Accounts Based On Username
  const filteredAccounts = accounts.filter((account) =>
    account.username.toLowerCase().includes(search.toLowerCase())
  );



  return (
    <>

      {/* Top Header Section */}
      <div className="w-full px-6 md:px-10 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

{/* Left Side */}
<div>

  <h1 className="text-[18px] lg:text-[30px] font-semibold text-black 
                 -mt-6 lg:-mt-12 
                 -ml-4 lg:-ml-8">
    Saved Account
  </h1>

  <p
    className="
      font-['Montserrat']
      font-medium
      text-[12px] lg:text-[16px]
      leading-snug
      text-black
      mt-1 lg:mt-2
      -ml-4 lg:-ml-8
      whitespace-nowrap
    "
  >
    These are the details which you have saved during the transaction
  </p>

</div>


{/* Right Side Search */}
<div className="relative mt-2 flex justify-end -mr-6">



<input
  type="text"
  placeholder="Search"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="
    w-[180px] md:w-[200px]
    h-[34px]
    pl-4 pr-10
    rounded-full
    border-2 border-[#5E27B6]
    bg-white
    text-[13px]
    text-black
    placeholder:text-[#5E27B6]
    ring-1 ring-[#5E27B6]/30
    focus:ring-2 focus:ring-[#5E27B6]
    focus:outline-none
    transition-all duration-200
  "
/>

  {/* Search Icon */}
  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-[#5E27B6]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" />
    </svg>
  </div>

</div>


        </div>
      
      {/* Divider */}
      <div className="w-full h-[1px] bg-gray-200"></div>

{/* White Card Wrapper */}
<div className="
  mt-4 lg:mt-8
  bg-white
  rounded-[20px] lg:rounded-[24px]
  border border-gray-200
  shadow-sm
  max-w-[1100px]
  w-full
  mx-auto
  overflow-x-auto
">

  
  

  <div>
   <table className="
  w-full
  text-left
  font-['Montserrat']
  text-[10px]
  md:text-[12px]
  lg:text-[13px]
  xl:text-[14px]
">



      <thead className="border-b border-[#7B3FE4]">
        <tr className="text-black">

          <th className="w-[18%] px-2 lg:px-6 py-3 lg:py-4 font-semibold">
            Username
          </th>

<th className="w-[28%] px-2 lg:px-6 py-3 lg:py-4 font-semibold break-words lg:text-center">
  Email ID
</th>


<th className="w-[18%] px-2 lg:px-6 py-3 lg:py-4 font-semibold lg:whitespace-nowrap">
  Joined date
</th>


<th className="w-[20%] px-2 lg:px-6 py-3 lg:py-4 font-semibold lg:whitespace-nowrap">
  Payment type
</th>


<th className="w-[16%] px-2 lg:px-6 py-3 lg:py-4 font-semibold lg:text-center">
  Action
</th>


        </tr>

        {/* Violet Divider Line */}
        <tr>
          <td colSpan="5" className="p-0">
            <div className="w-full h-[2px] bg-[#7B3FE4]"></div>
          </td>
        </tr>

      </thead>

      
<tbody className="text-[12px] lg:text-[14px] text-[#4A4A4A] font-medium">
  {accounts.map((acc, index) => (
    <tr
      key={index}
      className="border-b border-gray-200 hover:bg-gray-50 transition duration-200 align-top"
    >
      {/* Username */}
      <td className="px-2 lg:px-6 py-3 lg:py-4 break-words">
        {acc.username}
      </td>

{/* Email */}
<td className="px-2 lg:px-6 py-3 lg:py-4">
  <div className="lg:hidden leading-tight">
    <div>{acc.email.split("@")[0]}</div>
    <div>@{acc.email.split("@")[1]}</div>
  </div>

  <div className="hidden lg:block">
    {acc.email}
  </div>
</td>


{/* Date */}
<td className="px-2 lg:px-6 py-3 lg:py-4">
  <div className="lg:hidden leading-tight">
    <div>{acc.date.split(",")[0]},</div>
    <div>{acc.date.split(",")[1]}</div>
  </div>

  <div className="hidden lg:block whitespace-nowrap">
    {acc.date}
  </div>
</td>


{/* Payment */}
<td className="px-2 lg:px-6 py-3 lg:py-4">
  <div className="lg:hidden leading-tight">
    {acc.payment.split(" ").map((word, i) => (
      <div key={i}>{word}</div>
    ))}
  </div>

  <div className="hidden lg:block whitespace-nowrap">
    {acc.payment}
  </div>
</td>


{/* Actions */}
<td className="px-2 lg:px-6 py-3 lg:py-4 !text-left align-top">
  <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 lg:whitespace-nowrap justify-start">
    
    <button
      onClick={() => setShowTransferModal(true)}
      className="text-[#5E27B6] font-semibold hover:underline"
    >
      Transfer now
    </button>

<button
  onClick={() => {
    setSelectedIndex(index);   // store which user to delete
    setShowRemoveModal(true);  // open confirmation modal
  }}
  className="text-red-500 font-semibold hover:underline"
>
  Remove
</button>


  </div>
</td>

    </tr>
  ))}
</tbody>

{showTransferModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="
      bg-white
      w-[90%]
      max-w-[600px]
      rounded-[24px]
      p-8
      shadow-xl
      border-2 border-[#5E27B6]
      ring-2 ring-[#5E27B6]/20
    ">

      <h2 className="text-[28px] font-semibold text-black text-center">
        Do you want to Transfer Instantly?
      </h2>

      <p className="text-gray-600 text-center mt-3 leading-relaxed">
        These are the details which you have saved during the transaction before.
        This will instantly transfer the fund without any input of details
      </p>

<div className="mt-6">
  <label className="text-gray-500 text-[16px] font-medium">
    Enter the amount to be transfer
  </label>

  <input
    type="text"
    value={amount}
    onChange={(e) => {
      let value = e.target.value;

      // Allow only numbers and decimal
      value = value.replace(/[^0-9.]/g, "");

      // Prevent multiple decimals
      const parts = value.split(".");
      if (parts.length > 2) return;

      // Remove leading zeros (except 0.)
      if (value.startsWith("0") && !value.startsWith("0.") && value.length > 1) {
        value = value.replace(/^0+/, "");
      }

      // If only "0" entered → clear it
      if (value === "0") {
        value = "";
      }

      setAmount(value);

      // ✅ Validation
      if (!value) {
        setAmountError("*Amount is required");
      } 
      else if (Number(value) <= 0) {
        setAmountError("Amount must be greater than 0");
      } 
      else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        setAmountError("Maximum 2 decimal places allowed");
      } 
      else {
        setAmountError("");
      }
    }}
    className="
      w-full mt-3
      h-[55px]
      rounded-[18px]
      border-[4px] border-[#5E27B6]
      bg-white
      px-5
      text-[22px]
      text-black
      outline-none
      shadow-[0_0_0_2px_#5E27B6]
    "
  />

  {amountError && (
    <p className="text-red-500 text-sm mt-2">
      {amountError}
    </p>
  )}
</div>


<div className="flex gap-4 mt-8">
  <button
    onClick={() => setShowTransferModal(false)}
    className="
      w-1/2
      h-[55px]
      rounded-[16px]
      border-[3px] border-[#5E27B6]
      text-black
      text-[18px]
      font-medium
      bg-white
      shadow-[0_0_0_2px_#5E27B6]
      hover:bg-[#F3EFFF]
      transition
    "
  >
    Cancel
  </button>

 <button
  onClick={() => {
    if (!amount) {
      setAmountError("Amount is required");
      return;
    }

    if (Number(amount) <= 0) {
      setAmountError("Amount must be greater than 0");
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      setAmountError("Maximum 2 decimal places allowed");
      return;
    }

    // ✅ If valid → proceed transfer
    console.log("Transfer Successful");
  }}
  className="
    w-1/2
    h-[55px]
    rounded-[16px]
    bg-gradient-to-r
    from-[#5E27B6]
    to-[#14002E]
    text-white
    text-[18px]
    font-semibold
    hover:opacity-90
    transition
  "
>
  Transfer Instantly
</button>

</div>

<p className="text-gray-400 text-sm text-center mt-6">
  This will directly transfer the fund to represent account holder
</p>


    </div>
  </div>
)}
{showRemoveModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="
      bg-white
      w-[90%]
      max-w-[650px]
      rounded-[30px]
      p-10
      shadow-2xl
    ">

      <h2 className="text-[30px] font-semibold text-black">
        Do you want to remove this account?
      </h2>

      <p className="text-gray-600 mt-4 text-[18px]">
        This will permanently removed from saved account details
      </p>

      <div className="w-full h-[1px] bg-gray-200 mt-6"></div>

      <div className="flex gap-6 mt-8">
 <button
  onClick={() => setShowRemoveModal(false)}
  className="
    w-1/2
    h-[60px]
    rounded-[18px]
    border-[3px] border-[#5E27B6]
    text-black
    text-[20px]
    font-medium
    bg-white
    shadow-[0_0_0_2px_#5E27B6]
    hover:bg-[#F3EFFF]
    transition
  "
>
  Cancel
</button>


 <button
  onClick={() => {
    setAccounts(prev =>
      prev.filter((_, index) => index !== selectedIndex)
    );

    setShowRemoveModal(false);
    setSelectedIndex(null);
  }}
  className="
    w-1/2
    h-[60px]
    rounded-[18px]
    bg-gradient-to-r
    from-[#5E27B6]
    to-[#14002E]
    text-white
    text-[20px]
    font-semibold
    hover:opacity-90
    transition
  "
>
  Confirm
</button>

      </div>

    </div>
  </div>
)}



          </table>
        </div>

      </div>

    </>
  );
};

export default SavedAccount;