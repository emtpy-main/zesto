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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-8">
         
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Choose your role
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Select how you want to use the platform.
          </p>
        </div>

        {/* Role Selection Options */}
        <div className="space-y-3">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = role === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => setRole(option.id)}
                className={`group relative w-full flex items-center gap-4 text-left p-4 rounded-2xl border-2 transition-all duration-200 ease-in-out outline-none focus:ring-4 focus:ring-[#e23744]/10 ${
                  isSelected
                    ? "border-[#e23744] bg-[#e23744]/[0.03] shadow-sm"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`flex-shrink-0 p-3 rounded-xl transition-colors ${
                    isSelected
                      ? "bg-[#e23744] text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                  }`}
                >
                  <Icon className="text-2xl" />
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3
                    className={`text-base font-bold transition-colors ${
                      isSelected ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {option.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5 pr-4 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Selected Indicator */}
                <div
                  className={`absolute right-4 transition-all duration-200 ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  }`}
                >
                  <BiCheckCircle className="text-2xl text-[#e23744]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            disabled={!role || isLoading}
            onClick={addRole}
            className={`w-full relative flex items-center justify-center rounded-xl px-4 py-4 text-base font-bold transition-all duration-200 active:scale-[0.98] ${
              role && !isLoading
                ? "bg-[#e23744] hover:bg-[#c9313d] text-white shadow-lg shadow-[#e23744]/25"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
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