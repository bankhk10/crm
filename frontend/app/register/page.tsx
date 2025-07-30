'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

// --- Placeholder Logo Component ---
const Logo = () => (
    <div className="flex flex-col items-center justify-center bg-white p-4 border-2 border-gray-200 rounded-lg shadow-md -mt-20 mb-6 w-40 h-40 mx-auto">
      <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      </div>
      <div className="bg-black text-white text-center text-lg font-bold px-4 py-1 rounded-md">
        ตราปืนใหญ่
      </div>
    </div>
  );

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Registration successful! Please log in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F3F4F6] overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#D42A2A] rounded-full opacity-90"></div>
      <div className="absolute bottom-[-30%] left-[-25%] w-[700px] h-[700px] bg-[#D42A2A] rounded-full opacity-90"></div>
      <div className="absolute bottom-[-25%] left-[-20%] w-[600px] h-[600px] bg-white rounded-full"></div>
      <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] bg-gray-300 rounded-full"></div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 pt-24 rounded-2xl shadow-2xl">
          <Logo />
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">สร้างบัญชีใหม่</h1>
            <p className="text-gray-600">Customer Relationship Management (CRM)</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                placeholder="Your Name"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{`${errors.name.message}`}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="youremail@gmail.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{`${errors.email.message}`}</p>}
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('password', { required: 'Password is required', minLength: 6 })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters.</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="********"
                {...register('confirmPassword', { required: 'Please confirm your password' })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent transition"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{`${errors.confirmPassword.message}`}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
              {isSubmitting ? 'กำลังสร้างบัญชี...' : 'ลงทะเบียน'}
              {!isSubmitting && <ArrowRight className="ml-2" size={20} />}
            </button>

            <p className="text-sm text-center pt-2">
                มีบัญชีอยู่แล้ว?{' '}
                <Link href="/login" className="font-medium text-gray-600 hover:underline">
                    เข้าสู่ระบบที่นี่
                </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
