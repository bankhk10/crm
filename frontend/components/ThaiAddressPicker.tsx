"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Province = { id: number; name_th: string };
type Amphure = { id: number; name_th: string; province_id: number };
type Tambon = {
  id: number;
  name_th: string;
  amphure_id: number;
  zip_code: number;
};

interface Props {
  register: any;
  setValue: (name: string, value: any, options?: any) => void;
  defaultValues?: {
    province?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;
  };
}

export default function ThaiAddressPicker({
  register,
  setValue,
  defaultValues,
}: Props) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);

  const [provinceId, setProvinceId] = useState<number | undefined>(undefined);
  const [amphureId, setAmphureId] = useState<number | undefined>(undefined);
  const [tambonId, setTambonId] = useState<number | undefined>(undefined);

  // 1) โหลด provinces
  useEffect(() => {
    api.get("/thai-address/provinces").then((res) => setProvinces(res.data));
  }, []);

  // 2) provinceId -> โหลด amphures
  useEffect(() => {
    if (provinceId) {
      api
        .get("/thai-address/amphures", { params: { provinceId } })
        .then((res) => setAmphures(res.data));
    } else {
      setAmphures([]);
    }
    // เมื่อ province เปลี่ยน เคลียร์ชั้นล่าง
    setAmphureId(undefined);
    setTambonId(undefined);
    setTambons([]);
  }, [provinceId]);

  // 3) amphureId -> โหลด tambons
  useEffect(() => {
    if (amphureId) {
      api
        .get("/thai-address/tambons", { params: { amphureId } })
        .then((res) => setTambons(res.data));
    } else {
      setTambons([]);
    }
    // เมื่อ amphure เปลี่ยน เคลียร์ชั้นล่าง
    setTambonId(undefined);
  }, [amphureId]);

  // 4) ดันค่า default เข้า form เมื่อมี defaultValues
  useEffect(() => {
    if (!defaultValues) return;
    if (defaultValues.province) setValue("province", defaultValues.province);
    if (defaultValues.district) setValue("district", defaultValues.district);
    if (defaultValues.subdistrict) setValue("subdistrict", defaultValues.subdistrict);
    if (defaultValues.postalCode) setValue("postalCode", defaultValues.postalCode);
  }, [defaultValues, setValue]);

  // 5) แม็ปชื่อจังหวัด -> provinceId เมื่อ provinces โหลดเสร็จ
  useEffect(() => {
    if (!defaultValues?.province || provinces.length === 0) return;
    const wanted = defaultValues.province.trim();
    const p = provinces.find((x) => x.name_th.trim() === wanted);
    if (p) setProvinceId(p.id);
  }, [defaultValues?.province, provinces]);

  // 6) แม็ปชื่ออำเภอ -> amphureId เมื่อ amphures โหลดเสร็จ
  useEffect(() => {
    if (!defaultValues?.district || amphures.length === 0) return;
    const wanted = defaultValues.district.trim();
    const a = amphures.find((x) => x.name_th.trim() === wanted);
    if (a) setAmphureId(a.id);
  }, [defaultValues?.district, amphures]);

  // 7) แม็ปชื่อตำบล -> tambonId และอัปเดต postalCode เมื่อ tambons โหลดเสร็จ
  useEffect(() => {
    if (!defaultValues?.subdistrict || tambons.length === 0) return;
    const wanted = defaultValues.subdistrict.trim();
    const t = tambons.find((x) => x.name_th.trim() === wanted);
    if (t) {
      setTambonId(t.id);
      setValue("postalCode", t.zip_code.toString());
    }
  }, [defaultValues?.subdistrict, tambons, setValue]);

  // === handlers ===
  const handleProvinceChange = (value: string) => {
    const id = Number(value);
    setProvinceId(id);

    const found = provinces.find((p) => p.id === id);
    setValue("province", found ? found.name_th : "");

    // เคลียร์ระดับล่าง
    setValue("district", "");
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleAmphureChange = (value: string) => {
    const id = Number(value);
    setAmphureId(id);

    const found = amphures.find((a) => a.id === id);
    setValue("district", found ? found.name_th : "");

    // เคลียร์ระดับล่าง
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleTambonChange = (value: string) => {
    const id = Number(value);
    setTambonId(id);

    const found = tambons.find((t) => t.id === id);
    setValue("subdistrict", found ? found.name_th : "");
    setValue("postalCode", found ? found.zip_code.toString() : "");
  };

  return (
    <>
      {/* จังหวัด */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          จังหวัด
        </label>
        <Select
          onValueChange={handleProvinceChange}
          value={provinceId ? String(provinceId) : undefined}
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

      {/* อำเภอ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          อำเภอ
        </label>
        <Select
          onValueChange={handleAmphureChange}
          value={amphureId ? String(amphureId) : undefined}
          disabled={!provinceId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="กรุณาเลือก" />
          </SelectTrigger>
          <SelectContent>
            {amphures.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.name_th}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" {...register("district")} />
      </div>

      {/* ตำบล */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ตำบล
        </label>
        <Select
          onValueChange={handleTambonChange}
          value={tambonId ? String(tambonId) : undefined}
          disabled={!amphureId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="กรุณาเลือก" />
          </SelectTrigger>
          <SelectContent>
            {tambons.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.name_th}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" {...register("subdistrict")} />
      </div>

      {/* รหัสไปรษณีย์ */}
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
    </>
  );
}
