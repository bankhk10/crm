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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="border-b pb-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800 mx-auto">
            เพิ่มพนักงาน
          </h1>
          <div className="w-6" />{" "}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6 text-xl">
            ข้อมูลพนักงาน
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสพนักงาน *
              </label>
              <Input
                {...register("employeeId", {
                  required: "กรุณากรอกรหัสพนักงาน",
                })}
                className={cn(errors.employeeId && "border-red-500")}
              />
              {errors.employeeId && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.employeeId.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำนำหน้า *
              </label>
              <Select
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
                {...register("firstName", {
                  required: "กรุณากรอกชื่อ",
                })}
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
                {...register("lastName", {
                  required: "กรุณากรอกนามสกุล",
                })}
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
                      "h-10 w-full justify-between text-left font-normal",
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

              {/* hidden input */}
              <input
                type="hidden"
                {...register("birthDate", {
                  required: "กรุณาเลือกวันเกิด",
                })}
                // ref={(e) => {
                //   if (errors.birthDate && birthButtonRef.current) {
                //     birthButtonRef.current.focus();
                //   }
                // }}
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
                onValueChange={(value) =>
                  setValue("gender", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn("w-full", errors.gender && "border-red-500")}
                >
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ชาย">ชาย</SelectItem>
                  <SelectItem value="หญิง">หญิง</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <Input type="number" {...register("phone")} />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จังหวัด
              </label>
              <Select
                onValueChange={(value) => {
                  const id = Number(value);
                  setProvinceId(id);
                  const found = provinces.find((p) => p.id === id);
                  setValue("province", found ? found.name_th : "", {
                    shouldValidate: true,
                  });
                  // reset อำเภอ / ตำบล
                  setAmphureId(undefined);
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
                onValueChange={(value) => {
                  const id = Number(value);
                  setAmphureId(id);
                  const found = amphures.find((a) => a.id === id);
                  setValue("district", found ? found.name_th : "", {
                    shouldValidate: true,
                  });
                  // reset ตำบล
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
                onValueChange={(value) => {
                  const id = Number(value);
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
              <Input
                {...register("postalCode")}
                readOnly
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
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
                onValueChange={(value) =>
                  setValue("department", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.department && "border-red-500"
                  )}
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
                วันที่เริ่มงาน *
              </label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    ref={startButtonRef}
                    variant="outline"
                    className={cn(
                      "h-10 w-full justify-between text-left font-normal",
                      !startDate && "text-gray-400",
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
                        if (day) {
                          setValue("startDate", day.toISOString(), {
                            shouldValidate: true,
                          });
                        }
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
                // ref={() => {
                //   if (errors.startDate && startButtonRef.current) {
                //     startButtonRef.current.focus();
                //   }
                // }}
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
                    className={cn(
                      "h-10 w-full justify-between text-left font-normal",
                      !endDate && "text-gray-400",
                      errors.endDate && "border-red-500"
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
                      captionLayout="dropdown"
                      onSelect={(day) => {
                        setEndDate(day);
                        if (day) {
                          setValue("endDate", day.toISOString(), {
                            shouldValidate: true,
                          });
                        }
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสหัวหน้าพนักงาน
              </label>
              <Input {...register("managerId")} />
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
              <Select
                onValueChange={(value) =>
                  setValue("responsibleArea", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.responsibleArea && "border-red-500"
                  )}
                >
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ภาคกลาง">ภาคกลาง</SelectItem>
                  <SelectItem value="ภาคเหนือ">ภาคเหนือ</SelectItem>
                  <SelectItem value="ภาคตะวันออกเฉียงเหนือ">
                    ภาคตะวันออกเฉียงเหนือ
                  </SelectItem>
                  <SelectItem value="ภาคใต้">ภาคใต้</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6 text-xl mt-6">
            ข้อมูลการเข้าสู่ระบบ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล *
              </label>
              <Input
                type="email"
                {...register("email", {
                  required: "กรุณากรอกอีเมล",
                })}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.email.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน *
              </label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "กรุณากรอกรหัสผ่าน",
                    minLength: {
                      value: 6,
                      message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                    },
                  })}
                  className={cn(
                    errors.password && "border-red-500 pr-10" // เพิ่ม padding เผื่อ icon
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                    <SelectItem key={r.id} value={String(r.id)}>
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
                {...register("roleId", {
                  required: "กรุณาเลือกสิทธิ์การใช้งาน",
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <Select
                defaultValue="Active"
                onValueChange={(value) =>
                  setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger
                  className={cn("w-full", errors.status && "border-red-500")}
                >
                  <SelectValue placeholder="กรุณาเลือก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-800 font-bold py-2 px-8 rounded-lg hover:bg-gray-400"
          >
            ย้อนกลับ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </div>
  );
}
