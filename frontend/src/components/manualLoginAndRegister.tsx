import axios from "axios";
import { useState, type ChangeEvent, type FormEvent, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import { authService } from "../main";
import { useAppData } from "../context/AppContext";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUser, setIsAuth } = useAppData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePhoto: "",
  });

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let errorMsg = "";
    if (name === "name" && value.trim().length <= 2) {
      errorMsg = "Name must be more than 2 characters";
    } else if (name === "email" && !validateEmail(value)) {
      errorMsg = "Please enter a valid email address";
    } else if (name === "password" && value.length < 6) {
      errorMsg = "Password must be at least 6 characters";
    } else if (name === "confirmPassword" && value !== formData.password) {
      errorMsg = "Passwords do not match";
    } else if (
      name === "password" &&
      formData.confirmPassword &&
      value !== formData.confirmPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else if (
      name === "password" &&
      formData.confirmPassword &&
      value === formData.confirmPassword
    ) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePhoto: "File size must be less than 2MB",
        }));
        setProfilePhoto(null);
        setPreviewUrl(null);
        return;
      }

      setErrors((prev) => ({ ...prev, profilePhoto: "" }));
      setProfilePhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePhoto: "",
    });
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    removePhoto();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const currentErrors = { ...errors };
    let hasError = false; 
    if (!validateEmail(formData.email)) {
      currentErrors.email = "Valid email is required";
      hasError = true;
    }
    if (formData.password.length < 6) {
      currentErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    if (!isLogin) {
      if (formData.name.trim().length <= 2) {
        currentErrors.name = "Name must be more than 2 characters";
        hasError = true;
      }
      if (formData.password !== formData.confirmPassword) {
        currentErrors.confirmPassword = "Passwords do not match";
        hasError = true;
      }
      if (!profilePhoto) {
        currentErrors.profilePhoto = "Profile photo is required";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(currentErrors);
      toast.error("Please fix the errors in the form");
      return;
    } 
    try {
      if (isLogin) { 
        const { data } = await axios.post(
          `${authService}/api/auth/login/manual`,
          {
            email: formData.email,
            password: formData.password,
          },
        );

        toast.success(data.message || "Logged in successfully!");
        setUser(data.user);
        setIsAuth(true);
        localStorage.setItem("token", data.token);
      } else { 
        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("email", formData.email);
        submitData.append("password", formData.password); 
        submitData.append("file", profilePhoto as Blob);

        const { data } = await axios.post(
          `${authService}/api/auth/new/register`,
          submitData,
        );

        toast.success(data.message || "Account created successfully!");
        setIsLogin(true);
        toast.success("Please switch to Login");
        // setIsLogin(true);
      }
    } catch (error: any) {
      console.error(error); 
      const backendMessage = error.response?.data?.message;
      if (isLogin) {
        toast.error(backendMessage || "Problem while logging in");
      } else {
        toast.error(backendMessage || "Problem while registering");
      }
    }
  };

  const inputBaseClass =
    "w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border rounded-xl outline-none transition-all duration-200 focus:bg-white/90 focus:ring-2 shadow-sm placeholder:text-gray-400";

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full bg-white/50 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 transition-all duration-300 ease-in-out font-sans text-gray-800">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold mb-2 text-[#e23774] drop-shadow-sm">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600 font-medium text-sm">
            {isLogin
              ? "Enter your details to access your account"
              : "Sign up to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="animate-fade-in">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${inputBaseClass} ${
                    errors.name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-white/80 focus:border-[#e23774] focus:ring-[#e23774]/20"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {/* ---- EMAIL ---- */}
          <div>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className={`${inputBaseClass} ${
                  errors.email
                    ? "border-red-400 focus:ring-red-200"
                    : "border-white/80 focus:border-[#e23774] focus:ring-[#e23774]/20"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* ---- PASSWORD ---- */}
          <div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${inputBaseClass} pr-12 ${
                  errors.password
                    ? "border-red-400 focus:ring-red-200"
                    : "border-white/80 focus:border-[#e23774] focus:ring-[#e23774]/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e23774] transition-colors"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          {/* ---- CONFIRM PASSWORD ---- */}
          {!isLogin && (
            <div className="animate-fade-in">
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${inputBaseClass} ${
                    errors.confirmPassword
                      ? "border-red-400 focus:ring-red-200"
                      : "border-white/80 focus:border-[#e23774] focus:ring-[#e23774]/20"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* ---- PROFILE PHOTO UPLOAD ---- */}
          {!isLogin && (
            <div className="animate-fade-in">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/70 bg-white/40 backdrop-blur-sm ${
                    errors.profilePhoto
                      ? "border-red-400 bg-red-50/50"
                      : "border-white/80 hover:border-[#e23774]"
                  }`}
                >
                  <FiUploadCloud
                    className={`text-3xl mb-2 ${errors.profilePhoto ? "text-red-400" : "text-[#e23774]/70"}`}
                  />
                  <p className="text-sm font-medium text-gray-700">
                    Upload Profile Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-32 rounded-xl border border-white/80 overflow-hidden flex items-center justify-center bg-white/40 backdrop-blur-sm shadow-inner">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
              {errors.profilePhoto && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
                  {errors.profilePhoto}
                </p>
              )}
            </div>
          )}

          {/* ---- SUBMIT BUTTON ---- */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 text-white font-semibold rounded-xl bg-[#e23774]/90 backdrop-blur-md shadow-[0_4px_14px_0_rgba(226,55,116,0.39)] hover:shadow-[0_6px_20px_rgba(226,55,116,0.23)] hover:bg-[#e23774] transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 mt-4"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* ---- TOGGLE MODE ---- */}
        <div className="mt-6 text-center text-sm text-gray-600 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-bold text-[#e23774] hover:text-[#c92f66] hover:underline underline-offset-2 focus:outline-none transition-colors"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </>
  );
}
