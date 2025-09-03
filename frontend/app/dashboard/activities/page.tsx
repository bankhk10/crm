'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Activity {
  id: number;
  title: string;
  description?: string;
  createdById: number;
  department?: string | null;
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchActivities = async () => {
    const res = await api.get('/activities');
    setActivities(res.data);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.patch(`/activities/${editingId}`, form);
    } else {
      await api.post('/activities', form);
    }
    setForm({ title: '', description: '' });
    setEditingId(null);
    fetchActivities();
  };

  const handleEdit = (activity: Activity) => {
    setForm({ title: activity.title, description: activity.description || '' });
    setEditingId(activity.id);
  };

  const handleDelete = async (id: number) => {
    await api.delete(`/activities/${id}`);
    fetchActivities();
  };

  const canModify = (activity: Activity) => {
    if (!user) return false;
    if (user.role?.name === 'ADMIN') return true;
    if (user.role?.name === 'MANAGER' && user.department && activity.department === user.department)
      return true;
    return activity.createdById === user.id;
  };

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">หน้ากิจกรรม (Activities)</h1>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="หัวข้อ"
          className="border p-2 w-full"
          required
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="รายละเอียด"
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingId ? 'แก้ไข' : 'เพิ่ม'} กิจกรรม
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', description: '' });
            }}
            className="ml-2 px-4 py-2 rounded border"
          >
            ยกเลิก
          </button>
        )}
      </form>

      <ul className="space-y-4">
        {activities.map((act) => (
          <li key={act.id} className="border p-4 rounded">
            <h2 className="font-bold">{act.title}</h2>
            <p>{act.description}</p>
            {canModify(act) && (
              <div className="mt-2 space-x-2">
                <button onClick={() => handleEdit(act)} className="text-blue-500">
                  แก้ไข
                </button>
                <button onClick={() => handleDelete(act.id)} className="text-red-500">
                  ลบ
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
