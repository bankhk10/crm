'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Edit, X, AlertTriangle } from 'lucide-react';

interface Permission {
  id: number;
  action: string;
  subject: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

type RoleFormInputs = { name: string; permissionIds: number[] };

const RoleModal = ({
  isOpen,
  onClose,
  onSubmit,
  permissions,
  defaultValues,
  title,
  submitLabel,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormInputs) => Promise<void>;
  permissions: Permission[];
  defaultValues?: RoleFormInputs;
  title: string;
  submitLabel: string;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormInputs>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  if (!isOpen) return null;

  const handleFormSubmit: SubmitHandler<RoleFormInputs> = async (data) => {
    await onSubmit({
      name: data.name,
      permissionIds: data.permissionIds.map(Number),
    });
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="max-h-48 overflow-y-auto border p-2 rounded-md">
              {permissions.map((p) => (
                <label key={p.id} className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    value={p.id}
                    {...register('permissionIds', { required: 'Select at least one permission' })}
                  />
                  <span>{p.action} {p.subject}</span>
                </label>
              ))}
            </div>
            {errors.permissionIds && <p className="text-sm text-red-600 mt-1">{errors.permissionIds.message as string}</p>}
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteRoleModal = ({
  role,
  isOpen,
  onClose,
  onConfirm,
}: {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen || !role) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Role</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <strong>{role.name}</strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            onClick={onConfirm}
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

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch {
      toast.error('Failed to fetch roles or permissions.');
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role.name !== 'ADMIN') {
      toast.error("Access Denied: You don't have permission to view this page.");
      router.push('/dashboard');
      return;
    }
    if (user?.role.name === 'ADMIN') {
      fetchData();
    }
  }, [user, isLoading, router]);

  const openAddModal = () => {
    setModalMode('add');
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleAddOrUpdate = async (data: RoleFormInputs) => {
    try {
      if (modalMode === 'add') {
        await api.post('/roles', data);
        toast.success('Role created successfully!');
      } else if (selectedRole) {
        await api.patch(`/roles/${selectedRole.id}`, data);
        toast.success('Role updated successfully!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save role.');
    }
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    try {
      await api.delete(`/roles/${selectedRole.id}`);
      toast.success('Role deleted successfully.');
      fetchData();
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete role.');
    }
  };

  if (isLoading || !user || user.role.name !== 'ADMIN') {
    return <div className="flex items-center justify-center h-screen">Checking permissions...</div>;
  }

  return (
    <>
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddOrUpdate}
        permissions={permissions}
        defaultValues={
          modalMode === 'edit' && selectedRole
            ? { name: selectedRole.name, permissionIds: selectedRole.permissions.map((p) => p.id) }
            : { name: '', permissionIds: [] }
        }
        title={modalMode === 'add' ? 'Add Role' : 'Edit Role'}
        submitLabel={modalMode === 'add' ? 'Create' : 'Save'}
      />
      <DeleteRoleModal
        role={selectedRole}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <nav className="mb-4 space-x-4">
        <Link href="/admin/users" className="text-blue-600 hover:underline">Users</Link>
        <Link href="/admin/roles" className="text-blue-600 hover:underline">Roles</Link>
        <Link href="/admin/permissions" className="text-blue-600 hover:underline">Permissions</Link>
      </nav>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full min-h-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Roles</h1>
          <button
            onClick={openAddModal}
            className="w-full md:w-auto flex items-center justify-center bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Role
          </button>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap">{r.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {r.permissions.map((p) => `${p.action} ${p.subject}`).join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openEditModal(r)} className="text-indigo-600 hover:text-indigo-900"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(r)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

