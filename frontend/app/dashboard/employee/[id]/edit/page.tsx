'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Role {
  id: number;
  name: string;
}

type EditEmployeeFormInputs = {
  prefix: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password?: string;
  status: string;
  company: string;
  responsibleArea: string;
  roleId: string;
};

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<EditEmployeeFormInputs>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/roles'),
        ]);
        const user = userRes.data;
        setEmployeeId(user.employeeId);
        setRoles(rolesRes.data);
        setValue('prefix', user.prefix || '');
        setValue('firstName', user.firstName || '');
        setValue('lastName', user.lastName || '');
        setValue('phone', user.phone || '');
        setValue('email', user.email || '');
        setValue('status', user.status || '');
        setValue('company', user.company || '');
        setValue('responsibleArea', user.responsibleArea || '');
        setValue('roleId', String(user.roleId));
      } catch (error) {
        toast.error('ไม่สามารถโหลดข้อมูลพนักงาน');
        router.push('/dashboard/employee');
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, router, setValue]);

  const onSubmit: SubmitHandler<EditEmployeeFormInputs> = async (data) => {
    const payload: any = {
      ...data,
      roleId: Number(data.roleId),
    };
    if (!data.password) {
      delete payload.password;
    }
    try {
      await api.patch(`/employees/${employeeId}`, payload);
      toast.success('แก้ไขพนักงานสำเร็จ');
      router.push('/dashboard/employee');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'แก้ไขพนักงานไม่สำเร็จ');
    }
  };

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">แก้ไขพนักงาน</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน</label>
            <input value={employeeId} readOnly className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">คำนำหน้า</label>
            <input {...register('prefix')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
            <input {...register('firstName')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
            <input {...register('lastName')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input {...register('email')} readOnly className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
            <input type="password" {...register('password')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <input {...register('phone')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">สถานะพนักงาน</label>
            <select {...register('status')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option value="">กรุณาเลือก</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">บริษัท</label>
            <input {...register('company')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">เขตรับผิดชอบ</label>
            <input {...register('responsibleArea')} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน *</label>
            <select {...register('roleId', { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
              <option value="">กรุณาเลือก</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
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

