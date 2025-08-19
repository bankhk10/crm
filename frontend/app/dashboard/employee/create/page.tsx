"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { AlertTriangle } from "lucide-react";

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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<CreateEmployeeFormInputs>({
    shouldFocusError: true,
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [provinceId, setProvinceId] = useState<number>();
  const [amphureId, setAmphureId] = useState<number>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [openStart, setOpenStart] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [openEnd, setOpenEnd] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [pRes, aRes, tRes, rolesRes] = await Promise.all([
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json"
          ),
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json"
          ),
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json"
          ),
          api.get("/roles"),
        ]);
        setProvinces(await pRes.json());
        setAmphures(await aRes.json());
        setTambons(await tRes.json());
        setRoles(rolesRes.data);
      } catch (error) {
        toast.error("โหลดข้อมูลเริ่มต้นไม่สำเร็จ");
      }
    };
    fetchInitialData();
  }, []);

  const filteredAmphures = amphures.filter((a) => a.province_id === provinceId);
  const filteredTambons = tambons.filter((t) => t.amphure_id === amphureId);

  const onSubmit: SubmitHandler<CreateEmployeeFormInputs> = async (data) => {
    const payload = {
      ...data,
      email: data.email.trim(),
      age: data.age ? Number(data.age) : undefined,
      birthDate: data.birthDate
        ? new Date(data.birthDate).toISOString()
        : undefined,
      startDate: data.startDate
        ? new Date(data.startDate).toISOString()
        : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      roleId: Number(data.roleId),
    };
    try {
      await api.post("/employees", payload);
      toast.success("บันทึกพนักงานสำเร็จ");
      router.push("/dashboard/employee");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "บันทึกพนักงานไม่สำเร็จ");
    }
  };

  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setProvinceId(id);
    setAmphureId(undefined);
    setValue("province", e.target.options[e.target.selectedIndex].text);
    setValue("district", "");
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleAmphureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setAmphureId(id);
    setValue("district", e.target.options[e.target.selectedIndex].text);
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleTambonChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const selected = tambons.find((t) => t.id === id);
    setValue("subdistrict", e.target.options[e.target.selectedIndex].text);
    if (selected) setValue("postalCode", selected.zip_code.toString());
  };

  const birthButtonRef = useRef<HTMLButtonElement | null>(null);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const endButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100 mr-4"
        >
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
            {/* <div><label className="block text-sm font-medium text-gray-700">รหัสพนักงาน *</label><input {...register('employeeId', { required: true })} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" /></div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสพนักงาน *
              </label>
              <Input {...register("employeeId", { required: true })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                คำนำหน้า *
              </label>
              <select
                {...register("prefix", { required: true })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">กรุณาเลือก</option>
                <option>นาย</option>
                <option>นาง</option>
                <option>นางสาว</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ชื่อ *
              </label>
              <input
                {...register("firstName", { required: true })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                นามสกุล *
              </label>
              <input
                {...register("lastName", { required: true })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเกิด *
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={birthButtonRef} // <–– เอา focus มาใส่ตรงนี้แทน
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      errors.birthDate && "border-red-500"
                    )}
                  >
                    {birthDate
                      ? format(birthDate, "dd/MM/yyyy", { locale: th })
                      : "เลือกวันที่"}
                    <CalendarIcon size={16} className="text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      captionLayout="dropdown"
                      onSelect={(day) => {
                        setBirthDate(day);
                        if (day) setValue("birthDate", day.toISOString());
                      }}
                      initialFocus
                    />
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button size="sm" onClick={() => setOpen(false)}>
                        ตกลง
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* hidden input */}
              <input
                type="hidden"
                {...register("birthDate", {
                  required: "กรุณาเลือกวันเกิด",
                })}
                ref={(e) => {
                  // ไม่ให้ react-hook-form focus hidden แต่ไป focus ที่ปุ่มแทน
                  if (errors.birthDate && birthButtonRef.current) {
                    birthButtonRef.current.focus();
                  }
                }}
              />

              {errors.birthDate && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.birthDate.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                อายุ
              </label>
              <input
                {...register("age")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เพศ
              </label>
              <select
                {...register("gender")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">กรุณาเลือก</option>
                <option>ชาย</option>
                <option>หญิง</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </label>
              <input
                {...register("phone")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                อีเมล *
              </label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่าน *
              </label>
              <input
                type="password"
                {...register("password", { required: true, minLength: 6 })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                สิทธิ์การใช้งาน *
              </label>
              <select
                {...register("roleId", { required: true })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">กรุณาเลือก</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                ที่อยู่
              </label>
              <input
                {...register("address")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                จังหวัด
              </label>
              <select
                value={provinceId ?? ""}
                onChange={handleProvinceChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">กรุณาเลือก</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                อำเภอ
              </label>
              <select
                value={amphureId ?? ""}
                onChange={handleAmphureChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                disabled={!provinceId}
              >
                <option value="">กรุณาเลือก</option>
                {filteredAmphures.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name_th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ตำบล
              </label>
              <select
                onChange={handleTambonChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                disabled={!amphureId}
              >
                <option value="">กรุณาเลือก</option>
                {filteredTambons.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name_th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสไปรษณีย์
              </label>
              <input
                {...register("postalCode")}
                readOnly
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ตำแหน่ง
              </label>
              <input
                {...register("position")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                แผนก
              </label>
              <input
                {...register("department")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มงาน *
              </label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    ref={startButtonRef}
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      errors.startDate && "border-red-500"
                    )}
                  >
                    {startDate
                      ? format(startDate, "dd/MM/yyyy", { locale: th })
                      : "เลือกวันที่"}
                    <CalendarIcon size={16} className="text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      captionLayout="dropdown"
                      onSelect={(day) => {
                        setStartDate(day);
                        if (day) setValue("startDate", day.toISOString());
                      }}
                    />
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOpenStart(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button size="sm" onClick={() => setOpenStart(false)}>
                        ตกลง
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <input
                type="hidden"
                {...register("startDate", {
                  required: "กรุณาเลือกวันที่เริ่มงาน",
                })}
                ref={() => {
                  if (errors.startDate && startButtonRef.current) {
                    startButtonRef.current.focus();
                  }
                }}
              />
              {errors.startDate && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.startDate.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุดพนักงาน
              </label>
              <Popover open={openEnd} onOpenChange={setOpenEnd}>
                <PopoverTrigger asChild>
                  <Button
                    ref={endButtonRef}
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    {endDate
                      ? format(endDate, "dd/MM/yyyy", { locale: th })
                      : "เลือกวันที่"}
                    <CalendarIcon size={16} className="text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      captionLayout="dropdown"
                      onSelect={(day) => {
                        setEndDate(day);
                        if (day) setValue("endDate", day.toISOString());
                      }}
                    />
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOpenEnd(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button size="sm" onClick={() => setOpenEnd(false)}>
                        ตกลง
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <input
                type="hidden"
                {...register("endDate")}
                ref={() => {
                  if (errors.endDate && endButtonRef.current) {
                    endButtonRef.current.focus();
                  }
                }}
              />
              {errors.endDate && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.endDate.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสหัวหน้าพนักงาน
              </label>
              <input
                {...register("managerId")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                สถานะพนักงาน
              </label>
              <select
                {...register("status")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">กรุณาเลือก</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                บริษัท
              </label>
              <input
                {...register("company")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เขตรับผิดชอบ
              </label>
              <input
                {...register("responsibleArea")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </div>
  );
}
