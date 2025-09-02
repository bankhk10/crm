"use client";

import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { toast } from "sonner";
import { Prompt } from "next/font/google";

const prompt = Prompt({
  weight: ["400", "500", "700"],
  subsets: ["thai", "latin"],
});

type ForgotPasswordInputs = {
  email: string;
};

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      await api.post("/auth/forgot-password", data);
      toast.success("Password reset email sent");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Email not found");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <h1 className={`${prompt.className} text-center text-2xl font-bold mb-6`}>
          ลืมรหัสผ่าน
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="อีเมล"
            {...register("email", { required: "Email is required" })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition placeholder:text-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-white bg-gray-500 rounded-xl hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งลิงค์รีเซตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}

