import { Router, type Response } from 'express';
import {
  chatRequestSchema,
  intakeAnalysisSchema,
  preventiveAnalysisSchema,
  deliveryReportSchema,
} from './ai.schema';
import {
  getSmartMecStatus,
  processChat,
  analyzeIntake,
  analyzePreventive,
  generateDeliveryReport,
} from './ai.service';

const router = Router();

const getUser = (res: Response) => {
  return res.locals.user as { id: string; name: string; role: string } | undefined;
};

// Returns SmartMec agent metadata and Gemini API connectivity check
router.get('/status', async (_req, res, next) => {
  try {
    const status = await getSmartMecStatus();
    res.json(status);
  } catch (e) {
    next(e);
  }
});

// Interactive chat with SmartMec
router.post('/chat', async (req, res, next) => {
  try {
    const parsed = chatRequestSchema.parse(req.body);
    const user = getUser(res);
    const reply = await processChat(parsed, user);
    res.json(reply);
  } catch (e) {
    next(e);
  }
});

// Intake classification & triage
router.post('/intake', async (req, res, next) => {
  try {
    const parsed = intakeAnalysisSchema.parse(req.body);
    const result = await analyzeIntake(parsed);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Preventive maintenance calculation
router.post('/preventive', async (req, res, next) => {
  try {
    const parsed = preventiveAnalysisSchema.parse(req.body);
    const result = await analyzePreventive(parsed);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Handover delivery report generation
router.post('/delivery-report', async (req, res, next) => {
  try {
    const parsed = deliveryReportSchema.parse(req.body);
    const result = await generateDeliveryReport(parsed);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
