"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

type EditEmployeeFormInputs = {
  prefix: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  password?: string;
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

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<EditEmployeeFormInputs>({ shouldFocusError: true });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [provinceId, setProvinceId] = useState<number>();
  const [amphureId, setAmphureId] = useState<number>();
  const [tambonId, setTambonId] = useState<number>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [openStart, setOpenStart] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [openEnd, setOpenEnd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes, tRes, rolesRes, userRes] = await Promise.all([
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
          api.get(`/users/${id}`),
        ]);

        const provincesData = await pRes.json();
        const amphuresData = await aRes.json();
        const tambonsData = await tRes.json();
        const rolesData = rolesRes.data;
        const user = userRes.data;

        setProvinces(provincesData);
        setAmphures(amphuresData);
        setTambons(tambonsData);
        setRoles(rolesData);
        setEmployeeId(user.employeeId);

        setValue("prefix", user.prefix || "");
        setValue("firstName", user.firstName || "");
        setValue("lastName", user.lastName || "");
        setValue("age", user.age ? String(user.age) : "");
        setValue("gender", user.gender || "");
        setValue("phone", user.phone || "");
        setValue("email", user.email || "");
        setValue("roleId", String(user.roleId));
        setValue("address", user.address || "");
        setValue("subdistrict", user.subdistrict || "");
        setValue("district", user.district || "");
        setValue("province", user.province || "");
        setValue("postalCode", user.postalCode || "");
        setValue("position", user.position || "");
        setValue("department", user.department || "");
        setValue("startDate", user.startDate ? user.startDate : "");
        setValue("endDate", user.endDate ? user.endDate : "");
        setValue("managerId", user.managerId || "");
        setValue("status", user.status || "");
        setValue("company", user.company || "");
        setValue("responsibleArea", user.responsibleArea || "");

        if (user.birthDate) {
          const bd = new Date(user.birthDate);
          setBirthDate(bd);
          setValue("birthDate", bd.toISOString());
        }
        if (user.startDate) {
          const sd = new Date(user.startDate);
          setStartDate(sd);
          setValue("startDate", sd.toISOString());
        }
        if (user.endDate) {
          const ed = new Date(user.endDate);
          setEndDate(ed);
          setValue("endDate", ed.toISOString());
        }

        const province = provincesData.find(
          (p: Province) => p.name_th === user.province
        );
        if (province) {
          setProvinceId(province.id);
          const amphure = amphuresData.find(
            (a: Amphure) =>
              a.name_th === user.district && a.province_id === province.id
          );
          if (amphure) {
            setAmphureId(amphure.id);
            const tambon = tambonsData.find(
              (t: Tambon) =>
                t.name_th === user.subdistrict && t.amphure_id === amphure.id
            );
            if (tambon) {
              setTambonId(tambon.id);
            }
          }
        }
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลพนักงาน");
        router.push("/dashboard/employee");
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, router, setValue]);

  const filteredAmphures = amphures.filter((a) => a.province_id === provinceId);
  const filteredTambons = tambons.filter((t) => t.amphure_id === amphureId);

  const onSubmit: SubmitHandler<EditEmployeeFormInputs> = async (data) => {
    const payload: any = {
      ...data,
      email: data.email.trim(),
      age: data.age ? Number(data.age) : undefined,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      roleId: Number(data.roleId),
    };
    if (!data.password) {
      delete payload.password;
    }
    try {
      await api.patch(`/employees/${employeeId}`, payload);
      toast.success("แก้ไขพนักงานสำเร็จ");
      router.push("/dashboard/employee");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "แก้ไขพนักงานไม่สำเร็จ");
    }
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
        <h1 className="text-3xl font-bold text-gray-800">แก้ไขพนักงาน</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6">
            ข้อมูลพนักงาน
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสพนักงาน
              </label>
              <Input value={employeeId} readOnly />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำนำหน้า *
              </label>
              <Select
                value={watch("prefix")}
                onValueChange={(value) =>
                  setValue("prefix", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn("w-full", errors.prefix && "border-red-500")}
                >
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="นาย">นาย</SelectItem>
                  <SelectItem value="นาง">นาง</SelectItem>
                  <SelectItem value="นางสาว">นางสาว</SelectItem>
                </SelectContent>
              </Select>
              {errors.prefix && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.prefix.message as string}
                </p>
              )}
              <input
                type="hidden"
                {...register("prefix", { required: "กรุณาเลือกคำนำหน้า" })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ *
              </label>
              <Input
                {...register("firstName", { required: "กรุณากรอกชื่อ" })}
                className={cn(errors.firstName && "border-red-500")}
              />
              {errors.firstName && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.firstName.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                นามสกุล *
              </label>
              <Input
                {...register("lastName", { required: "กรุณากรอกนามสกุล" })}
                className={cn(errors.lastName && "border-red-500")}
              />
              {errors.lastName && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.lastName.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเกิด *
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    ref={birthButtonRef}
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      !birthDate && "text-gray-400",
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
                        if (day) {
                          setValue("birthDate", day.toISOString(), {
                            shouldValidate: true,
                          });
                        }
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
              <input
                type="hidden"
                {...register("birthDate", { required: "กรุณาเลือกวันเกิด" })}
              />
              {errors.birthDate && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.birthDate.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อายุ
              </label>
              <Input type="number" {...register("age")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เพศ
              </label>
              <Select
                value={watch("gender")}
                onValueChange={(value) =>
                  setValue("gender", value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ชาย">ชาย</SelectItem>
                  <SelectItem value="หญิง">หญิง</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("gender")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <Input type="number" {...register("phone")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล *
              </label>
              <Input type="email" {...register("email")} readOnly />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    minLength: {
                      value: 6,
                      message: "รหัสผ่านอย่างน้อย 6 ตัว",
                    },
                  })}
                  className={cn(errors.password && "border-red-500")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {errors.password && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สิทธิ์การใช้งาน *
              </label>
              <Select
                value={watch("roleId")}
                onValueChange={(value) =>
                  setValue("roleId", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn("w-full", errors.roleId && "border-red-500")}
                >
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.roleId.message as string}
                </p>
              )}
              <input
                type="hidden"
                {...register("roleId", { required: "กรุณาเลือกสิทธิ์การใช้งาน" })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ที่อยู่
              </label>
              <Input {...register("address")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จังหวัด
              </label>
              <Select
                value={provinceId ? String(provinceId) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  setProvinceId(id);
                  const found = provinces.find((p) => p.id === id);
                  setValue("province", found ? found.name_th : "", {
                    shouldValidate: true,
                  });
                  setAmphureId(undefined);
                  setTambonId(undefined);
                  setValue("district", "");
                  setValue("subdistrict", "");
                  setValue("postalCode", "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("province")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อำเภอ
              </label>
              <Select
                value={amphureId ? String(amphureId) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  setAmphureId(id);
                  const found = amphures.find((a) => a.id === id);
                  setValue("district", found ? found.name_th : "", {
                    shouldValidate: true,
                  });
                  setTambonId(undefined);
                  setValue("subdistrict", "");
                  setValue("postalCode", "");
                }}
                disabled={!provinceId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAmphures.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("district")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำบล
              </label>
              <Select
                value={tambonId ? String(tambonId) : ""}
                onValueChange={(value) => {
                  const id = Number(value);
                  setTambonId(id);
                  const found = tambons.find((t) => t.id === id);
                  setValue("subdistrict", found ? found.name_th : "", {
                    shouldValidate: true,
                  });
                  if (found) setValue("postalCode", found.zip_code.toString());
                }}
                disabled={!amphureId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTambons.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name_th}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("subdistrict")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสไปรษณีย์
              </label>
              <Input {...register("postalCode")} readOnly />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่ง
              </label>
              <Input {...register("position")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แผนก *
              </label>
              <Select
                value={watch("department")}
                onValueChange={(value) =>
                  setValue("department", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn("w-full", errors.department && "border-red-500")}
                >
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">ฝ่ายเทคโนโลยีสารสนเทศ</SelectItem>
                  <SelectItem value="Sales">ฝ่ายขาย</SelectItem>
                  <SelectItem value="Marketing ">ฝ่ายการตลาด</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.department.message as string}
                </p>
              )}
              <input
                type="hidden"
                {...register("department", { required: "กรุณาเลือแผนก" })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มงาน
              </label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    ref={startButtonRef}
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      !startDate && "text-gray-400"
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
                      onSelect={(day) => {
                        setStartDate(day);
                        if (day) setValue("startDate", day.toISOString());
                      }}
                      initialFocus
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
              <input type="hidden" {...register("startDate")} />
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
                    className={cn(
                      "w-full justify-between text-left font-normal",
                      !endDate && "text-gray-400"
                    )}
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
                      onSelect={(day) => {
                        setEndDate(day);
                        if (day) setValue("endDate", day.toISOString());
                      }}
                      initialFocus
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
              <input type="hidden" {...register("endDate")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสหัวหน้าพนักงาน
              </label>
              <Input {...register("managerId")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะพนักงาน
              </label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("status")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                บริษัท
              </label>
              <Input {...register("company")} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เขตรับผิดชอบ
              </label>
              <Input {...register("responsibleArea")} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={isSubmitting} className="px-12">
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </form>
    </div>
  );
}

