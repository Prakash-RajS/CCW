import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../../assets/Subscription.png";
import card1 from "../../assets/card1.png";
import card2 from "../../assets/card2.png";
import Footer from "../../component/Footer";
import ColHeader from "../../component/ColHeader";
import api from "../../utils/axiosConfig";
import toast from "../../component/Toast";

const CollabSubscription = () => {
  const cardsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [billing, setBilling] = useState("monthly");
  const [activeIndex, setActiveIndex] = useState(0);
  const [plans, setPlans] = useState({ monthly: [], yearly: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [currentUserPlan, setCurrentUserPlan] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState("");
  const [currentPlanName, setCurrentPlanName] = useState("");
  const [activeCard, setActiveCard] = useState(null);
  const [userCounts, setUserCounts] = useState({});

  const [cashfreeReady, setCashfreeReady] = useState(false);
  const cashfreeInitialized = useRef(false);

  const _verifyInFlight = useRef(false);
  const _verifyToastShown = useRef(false);
  const _basicToastShown = useRef(false);

  const CARD_WIDTH = 320;
  const cardBackgrounds = [card1, card2, card1];

  const userHasEmail = user && user.email && user.email.trim() !== "";

  const handleUserIncrement = (planId, currentCount, maxUsers = 20) => {
    if (currentCount < maxUsers) {
      setUserCounts(prev => ({ ...prev, [planId]: (prev[planId] || 1) + 1 }));
    }
  };

  const handleUserDecrement = (planId) => {
    setUserCounts(prev => ({
      ...prev,
      [planId]: Math.max(1, (prev[planId] || 1) - 1),
    }));
  };

  useEffect(() => {
    if (cashfreeInitialized.current) return;
    const loadCashfreeScript = () =>
      new Promise((resolve) => {
        if (window.Cashfree) { resolve(true); return; }
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    loadCashfreeScript().then((loaded) => {
      setCashfreeReady(loaded);
      cashfreeInitialized.current = true;
      if (!loaded) toast.error("Payment gateway failed to load");
    });
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
      return null;
    }
  };

  const isBasicPlan = (planName) =>
    !planName || planName.toLowerCase().includes("basic");

  const fetchUserSubscription = async (userEmail) => {
    try {
      const response = await api.get("/payment/user/subscription", {
        params: { user_email: userEmail },
      });
      if (response.data.has_subscription && response.data.subscription) {
        const subscription = response.data.subscription;
        setCurrentUserPlan(subscription);
        setCurrentPlanName(subscription.current_plan || subscription.plan_name || "Basic");
        if (!subscription.is_active && !isBasicPlan(subscription.current_plan)) {
          setExpiredMessage("Your subscription has expired. You've been downgraded to Basic plan.");
        } else {
          setExpiredMessage("");
        }
        return subscription;
      } else {
        setCurrentUserPlan(null);
        setCurrentPlanName("Basic Plan");
        setExpiredMessage("");
        return null;
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setCurrentUserPlan(null);
      setCurrentPlanName("");
      return null;
    }
  };

  const verifyPayment = async () => {
    const query = new URLSearchParams(location.search);
    const orderId = query.get("order_id");
    if (!orderId) return;
    if (_verifyInFlight.current) return;
    _verifyInFlight.current = true;

    setIsVerifyingPayment(true);
    try {
      const response = await api.get("/payment/verify-payment", {
        params: { order_id: orderId },
      });
      if (response.data.success) {
        if (!_verifyToastShown.current) {
          _verifyToastShown.current = true;
          toast.success("Payment successful! Your subscription is now active.");
        }
        const freshUser = await fetchUserData();
        if (freshUser?.email) {
          await fetchUserSubscription(freshUser.email);
        }
        navigate("/collab-subscription", { replace: true });
      } else {
        toast.error("Payment was not completed. Please try again to activate your plan.");
        navigate("/collab-subscription", { replace: true });
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Could not verify payment. Please contact support.");
      navigate("/collab-subscription", { replace: true });
    } finally {
      setIsVerifyingPayment(false);
      _verifyInFlight.current = false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserData();
        if (userData) {
          await fetchUserSubscription(userData.email);
        } else {
          setUser(null);
          setCurrentUserPlan(null);
          setCurrentPlanName("");
        }

        // ✅ FIX: First try with collaborator role
        let response = await api.get("/plans/list", { 
          params: { 
            role: "collaborator", 
            is_active: true 
          } 
        });
        let allPlans = [];

        if (response.data) {
          if (Array.isArray(response.data)) allPlans = response.data;
          else if (response.data.plans && Array.isArray(response.data.plans)) allPlans = response.data.plans;
          else if (response.data.data && Array.isArray(response.data.data)) allPlans = response.data.data;
        }

        // ✅ If no plans found, try with no role filter
        if (allPlans.length === 0) {
          response = await api.get("/plans/list", { 
            params: { is_active: true } 
          });
          if (response.data) {
            if (Array.isArray(response.data)) allPlans = response.data;
            else if (response.data.plans && Array.isArray(response.data.plans)) allPlans = response.data.plans;
            else if (response.data.data && Array.isArray(response.data.data)) allPlans = response.data.data;
          }
        }

        // ✅ If still no plans, try admin endpoint
        if (allPlans.length === 0) {
          try {
            const adminResponse = await api.get("/plans/admin/list-all");
            if (adminResponse.data && adminResponse.data.plans) {
              allPlans = adminResponse.data.plans;
            }
          } catch (adminErr) {
            // console.log("Admin endpoint not accessible, continuing...");
          }
        }

        if (allPlans.length > 0) {
          const processedPlans = allPlans.map(plan => {
            let features = plan.features;
            if (typeof features === "string") {
              try { features = JSON.parse(features); } catch { features = []; }
            }
            if (!Array.isArray(features)) features = [];
            return { ...plan, features };
          });

          // ✅ Filter for collaborator-compatible plans
          const collaboratorPlans = processedPlans.filter(plan => {
            const planRole = (plan.role || "both").toLowerCase();
            return planRole === "both" || planRole === "collaborator";
          });

          // Use collaborator plans if found, otherwise all plans
          const plansToShow = collaboratorPlans.length > 0 ? collaboratorPlans : processedPlans;

          setPlans({
            // ✅ Include lifetime plans in monthly view
            monthly: plansToShow
              .filter(p => {
                const duration = String(p.duration || "").toLowerCase().trim();
                return ["monthly", "month", "lifetime"].includes(duration);
              })
              .sort((a, b) => {
                // ✅ Put lifetime plans first
                const aIsLifetime = String(a.duration || "").toLowerCase().trim() === "lifetime";
                const bIsLifetime = String(b.duration || "").toLowerCase().trim() === "lifetime";
                if (aIsLifetime && !bIsLifetime) return -1;
                if (!aIsLifetime && bIsLifetime) return 1;
                return a.price - b.price;
              }),
            yearly: plansToShow
              .filter(p => {
                const duration = String(p.duration || "").toLowerCase().trim();
                return ["yearly", "year", "annual"].includes(duration);
              })
              .sort((a, b) => a.price - b.price),
          });
          setError("");
        } else {
          setPlans({ monthly: [], yearly: [] });
          setError("No subscription plans are currently available for collaborators. Please check back later or contact support.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load subscription plans. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => { verifyPayment(); }, [location.search]);

  useEffect(() => {
    if (
      !loading &&
      user &&
      !_basicToastShown.current &&
      currentPlanName &&
      isBasicPlan(currentPlanName)
    ) {
      _basicToastShown.current = true;
      setTimeout(() => {
        toast.info("🚀 You're on the Free Basic plan — upgrade to enjoy more features!");
      }, 800);
    }
  }, [loading, user, currentPlanName]);

  const currentPlans = billing === "monthly" ? plans.monthly : plans.yearly;

  useEffect(() => {
    if (currentPlans.length > 0) {
      const initialCounts = {};
      currentPlans.forEach(plan => { if (plan.id) initialCounts[plan.id] = 1; });
      setUserCounts(prev => ({ ...prev, ...initialCounts }));
    }
  }, [currentPlans]);

  const getPlanPrice = (plan) => parseFloat(plan.price || 0);
  const getCurrentPlanPrice = () => parseFloat(currentUserPlan?.plan_price || 0);

  const isCurrentUserPlan = (plan) => {
    if (!user) return false;
    if (!currentUserPlan) return getPlanPrice(plan) === 0;
    const userPlanName = (currentUserPlan.current_plan || currentUserPlan.plan_name || "").toLowerCase().trim();
    const userDuration = (currentUserPlan.duration || "").toLowerCase().trim();
    const normalizeDuration = (d) => (d.includes("year") || d.includes("annual") ? "yearly" : "monthly");
    return (
      userPlanName === (plan.name?.toLowerCase().trim() || "") &&
      normalizeDuration(userDuration) === normalizeDuration(plan.duration?.toLowerCase().trim() || "")
    );
  };

  const getPlanAction = (plan) => {
    if (!user) return "login";
    if (!userHasEmail) return "no_email";
    if (isCurrentUserPlan(plan)) return "current";

    const planPrice = getPlanPrice(plan);
    const currentPrice = getCurrentPlanPrice();
    const userOnBasic = isBasicPlan(currentUserPlan?.current_plan || currentPlanName);

    if (planPrice === 0) {
      if (userOnBasic) return "disabled_basic";
      return "basic";
    }

    if (!userOnBasic && currentPrice > 0 && planPrice < currentPrice) {
      return "downgrade";
    }

    return "subscribe";
  };

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error("Please login to subscribe");
      navigate("/login");
      return;
    }

    if (!userHasEmail) {
      toast.error("Please add your email address in your profile before subscribing.");
      navigate("/collab-edit-profile");
      return;
    }

    const action = getPlanAction(plan);

    if (action === "current" || action === "disabled_basic") return;

    if (action === "basic") {
      toast.error("You cannot purchase the Basic plan. It is assigned automatically when your paid plan expires.");
      return;
    }

    if (action === "downgrade") {
      toast.error("Downgrading to a lower plan is not allowed while your current plan is active.");
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const response = await api.post("/payment/create-checkout-session", {
        email: user.email,
        plan_name: plan.name,
        duration: plan.duration,
        role: "collaborator",
      });

      if (response.data.is_basic) {
        toast.success("Plan activated successfully!");
        await fetchUserSubscription(user.email);
        setCurrentUserPlan({
          current_plan: plan.name,
          plan_name: plan.name,
          duration: plan.duration,
          is_active: true,
          price: 0,
        });
        return;
      }

      const { payment_session_id } = response.data;
      if (!payment_session_id) {
        toast.error("Could not create payment session. Please try again.");
        return;
      }

      if (!cashfreeReady || !window.Cashfree) {
        toast.error("Payment gateway still loading, please try again.");
        return;
      }

      const cashfree = window.Cashfree({
        mode: response.data.cashfree_env === "production" ? "production" : "sandbox",
      });

      cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: "_self" })
        .then((result) => {
          if (result.error) toast.error(result.error.message || "Payment failed");
        });

    } catch (err) {
      console.error("Subscribe error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const scrollLeft = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const scrollRight = () => {
    if (activeIndex < currentPlans.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const getPlanFeatures = (plan) => {
    if (!plan) return [];
    if (Array.isArray(plan.features)) return plan.features;
    if (typeof plan.features === "string") {
      try { const p = JSON.parse(plan.features); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    return [];
  };

  // ✅ UPDATED: Handle Lifetime duration
  const getPlanDuration = (plan) => {
    const duration = String(plan.duration || "").toLowerCase().trim();
    if (duration === "lifetime") return "Lifetime";
    if (duration === "yearly" || duration === "year" || duration === "annual") return "year";
    return "month";
  };

  const hasDiscount = (plan) =>
    Number(plan.discount_percentage) > 0;

  const getButtonText = (plan) => {
    if (isVerifyingPayment) return "Processing...";
    if (loadingPlanId === plan.id) return "Loading...";
    if (!user) return "Login to Subscribe";
    const action = getPlanAction(plan);
    if (action === "no_email") return "Add Email First";
    if (action === "current") return "Current Plan";
    if (action === "disabled_basic") return "Current Plan";
    if (action === "basic") return "Not Available";
    if (action === "downgrade") return "Cannot Downgrade";
    if (getPlanPrice(plan) === 0) return "Free Plan";
    return `Subscribe to ${plan.name}`;
  };

  const isButtonDisabled = (plan) => {
    if (isVerifyingPayment) return true;
    if (loadingPlanId !== null) return true;
    if (!user) return false;
    const action = getPlanAction(plan);
    return action === "current" || action === "disabled_basic" || action === "no_email";
  };

  const renderPlanCard = (plan, index) => {
    const features = getPlanFeatures(plan);
    const showDiscount = hasDiscount(plan);
    const displayPrice = showDiscount ? plan.discounted_price : plan.price;
    const isCurrentPlan = isCurrentUserPlan(plan);
    const isThisLoading = loadingPlanId === plan.id;
    const action = getPlanAction(plan);
    const isBlocked = action === "basic" || action === "downgrade";

    return (
      <div className="w-full">
        <div
          className={`
            w-full max-w-[380px] mx-auto
            h-auto min-h-[780px]
            rounded-[24px] p-5 sm:p-6
            text-center relative flex flex-col overflow-hidden
            transition-all duration-300 ease-out border-2 cursor-pointer
            transform hover:scale-[1.02] hover:-translate-y-2
            ${!isCurrentPlan ? "hover:border-[3px] hover:border-[#FFD700] hover:shadow-[0_0_25px_rgba(255,215,0,0.5),0_20px_50px_rgba(255,215,0,0.3)]" : ""}
            ${activeCard === index + 1
              ? "border-[3px] border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.6),0_25px_60px_rgba(255,215,0,0.4)]"
              : "border-transparent"
            }
          `}
          style={{
            backgroundImage: `url(${cardBackgrounds[index % cardBackgrounds.length]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Popular Badge */}
          {plan.is_popular && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg">
              ⭐ POPULAR
            </div>
          )}

          {/* ✅ Lifetime Badge */}
          {String(plan.duration || "").toLowerCase().trim() === "lifetime" && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg">
              ♾️ LIFETIME
            </div>
          )}

          {/* Icon */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center justify-center w-12 h-12 bg-[#3e1c71] rounded-full border border-white/20 shadow-lg">
              <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>

          {/* Plan Name & Price */}
          <div className="pt-16 flex flex-col items-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{plan.name}</h3>
            <div className="flex flex-col items-center mt-2">
              {showDiscount && (
                <p className="text-lg text-gray-300 line-through">₹{plan.price}</p>
              )}
              <p className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.1] flex items-end gap-1">
                ₹{displayPrice}
                <span className="text-base sm:text-lg font-medium mb-1">
                  /{getPlanDuration(plan)}
                </span>
              </p>
            </div>
            {plan.description && (
              <p className="text-white/80 text-sm text-center mt-2 mb-3 px-2">
                {plan.description}
              </p>
            )}

            {/* Discount Badge */}
            {showDiscount ? (
              <div className="mt-4 bg-yellow-400/10 px-4 py-2 rounded-lg border border-yellow-500/30 w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-1">
                  <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">{plan.discount_percentage}% OFF</span>
                </div>
                {plan.discount_description && <p className="text-yellow-200 text-xs text-center">{plan.discount_description}</p>}
              </div>
            ) : (
              <div className="mt-4 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600 w-full">
                <p className="text-gray-300 text-xs font-medium text-center">No discount available</p>
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="mt-6 mb-4 text-left flex-1">
            <div className="h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-3 text-white">
                {features.length > 0 ? (
                  features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 list-none">
                      <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-transparent shrink-0">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-sm sm:text-base">
                          {feature.title || feature.description || `Feature ${idx + 1}`}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-white/70 text-sm text-center py-8">No features listed</li>
                )}
              </ul>
            </div>
          </div>

          {/* Subscribe Button */}
          <div className="w-full flex justify-center mt-auto pt-4">
            <button
              onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }}
              className={`
                w-full py-3.5 rounded-full font-bold text-sm sm:text-base
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                flex items-center justify-center gap-2
                ${!user
                  ? "text-white bg-transparent border-2 border-white hover:bg-white hover:text-black"
                  : !userHasEmail
                    ? "bg-gray-700 text-white border-2 border-yellow-500 cursor-pointer hover:bg-gray-600"
                    : isCurrentPlan || action === "disabled_basic"
                      ? "bg-[#5822b4] text-white border-2 border-[#9f7aea] cursor-default opacity-80"
                      : isBlocked
                        ? "bg-gray-600 text-white border-2 border-gray-500 cursor-not-allowed opacity-70"
                        : getPlanPrice(plan) === 0
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-2 border-green-500"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-2 border-blue-500"
                }
              `}
              disabled={isButtonDisabled(plan)}
            >
              {isThisLoading && (
                <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {getButtonText(plan)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen w-full text-white pt-16 md:pt-24 px-4 bg-cover bg-center bg-no-repeat relative overflow-x-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: "fixed" }}
    >
      <div className="absolute inset-0 bg-[#d9d9d9]/10 backdrop-blur-[1px]" />

      <div className="relative z-10">
        <div className="mt-[-40px] md:mt-[-80px]">
          <ColHeader />
        </div>

        {isVerifyingPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-white text-lg font-semibold">Verifying Payment...</p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-28 left-5 md:left-10 z-10">
          <button
            onClick={() => navigate("/col-home")}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-white hover:text-white/80 transition-colors group bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40"
          >
            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#51218F] to-[#2a0e4a] group-hover:from-[#3d1768] group-hover:to-[#1a0830] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium text-sm md:text-base">Back</span>
          </button>
        </div>

        {expiredMessage && (
          <div className="max-w-4xl mx-auto mb-6 bg-yellow-500/20 border border-yellow-500 text-white px-6 py-4 rounded-lg">
            <p className="text-center font-semibold">{expiredMessage}</p>
          </div>
        )}

        <div className="text-center mt-28 md:mt-24 mb-2 md:mb-20">
          <h1 className="text-white text-2xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Simple Pricing, <br /> Powerful Features
          </h1>
          <p className="text-white text-xs md:text-lg font-semibold mt-4 drop-shadow-md">
            {user && currentPlanName
              ? `Simple, transparent pricing that grows with you. You are on ${currentPlanName}`
              : "Simple, transparent pricing that grows with you."}
          </p>

          {!loading && (plans.monthly.length > 0 || plans.yearly.length > 0) && (
            <div className="flex justify-center mt-12">
              <div className="flex rounded-full p-1 bg-[#2D0A4A] border border-white ring-1 ring-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                <button 
                  onClick={() => setBilling("monthly")} 
                  className={`px-6 py-2 rounded-full font-semibold text-sm ${billing === "monthly" ? "bg-white text-black" : "text-white hover:text-gray-200"}`} 
                  disabled={loading || isVerifyingPayment}
                >
                  Lifetime / Monthly
                </button>
                <button 
                  onClick={() => setBilling("yearly")} 
                  className={`px-6 py-2 rounded-full font-semibold text-sm ${billing === "yearly" ? "bg-white text-black" : "text-white hover:text-gray-200"}`} 
                  disabled={loading || isVerifyingPayment}
                >
                  Annual billing
                </button>
              </div>
            </div>
          )}

          {/* Helper Banner - shown when user has no email */}
          {!loading && user && !userHasEmail && (
            <div className="max-w-2xl mx-auto mt-8 px-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-purple-800/40 to-purple-900/60 backdrop-blur-sm border border-yellow-500/40 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent pointer-events-none" />
                <div className="relative p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-white font-semibold text-base md:text-lg">Email address missing</p>
                    <p className="text-yellow-200/90 text-sm md:text-base">Please add your email address in your profile to subscribe to any plan.</p>
                  </div>
                  <button
                    onClick={() => navigate("/collab-edit-profile")}
                    className="px-5 py-2 rounded-full bg-white text-purple-900 font-bold text-sm hover:bg-yellow-400 hover:text-purple-900 transition-all duration-200 shadow-md whitespace-nowrap"
                  >
                    Add Email →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading subscription plans...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10 px-4 max-w-2xl mx-auto">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8">
              <p className="text-yellow-300 text-lg mb-4">{error}</p>
              <p className="text-white/70 text-sm mb-6">
                This could be because:<br />
                • No subscription plans have been created for collaborators in the admin panel<br />
                • Your account role may need to be configured
              </p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors">Retry</button>
            </div>
          </div>
        )}

        {!loading && !error && plans.monthly.length === 0 && plans.yearly.length === 0 && (
          <div className="text-center py-10 px-4 max-w-2xl mx-auto">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-8">
              <p className="text-yellow-300 text-lg mb-4">No subscription plans available for collaborators.</p>
              <p className="text-white/70 text-sm mb-6">Please check back later or contact support if you believe this is an error.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors">Refresh</button>
            </div>
          </div>
        )}

        {!loading && !error && (plans.monthly.length > 0 || plans.yearly.length > 0) && (
          <>
            {/* Mobile/Tablet: Single Card Carousel */}
            <div className="md:hidden">
              <div className="flex justify-center px-4">
                <div className="w-full max-w-[380px] mx-auto transition-all duration-300">
                  {currentPlans[activeIndex] && renderPlanCard(currentPlans[activeIndex], activeIndex)}
                </div>
              </div>

              {currentPlans.length > 1 && (
                <div className="flex flex-col items-center justify-center gap-4 mt-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={scrollLeft}
                      disabled={activeIndex === 0}
                      className={`
                        w-10 h-10 rounded-full bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] 
                        flex items-center justify-center text-white shadow-md active:scale-90 transition-all
                        ${activeIndex === 0
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:from-[#5b24ad] hover:to-[#2a1f5e]'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2">
                      {currentPlans.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${idx === activeIndex
                            ? 'w-8 bg-[#FFD700]'
                            : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={scrollRight}
                      disabled={activeIndex === currentPlans.length - 1}
                      className={`
                        w-10 h-10 rounded-full bg-gradient-to-b from-[#4c1d95] to-[#1e1b4b] 
                        flex items-center justify-center text-white shadow-md active:scale-90 transition-all
                        ${activeIndex === currentPlans.length - 1
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:from-[#5b24ad] hover:to-[#2a1f5e]'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-[1200px] mx-auto px-4 md:px-6 mb-12 md:mb-16">
              {currentPlans.map((plan, index) => renderPlanCard(plan, index))}
            </div>
          </>
        )}

        <div className="-mx-4 mt-12 sm:mt-16 md:mt-20">
          <Footer />
        </div>
      </div>

      <style>{`
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(32, 5, 49, 0.84) transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.5); }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default CollabSubscription;