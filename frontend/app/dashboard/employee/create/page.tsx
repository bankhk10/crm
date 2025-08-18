'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

type Province = {
  id: number;
  name_th: string;
};

type Amphure = {
  id: number;
  name_th: string;
  province_id: number;
};

type Tambon = {
  id: number;
  name_th: string;
  amphure_id: number;
  zip_code: string;
};

type Role = {
  id: number;
  name: string;
};

type CreateEmployeeFormInputs = {
  employeeId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
  roleId: string;
  birthDate: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  position: string;
  department: string;
  startDate: string;
  endDate: string;
  managerId: string;
  status: string;
  company: string;
  responsibleArea: string;
};

export default function CreateEmployeePage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, control, formState: { isSubmitting } } = useForm<CreateEmployeeFormInputs>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [provinceId, setProvinceId] = useState<number>();
  const [amphureId, setAmphureId] = useState<number>();
  const [tambonId, setTambonId] = useState<number>();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pRes, aRes, tRes, rolesRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json'),
          fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json'),
          fetch('https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json'),
          api.get('/roles'),
        ]);
        setProvinces(await pRes.json());
        setAmphures(await aRes.json());
        setTambons(await tRes.json());
        setRoles(rolesRes.data);
      } catch (error) {
        toast.error('โหลดข้อมูลเริ่มต้นไม่สำเร็จ');
      }
    };
    fetchInitialData();
  }, []);

  const filteredAmphures = amphures.filter(a => a.province_id === provinceId);
  const filteredTambons = tambons.filter(t => t.amphure_id === amphureId);

  const onSubmit: SubmitHandler<CreateEmployeeFormInputs> = async (data) => {
    const payload = {
      ...data,
      email: data.email.trim(),
      age: data.age ? Number(data.age) : undefined,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      roleId: Number(data.roleId),
    };
    try {
      await api.post('/employees', payload);
      toast.success('บันทึกพนักงานสำเร็จ');
      router.push('/dashboard/employee');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'บันทึกพนักงานไม่สำเร็จ');
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
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6">
            ข้อมูลพนักงาน
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน *</label>
              <Input {...register('employeeId', { required: true })} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">คำนำหน้า *</label>
              <Controller
                name="prefix"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="นาย">นาย</SelectItem>
                      <SelectItem value="นาง">นาง</SelectItem>
                      <SelectItem value="นางสาว">นางสาว</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ *</label>
              <Input {...register('firstName', { required: true })} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">นามสกุล *</label>
              <Input {...register('lastName', { required: true })} className="mt-1" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">วันเกิด *</label>
              <Input type="date" {...register('birthDate', { required: true })} className="mt-1" />
              <CalendarIcon className="absolute right-3 top-9 text-gray-400" size={20} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">อายุ</label>
              <Input {...register('age')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">เพศ</label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ชาย">ชาย</SelectItem>
                      <SelectItem value="หญิง">หญิง</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
              <Input {...register('phone')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">อีเมล *</label>
              <Input type="email" {...register('email', { required: true })} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสผ่าน *</label>
              <Input type="password" {...register('password', { required: true, minLength: 6 })} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">สิทธิ์การใช้งาน *</label>
              <Controller
                name="roleId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
              <Input {...register('address')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">จังหวัด</label>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <Select
                    value={provinceId ? provinceId.toString() : ''}
                    onValueChange={(value) => {
                      const id = Number(value);
                      const name = provinces.find(p => p.id === id)?.name_th || '';
                      setProvinceId(id);
                      setAmphureId(undefined);
                      setTambonId(undefined);
                      field.onChange(name);
                      setValue('district', '');
                      setValue('subdistrict', '');
                      setValue('postalCode', '');
                    }}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name_th}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">อำเภอ</label>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    value={amphureId ? amphureId.toString() : ''}
                    onValueChange={(value) => {
                      const id = Number(value);
                      const name = filteredAmphures.find(a => a.id === id)?.name_th || '';
                      setAmphureId(id);
                      setTambonId(undefined);
                      field.onChange(name);
                      setValue('subdistrict', '');
                      setValue('postalCode', '');
                    }}
                    disabled={!provinceId}
                  >
                    <SelectTrigger className="mt-1 w-full" disabled={!provinceId}>
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAmphures.map(a => (
                        <SelectItem key={a.id} value={a.id.toString()}>{a.name_th}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ตำบล</label>
              <Controller
                name="subdistrict"
                control={control}
                render={({ field }) => (
                  <Select
                    value={tambonId ? tambonId.toString() : ''}
                    onValueChange={(value) => {
                      const id = Number(value);
                      const selected = filteredTambons.find(t => t.id === id);
                      setTambonId(id);
                      field.onChange(selected?.name_th || '');
                      if (selected) setValue('postalCode', selected.zip_code.toString());
                    }}
                    disabled={!amphureId}
                  >
                    <SelectTrigger className="mt-1 w-full" disabled={!amphureId}>
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTambons.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.name_th}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสไปรษณีย์</label>
              <Input {...register('postalCode')} readOnly className="mt-1 bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
              <Input {...register('position')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">แผนก</label>
              <Input {...register('department')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">วันที่เริ่มงาน</label>
              <Input type="date" {...register('startDate')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">วันที่สิ้นสุดพนักงาน</label>
              <Input type="date" {...register('endDate')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสหัวหน้าพนักงาน</label>
              <Input {...register('managerId')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">สถานะพนักงาน</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">บริษัท</label>
              <Input {...register('company')} className="mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">เขตรับผิดชอบ</label>
              <Input {...register('responsibleArea')} className="mt-1" />
            </div>
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
