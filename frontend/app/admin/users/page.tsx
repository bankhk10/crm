'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Edit, X, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
type AddUserFormInputs = { name: string; email: string; password: string; roleId: number; };
type EditUserFormInputs = { name: string; email: string; roleId: number; };

// --- Modal Components (No changes needed, but included for completeness) ---

const AddUserModal = ({ isOpen, onClose, onUserAdded, roles }: { isOpen: boolean; onClose: () => void; onUserAdded: () => void; roles: Role[] }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddUserFormInputs>();
  const onSubmit: SubmitHandler<AddUserFormInputs> = async (data) => {
    try {
      const userData = { ...data, roleId: Number(data.roleId) };
      await api.post('/users', userData);
      toast.success('User created successfully!');
      onUserAdded();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user.');
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Add New User</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button></div><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700">Name</label><input {...register('name', { required: 'Name is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />{errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}</div><div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />{errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}</div><div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />{errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}</div><div><label className="block text-sm font-medium text-gray-700">Role</label><select {...register('roleId', { required: 'Role is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"><option value="">Select a role</option>{roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}</select>{errors.roleId && <p className="text-sm text-red-600 mt-1">{errors.roleId.message}</p>}</div><div className="flex justify-end pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">{isSubmitting ? 'Creating...' : 'Create User'}</button></div></form></div></div>
  );
};

const EditUserModal = ({ user, isOpen, onClose, onUserUpdated, roles }: { user: User | null; isOpen: boolean; onClose: () => void; onUserUpdated: () => void; roles: Role[] }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EditUserFormInputs>();
  useEffect(() => { if (user) { reset({ name: user.name, email: user.email, roleId: user.role.id }); } }, [user, reset]);
  const onSubmit: SubmitHandler<EditUserFormInputs> = async (data) => {
    if (!user) return;
    try {
      const updatedData = { ...data, roleId: Number(data.roleId) };
      await api.patch(`/users/${user.id}`, updatedData);
      toast.success('User updated successfully!');
      onUserUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user.');
    }
  };
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Edit User</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button></div><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700">Name</label><input {...register('name', { required: 'Name is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />{errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}</div><div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" {...register('email', { required: 'Email is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" readOnly /></div><div><label className="block text-sm font-medium text-gray-700">Role</label><select {...register('roleId', { required: 'Role is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"><option value="">Select a role</option>{roles.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}</select>{errors.roleId && <p className="text-sm text-red-600 mt-1">{errors.roleId.message}</p>}</div><div className="flex justify-end pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400">{isSubmitting ? 'Saving...' : 'Save Changes'}</button></div></form></div></div>
  );
};

const DeleteConfirmationModal = ({ user, isOpen, onClose, onConfirmDelete }: { user: User | null; isOpen: boolean; onClose: () => void; onConfirmDelete: () => void; }) => {
  if (!isOpen || !user) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"><div className="flex items-start"><div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><AlertTriangle className="h-6 w-6 text-red-600" /></div><div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"><h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3><div className="mt-2"><p className="text-sm text-gray-500">Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.</p></div></div></div><div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"><button onClick={onConfirmDelete} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button><button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button></div></div></div>
  );
};

// --- New UserCard Component ---
const UserCard = ({ user, onEdit, onDelete }: { user: User; onEdit: () => void; onDelete: () => void; }) => {
    const { user: currentUser } = useAuth();
    // Placeholder stats
    const stats = [
        { label: 'ที่เหลือ', value: Math.floor(Math.random() * 50) },
        { label: 'กำลังทำ', value: Math.floor(Math.random() * 60) },
        { label: 'สำเร็จ', value: Math.floor(Math.random() * 30) },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-transform transform hover:-translate-y-2">
            <div className="w-full flex justify-end">
                <button onClick={onDelete} disabled={currentUser?.id === user.id} className="text-gray-400 hover:text-red-500 disabled:text-gray-200 disabled:cursor-not-allowed">
                    <Trash2 size={20} />
                </button>
            </div>
            <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 -mt-4">
                {/* Placeholder Avatar */}
                <Image src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} layout="fill" className="object-cover" />
            </div>
            <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{user.role.name === 'USER' ? 'เซลล์' : user.role.name}</p>
            <div className="flex space-x-2 mb-6">
                <button onClick={onEdit} className="bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-300">แก้ไข</button>
                <button className="bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-300">รายละเอียด</button>
            </div>
            <div className="w-full flex justify-around border-t border-gray-200 pt-4">
                {stats.map(stat => (
                    <div key={stat.label}>
                        <p className="font-bold text-xl text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main AdminUsersPage Component (Updated) ---
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const { user: currentUser, isLoading } = useAuth();
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([api.get('/users'), api.get('/roles')]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) { toast.error('Failed to fetch data.'); }
  };

  useEffect(() => {
    if (!isLoading && currentUser?.role.name !== 'ADMIN') {
      toast.error("Access Denied: You don't have permission to view this page.");
      router.push('/dashboard');
      return;
    }
    if (currentUser?.role.name === 'ADMIN') { fetchData(); }
  }, [currentUser, isLoading, router]);

  const handleEdit = (user: User) => { setSelectedUser(user); setIsEditModalOpen(true); };
  const handleDelete = (user: User) => { setSelectedUser(user); setIsDeleteModalOpen(true); };
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      toast.success(`User ${selectedUser.name} deleted successfully.`);
      fetchData();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to delete user.'); }
  };

  if (isLoading || !currentUser || currentUser.role.name !== 'ADMIN') {
    return <div className="flex items-center justify-center h-screen">Checking permissions...</div>;
  }

  return (
    <>
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onUserAdded={fetchData} roles={roles} />
      <EditUserModal user={selectedUser} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUserUpdated={fetchData} roles={roles} />
      <DeleteConfirmationModal user={selectedUser} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirmDelete={handleConfirmDelete} />
      <nav className="mb-4 space-x-4">
        <Link href="/admin/users" className="text-blue-600 hover:underline">Users</Link>
        <Link href="/admin/roles" className="text-blue-600 hover:underline">Roles</Link>
        <Link href="/admin/permissions" className="text-blue-600 hover:underline">Permissions</Link>
      </nav>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full min-h-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <input type="text" placeholder="ค้นหา" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold">
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มพนักงาน
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {users.map((user) => (
            <UserCard 
              key={user.id} 
              user={user} 
              onEdit={() => handleEdit(user)} 
              onDelete={() => handleDelete(user)} 
            />
          ))}
        </div>

        <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
            <p>1-8 of 28</p>
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft size={20} /></button>
                <button className="p-2 rounded-md hover:bg-gray-100"><ChevronRight size={20} /></button>
            </div>
        </div>
      </div>
    </>
  );
}
