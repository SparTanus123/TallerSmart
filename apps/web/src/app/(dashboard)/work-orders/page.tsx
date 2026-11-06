"use client";

import WorkOrders from '@/components/work-orders/WorkOrders';
import { useGlobal } from '@/lib/context';
import { useState } from 'react';

export default function WorkOrdersPage() {
  const { orders, updateOrder, role, persona, user } = useGlobal();
  const [openOtId, setOpenOtId] = useState<string | null>(null);

  const currentTechId = persona?.techId || user?.id;
  const displayedOrders = role === 'technician'
    ? orders.filter((o) => currentTechId ? o.technicianId === currentTechId : false)
    : orders;

  return (
    <WorkOrders 
      orders={displayedOrders} 
      onOrdersChange={updateOrder}
      openOtId={openOtId} 
      onOpenOtChange={setOpenOtId} 
      role={role} 
    />
  );
}
