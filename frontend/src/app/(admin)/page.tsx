'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { RoleGate } from '@/src/components/rbac';

export const userFormSchema = z.object({
  employeeId: z.string().min(1, 'กรุณาระบุรหัสพนักงาน'),
  name: z.string().min(1, 'กรุณาระบุชื่อ'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัวอักษร').optional(),
  roleIds: z.array(z.number(), { required_error: 'กรุณาเลือกบทบาท' }).min(1, 'เลือกอย่างน้อย 1 บทบาท'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type ApiUser = {
  id: number;
  employeeId: string;
  email: string;
  name: string;
  userRoles: { role: { id: number; name: string } }[];
};

type ApiRole = {
  id: number;
  name: string;
  rolePermissions: { permission: { id: number; name: string } }[];
};

type ApiPermission = {
  id: number;
  name: string;
  description?: string | null;
};

export const roleFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อบทบาท'),
  permissionIds: z.array(z.number()).optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export const permissionFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อสิทธิ์'),
  description: z.string().optional(),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

export const mapUserRoles = (user?: ApiUser | null) =>
  user?.userRoles?.map((relation) => relation.role.id) ?? [];

export const mapRolePermissions = (role?: ApiRole | null) =>
  role?.rolePermissions?.map((relation) => relation.permission.id) ?? [];

const SectionLayout = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {children}
    </CardContent>
  </Card>
);

const UsersSection = ({
  users,
  roles,
  onRefresh,
}: {
  users: ApiUser[];
  roles: ApiRole[];
  onRefresh: () => Promise<void>;
}) => {
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      employeeId: '',
      name: '',
      email: '',
      password: '',
      roleIds: [],
    },
  });

  useEffect(() => {
    if (selectedUser) {
      form.reset({
        employeeId: selectedUser.employeeId,
        name: selectedUser.name ?? '',
        email: selectedUser.email,
        password: '',
        roleIds: mapUserRoles(selectedUser),
      });
    } else {
      form.reset({ employeeId: '', name: '', email: '', password: '', roleIds: [] });
    }
  }, [selectedUser, form]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      const payload = { ...values };
      if (!payload.password) {
        delete (payload as Partial<UserFormValues>).password;
      }
      if (selectedUser) {
        await api.patch(`/users/${selectedUser.id}`, payload);
        toast.success('อัปเดตข้อมูลผู้ใช้สำเร็จ');
      } else {
        await api.post('/users', payload);
        toast.success('สร้างผู้ใช้สำเร็จ');
      }
      setSelectedUser(null);
      await onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'ไม่สามารถบันทึกข้อมูลผู้ใช้ได้';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success('ลบผู้ใช้สำเร็จ');
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      await onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'ไม่สามารถลบผู้ใช้ได้';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <SectionLayout
      title="จัดการผู้ใช้"
      description="สร้าง แก้ไข และกำหนดบทบาทให้ผู้ใช้งาน"
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสพนักงาน</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead className="w-[140px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.employeeId}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  {user.userRoles?.map((relation) => relation.role.name).join(', ') || '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedUser(user)}>
                    แก้ไข
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!users.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  ยังไม่มีข้อมูลผู้ใช้
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{selectedUser ? 'แก้ไขผู้ใช้' : 'สร้างผู้ใช้ใหม่'}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedUser ? 'แก้ไขรายละเอียดและบทบาทของผู้ใช้' : 'กรอกข้อมูลเพื่อสร้างผู้ใช้ใหม่'}
            </p>
          </div>
          {selectedUser && (
            <Button variant="ghost" onClick={() => setSelectedUser(null)}>
              + สร้างใหม่
            </Button>
          )}
        </div>
        <Separator className="my-4" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสพนักงาน</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น EMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ - นามสกุล</FormLabel>
                  <FormControl>
                    <Input placeholder="ชื่อผู้ใช้งาน" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสผ่าน</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={selectedUser ? 'เว้นว่างหากไม่เปลี่ยน' : 'กรอกรหัสผ่าน'} {...field} />
                  </FormControl>
                  <FormDescription>
                    {selectedUser
                      ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน'
                      : 'กำหนดรหัสผ่านสำหรับผู้ใช้ใหม่'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สิทธิ์การใช้งาน</FormLabel>
                  <div className="grid gap-2">
                    {roles.map((role) => (
                      <Label key={role.id} className="flex items-center gap-2 font-normal">
                        <Checkbox
                          checked={field.value?.includes(role.id) ?? false}
                          onCheckedChange={(checked) => {
                            const current = new Set(field.value ?? []);
                            if (checked) {
                              current.add(role.id);
                            } else {
                              current.delete(role.id);
                            }
                            field.onChange(Array.from(current));
                          }}
                        />
                        {role.name}
                      </Label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {selectedUser ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้'}
            </Button>
          </form>
        </Form>
      </div>
    </SectionLayout>
  );
};

const RolesSection = ({
  roles,
  permissions,
  onRefresh,
}: {
  roles: ApiRole[];
  permissions: ApiPermission[];
  onRefresh: () => Promise<void>;
}) => {
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null);
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      permissionIds: [],
    },
  });

  useEffect(() => {
    if (selectedRole) {
      form.reset({
        name: selectedRole.name,
        permissionIds: mapRolePermissions(selectedRole),
      });
    } else {
      form.reset({ name: '', permissionIds: [] });
    }
  }, [selectedRole, form]);

  const onSubmit = async (values: RoleFormValues) => {
    try {
      const payload = { ...values, permissionIds: values.permissionIds ?? [] };
      if (selectedRole) {
        await api.patch(`/roles/${selectedRole.id}`, payload);
        toast.success('อัปเดตบทบาทสำเร็จ');
      } else {
        await api.post('/roles', payload);
        toast.success('สร้างบทบาทสำเร็จ');
      }
      setSelectedRole(null);
      await onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'ไม่สามารถบันทึกข้อมูลบทบาทได้';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleDelete = async (roleId: number) => {
    try {
      await api.delete(`/roles/${roleId}`);
      toast.success('ลบบทบาทสำเร็จ');
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
      await onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'ไม่สามารถลบบทบาทได้';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <SectionLayout title="จัดการบทบาท" description="กำหนดสิทธิ์และบทบาทของระบบ">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อบทบาท</TableHead>
              <TableHead>สิทธิ์ที่ได้รับ</TableHead>
              <TableHead className="w-[140px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>
                  {role.rolePermissions?.map((relation) => relation.permission.name).join(', ') || '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedRole(role)}>
                    แก้ไข
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(role.id)}>
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!roles.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  ยังไม่มีข้อมูลบทบาท
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{selectedRole ? 'แก้ไขบทบาท' : 'สร้างบทบาทใหม่'}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedRole ? 'เลือกสิทธิ์ที่เกี่ยวข้องกับบทบาทนี้' : 'ตั้งชื่อบทบาทและกำหนดสิทธิ์ที่ต้องการ'}
            </p>
          </div>
          {selectedRole && (
            <Button variant="ghost" onClick={() => setSelectedRole(null)}>
              + สร้างใหม่
            </Button>
          )}
        </div>
        <Separator className="my-4" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อบทบาท</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น ADMIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สิทธิ์ที่ต้องการกำหนด</FormLabel>
                  <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                    {permissions.map((permission) => (
                      <Label key={permission.id} className="flex items-center gap-2 font-normal">
                        <Checkbox
                          checked={field.value?.includes(permission.id) ?? false}
                          onCheckedChange={(checked) => {
                            const current = new Set(field.value ?? []);
                            if (checked) {
                              current.add(permission.id);
                            } else {
                              current.delete(permission.id);
                            }
                            field.onChange(Array.from(current));
                          }}
                        />
                        {permission.name}
                      </Label>
                    ))}
                  </div>
                  <FormDescription>ปล่อยว่างหากไม่ต้องการกำหนดสิทธิ์เพิ่มเติม</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {selectedRole ? 'บันทึกการแก้ไข' : 'สร้างบทบาท'}
            </Button>
          </form>
        </Form>
      </div>
    </SectionLayout>
  );
};

const PermissionsSection = ({
  permissions,
  onRefresh,
}: {
  permissions: ApiPermission[];
  onRefresh: () => Promise<void>;
}) => {
  const [selectedPermission, setSelectedPermission] = useState<ApiPermission | null>(null);
  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (selectedPermission) {
      form.reset({
        name: selectedPermission.name,
        description: selectedPermission.description ?? '',
      });
    } else {
      form.reset({ name: '', description: '' });
    }
  }, [selectedPermission, form]);

  const onSubmit = async (values: PermissionFormValues) => {
    try {
      if (selectedPermission) {
        await api.patch(`/permissions/${selectedPermission.id}`, values);
        toast.success('อัปเดตสิทธิ์สำเร็จ');
      } else {
        await api.post('/permissions', values);
        toast.success('สร้างสิทธิ์สำเร็จ');
      }
      setSelectedPermission(null);
      await onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'ไม่สามารถบันทึกข้อมูลสิทธิ์ได้';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleDelete = async (permissionId: number) => {
    try {
      await api.delete(`/permissions/${permissionId}`);
      toast.success('ลบสิทธิ์สำเร็จ');
      if (selectedPermission?.id === permissionId) {
        setSelectedPermission(null);
      }
      await onRefresh();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'ไม่สามารถลบสิทธิ์ได้';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  return (
    <SectionLayout title="จัดการสิทธิ์" description="เพิ่ม แก้ไข หรือลบสิทธิ์การใช้งานระบบ">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อสิทธิ์</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead className="w-[140px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.name}</TableCell>
                <TableCell>{permission.description || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedPermission(permission)}>
                    แก้ไข
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(permission.id)}>
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!permissions.length && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  ยังไม่มีข้อมูลสิทธิ์
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{selectedPermission ? 'แก้ไขสิทธิ์' : 'สร้างสิทธิ์ใหม่'}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedPermission
                ? 'แก้ไขรายละเอียดของสิทธิ์ที่มีอยู่'
                : 'เพิ่มสิทธิ์ใหม่เพื่อใช้ในระบบ RBAC'}
            </p>
          </div>
          {selectedPermission && (
            <Button variant="ghost" onClick={() => setSelectedPermission(null)}>
              + สร้างใหม่
            </Button>
          )}
        </div>
        <Separator className="my-4" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อสิทธิ์</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น read_user" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Input placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {selectedPermission ? 'บันทึกการแก้ไข' : 'สร้างสิทธิ์'}
            </Button>
          </form>
        </Form>
      </div>
    </SectionLayout>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    const response = await api.get<ApiUser[]>('/users');
    setUsers(response.data);
  }, []);

  const loadRoles = useCallback(async () => {
    const response = await api.get<ApiRole[]>('/roles');
    setRoles(response.data);
  }, []);

  const loadPermissions = useCallback(async () => {
    const response = await api.get<ApiPermission[]>('/permissions');
    setPermissions(response.data);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadUsers(), loadRoles(), loadPermissions()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers, loadRoles, loadPermissions]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ศูนย์ควบคุมสิทธิ์การใช้งาน</h1>
        <p className="text-muted-foreground">
          กำหนดบทบาทและสิทธิ์การใช้งานของผู้ใช้ภายในระบบจากจุดเดียว
        </p>
      </div>
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">ผู้ใช้</TabsTrigger>
          <TabsTrigger value="roles">บทบาท</TabsTrigger>
          <TabsTrigger value="permissions">สิทธิ์</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UsersSection users={users} roles={roles} onRefresh={refreshAll} />
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <RolesSection roles={roles} permissions={permissions} onRefresh={refreshAll} />
        </TabsContent>
        <TabsContent value="permissions" className="space-y-4">
          <PermissionsSection permissions={permissions} onRefresh={refreshAll} />
        </TabsContent>
      </Tabs>
      {isLoading && <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>}
    </div>
  );
};

const UnauthorizedPanel = () => (
  <Card>
    <CardHeader>
      <CardTitle>ไม่มีสิทธิ์เข้าถึง</CardTitle>
      <CardDescription>
        เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถเข้าถึงหน้าจัดการสิทธิ์ได้
      </CardDescription>
    </CardHeader>
  </Card>
);

export default function AdminPanelPage() {
  return (
    <RoleGate roles={["SUPER_ADMIN", "ADMIN"]} fallback={<UnauthorizedPanel />}>
      <AdminPanel />
    </RoleGate>
  );
}
