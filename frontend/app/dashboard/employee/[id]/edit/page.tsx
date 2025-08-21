"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";

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
    formState: { isSubmitting },
  } = useForm<EditEmployeeFormInputs>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [provinceId, setProvinceId] = useState<number>();
  const [amphureId, setAmphureId] = useState<number>();
  const [roles, setRoles] = useState<Role[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [tambonId, setTambonId] = useState<number>(); // <<< เพิ่มบรรทัดนี้

  // helper สำหรับ normalize ชื่อเขตการปกครองไทย
  const normalizeThai = (s?: string) =>
    (s ?? "")
      .trim()
      .replace(/^(อำเภอ|เขต|ตำบล|แขวง)\s*/g, "")
      .replace(/\s+/g, ""); // ตัด space กลางคำออก เพื่อลด miss-match

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, aRes, tRes, userRes, rolesRes] = await Promise.all([
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json"
          ),
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json"
          ),
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json"
          ),
          api.get(`/users/${id}`), // ถ้าของจริงคือ /employees/:id เปลี่ยนตรงนี้ด้วย
          api.get("/roles"),
        ]);

        const provincesData: Province[] = await pRes.json();
        const amphuresData: Amphure[] = await aRes.json();
        const tambonsData: Tambon[] = await tRes.json();
        const user = userRes.data;
        const rolesData: Role[] = rolesRes.data;

        setProvinces(provincesData);
        setAmphures(amphuresData);
        setTambons(tambonsData);
        setRoles(rolesData);
        setEmployeeId(user.employeeId);
        // set ค่าเดิมในฟอร์ม
        setValue("prefix", user.prefix || "");
        setValue("firstName", user.firstName || "");
        setValue("lastName", user.lastName || "");
        setValue("age", user.age ? String(user.age) : "");
        setValue("gender", user.gender || "");
        setValue("phone", user.phone || "");
        setValue("email", user.email || "");
        setValue("roleId", String(user.roleId));
        setValue(
          "birthDate",
          user.birthDate ? user.birthDate.substring(0, 10) : ""
        );
        setValue("address", user.address || "");
        setValue("subdistrict", user.subdistrict || "");
        setValue("district", user.district || "");
        setValue("province", user.province || "");
        setValue("postalCode", user.postalCode || "");
        setValue("position", user.position || "");
        setValue("department", user.department || "");
        setValue(
          "startDate",
          user.startDate ? user.startDate.substring(0, 10) : ""
        );
        setValue("endDate", user.endDate ? user.endDate.substring(0, 10) : "");
        setValue("managerId", user.managerId || "");
        setValue("status", user.status || "");
        setValue("company", user.company || "");
        setValue("responsibleArea", user.responsibleArea || "");

        const province = provincesData.find(
          (p) => normalizeThai(p.name_th) === normalizeThai(user.province)
        );
        if (province) setProvinceId(province.id);

        let amphure: Amphure | undefined = undefined;
        if (province) {
          amphure = amphuresData.find(
            (a) =>
              a.province_id === province.id &&
              normalizeThai(a.name_th) === normalizeThai(user.district)
          );
        }

        // หา tambon จากชื่อเดิมของ user
        const tambonFound = tambonsData.find(
          (t) => normalizeThai(t.name_th) === normalizeThai(user.subdistrict)
        );

        // ถ้าอำเภอยังไม่เจอ แต่หาได้จากตำบล -> ย้อนกลับไปหาอำเภอ
        if (!amphure && tambonFound) {
          amphure = amphuresData.find((a) => a.id === tambonFound.amphure_id);
        }

        if (amphure) setAmphureId(amphure.id);

        // ตั้งค่า tambonId เพื่อให้ <select> ตำบล preselect
        if (tambonFound) {
          setTambonId(tambonFound.id);
          // ถ้า user ไม่มีรหัสไปรษณีย์ ให้เติมจากข้อมูลตำบล
          if (!user.postalCode && tambonFound.zip_code) {
            setValue("postalCode", String(tambonFound.zip_code));
          }
        } else {
          setTambonId(undefined);
        }
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลพนักงาน");
        router.push("/dashboard/employee");
      }
    };

    if (id) fetchData();
  }, [id, router, setValue]);

  const filteredAmphures = amphures.filter((a) => a.province_id === provinceId);
  const filteredTambons = tambons.filter((t) => t.amphure_id === amphureId);

  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setProvinceId(id);
    setAmphureId(undefined);
    setTambonId(undefined); // <<< รีเซ็ตเมื่อเปลี่ยนจังหวัด
    setValue("province", e.target.options[e.target.selectedIndex].text);
    setValue("district", "");
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleAmphureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setAmphureId(id);
    setTambonId(undefined); // <<< รีเซ็ตเมื่อเปลี่ยนอำเภอ
    setValue("district", e.target.options[e.target.selectedIndex].text);
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleTambonChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const selected = tambons.find((t) => t.id === id);
    setTambonId(id); // <<< ตั้งค่าเลือกตำบล
    setValue("subdistrict", e.target.options[e.target.selectedIndex].text);
    if (selected) setValue("postalCode", selected.zip_code.toString());
  };

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
              <label className="block text-sm font-medium text-gray-700">
                รหัสพนักงาน
              </label>
              <input
                value={employeeId}
                readOnly
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
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
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                วันเกิด *
              </label>
              <input
                type="date"
                {...register("birthDate", { required: true })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <CalendarIcon
                className="absolute right-3 top-9 text-gray-400"
                size={20}
              />
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
                readOnly
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                {...register("password", { minLength: 6 })}
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
                value={tambonId ?? ""} // <<< ผูก value กับ tambonId
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
              <label className="block text-sm font-medium text-gray-700">
                วันที่เริ่มงาน
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                วันที่สิ้นสุดพนักงาน
              </label>
              <input
                type="date"
                {...register("endDate")}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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
