import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import toast from "react-hot-toast";
import { 
  BiUser, 
  BiStoreAlt, 
  BiMapAlt, 
  BiCheckCircle 
} from "react-icons/bi";

type Role = "customer" | "rider" | "seller" | null;

// Mapping array to easily add icons and descriptions while keeping the backend value intact
const ROLE_OPTIONS = [
  {
    id: "customer" as Role,
    title: "Customer",
    description: "Order food and track deliveries easily.",
    icon: BiUser,
  },
  {
    id: "rider" as Role,
    title: "Delivery Partner",
    description: "Deliver orders, manage routes, and earn.",
    icon: BiMapAlt,
  },
  {
    id: "seller" as Role,
    title: "Restaurant Owner",
    description: "Manage your menu, kitchen, and sales.",
    icon: BiStoreAlt,
  },
];

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAppData();
  const navigate = useNavigate();

  const addRole = async () => {
    if (!role) return;
    setIsLoading(true);

    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 font-sans overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#e23744] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-white space-y-8">
          
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Choose your role
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Select how you want to use the platform.
          </p>
        </div>

        {/* Role Selection Options */}
        <div className="space-y-4">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = role === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => setRole(option.id)}
                className={`group relative w-full flex items-center gap-4 text-left p-4 rounded-2xl border-2 transition-all duration-300 ease-in-out outline-none focus:ring-4 focus:ring-[#e23744]/15 ${
                  isSelected
                    ? "border-[#e23744] bg-white shadow-md scale-[1.02]"
                    : "border-transparent bg-white/60 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`flex-shrink-0 p-3.5 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? "bg-[#e23744] text-white shadow-lg shadow-[#e23744]/30"
                      : "bg-gray-100/80 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-700"
                  }`}
                >
                  <Icon className="text-2xl" />
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3
                    className={`text-base font-bold transition-colors ${
                      isSelected ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {option.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 mt-1 pr-6 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Selected Indicator */}
                <div
                  className={`absolute right-4 transition-all duration-300 ${
                    isSelected ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
                  }`}
                >
                  <BiCheckCircle className="text-2xl text-[#e23744]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            disabled={!role || isLoading}
            onClick={addRole}
            className={`w-full relative flex items-center justify-center rounded-2xl px-4 py-4 text-base font-bold transition-all duration-300 active:scale-[0.98] ${
              role && !isLoading
                ? "bg-[#e23744] hover:bg-[#c9313d] text-white shadow-xl shadow-[#e23744]/25 hover:shadow-[#e23744]/40"
                : "bg-gray-200/60 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SelectRole;