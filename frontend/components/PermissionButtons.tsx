"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { PermissionGate, RoleGate } from "@/src/components/rbac";

export default function PermissionButtons() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <PermissionGate can="add_user">
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" /> สร้างผู้ใช้
        </Button>
      </PermissionGate>
      <PermissionGate can="edit_user">
        <Button size="sm" variant="secondary">
          <Pencil className="h-4 w-4 mr-2" /> แก้ไขผู้ใช้
        </Button>
      </PermissionGate>
      <RoleGate roles={["SUPER_ADMIN", "ADMIN"]}>
        <Button size="sm" variant="destructive">
          <Trash className="h-4 w-4 mr-2" /> ลบผู้ใช้
        </Button>
      </RoleGate>
    </div>
  );
}
