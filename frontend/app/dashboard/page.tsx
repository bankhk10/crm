'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    // Changes made here:
    // 1. Removed `h-full`, `flex`, `items-center`, `justify-center` to allow the container to grow.
    // 2. Added `p-6` (padding) so the text doesn't touch the edges.
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        สวัสดี {user?.name || 'Admin'}
      </h1>

      {/* Your content will now scroll properly within the main area */}
      <div className="space-y-4 text-gray-700">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error cupiditate quis, laboriosam quaerat voluptas maiores ullam dolore mollitia. Excepturi blanditiis et optio ad quod explicabo ut eligendi quam in debitis.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error cupiditate quis, laboriosam quaerat voluptas maiores ullam dolore mollitia. Excepturi blanditiis et optio ad quod explicabo ut eligendi quam in debitis.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error cupiditate quis, laboriosam quaerat voluptas maiores ullam dolore mollitia. Excepturi blanditiis et optio ad quod explicabo ut eligendi quam in debitis.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error cupiditate quis, laboriosam quaerat voluptas maiores ullam dolore mollitia. Excepturi blanditiis et optio ad quod explicabo ut eligendi quam in debitis.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error cupiditate quis, laboriosam quaerat voluptas maiores ullam dolore mollitia. Excepturi blanditiis et optio ad quod explicabo ut eligendi quam in debitis.
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Error cupiditate quis, laboriosam quaerat voluptas maiores ullam dolore mollitia. Excepturi blanditiis et optio ad quod explicabo ut eligendi quam in debitis.
        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Impedit delectus sint sequi maiores! Quidem, harum sint suscipit fugiat quaerat debitis aliquid! Reiciendis numquam voluptates iste provident porro id ipsum distinctio?</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quasi unde, odio non architecto veritatis velit. Perferendis laborum debitis aspernatur sint suscipit maxime ipsam, adipisci quo rerum ex quam doloribus!</p>
      </div>
    </div>
  );
}
