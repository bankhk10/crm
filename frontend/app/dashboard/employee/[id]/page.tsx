'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';
import { Mail, Phone, Building, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

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

// --- Mock Data for Activities (for demonstration) ---
const mockActivities = [
  { id: 1, code: 'PN0001265', type: 'เข้าพบร้านค้า', revenue: 30124, cost: 8124, profit: 20000, duration: 8 },
  { id: 2, code: 'PN0001265', type: 'เข้าพบเกษตรกร', revenue: 2124, cost: 4451, profit: -2327, duration: 1 },
  { id: 3, code: 'PN0001265', type: 'เข้าพบร้านค้า', revenue: 7124, cost: 0, profit: 7124, duration: 2 },
  { id: 4, code: 'PN0001265', type: 'เข้าพบร้านค้า', revenue: 45114, cost: 14214, profit: 30900, duration: 7 },
];

// --- Left Panel Component ---
const UserProfilePanel = ({ user }: { user: User }) => (
  <div className="w-full lg:w-1/4 xl:w-1/5 bg-white rounded-2xl shadow-lg p-6 self-start sticky top-8">
    <div className="flex flex-col items-center text-center">
      <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-gray-200">
        <Image src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} layout="fill" className="object-cover" />
      </div>
      <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
      <p className="text-gray-500">{user.role.name === 'USER' ? 'พนักงานขาย' : user.role.name}</p>
    </div>

    <div className="border-t border-gray-200 my-6"></div>

    <div>
      <h3 className="font-bold text-gray-800 mb-4">รายละเอียด</h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Building size={16} className="mr-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-semibold">บริษัท</p>
            <p>Cropsciences</p>
          </div>
        </div>
        <div className="flex items-center text-gray-600">
          <CalendarIcon size={16} className="mr-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-semibold">วันที่เกิด</p>
            <p>12 มกราคม 2538</p>
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-200 my-6"></div>

    <div>
      <h3 className="font-bold text-gray-800 mb-4">ติดต่อ</h3>
      <div className="space-y-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Mail size={16} className="mr-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-semibold">Email</p>
            <p className="break-all">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone size={16} className="mr-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="font-semibold">เบอร์โทรศัพท์</p>
            <p>0985541223</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Activity Card Component ---
const ActivityCard = ({ activity }: { activity: typeof mockActivities[0] }) => {
    const isProfitPositive = activity.profit >= 0;
    const typeColor = activity.type === 'เข้าพบร้านค้า' ? 'bg-purple-500' : 'bg-yellow-500';
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex items-center space-x-4 md:w-1/3">
                <div className={`w-12 h-12 rounded-full ${typeColor} flex-shrink-0`}></div>
                <div>
                    <p className="font-bold text-gray-500 text-sm">{activity.code}</p>
                    <p className="font-bold text-gray-800">{activity.type}</p>
                    <p className="text-xs text-gray-500 flex items-center"><CalendarIcon size={14} className="mr-1.5" /> วันที่สร้าง 13, 2025</p>
                </div>
            </div>
            <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-4 md:pt-0">
                <p className="font-bold text-gray-800 mb-2">ข้อมูล</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-gray-500">รายรับ</p><p className="font-bold text-gray-900">{activity.revenue.toLocaleString()} บาท</p></div>
                    <div><p className="text-gray-500">รายจ่าย</p><p className="font-bold text-gray-900">{activity.cost.toLocaleString()} บาท</p></div>
                    <div><p className="text-gray-500">รายได้สุทธิ</p><p className={`font-bold ${isProfitPositive ? 'text-green-600' : 'text-red-600'}`}>{activity.profit.toLocaleString()} บาท</p></div>
                    <div><p className="text-gray-500">ระยะเวลา</p><p className="font-bold text-gray-900">{activity.duration} วัน</p></div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          // Assuming you have an endpoint to get a single user
          const response = await api.get(`/users/${id}`);
          setUser(response.data);
        } catch (error) {
          toast.error('Failed to fetch user details.');
          router.push('/dashboard/employee'); // Redirect if user not found
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading user profile...</p></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-full"><p>User not found.</p></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <UserProfilePanel user={user} />
      
      <div className="w-full lg:flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 font-semibold">
                <ArrowLeft size={20} className="mr-2" />
                กลับ
            </button>
            <div className="relative">
                <button className="flex items-center bg-white px-4 py-2 rounded-lg shadow-md font-semibold text-gray-700">
                เดือนปัจจุบัน <ChevronDown size={20} className="ml-2" />
                </button>
            </div>
        </div>
        
        <div className="space-y-6">
          {mockActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
            <p>1-4 of 28</p>
            <div className="flex items-center space-x-2">
                <button className="p-2 rounded-md hover:bg-gray-200"><ChevronLeft size={20} /></button>
                <button className="p-2 rounded-md hover:bg-gray-200"><ChevronRight size={20} /></button>
            </div>
        </div>
      </div>
    </div>
  );
}
