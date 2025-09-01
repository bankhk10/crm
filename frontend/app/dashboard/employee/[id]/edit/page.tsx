"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ✅ เพิ่มสำหรับ Date Picker ของ shadcn
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import ThaiAddressPicker from "@/components/ThaiAddressPicker";

type Role = {
  id: number;
  name: string;
};

type EditEmployeeFormInputs = {
  prefix: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  password?: string;
  roleId: string;
  birthDate: string; // เก็บเป็น ISO string ในฟอร์ม
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
    control,
    reset,
    setValue, // ✅ ใช้ sync birthDate (ISO) ตอนเลือกวันที่
    formState: { isSubmitting, errors },
  } = useForm<EditEmployeeFormInputs>({
    defaultValues: {
      roleId: undefined, // ✅ อย่าส่งเป็น ""
    },
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [employeeIdForUrl, setEmployeeIdForUrl] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  // 🔹 สำหรับ Date Picker
  const [open, setOpen] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const birthButtonRef = useRef<HTMLButtonElement>(null);
  const [addressDefaults, setAddressDefaults] = useState<{
    province?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get("/roles"),
        ]);
        const user = userRes.data;
        setRoles(rolesRes.data);
        reset({
          employeeId: user.employeeId ?? "",
          prefix: user.prefix ?? "",
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          age: user.age ? String(user.age) : "",
          gender: user.gender ?? "",
          phone: user.phone ?? "",
          email: user.email ?? "",
          roleId: user.roleId != null ? String(user.roleId) : undefined, // ✅
          birthDate: "",
          address: user.address ?? "",
          subdistrict: "",
          district: "",
          province: "",
          postalCode: "",
          position: user.position ?? "",
          department: user.department ?? "",
          startDate: user.startDate ? user.startDate.substring(0, 10) : "",
          endDate: user.endDate ? user.endDate.substring(0, 10) : "",
          managerId: user.managerId ?? "",
          status: user.status ?? "",
          company: user.company ?? "",
          responsibleArea: user.responsibleArea ?? "",
        });
        setEmployeeIdForUrl(user.employeeId);
        setAddressDefaults({
          province: user.province ?? "",
          district: user.district ?? "",
          subdistrict: user.subdistrict ?? "",
          postalCode: user.postalCode ?? "",
        });
        if (user.birthDate) {
          const d = new Date(user.birthDate);
          setBirthDate(d);
          setValue("birthDate", d.toISOString(), { shouldValidate: false });
        } else {
          setBirthDate(undefined);
          setValue("birthDate", "", { shouldValidate: false });
        }
        if (user.startDate) {
          const d = new Date(user.startDate);
          setStartDate(d);
          setValue("startDate", d.toISOString(), { shouldValidate: false });
        }
        if (user.endDate) {
          const d = new Date(user.endDate);
          setEndDate(d);
          setValue("endDate", d.toISOString(), { shouldValidate: false });
        }
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลพนักงาน");
        router.push("/dashboard/employee");
      }
    };

    if (id) fetchData();
  }, [id, reset, router, setValue]);

  const onSubmit: SubmitHandler<EditEmployeeFormInputs> = async (data) => {
    const payload: any = {
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
    if (!data.password) delete payload.password;

    try {
      await api.patch(`/employees/${employeeIdForUrl}`, payload);
      toast.success("แก้ไขพนักงานสำเร็จ");
      router.push("/dashboard/employee");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "แก้ไขพนักงานไม่สำเร็จ");
    }
  };

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <div className="border-b pb-4 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800 mx-auto">
            แก้ไขข้อมูลพนักงาน
          </h1>
          <div className="w-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6 text-xl">
            ข้อมูลพนักงาน
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* รหัสพนักงาน */}
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

            {/* คำนำหน้า */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำนำหน้า *
              </label>
              <Controller
                name="prefix"
                control={control}
                rules={{ required: "กรุณาเลือกคำนำหน้า" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.prefix && "border-red-500"
                      )}
                    >
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
              {errors.prefix && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.prefix.message as string}
                </p>
              )}
            </div>

            {/* ชื่อ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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

            {/* นามสกุล */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
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

            {/* วันเกิด — Shadcn Date Picker */}
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
                          // เก็บในฟอร์มเป็น ISO เพื่อส่ง backend ง่าย
                          setValue("birthDate", day.toISOString(), {
                            shouldValidate: true,
                          });
                        } else {
                          setValue("birthDate", "", { shouldValidate: true });
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

              {/* hidden input สำหรับ react-hook-form */}
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

            {/* อายุ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                อายุ
              </label>
              <Input {...register("age")} />
            </div>

            {/* เพศ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เพศ
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
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

            {/* เบอร์โทร */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                เบอร์โทรศัพท์
              </label>
              <Input {...register("phone")} />
            </div>

            {/* ที่อยู่ */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                ที่อยู่
              </label>
              <Input {...register("address")} />
            </div>

            <ThaiAddressPicker
              register={register}
              setValue={setValue}
              defaultValues={addressDefaults}
            />

            {/* ตำแหน่ง */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่ง
              </label>
              <Input {...register("position")} />
            </div>

            {/* แผนก */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">
                แผนก
              </label>
              <Input {...register("department")} />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                แผนก *
              </label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="กรุณาเลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">ฝ่ายเทคโนโลยีสารสนเทศ</SelectItem>
                      <SelectItem value="Sales">ฝ่ายขาย</SelectItem>
                      <SelectItem value="Marketing ">ฝ่ายการตลาด</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* วันที่เริ่มงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่เริ่มงาน
              </label>
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                  <Button
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
                        } else {
                          setValue("startDate", "", { shouldValidate: true });
                        }
                      }}
                      initialFocus
                    />
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setStartOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button size="sm" onClick={() => setStartOpen(false)}>
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
              />
              {errors.startDate && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.startDate.message as string}
                </p>
              )}
            </div>

            {/* วันที่สิ้นสุดพนักงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันที่สิ้นสุดพนักงาน
              </label>
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                  <Button
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
                        } else {
                          setValue("endDate", "", { shouldValidate: true });
                        }
                      }}
                      initialFocus
                    />
                    <div className="flex justify-center gap-3 mt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEndOpen(false)}
                      >
                        ยกเลิก
                      </Button>
                      <Button size="sm" onClick={() => setEndOpen(false)}>
                        ตกลง
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <input type="hidden" {...register("endDate")} />
              {errors.endDate && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.endDate.message as string}
                </p>
              )}
            </div>

            {/* รหัสหัวหน้า */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสหัวหน้าพนักงาน
              </label>
              <Input {...register("managerId")} />
            </div>

            {/* บริษัท */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                บริษัท
              </label>
              <Input {...register("company")} />
            </div>

            {/* เขตรับผิดชอบ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เขตรับผิดชอบ
              </label>
              <Controller
                name="responsibleArea"
                control={control}
                // ถ้าต้องการบังคับเลือก ให้ใส่ rules ด้านล่างนี้
                // rules={{ required: "กรุณาเลือกเขตรับผิดชอบ" }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""} // โชว์ค่าเดิมอัตโนมัติจาก reset()
                    onValueChange={field.onChange} // อัปเดตค่าเข้า form
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
                )}
              />

              {errors.responsibleArea && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.responsibleArea.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg mb-6 text-xl">
            ข้อมูลการเข้าสู่ระบบ
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* อีเมล */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                อีเมล *
              </label>
              <Input
                type="email"
                {...register("email", { required: "กรุณากรอกอีเมล" })}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {/* รหัสผ่านใหม่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่านใหม่
              </label>
              <Input
                type="password"
                {...register("password", { minLength: 6 })}
              />
            </div>

            {/* สิทธิ์การใช้งาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                สิทธิ์การใช้งาน *
              </label>

              <Controller
                name="roleId"
                control={control}
                rules={{ required: "กรุณาเลือกสิทธิ์การใช้งาน" }}
                render={({ field }) => (
                  <Select
                    // รี-mount เมื่อ roles มา หรือค่า roleId เปลี่ยน เพื่อให้ sync กับรายการ
                    key={`${roles.length}-${field.value ?? ""}`}
                    value={field.value ?? undefined} // ใช้ nullish เพื่อไม่ทับค่า "0"
                    defaultValue={field.value ?? undefined} // เผื่อ first paint
                    onValueChange={field.onChange}
                    disabled={roles.length === 0} // กันคลิกระหว่างกำลังโหลด
                  >
                    <SelectTrigger
                      className={cn(
                        "w-full",
                        errors.roleId && "border-red-500"
                      )}
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
                )}
              />

              {errors.roleId && (
                <p className="flex items-center mt-1 text-xs text-red-500">
                  <AlertTriangle size={14} className="mr-1" />
                  {errors.roleId.message as string}
                </p>
              )}
            </div>

            {/* สถานะพนักงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                สถานะพนักงาน
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
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
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400"
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
