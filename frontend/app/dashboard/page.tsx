'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogOut, UserCog, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-xl font-semibold">Welcome, {user.name}!</h2>
            <p className="mt-2 text-gray-600">Your role is: <span className="font-bold text-indigo-600">{user.role.name}</span></p>
            
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium">Available Actions</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.role.name === 'ADMIN' && (
                  <Link href="/admin/users" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <div className="flex items-center">
                      <UserCog className="w-6 h-6 mr-3 text-blue-600"/>
                      <div>
                        <p className="font-semibold">Manage Users</p>
                        <p className="text-sm text-gray-500">Add, edit, or remove users.</p>
                      </div>
                    </div>
                  </Link>
                )}
                 {user.role.name === 'ADMIN' && (
                  <Link href="/admin/roles" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    <div className="flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-green-600"/>
                      <div>
                        <p className="font-semibold">Manage Roles</p>
                        <p className="text-sm text-gray-500">View and configure roles.</p>
                      </div>
                    </div>
                  </Link>
                )}
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-semibold">View Profile</p>
                  <p className="text-sm text-gray-500">Check your personal information.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}