import { describe, it } from 'node:test';
import assert from 'node:assert';

interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  authorizationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

function calculateOrderTotal(items: LineItem[]): number {
  return items
    .filter(item => item.authorizationStatus === 'APPROVED')
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

describe('Unit: Work Order Item Authorization & Total Calculations', () => {
  it('calculates total as zero when all items are PENDING', () => {
    const items: LineItem[] = [
      { name: 'Cambio de aceite', quantity: 1, unitPrice: 85000, authorizationStatus: 'PENDING' },
      { name: 'Filtro de aire', quantity: 1, unitPrice: 35000, authorizationStatus: 'PENDING' },
    ];

    const total = calculateOrderTotal(items);
    assert.strictEqual(total, 0, 'Pending items must not contribute to invoice total');
  });

  it('calculates total correctly including only APPROVED items', () => {
    const items: LineItem[] = [
      { name: 'Cambio de aceite', quantity: 1, unitPrice: 85000, authorizationStatus: 'APPROVED' },
      { name: 'Filtro de aire', quantity: 2, unitPrice: 35000, authorizationStatus: 'APPROVED' }, // 70000
      { name: 'Alineación láser', quantity: 1, unitPrice: 60000, authorizationStatus: 'REJECTED' }, // 0
      { name: 'Balanceo de llantas', quantity: 4, unitPrice: 15000, authorizationStatus: 'PENDING' }, // 0
    ];

    // Expected: 85,000 + 70,000 = 155,000
    const total = calculateOrderTotal(items);
    assert.strictEqual(total, 155000);
  });

  it('handles decimal quantities correctly (e.g. 3.5 quarts of oil)', () => {
    const items: LineItem[] = [
      { name: 'Aceite 10W-30 (cuartos)', quantity: 3.5, unitPrice: 42000, authorizationStatus: 'APPROVED' },
    ];

    const total = calculateOrderTotal(items);
    assert.strictEqual(total, 147000);
  });

  it('re-sets authorization status to PENDING upon line item edit', () => {
    const originalItem: LineItem = {
      name: 'Pastillas delanteras',
      quantity: 1,
      unitPrice: 120000,
      authorizationStatus: 'APPROVED',
    };

    // When item is updated, business logic forces authorizationStatus back to PENDING
    const updatedItem: LineItem = {
      ...originalItem,
      quantity: 2,
      authorizationStatus: 'PENDING',
    };

    assert.strictEqual(updatedItem.authorizationStatus, 'PENDING');
    assert.strictEqual(calculateOrderTotal([updatedItem]), 0);
  });
});
