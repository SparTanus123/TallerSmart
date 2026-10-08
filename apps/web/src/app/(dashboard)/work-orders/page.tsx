"use client";

import WorkOrders from '@/components/work-orders/WorkOrders';
import { useGlobal } from '@/lib/context';
import { useState } from 'react';

export default function WorkOrdersPage() {
  const { orders, setOrders, role } = useGlobal();
  const [openOtId, setOpenOtId] = useState<string | null>(null);

  return (
    <WorkOrders 
      orders={orders} 
      onOrdersChange={setOrders} 
      openOtId={openOtId} 
      onOpenOtChange={setOpenOtId} 
      role={role} 
    />
  );
}
