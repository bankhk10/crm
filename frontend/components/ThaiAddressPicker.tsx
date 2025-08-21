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
  const [provinceId, setProvinceId] = useState<number>();
  const [amphureId, setAmphureId] = useState<number>();

  useEffect(() => {
    api.get("/thai-address/provinces").then((res) => setProvinces(res.data));
  }, []);

  useEffect(() => {
    if (provinceId) {
      api
        .get("/thai-address/amphures", { params: { provinceId } })
        .then((res) => setAmphures(res.data));
    }
  }, [provinceId]);

  useEffect(() => {
    if (amphureId) {
      api
        .get("/thai-address/tambons", { params: { amphureId } })
        .then((res) => setTambons(res.data));
    }
  }, [amphureId]);

  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.province) setValue("province", defaultValues.province);
      if (defaultValues.district) setValue("district", defaultValues.district);
      if (defaultValues.subdistrict)
        setValue("subdistrict", defaultValues.subdistrict);
      if (defaultValues.postalCode)
        setValue("postalCode", defaultValues.postalCode);
    }
  }, [defaultValues, setValue]);

  useEffect(() => {
    if (defaultValues?.province && provinces.length) {
      const p = provinces.find((p) => p.name_th === defaultValues.province);
      if (p) setProvinceId(p.id);
    }
  }, [defaultValues?.province, provinces]);

  useEffect(() => {
    if (defaultValues?.district && amphures.length) {
      const a = amphures.find((a) => a.name_th === defaultValues.district);
      if (a) setAmphureId(a.id);
    }
  }, [defaultValues?.district, amphures]);

  useEffect(() => {
    if (defaultValues?.subdistrict && tambons.length) {
      const t = tambons.find((t) => t.name_th === defaultValues.subdistrict);
      if (t) setValue("postalCode", t.zip_code.toString());
    }
  }, [defaultValues?.subdistrict, tambons, setValue]);

  const handleProvinceChange = (value: string) => {
    const id = Number(value);
    setProvinceId(id);
    setAmphureId(undefined);
    setTambons([]);
    const found = provinces.find((p) => p.id === id);
    setValue("province", found ? found.name_th : "");
    setValue("district", "");
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleAmphureChange = (value: string) => {
    const id = Number(value);
    setAmphureId(id);
    const found = amphures.find((a) => a.id === id);
    setValue("district", found ? found.name_th : "");
    setValue("subdistrict", "");
    setValue("postalCode", "");
  };

  const handleTambonChange = (value: string) => {
    const id = Number(value);
    const found = tambons.find((t) => t.id === id);
    setValue("subdistrict", found ? found.name_th : "");
    setValue("postalCode", found ? found.zip_code.toString() : "");
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          จังหวัด
        </label>
        <Select onValueChange={handleProvinceChange} value={provinceId?.toString()}>
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
          onValueChange={handleAmphureChange}
          value={amphureId?.toString()}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ตำบล
        </label>
        <Select onValueChange={handleTambonChange} disabled={!amphureId}>
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
