"use client";

import PermissionButtons from "@/components/PermissionButtons";

export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      <PermissionButtons />
    </div>
  );
}
