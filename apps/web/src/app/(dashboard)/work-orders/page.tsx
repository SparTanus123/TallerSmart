"use client";

import WorkOrders from '@/components/work-orders/WorkOrders';
import { useGlobal } from '@/lib/context';
import { useState } from 'react';

export default function WorkOrdersPage() {
  const { orders, updateOrder, role } = useGlobal();
  const [openOtId, setOpenOtId] = useState<string | null>(null);

  return (
    <WorkOrders 
      orders={orders} 
      onOrdersChange={updateOrder}
      openOtId={openOtId} 
      onOpenOtChange={setOpenOtId} 
      role={role} 
    />
  );
}
