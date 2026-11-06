import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getSmartMecStatus } from '../../src/modules/ai/ai.service';
import { SMARTMEC_SYSTEM_PROMPT } from '../../src/modules/ai/gemini.client';

describe('Unit: AI Copilot SmartMec Specifications & System Prompts', () => {
  it('exposes correct metadata and capabilities in status', async () => {
    const status = await getSmartMecStatus();

    assert.strictEqual(status.agent.name, 'SmartMec');
    assert.strictEqual(status.agent.version, '1.0.0');
    assert.ok(status.agent.capabilities.length >= 5, 'Must list at least 5 key automotive capabilities');
    assert.ok(typeof status.gemini.ok === 'boolean', 'Gemini health status must be boolean');
    assert.ok(status.gemini.model.includes('gemini'), 'Model should refer to a gemini model family');
  });

  it('verifies that SMARTMEC_SYSTEM_PROMPT strictly defines automotive role and guidelines', () => {
    assert.ok(SMARTMEC_SYSTEM_PROMPT.includes('SmartMec'), 'Prompt must define agent name as SmartMec');
    assert.ok(SMARTMEC_SYSTEM_PROMPT.includes('TallerSmart'), 'Prompt must ground context in TallerSmart');
    assert.ok(SMARTMEC_SYSTEM_PROMPT.includes('OBD-II'), 'Prompt must include OBD-II diagnosis capability');
    assert.ok(SMARTMEC_SYSTEM_PROMPT.includes('mantenimiento preventivo'), 'Prompt must support preventive maintenance');
    assert.ok(SMARTMEC_SYSTEM_PROMPT.includes('REGLA ESTRICTA DE FORMATO'), 'Prompt must enforce clean formatting without asterisks spam');
  });
});
