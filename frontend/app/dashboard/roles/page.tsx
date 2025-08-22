'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

import {
  PlusCircle,
  Trash2,
  Edit,
  Shield,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

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

// submitted to API
type RoleFormInputs = { name: string; permissionIds: number[] };
// used in form
type RoleFormData = { name: string; permissionIds: string[] };

function RoleDialog({
  open,
  onOpenChange,
  mode,
  permissions,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: 'add' | 'edit';
  permissions: Permission[];
  defaultValues: RoleFormData;
  onSubmit: (data: RoleFormInputs) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit: SubmitHandler<RoleFormData> = async (data) => {
    const ids = (data.permissionIds ?? []).map((x) => Number(x));
    await onSubmit({ name: data.name.trim(), permissionIds: ids });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {mode === 'add' ? 'Add Role' : 'Edit Role'}
          </DialogTitle>
          <DialogDescription>Set a role name and choose permissions.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="roleName">Name</Label>
            <Input
              id="roleName"
              placeholder="e.g. ADMIN, MANAGER, STAFF"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="max-h-56 overflow-auto rounded-md border p-2">
              <Controller
                name="permissionIds"
                control={control}
                rules={{
                  validate: (v) =>
                    (v && v.length > 0) || 'Select at least one permission',
                }}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {permissions.map((p) => {
                      const val = String(p.id);
                      const checked = field.value?.includes(val) ?? false;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v) {
                                field.onChange([...(field.value ?? []), val]);
                              } else {
                                field.onChange((field.value ?? []).filter((x) => x !== val));
                              }
                            }}
                          />
                          <span className="text-sm">
                            <span className="font-medium">{p.action}</span>{' '}
                            <span className="text-gray-600">{p.subject}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>
            {errors.permissionIds && (
              <p className="text-xs text-red-600">
                {String(errors.permissionIds.message)}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : mode === 'add' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteRoleDialog({
  open,
  onOpenChange,
  role,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: Role | null;
  onConfirm: () => Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{role?.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminRolesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [query, setQuery] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editing, setEditing] = useState<Role | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const fetchData = async () => {
    try {
      setLoadingList(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      setRoles(rolesRes.data ?? []);
      setPermissions(permsRes.data ?? []);
    } catch {
      toast.error('Failed to fetch roles or permissions.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role?.name !== 'ADMIN') {
      toast.error("Access Denied: You don't have permission to view this page.");
      router.push('/dashboard');
      return;
    }
    if (user?.role?.name === 'ADMIN') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const filtered = useMemo(() => {
    if (!query.trim()) return roles;
    const q = query.toLowerCase();
    return roles.filter((r) => {
      const perms = r.permissions.map((p) => `${p.action} ${p.subject}`).join(' ').toLowerCase();
      return r.name.toLowerCase().includes(q) || perms.includes(q);
    });
  }, [roles, query]);

  const openAdd = () => {
    setDialogMode('add');
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (r: Role) => {
    setDialogMode('edit');
    setEditing(r);
    setDialogOpen(true);
  };

  const saveRole = async (data: RoleFormInputs) => {
    try {
      if (dialogMode === 'add') {
        await api.post('/roles', data);
        toast.success('Role created successfully!');
      } else if (editing) {
        await api.patch(`/roles/${editing.id}`, data);
        toast.success('Role updated successfully!');
      }
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save role.');
      throw error;
    }
  };

  const confirmDelete = (r: Role) => {
    setDeleting(r);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/roles/${deleting.id}`);
      toast.success('Role deleted successfully.');
      await fetchData();
      setDeleting(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete role.');
      throw error;
    }
  };

  if (isLoading || !user || user.role?.name !== 'ADMIN') {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-sm text-gray-500">Checking permissions…</div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      {/* dialogs */}
      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        permissions={permissions}
        defaultValues={
          dialogMode === 'edit' && editing
            ? {
                name: editing.name,
                permissionIds: editing.permissions.map((p) => String(p.id)),
              }
            : { name: '', permissionIds: [] }
        }
        onSubmit={saveRole}
      />
      <DeleteRoleDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={deleting}
        onConfirm={doDelete}
      />

      {/* breadcrumb-ish */}
      <nav className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        {/* <Link href="/admin/users" className="text-blue-600 hover:underline">Users</Link> */}
        <Separator orientation="vertical" className="h-4" />
        <Link href="/dashboard/roles" className="font-medium text-gray-900">Roles</Link>
        <Separator orientation="vertical" className="h-4" />
        <Link href="/dashboard/permissions" className="text-blue-600 hover:underline">Permissions</Link>
      </nav>

      <Card className="w-full rounded-2xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles
              </CardTitle>
              <CardDescription>Group permissions into roles.</CardDescription>
            </div>

            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search role or permission…"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button onClick={openAdd} className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Permissions</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loadingList ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-6 py-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 3 }).map((__, j) => (
                            <div key={j} className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr className="border-t">
                    <td className="px-6 py-16 text-center text-sm text-gray-500" colSpan={3}>
                      <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gray-100 p-2">
                        <Search />
                      </div>
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{r.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {r.permissions.map((p) => (
                            <Badge key={p.id} variant="secondary" className="rounded-full px-3 py-1">
                              {p.action} {p.subject}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(r)}
                                aria-label="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => confirmDelete(r)}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
