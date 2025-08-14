'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, Trash2, X, AlertTriangle } from 'lucide-react';

interface Permission {
  id: number;
  action: string;
  subject: string;
}

type AddPermissionFormInputs = { action: string; subject: string };

const AddPermissionModal = ({ isOpen, onClose, onPermissionAdded }: { isOpen: boolean; onClose: () => void; onPermissionAdded: () => void; }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddPermissionFormInputs>();

  const onSubmit: SubmitHandler<AddPermissionFormInputs> = async (data) => {
    try {
      await api.post('/permissions', data);
      toast.success('Permission created successfully!');
      onPermissionAdded();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create permission.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Permission</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <input {...register('action', { required: 'Action is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            {errors.action && <p className="text-sm text-red-600 mt-1">{errors.action.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input {...register('subject', { required: 'Subject is required' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>}
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">{isSubmitting ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ permission, isOpen, onClose, onConfirmDelete }: { permission: Permission | null; isOpen: boolean; onClose: () => void; onConfirmDelete: () => void; }) => {
  if (!isOpen || !permission) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Permission</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Are you sure you want to delete <strong>{permission.action}</strong> on <strong>{permission.subject}</strong>? This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button onClick={onConfirmDelete} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
          <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/permissions');
      setPermissions(res.data);
    } catch {
      toast.error('Failed to fetch permissions.');
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role.name !== 'ADMIN') {
      toast.error("Access Denied: You don't have permission to view this page.");
      router.push('/dashboard');
      return;
    }
    if (user?.role.name === 'ADMIN') {
      fetchPermissions();
    }
  }, [user, isLoading, router]);

  const handleDelete = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPermission) return;
    try {
      await api.delete(`/permissions/${selectedPermission.id}`);
      toast.success('Permission deleted successfully.');
      fetchPermissions();
      setIsDeleteModalOpen(false);
      setSelectedPermission(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete permission.');
    }
  };

  if (isLoading || !user || user.role.name !== 'ADMIN') {
    return <div className="flex items-center justify-center h-screen">Checking permissions...</div>;
  }

  return (
    <>
      <AddPermissionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onPermissionAdded={fetchPermissions} />
      <DeleteConfirmationModal permission={selectedPermission} isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirmDelete={handleConfirmDelete} />

      <nav className="mb-4 space-x-4">
        <Link href="/admin/users" className="text-blue-600 hover:underline">Users</Link>
        <Link href="/admin/roles" className="text-blue-600 hover:underline">Roles</Link>
        <Link href="/admin/permissions" className="text-blue-600 hover:underline">Permissions</Link>
      </nav>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full min-h-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Permissions</h1>
          <button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Permission
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {permissions.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">{p.action}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

