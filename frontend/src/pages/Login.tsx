import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { useAppData } from "../context/AppContext";
import AuthForm from "../components/manualLoginAndRegister";
import Footer from "../components/Footer";

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);
  const { setUser, setIsAuth } = useAppData(); 

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && !hasProcessed.current) {
      hasProcessed.current = true;
      handleLogin(code);
      window.history.replaceState({}, document.title, "/login");
    }
  }, [searchParams]);

  const handleLogin = async (code: string) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code,
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setUser(result.data.user); 
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Problem while login");
    } finally {
      setLoading(false);
    }
  };
 
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: import.meta.env.VITE_REDIRECT_URL,
  });
 
  if (showEmailForm) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-slate-50/50 overflow-hidden animate-fade-in px-4">
         
        <div className="absolute top-[-5%] left-[-5%] w-96 h-96 rounded-full bg-[#e23774]/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 rounded-full bg-purple-400/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[70%] w-72 h-72 rounded-full bg-pink-300/30 blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-rose-200/30 blur-[120px] pointer-events-none"></div>
         
        <button 
          onClick={() => setShowEmailForm(false)}
          className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center gap-2 text-gray-600 hover:text-[#e23774] transition-all duration-300 font-medium bg-white/50 backdrop-blur-xl px-5 py-2.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/60 hover:shadow-md hover:bg-white/70"
        >
          <FiArrowLeft size={18} />
          Back to Options
        </button>
         
        <div className="relative z-10 w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 px-4 font-sans overflow-hidden animate-fade-in">
       
      <div className="absolute top-[-10%] left-[10%] w-[25rem] h-[25rem] rounded-full bg-[#e23774]/25 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30rem] h-[30rem] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[15%] w-64 h-64 rounded-full bg-orange-200/30 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-80 h-80 rounded-full bg-pink-300/30 blur-[100px] pointer-events-none"></div>
  
      <div className="relative z-10 w-full max-w-sm space-y-8 bg-white/50 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60">
         
        <div>
          <h1 className="text-center text-4xl font-extrabold text-[#e23774] mb-2 tracking-tight drop-shadow-sm">
            Zesto
          </h1>
          <p className="text-center text-sm text-gray-600 font-medium">
            Log in or Sign up to continue
          </p>
        </div>
 
        <div className="space-y-4">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/80 bg-white/70 backdrop-blur-md px-4 py-3.5 text-gray-700 font-semibold shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            <FcGoogle size={22} />
            {loading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50"></div>
            </div>
            <div className="relative bg-transparent px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Or
            </div>
          </div>

          <button
            onClick={() => setShowEmailForm(true)}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#e23774]/90 backdrop-blur-md px-4 py-3.5 text-white font-semibold shadow-[0_4px_14px_0_rgba(226,55,116,0.39)] hover:shadow-[0_6px_20px_rgba(226,55,116,0.23)] hover:bg-[#e23774] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
          >
            <FiMail size={20} />
            Continue with Email
          </button>
        </div>
 
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 leading-relaxed font-medium">
          By continuing, you agree with our{" "}
          <a href="#" className="text-[#e23774] hover:text-[#c92f66] transition-colors underline decoration-[#e23774]/30 underline-offset-2">Terms of Service</a> &{" "}
          <a href="#" className="text-[#e23774] hover:text-[#c92f66] transition-colors underline decoration-[#e23774]/30 underline-offset-2">Privacy Policy</a>
        </p>

      </div>
      <Footer/>
    </div>
  );
};

export default Login;