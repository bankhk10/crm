'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

import {
  PlusCircle,
  Trash2,
  Edit,
  ShieldCheck,
  Search,
  AlertTriangle,
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
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Permission {
  id: number;
  action: string;
  subject: string;
}

type PermissionFormInputs = { action: string; subject: string };

function PermissionDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: 'add' | 'edit';
  defaultValues: PermissionFormInputs;
  onSubmit: (data: PermissionFormInputs) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PermissionFormInputs>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const submit: SubmitHandler<PermissionFormInputs> = async (data) => {
    await onSubmit({ action: data.action.trim(), subject: data.subject.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {mode === 'add' ? 'Add Permission' : 'Edit Permission'}
          </DialogTitle>
          <DialogDescription>
            Define what an action can do on a target subject (e.g. <code>read</code> on <code>user</code>).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Input
              id="action"
              placeholder="e.g. read, create, update, delete"
              {...register('action', { required: 'Action is required' })}
            />
            {errors.action && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {errors.action.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. user, role, invoice"
              {...register('subject', { required: 'Subject is required' })}
            />
            {errors.subject && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {errors.subject.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePermissionDialog({
  open,
  onOpenChange,
  permission,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  permission: Permission | null;
  onConfirm: () => Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Permission</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>{permission?.action}</strong> on <strong>{permission?.subject}</strong>? This
            action cannot be undone.
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

export default function AdminPermissionsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editing, setEditing] = useState<Permission | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Permission | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoadingList(true);
      const res = await api.get('/permissions');
      setPermissions(res.data ?? []);
    } catch {
      toast.error('Failed to fetch permissions.');
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
      fetchPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const filtered = useMemo(() => {
    if (!query.trim()) return permissions;
    const q = query.toLowerCase();
    return permissions.filter(
      (p) => p.action.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q),
    );
  }, [permissions, query]);

  const openAdd = () => {
    setDialogMode('add');
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Permission) => {
    setDialogMode('edit');
    setEditing(p);
    setDialogOpen(true);
  };

  const savePermission = async (data: PermissionFormInputs) => {
    try {
      if (dialogMode === 'add') {
        await api.post('/permissions', data);
        toast.success('Permission created successfully!');
      } else if (editing) {
        await api.patch(`/permissions/${editing.id}`, data);
        toast.success('Permission updated successfully!');
      }
      await fetchPermissions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save permission.');
      throw error;
    }
  };

  const confirmDelete = (p: Permission) => {
    setDeleting(p);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/permissions/${deleting.id}`);
      toast.success('Permission deleted successfully.');
      await fetchPermissions();
      setDeleting(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete permission.');
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
      {/* Dialogs */}
      <PermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        defaultValues={
          dialogMode === 'edit' && editing
            ? { action: editing.action, subject: editing.subject }
            : { action: '', subject: '' }
        }
        onSubmit={savePermission}
      />
      <DeletePermissionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        permission={deleting}
        onConfirm={doDelete}
      />

      {/* Breadcrumb-ish nav */}
      <nav className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        {/* <Link href="/admin/users" className="text-blue-600 hover:underline">
          Users
        </Link> */}
        <Separator orientation="vertical" className="h-4" />
        <Link href="/dashboard/roles" className="text-blue-600 hover:underline">
          Roles
        </Link>
        <Separator orientation="vertical" className="h-4" />
        <Link href="/dashboard/permissions" className="font-medium text-gray-900">
          Permissions
        </Link>
      </nav>

      <Card className="w-full rounded-2xl shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>Manage what actions are allowed on which subjects.</CardDescription>
            </div>

            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search action or subject…"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button onClick={openAdd} className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">Action</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Subject</th>
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
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
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
                      No permissions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50/60">
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">
                          {p.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">{p.subject}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(p)}
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
                                onClick={() => confirmDelete(p)}
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
