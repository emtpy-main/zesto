import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);
  const {setUser,setIsAuth} = useAppData();
  // 🔹 1. Handle redirect callback
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

  // 🔹 2. Google Login (Redirect Mode)
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "redirect",
    redirect_uri: "http://localhost:5173/login",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-3xl font-bold text-[#e23774]">Zesto</h1>

        <p className="text-center text-sm text-gray-500">
          Log in or Sign up to continue
        </p>

        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <FcGoogle size={20} />
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        <p className="text-center text-xs text-gray-400">
          By continuing, you agree with our{" "}
          <span className="text-[#e23774]">Terms of Service</span> &{" "}
          <span className="text-[#e23774]">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
