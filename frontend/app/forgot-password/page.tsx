"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Prompt } from "next/font/google";

interface ForgotPasswordForm {
  email: string;
}

const prompt = Prompt({
  weight: ["400", "500", "700"],
  subsets: ["thai", "latin"],
});

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>();

  const onSubmit: SubmitHandler<ForgotPasswordForm> = async (data) => {
    try {
      await api.post("/auth/forgot-password", data);
      toast.success("เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1
          className={`${prompt.className} text-center text-2xl font-bold mb-6`}
        >
          ลืมรหัสผ่าน
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            className="w-full py-2 text-white bg-gray-500 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition disabled:bg-gray-400"
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ต"}
          </button>
        </form>
        <p className="text-center mt-4">
          <Link
            href="/login"
            className={`${prompt.className} text-gray-600 hover:text-gray-900`}
          >
            กลับสู่หน้าล็อกอิน
          </Link>
        </p>
      </div>
    </div>
  );
}

