"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

// --- Type Definition for Form Inputs ---
type LoginFormInputs = {
  email: string;
  password: string;
};

// --- Placeholder Logo Component ---
const Logo = () => (
  <div className="flex flex-col items-center justify-center bg-white p-4 border-2 border-gray-200 rounded-lg shadow-md -mt-20 mb-6 w-40 h-40 mx-auto">
    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md mb-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    </div>
    <div className="bg-black text-white text-center text-lg font-bold px-4 py-1 rounded-md">
      ตราปืนใหญ่
    </div>
  </div>
);

// --- Main Login Page Component ---
export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await api.post("/auth/login", data);
      login(response.data.accessToken, response.data.refreshToken);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f3f6f8] overflow-hidden">
      {/* === Red Top-Right Blob === */}
      <svg
        className="absolute top-0 right-0 w-full h-full z-0"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M250,0 C300,100 600,100 700,200 C800,300 450,500 800,600 L800,0 Z"
          fill="#D42A2A"
        />
      </svg>

      {/* === Concentric Circles Bottom Left === */}
      <div className="absolute bottom-[-180px] left-[-180px] w-[500px] h-[500px] rounded-full bg-[#D42A2A] flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-white flex items-center justify-center">
          <div className="w-[300px] h-[300px] rounded-full bg-gray-400"></div>
        </div>
      </div>

      {/* === Login Form === */}
      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 pt-24 rounded-2xl shadow-2xl">
          <Logo />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              ระบบบริหารงานขายและการตลาด
            </h1>
            <p className="text-gray-600">
              Customer Relationship Management (CRM)
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="youremail@gmail.com"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-gray-800"
                >
                  บันทึกรหัส
                </label>
              </div>
              <Link
                href="#"
                className="font-medium text-gray-600 hover:text-gray-900"
              >
                ลืมรหัสผ่าน
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 text-white bg-gray-500 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
              {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              {!isSubmitting && <ArrowRight className="ml-2" size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
