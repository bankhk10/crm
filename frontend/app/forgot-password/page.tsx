"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Prompt } from "next/font/google";

const prompt = Prompt({
  weight: ["400", "500", "700"],
  subsets: ["thai", "latin"],
});

type ForgotFormInputs = {
  email: string;
};

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormInputs>();

  const onSubmit: SubmitHandler<ForgotFormInputs> = async (data) => {
    try {
      await api.post("/auth/forgot-password", data);
      toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้"
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-400 overflow-hidden">
      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-white/100 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
          <h1
            className={`${prompt.className} text-center text-xl font-bold text-gray-800 mb-6`}
          >
            ลืมรหัสผ่าน
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="EMAIL"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition placeholder:text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-2 px-6 text-white bg-gray-500 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>
            <div className="text-center">
              <Link
                href="/login"
                className={`${prompt.className} text-gray-600 hover:text-gray-900`}
              >
                กลับสู่หน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
