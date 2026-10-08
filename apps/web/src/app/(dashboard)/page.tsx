"use client";

import Dashboard from '@/components/Dashboard';
import { useGlobal } from '@/lib/context';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { orders, setOrders, role, persona, setReceptionOpen } = useGlobal();
  const router = useRouter();

  return (
    <Dashboard 
      orders={orders} 
      role={role} 
      persona={persona} 
      onOpenOrder={(id) => router.push(`/work-orders/${id}`)} 
      onNewReception={() => setReceptionOpen(true)} 
      onOrdersChange={setOrders} 
    />
  );
}
