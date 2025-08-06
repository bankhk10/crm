'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Type Definitions ---
interface Role {
  id: number;
  name: string;
}

type CreateEmployeeFormInputs = {
  firstName: string;
  lastName: string;
  employeeId: string;
  birthDate: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  company: string;
  loginEmail: string;
  loginPassword: string;
  accessRights: string;
  status: string;
  roleId: number; // For system role
};

// --- Main Page Component ---
export default function CreateEmployeePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateEmployeeFormInputs>();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (error) {
        toast.error('Failed to fetch roles.');
      }
    };
    fetchRoles();
  }, []);

  const onSubmit: SubmitHandler<CreateEmployeeFormInputs> = async (data) => {
    try {
      // Map form data to the user creation DTO
      const newUser = {
        name: `${data.firstName} ${data.lastName}`,
        email: data.loginEmail,
        password: data.loginPassword,
        roleId: Number(data.roleId),
      };
      await api.post('/users', newUser);
      toast.success('Employee created successfully!');
      router.push('/dashboard/employee'); // Redirect back to the employee list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create employee.');
    }
  };

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">เพิ่มพนักงาน</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* General Information Section */}
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6">
            ข้อมูลทั่วไป
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Form Fields */}
            <div><label className="block text-sm font-medium text-gray-700">ชื่อ *</label><input {...register("firstName", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">นามสกุล *</label><input {...register("lastName", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">รหัสพนักงาน</label><input {...register("employeeId")} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div className="relative"><label className="block text-sm font-medium text-gray-700">วันเกิด *</label><input type="date" {...register("birthDate", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /><CalendarIcon className="absolute right-3 top-9 text-gray-400" size={20} /></div>
            <div><label className="block text-sm font-medium text-gray-700">อายุ</label><input {...register("age")} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">เพศ</label><select {...register("gender")} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option>กรุณาเลือก</option><option>ชาย</option><option>หญิง</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label><input {...register("phone")} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">อีเมล</label><input type="email" {...register("email")} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">แผนก *</label><select {...register("department", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option>กรุณาเลือก</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">ตำแหน่ง *</label><select {...register("position", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option>กรุณาเลือก</option></select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">สังกัด บริษัท *</label><select {...register("company", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option>กรุณาเลือก</option></select></div>
          </div>
        </div>

        {/* System Access Section */}
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6">
            ข้อมูลการเข้าระบบ
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div><label className="block text-sm font-medium text-gray-700">อีเมล *</label><input type="email" {...register("loginEmail", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">รหัสผ่าน *</label><input type="password" {...register("loginPassword", { required: true, minLength: 6 })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
            <div><label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน *</label>
              <select {...register("roleId", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                <option value="">กรุณาเลือก</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">สถานะการเข้าระบบ *</label><select {...register("status", { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option>กรุณาเลือก</option><option>Active</option><option>Inactive</option></select></div>
          </div>
        </div>
        
        <div className="flex justify-center">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
        </div>
      </form>
    </div>
  );
}
