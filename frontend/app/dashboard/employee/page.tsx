"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PlusCircle,
  Trash2,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// --- Type Definitions ---
interface Role {
  id: number;
  name: string;
}
interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

// --- Modal Components ---
const DeleteConfirmationModal = ({
  user,
  isOpen,
  onClose,
  onConfirmDelete,
}: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}) => {
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Delete User
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{user.name}</strong>?
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            onClick={onConfirmDelete}
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
const UserCard = ({ user, onDelete }: { user: User; onDelete: () => void }) => {
  const { user: currentUser } = useAuth();
  const stats = [
    { label: "ที่เหลือ", value: Math.floor(Math.random() * 50) },
    { label: "กำลังทำ", value: Math.floor(Math.random() * 60) },
    { label: "สำเร็จ", value: Math.floor(Math.random() * 30) },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-transform transform hover:-translate-y-2">
      <div className="w-full flex justify-end">
        <button
          onClick={onDelete}
          disabled={currentUser?.id === user.id}
          className="text-gray-400 hover:text-red-500 disabled:text-gray-200 disabled:cursor-not-allowed"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 -mt-4">
        <Image
          src="/images/man-avatar.png"
          alt={user.name}
          layout="fill"
          className="object-cover"
        />
      </div>
      <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {user.role.name === "USER" ? "เซลล์" : user.role.name}
      </p>
      <div className="flex space-x-4 mb-6">
        <Link href={`/dashboard/employee/${user.id}/edit`}>
          <div className="bg-gray-200 text-gray-700 text-sm font-semibold px-5 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-300 cursor-pointer shadow-sm">
            แก้ไข
          </div>
        </Link>
        <Link href={`/dashboard/employee/${user.id}`}>
          <div className="bg-gray-200 text-gray-700 text-sm font-semibold px-5 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-300 cursor-pointer shadow-sm">
            ประวัติ
          </div>
        </Link>
      </div>
      <div className="w-full flex justify-around border-t border-gray-200 pt-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-bold text-xl text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Page Component (Updated) ---
export default function EmployeePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user: currentUser, isLoading } = useAuth();
  const router = useRouter();

  const fetchData = async () => {
    try {
      const usersRes = await api.get("/users");
      setUsers(usersRes.data);
    } catch (error) {
      toast.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    if (!isLoading && currentUser?.role.name !== "ADMIN") {
      toast.error(
        "Access Denied: You don't have permission to view this page."
      );
      router.push("/dashboard");
      return;
    }
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, isLoading, router]);

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success(`User ${selectedUser.name} deleted successfully.`);
      fetchData();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DeleteConfirmationModal
        user={selectedUser}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleConfirmDelete}
      />
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full min-h-full">
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="ค้นหา"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="ค้นหาพนักงาน"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
          </div>

          {/* Add Button */}
          <Link href="/dashboard/employee/create" className="w-full md:w-auto">
            <div className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition">
              <PlusCircle className="w-5 h-5" />
              <span className="font-semibold">เพิ่มพนักงาน</span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onDelete={() => handleDelete(user)}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
          <p>1-8 of 28</p>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
