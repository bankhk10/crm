"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Prompt } from "next/font/google";

type LoginFormInputs = {
  email: string;
  password: string;
};

const Logo = () => (
  <div className="flex flex-col items-center justify-center -mt-20 mb-6 mx-auto">
    <div className="relative w-36 h-36 bg-white border-2 border-gray-200 rounded-lg shadow-md overflow-hidden p-2">
      <Image
        src="/images/logo.jpg"
        alt="Logo"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  </div>
);

const prompt = Prompt({
  weight: ["400", "500", "700"], // เลือกน้ำหนักฟอนต์
  subsets: ["thai", "latin"], // ให้รองรับภาษาไทย
});

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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-400 overflow-hidden">
      {/* === Red Top-Right Blob === */}
      <svg
        className="absolute top-0 right-0 w-full h-full z-0"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M250,0 C300,100 600,100 700,200 C800,300 450,500 800,600 L800,0 Z"
          fill="#b92626"
        />
      </svg>

      {/* === Concentric Circles Bottom Left === */}
      <div className="absolute bottom-[-180px] left-[-180px] w-[500px] h-[500px] rounded-full bg-[#b92626] flex items-center justify-center">
        <div className="w-[400px] h-[400px] rounded-full bg-white flex items-center justify-center">
          <div className="w-[300px] h-[300px] rounded-full bg-gray-400"></div>
        </div>
      </div>

      {/* === Login Form === */}
      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-white/100 backdrop-blur-sm p-8 pt-24 rounded-2xl shadow-2xl">
          <Logo />
          <div className="text-center mb-8">
            <h1
              className={`${prompt.className} text-center text-2xl font-bold`}
            >
              ระบบ <span className="text-[#e51717]">CS ONE</span>
            </h1>

            <h1 className={`text-center text-1xl font-bold mt-2`}>
              Smart Crop Smart Solutions
            </h1>
            {/* <p className="text-gray-800">
              Smart Crop Smart Solutions
            </p> */}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="my-4">
              <h1
                className={`${prompt.className} text-center text-xl font-bold text-gray-800 mb-6`}
              >
                เข้าสู่ระบบ
              </h1>
              <input
                type="email"
                placeholder="USERNAME"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition placeholder:text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="PASSWORD"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition pr-10 placeholder:text-sm"
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <label
                  htmlFor="remember-me"
                  className={`${prompt.className} ml-2 block text-gray-600`}
                >
                  บันทึกรหัส
                </label>
              </div>
              <Link
                href="#"
                className={`${prompt.className} text-gray-600 hover:text-gray-900`}
              >
                ลืมรหัสผ่าน
              </Link>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="font-serif w-fit flex items-center justify-center py-2 px-6 text-white bg-gray-500 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-transform transform hover:scale-105 disabled:bg-gray-400 mt-4"
              >
                {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                {/* {!isSubmitting && <ArrowRight className="ml-2" size={20} />} */}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
