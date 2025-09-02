"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Plus, Pencil, Trash } from "lucide-react";

export default function PermissionButtons() {
  const { user } = useAuth();

  return (
    <div className="flex gap-2 mb-4">
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" /> สร้าง
      </Button>
      {user?.type !== "User" && (
        <Button size="sm" variant="secondary">
          <Pencil className="h-4 w-4 mr-2" /> แก้ไข
        </Button>
      )}
      {user?.type === "Admin" && (
        <Button size="sm" variant="destructive">
          <Trash className="h-4 w-4 mr-2" /> ลบ
        </Button>
      )}
    </div>
  );
}
