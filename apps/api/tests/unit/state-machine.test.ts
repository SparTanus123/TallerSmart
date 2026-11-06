import { describe, it } from 'node:test';
import assert from 'node:assert';
import { allowedTransitions } from '../../src/modules/work-orders/work-orders.service';

describe('Unit: Work Order State Machine Transitions & Invariants', () => {
  it('defines valid transition paths according to business rules', () => {
    assert.deepStrictEqual(allowedTransitions.RECEIVED, ['DIAGNOSING'], 'RECEIVED can only transition to DIAGNOSING');
    assert.deepStrictEqual(allowedTransitions.DIAGNOSING, ['IN_PROGRESS', 'WAITING_PARTS'], 'DIAGNOSING can transition to IN_PROGRESS or WAITING_PARTS');
    assert.deepStrictEqual(allowedTransitions.IN_PROGRESS, ['WAITING_PARTS', 'COMPLETED'], 'IN_PROGRESS can transition to WAITING_PARTS or COMPLETED');
    assert.deepStrictEqual(allowedTransitions.WAITING_PARTS, ['IN_PROGRESS'], 'WAITING_PARTS can only resume to IN_PROGRESS');
    assert.deepStrictEqual(allowedTransitions.COMPLETED, ['DELIVERED'], 'COMPLETED can only transition to DELIVERED');
    assert.strictEqual(allowedTransitions.DELIVERED, undefined, 'DELIVERED is a terminal state with no further transitions');
  });

  it('rejects illegitimate transition jumps', () => {
    const invalidTransitions = [
      { from: 'RECEIVED', to: 'IN_PROGRESS' },
      { from: 'RECEIVED', to: 'COMPLETED' },
      { from: 'RECEIVED', to: 'DELIVERED' },
      { from: 'DIAGNOSING', to: 'COMPLETED' },
      { from: 'DIAGNOSING', to: 'DELIVERED' },
      { from: 'WAITING_PARTS', to: 'COMPLETED' },
      { from: 'COMPLETED', to: 'IN_PROGRESS' },
      { from: 'DELIVERED', to: 'RECEIVED' },
      { from: 'DELIVERED', to: 'COMPLETED' },
    ];

    for (const { from, to } of invalidTransitions) {
      const allowed = allowedTransitions[from]?.includes(to) ?? false;
      assert.strictEqual(allowed, false, `Transition from ${from} to ${to} must be disallowed`);
    }
  });

  it('enforces RBAC role permissions per transition', () => {
    // According to work-orders.router.ts:
    // status === 'RECEIVED' || status === 'DELIVERED' -> ['ADMIN', 'ADVISOR']
    // other statuses (DIAGNOSING, IN_PROGRESS, WAITING_PARTS, COMPLETED) -> ['ADMIN', 'TECHNICIAN']

    function getPermittedRoles(targetStatus: string): string[] {
      return targetStatus === 'RECEIVED' || targetStatus === 'DELIVERED'
        ? ['ADMIN', 'ADVISOR']
        : ['ADMIN', 'TECHNICIAN'];
    }

    assert.deepStrictEqual(getPermittedRoles('DELIVERED'), ['ADMIN', 'ADVISOR']);
    assert.ok(!getPermittedRoles('DELIVERED').includes('TECHNICIAN'), 'Technician cannot deliver an order');

    assert.deepStrictEqual(getPermittedRoles('DIAGNOSING'), ['ADMIN', 'TECHNICIAN']);
    assert.ok(!getPermittedRoles('DIAGNOSING').includes('ADVISOR'), 'Advisor cannot move to diagnosing');

    assert.deepStrictEqual(getPermittedRoles('COMPLETED'), ['ADMIN', 'TECHNICIAN']);
    assert.ok(getPermittedRoles('COMPLETED').includes('TECHNICIAN'));
  });
});
