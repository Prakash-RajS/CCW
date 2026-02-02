import React from "react";

// CHANGE 1: Accept 'openCardPopup' prop
export default function AddFunds({ onWalletSelect, openCardPopup }) {
  const [depositAmount, setDepositAmount] = React.useState(0);

  const addFundsSummary = [
    { label: "Amount to Deposit", value: `$${depositAmount.toFixed(2)}` },
    { label: "Payment Method", value: "..." },
    {
      label: "Platform Fee",
      value: "$1 (No Fee for wallet deposists)",
    },
    { label: "Transaction Fee", value: "0.00 (3% of amount + 0.30 USD)" },
    { label: "Total to pay", value: `$${depositAmount.toFixed(2)}` },
  ];

  // CHANGE 2: Logic to show Card Details Form
  // Initialize with openCardPopup prop so it opens immediately if triggered by parent
  const [showAddPayment, setShowAddPayment] = React.useState(openCardPopup || false);

  // Logic to show Selection Popup (Card vs Wallet)
  const [showMethodSelectionPopup, setShowMethodSelectionPopup] =
    React.useState(false);

  // ... (Rest of the file remains exactly the same) ...
  const [paymentForm, setPaymentForm] = React.useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    country: "",
    state: "",
    address: "",
    city: "",
    zip: "",
  });

  const isFormValid = Object.values(paymentForm).every(
    (value) => value.trim() !== ""
  );

  const handleChange = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="font-['Montserrat']">
      {/* ... (Existing JSX Content remains same until Popups) ... */}
      
      <h2 className="font-['Montserrat'] font-semibold text-[16px] md:text-[24px]">
        Add Funds to Your Wallet
      </h2>
      <p className="mt-0.5 md:mt-1 font-['Montserrat'] font-medium text-[12px] md:text-[16px] text-black">
        Deposit funds quickly and securely. Choose a payment method, enter an
        amount, and confirm.
      </p>

      <div className="w-full h-[1px] bg-black/10 my-2 md:my-3"></div>

      <h3 className="font-['Montserrat'] font-semibold text-[16px] md:text-[24px] mb-1.5 md:mb-4">
        Enter Amount to Add Funds
      </h3>

      <label className="block font-['Montserrat'] font-medium text-[12px] md:text-[16px] mb-1 md:mb-2">
        Amount
      </label>

      <div className="flex items-center w-[200px] md:w-[240px] h-[36px] md:h-[48px] !border !border-[#d9d9d9] rounded overflow-hidden">
        <div className="w-[50px] md:w-[80px] h-full px-2 md:px-3 flex items-center justify-center !border-r !border-[#d9d9d9] font-semibold text-[14px] md:text-[16px]">
          $
        </div>
        <input
          placeholder="0"
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(Number(e.target.value))}
          className="
               flex-1
               h-full
               px-2
               outline-none
               font-medium
               text-[14px] md:text-[16px]
               [appearance:textfield]
               [&::-webkit-outer-spin-button]:appearance-none
               [&::-webkit-inner-spin-button]:appearance-none
             "
        />
      </div>

      <div className="w-full h-[1px] bg-black/30 my-3 md:my-8"></div>

      <h3 className="font-['Montserrat'] font-medium text-[14px] md:text-[20px] mb-2 md:mb-8 text-left">
        Choose Your Payment Method
      </h3>

      <div className="text-center md:text-center">
        <p className="font-['Montserrat'] font-medium text-[14px] md:text-[20px]">
          No payment methods Found
        </p>
        <p className="mt-0.5 md:mt-1 font-['Montserrat'] font-normal text-[12px] md:text-[16px] text-black/70">
          Add a payment method to deposit funds to your wallet.
        </p>

        <button
          onClick={() => setShowMethodSelectionPopup(true)}
          className="cursor-pointer
               mt-3 md:mt-6
               w-auto
               px-4 py-2 md:px-8 md:py-3
               rounded
               bg-gradient-to-r
               from-[#51218F]
               to-black
               text-white
               font-semibold
               text-[12px] md:text-[16px]
               hover:opacity-90
               transition
             "
        >
          Choose Payment Method
        </button>
      </div>

      <div className="mt-4 md:mt-10 w-full md:max-w-[520px]">
        <table className="w-full !border !border-[#d9d9d9]">
          <thead>
            <tr className="!border-b !border-[#d9d9d9]">
              <th className="px-2 py-1.5 md:px-4 md:py-3 text-left font-['Montserrat'] font-semibold text-[12px] md:text-[20px] !border-r !border-[#d9d9d9]">
                Field
              </th>
              <th className="px-2 py-1.5 md:px-4 md:py-3 text-left font-['Montserrat'] font-semibold text-[12px] md:text-[20px] !border-r !border-[#d9d9d9]">
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {addFundsSummary.map((row, index) => (
              <tr key={index} className="!border-t !border-[#d9d9d9]">
                <td className="px-2 py-1.5 md:px-4 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[16px] !border-r !border-[#d9d9d9]">
                  {row.label}
                </td>
                <td className="px-2 py-1.5 md:px-4 md:py-3 font-['Montserrat'] font-medium text-[11px] md:text-[16px] !border-[#d9d9d9]">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 md:mt-8 flex flex-row gap-2 md:gap-4">
        <button
          className="
            cursor-pointer
            w-auto
            px-4 md:px-8
            py-2 md:py-3
            rounded
            bg-gradient-to-r from-[#51218F] to-black
            text-white
            font-['Montserrat'] font-semibold text-[11px] md:text-[12px]
            transition-all
            hover:opacity-90
            "
        >
          Confirm Deposit
        </button>

        <button
          className="
            cursor-pointer
            w-auto
            px-4 md:px-8
            py-2 md:py-3
            rounded
            !border !border-[#d9d9d9]
            font-['Montserrat'] font-semibold text-[11px] md:text-[12px]
            transition-all
            hover:bg-gradient-to-r hover:from-[#51218F] hover:to-black
            hover:text-white
            "
        >
          Cancel
        </button>
      </div>

      {showMethodSelectionPopup && (
        <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
          <div
            className="
              w-[280px] md:w-full md:max-w-[880px]
              h-auto md:h-[340px]
              bg-white
              rounded-[10px]
              p-3 md:p-6
              shadow-2xl
              relative
              font-['Montserrat']
            "
          >
            <h2 className="font-semibold text-[12px] md:text-[24px]">
              Choose Your Preferred Payment Method
            </h2>

            <p className="mt-1 font-medium text-[12px] md:text-[16px] text-black">
              Select wallet for free-free transactions or card for secure
              payments.
            </p>

            <div className="w-full h-[1px] bg-black/20 mt-1 mb-3 md:mt-1 md:mb-0"></div>

            <h3 className="mt-2 md:mt-4 font-semibold text-[12px] md:text-[24px]">
              Select Your Preferred Payment Method
            </h3>

            <div className="mt-3 md:mt-4 flex flex-col md:flex-row gap-3 md:gap-6">
              <button
                onClick={() => {
                  setShowMethodSelectionPopup(false);
                  setShowAddPayment(true);
                }}
                className="
                    cursor-pointer
                    w-[150px] md:w-[360px]
                    h-[40px] md:h-[80px]
                    rounded-[10px] md:rounded-[15px]
                    flex
                    items-center
                    justify-start
                    gap-3 md:gap-4
                    px-4 md:px-8
                    font-semibold
                    text-[12px] md:text-[22px]
                    text-white
                    bg-gradient-to-r
                    from-[#51218F]
                    to-black
                    transition-all
                "
              >
                <div className="bg-white rounded-full p-0.5 md:p-1">
                  <svg
                    className="w-3 h-3 md:w-5 md:h-5 text-[#51218F]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                Card Payment
              </button>

              <button
                onClick={() => {
                  setShowMethodSelectionPopup(false);
                  if (onWalletSelect) onWalletSelect();
                }}
                className="
                    cursor-pointer
                    w-[150px] md:w-[290px]
                    h-[40px] md:h-[80px]
                    rounded-[10px] md:rounded-[15px]
                    flex
                    items-center
                    justify-start
                    gap-3 md:gap-4
                    px-4 md:px-8
                    font-semibold
                    text-[12px] md:text-[22px]
                    text-black
                    !border
                    !border-black
                    bg-white
                    transition-all
                    hover:bg-gradient-to-r
                    hover:from-[#51218F]
                    hover:to-black
                    hover:text-white
                    group
                "
              >
                <div className="w-3 h-3 md:w-7 md:h-7 rounded-full border-[2px] border-black group-hover:border-white">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="md:w-[28px] md:h-[28px]">
                        <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                      </svg>
                </div>
                Wallet Payment
              </button>
            </div>
          </div>
        </div>
      )}

     {showAddPayment && (
  <div className="absolute inset-0 z-50 bg-black/40 flex justify-center items-center px-4 py-4 font-['Montserrat']">
    <div
      className="
        w-full
        max-w-[350px] md:max-w-[466px]
        max-h-full
        bg-white
        rounded-[16px]
        p-5 md:p-[16px]
        shadow-[0px_4px_20px_rgba(0,0,0,0.25)]
        flex
        flex-col
        overflow-y-auto
        scrollbar-hide
      "
    >
      <div className="flex justify-start items-center mb-4 md:mb-4">
        <h2 className="font-['Montserrat'] font-bold text-[18px] md:text-[24px]">
          Add a Payment Method
        </h2>
      </div>

      <div className="flex flex-col gap-3 md:gap-4 font-['Montserrat'] text-[12px] md:text-[14px]">
        {/* Name on Card */}
        <div>
          <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
            Name on Card
          </label>
          <input
            value={paymentForm.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter name on card"
            className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none"
          />
        </div>

        {/* Card Number - Fixed & Validated */}
        <div>
          <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
            Card Number
          </label>
          <input
            type="number"
            
            value={paymentForm.cardNumber}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              const formattedValue = rawValue
                .replace(/(\d{4})(?=\d)/g, "$1 ")
                .slice(0, 19);
              handleChange("cardNumber", formattedValue);
            }}
            placeholder="1234 5678 1254 0000"
            className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none no-spinner"
          />
        </div>

        <div className="flex flex-row gap-3 md:gap-5 md:mr-[60px]">
          {/* Expiry Date - Fixed & Validated */}
          <div className="flex-1">
            <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
              Card Expiry
            </label>
            <input
              type="number"
              
              value={paymentForm.expiry}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, "");
                if (val.length >= 3) {
                  val = val.slice(0, 2) + "/" + val.slice(2);
                }
                if (val.length <= 5) {
                  handleChange("expiry", val);
                }
              }}
              placeholder="MM/YY"
              className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none no-spinner"
            />
          </div>

          {/* CVC Number - Fixed & Validated */}
          <div className="flex-1">
            <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
              CVC Number
            </label>
            <input
              type="number"
              
              pattern="\d*"
              maxLength={4}
              value={paymentForm.cvc}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^[0-9\b]+$/.test(val)) {
                  handleChange("cvc", val);
                }
              }}
              placeholder="CVC"
              className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none no-spinner"
            />
          </div>
        </div>

        <h3 className="font-semibold text-[16px] md:text-[18px] mt-2 md:mt-2">
          Billing Address
        </h3>

        <div className="flex flex-row gap-3 md:gap-5 md:mr-[60px]">
          <div className="flex-1">
            <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
              Country*
            </label>
            <input
              value={paymentForm.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Search Countries"
              className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
              State*
            </label>
            <input
              value={paymentForm.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="Search States"
              className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
            Address
          </label>
          <input
            value={paymentForm.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter your address line"
            className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none"
          />
        </div>

        <div className="flex flex-row gap-3 md:gap-5 md:mr-[60px]">
          <div className="flex-1">
            <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
              City
            </label>
            <input
              value={paymentForm.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Enter your city"
              className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none"
            />
          </div>

          <div className="flex-1">
            <label className="font-['Montserrat'] font-medium text-[12px] md:text-[16px]">
              ZIP Code
            </label>
            <input
              type="number"
              value={paymentForm.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
              placeholder="Enter your ZIP code"
              className="w-full h-[36px] md:h-[40px] !border rounded px-2 md:px-3 mt-1 outline-none no-spinner"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 mt-6 md:mt-6 mr-22 md:mr-34">
        <button
          onClick={() => setShowAddPayment(false)}
          className="
            flex-1
            h-[30px] md:h-[30px]
            !border !border-black/30
            rounded-[4px]
            font-['Montserrat']
            font-normal
            text-[14px] md:text-[14px]
            text-black
            cursor-pointer
            transition-all
            hover:bg-[#51218F]
            hover:text-white
          "
        >
          Cancel
        </button>

        <button
          disabled={!isFormValid}
          onClick={() => setShowAddPayment(false)}
          className={`
            flex-1
            h-[30px] md:h-[30px]
            rounded-[4px]
            font-['Montserrat']
            font-normal
            text-[14px] md:text-[14px]
            text-white
            cursor-pointer
            transition-all
            ${
              isFormValid
                ? "bg-[#51218F] hover:bg-[#51218F]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}