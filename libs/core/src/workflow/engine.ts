import jsonLogic from 'json-logic-js';
import { prisma } from '../prisma';
import { logger } from '../logger';

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string; // 'lead.created', 'lead.updated'
  condition: any;  // json-logic object
  action: string;  // 'send_email', 'add_tag'
  actionPayload: any;
}

// Mock Rules Store (In prod, this is a DB model)
const MOCK_RULES: WorkflowRule[] = [
  {
    id: 'rule-1',
    name: 'VIP Lead',
    trigger: 'lead.updated',
    condition: { "==": [{ "var": "status" }, "QUALIFIED"] },
    action: 'log_vip',
    actionPayload: { message: 'New VIP Lead detected!' }
  }
];

export class WorkflowEngine {
  async evaluate(trigger: string, context: any) {
    logger.info({ trigger, contextId: context.id }, 'Evaluating workflows');

    const rules = MOCK_RULES.filter(r => r.trigger === trigger);

    for (const rule of rules) {
      const isMatch = jsonLogic.apply(rule.condition, context);

      if (isMatch) {
        logger.info({ ruleId: rule.id }, 'Rule matched, executing action');
        await this.executeAction(rule.action, rule.actionPayload, context);
      }
    }
  }

  private async executeAction(action: string, payload: any, context: any) {
    switch (action) {
      case 'log_vip':
        console.log(`[WORKFLOW] 🌟 ${payload.message} - ${context.name}`);
        break;
      case 'send_email':
        // Call SenderEngine
        break;
      default:
        logger.warn({ action }, 'Unknown workflow action');
    }
  }
}
