"use client";

import { useParams, useRouter } from 'next/navigation';
import OTDrawer from '@/components/work-orders/OTDrawer';
import { useGlobal } from '@/lib/context';

export default function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, setOrders, role } = useGlobal();
  const order = orders.find((item) => item.id === id);

  if (!order) {
    return <div className="p-8 text-sm text-fg-2">No se encontró la orden. <button className="btn btn-secondary ml-2" onClick={() => router.push('/work-orders')}>Volver a órdenes</button></div>;
  }

  return <OTDrawer ot={order} onClose={() => router.push('/work-orders')} onUpdate={(updated) => setOrders((current) => current.map((item) => item.id !== updated.id ? item : ({ ...updated, auditLog: [...(updated.auditLog ?? item.auditLog ?? []), ...(item.status !== updated.status ? [{ id: `evt-${Date.now()}`, action: 'status_changed' as const, actor: role, at: new Date().toISOString(), fromStatus: item.status, toStatus: updated.status }] : [])] })))} role={role} />;
}