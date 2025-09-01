'use client';

import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface Stat {
  title: string;
  value: number;
  goal: number;
}

interface SalesDatum {
  month: string;
  sales: number;
  plan: number;
  remaining: number;
}

interface Tier {
  name: string;
  value: number;
  color: string;
}

interface Promotion {
  name: string;
  amount: number;
  progress: number;
  color: string;
}

interface ActivityDatum {
  name: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const stats: Stat[] = [
    {
      title: 'ยอดขายสะสมปีนี้',
      value: 1_250_000,
      goal: 1_500_000,
    },
    {
      title: 'ยอดขายเดือนนี้',
      value: 1_075_000,
      goal: 1_800_000,
    },
    {
      title: 'แผนการขายรวม',
      value: 10_500_000,
      goal: 18_000_000,
    },
    {
      title: 'ยอดขายที่ยังขาดจากเป้าปีนี้',
      value: 7_250_000,
      goal: 18_000_000,
    },
  ];

  const salesData: SalesDatum[] = [
    { month: 'ม.ค.', sales: 50_000, plan: 60_000, remaining: 10_000 },
    { month: 'ก.พ.', sales: 60_000, plan: 65_000, remaining: 5_000 },
    { month: 'มี.ค.', sales: 75_000, plan: 70_000, remaining: 0 },
    { month: 'เม.ย.', sales: 80_000, plan: 75_000, remaining: 0 },
    { month: 'พ.ค.', sales: 90_000, plan: 85_000, remaining: 0 },
    { month: 'มิ.ย.', sales: 85_000, plan: 90_000, remaining: 5_000 },
    { month: 'ก.ค.', sales: 88_000, plan: 95_000, remaining: 7_000 },
    { month: 'ส.ค.', sales: 93_000, plan: 100_000, remaining: 7_000 },
    { month: 'ก.ย.', sales: 97_000, plan: 110_000, remaining: 13_000 },
    { month: 'ต.ค.', sales: 120_000, plan: 120_000, remaining: 0 },
    { month: 'พ.ย.', sales: 130_000, plan: 125_000, remaining: 0 },
    { month: 'ธ.ค.', sales: 140_000, plan: 130_000, remaining: 0 },
  ];

  const salesConfig = {
    sales: {
      label: 'ยอดขาย',
      color: 'hsl(var(--chart-1))',
    },
    plan: {
      label: 'แผนการขายรวม',
      color: 'hsl(var(--chart-2))',
    },
    remaining: {
      label: 'ขาดเป้าปีนี้',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;

  const customerTiers: Tier[] = [
    { name: 'แพลทตินัม', value: 86.67, color: '#0ea5e9' },
    { name: 'โกลด์', value: 60, color: '#f97316' },
    { name: 'ซิลเวอร์', value: 40, color: '#22c55e' },
    { name: 'บรอนซ์', value: 20, color: '#8b5cf6' },
  ];

  const promotions: Promotion[] = [
    { name: 'ส่วนลดค่าแรง 30%', amount: 92_199, progress: 80, color: '#0ea5e9' },
    { name: 'ส่งฟรีเมื่อซื้อครบ 500 บาท', amount: 53_233, progress: 60, color: '#f97316' },
    { name: 'ซื้อครบ 1,000 บาทรับของแถม', amount: 41_000, progress: 40, color: '#22c55e' },
    { name: 'คูปองส่วนลด 1,000 บาท', amount: 20_000, progress: 20, color: '#8b5cf6' },
  ];

  const activityData: ActivityDatum[] = [
    { name: 'สำเร็จ', value: 513, color: '#22c55e' },
    { name: 'กำลังทำ', value: 741, color: '#0ea5e9' },
    { name: 'ยกเลิก', value: 121, color: '#ef4444' },
  ];

  const totalActivities = activityData.reduce(
    (acc, cur) => acc + cur.value,
    0,
  );

  return (
    <div className="bg-white w-full min-h-full rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        หน้ารายงาน (Dashboard)
        {user ? ` - ยินดีต้อนรับ ${user.name}` : ''}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const percent = Math.round((item.value / item.goal) * 100);
          return (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-gray-900">
                  {item.value.toLocaleString('th-TH')} บาท
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  เป้าหมาย: {item.goal.toLocaleString('th-TH')} บาท
                </div>
                <Progress value={percent} className="mt-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  ยอดที่ทำได้: {percent}%
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>ยอดขาย</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={salesConfig} className="h-[300px] w-full">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="plan" fill="var(--color-plan)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="remaining" fill="var(--color-remaining)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>ระดับลูกค้า</CardTitle>
            <CardDescription>ข้อมูลจำแนกตามระดับสมาชิก</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customerTiers.map((tier) => (
              <div key={tier.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{tier.name}</span>
                  <span>{tier.value}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${tier.value}%`, backgroundColor: tier.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>กิจกรรม</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center sm:flex-row sm:justify-center">
            <div className="relative h-[250px] w-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={80}
                    outerRadius={100}
                    strokeWidth={8}
                  >
                    {activityData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                {totalActivities.toLocaleString('th-TH')}
              </div>
            </div>
            <div className="mt-6 sm:mt-0 sm:ml-8 space-y-2">
              {activityData.map((item) => (
                <div key={item.name} className="flex items-center text-sm">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                  <span className="ml-2 font-medium">
                    {item.value.toLocaleString('th-TH')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>โปรโมชัน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {promotions.map((promo) => (
              <div key={promo.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{promo.name}</span>
                  <span>{promo.amount.toLocaleString('th-TH')}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${promo.progress}%`, backgroundColor: promo.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

