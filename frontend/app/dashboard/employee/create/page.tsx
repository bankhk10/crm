'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

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
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<CreateEmployeeFormInputs>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [provinceId, setProvinceId] = useState<number>();
  const [amphureId, setAmphureId] = useState<number>();
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

  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setProvinceId(id);
    setAmphureId(undefined);
    setValue('province', e.target.options[e.target.selectedIndex].text);
    setValue('district', '');
    setValue('subdistrict', '');
    setValue('postalCode', '');
  };

  const handleAmphureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setAmphureId(id);
    setValue('district', e.target.options[e.target.selectedIndex].text);
    setValue('subdistrict', '');
    setValue('postalCode', '');
  };

  const handleTambonChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const selected = tambons.find(t => t.id === id);
    setValue('subdistrict', e.target.options[e.target.selectedIndex].text);
    if (selected) setValue('postalCode', selected.zip_code.toString());
  };

  return (
    <Card className="w-full min-h-full p-6 md:p-8">
      <div className="flex items-center mb-8">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-3xl font-bold">เพิ่มพนักงาน</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6">
            ข้อมูลพนักงาน
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label htmlFor="employeeId" className="block">
                รหัสพนักงาน *
              </Label>
              <Input id="employeeId" className="mt-1" {...register('employeeId', { required: true })} />
            </div>
            <div>
              <Label htmlFor="prefix" className="block">
                คำนำหน้า *
              </Label>
              <Select id="prefix" className="mt-1 bg-white" {...register('prefix', { required: true })}>
                <option value="">กรุณาเลือก</option>
                <option>นาย</option>
                <option>นาง</option>
                <option>นางสาว</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="firstName" className="block">
                ชื่อ *
              </Label>
              <Input id="firstName" className="mt-1" {...register('firstName', { required: true })} />
            </div>
            <div>
              <Label htmlFor="lastName" className="block">
                นามสกุล *
              </Label>
              <Input id="lastName" className="mt-1" {...register('lastName', { required: true })} />
            </div>
            <div className="relative">
              <Label htmlFor="birthDate" className="block">
                วันเกิด *
              </Label>
              <Input
                id="birthDate"
                type="date"
                className="mt-1"
                {...register('birthDate', { required: true })}
              />
              <CalendarIcon className="absolute right-3 top-9 text-gray-400" size={20} />
            </div>
            <div>
              <Label htmlFor="age" className="block">
                อายุ
              </Label>
              <Input id="age" className="mt-1" {...register('age')} />
            </div>
            <div>
              <Label htmlFor="gender" className="block">
                เพศ
              </Label>
              <Select id="gender" className="mt-1 bg-white" {...register('gender')}>
                <option value="">กรุณาเลือก</option>
                <option>ชาย</option>
                <option>หญิง</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone" className="block">
                เบอร์โทรศัพท์
              </Label>
              <Input id="phone" className="mt-1" {...register('phone')} />
            </div>
            <div>
              <Label htmlFor="email" className="block">
                อีเมล *
              </Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                {...register('email', { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="password" className="block">
                รหัสผ่าน *
              </Label>
              <Input
                id="password"
                type="password"
                className="mt-1"
                {...register('password', { required: true, minLength: 6 })}
              />
            </div>
            <div>
              <Label htmlFor="roleId" className="block">
                สิทธิ์การใช้งาน *
              </Label>
              <Select id="roleId" className="mt-1 bg-white" {...register('roleId', { required: true })}>
                <option value="">กรุณาเลือก</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address" className="block">
                ที่อยู่
              </Label>
              <Input id="address" className="mt-1" {...register('address')} />
            </div>
            <div>
              <Label className="block">จังหวัด</Label>
              <Select
                value={provinceId ?? ''}
                onChange={handleProvinceChange}
                className="mt-1 bg-white"
              >
                <option value="">กรุณาเลือก</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name_th}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="block">อำเภอ</Label>
              <Select
                value={amphureId ?? ''}
                onChange={handleAmphureChange}
                className="mt-1 bg-white"
                disabled={!provinceId}
              >
                <option value="">กรุณาเลือก</option>
                {filteredAmphures.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name_th}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label className="block">ตำบล</Label>
              <Select
                onChange={handleTambonChange}
                className="mt-1 bg-white"
                disabled={!amphureId}
              >
                <option value="">กรุณาเลือก</option>
                {filteredTambons.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name_th}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="postalCode" className="block">
                รหัสไปรษณีย์
              </Label>
              <Input
                id="postalCode"
                readOnly
                className="mt-1 bg-gray-100"
                {...register('postalCode')}
              />
            </div>
            <div>
              <Label htmlFor="position" className="block">
                ตำแหน่ง
              </Label>
              <Input id="position" className="mt-1" {...register('position')} />
            </div>
            <div>
              <Label htmlFor="department" className="block">
                แผนก
              </Label>
              <Input id="department" className="mt-1" {...register('department')} />
            </div>
            <div>
              <Label htmlFor="startDate" className="block">
                วันที่เริ่มงาน
              </Label>
              <Input id="startDate" type="date" className="mt-1" {...register('startDate')} />
            </div>
            <div>
              <Label htmlFor="endDate" className="block">
                วันที่สิ้นสุดพนักงาน
              </Label>
              <Input id="endDate" type="date" className="mt-1" {...register('endDate')} />
            </div>
            <div>
              <Label htmlFor="managerId" className="block">
                รหัสหัวหน้าพนักงาน
              </Label>
              <Input id="managerId" className="mt-1" {...register('managerId')} />
            </div>
            <div>
              <Label htmlFor="status" className="block">
                สถานะพนักงาน
              </Label>
              <Select id="status" className="mt-1 bg-white" {...register('status')}>
                <option value="">กรุณาเลือก</option>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="company" className="block">
                บริษัท
              </Label>
              <Input id="company" className="mt-1" {...register('company')} />
            </div>
            <div>
              <Label htmlFor="responsibleArea" className="block">
                เขตรับผิดชอบ
              </Label>
              <Input id="responsibleArea" className="mt-1" {...register('responsibleArea')} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={isSubmitting} className="px-12 py-3 font-bold">
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
