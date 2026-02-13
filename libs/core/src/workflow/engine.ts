import jsonLogic from 'json-logic-js';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { eventBus, EVENTS } from '../events/bus';

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  condition: any;
  action: string;
  actionPayload: any;
}

// In-Memory Rule Cache (Refresh periodically in prod)
// For MVP we hardcode, but structure is ready for DB load.
const ACTIVE_RULES: WorkflowRule[] = [
  {
    id: 'rule-vip',
    name: 'Mark VIP',
    trigger: EVENTS.LEAD.UPDATED,
    condition: { "==": [{ "var": "status" }, "QUALIFIED"] },
    action: 'log_vip',
    actionPayload: { message: 'High Value Lead Qualified' }
  }
];

export class WorkflowEngine {
  constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    // Listen to all defined events
    Object.values(EVENTS).forEach(group => {
      Object.values(group).forEach(event => {
        eventBus.on(event, (payload) => this.evaluate(event, payload));
      });
    });

    logger.info('⚙️ Workflow Engine initialized and listening');
  }

  async evaluate(trigger: string, context: any) {
    // Load from DB (filtering by Organization ideally if context has it, but WorkflowEngine is often global worker)
    // If running in context-aware environment, we should filter by context.organizationId.
    // Assuming context has organizationId.

    let rules: WorkflowRule[] = [];

    if (context.organizationId) {
        const dbRules = await prisma.workflowRule.findMany({
            where: { trigger, isActive: true, organizationId: context.organizationId }
        });
        // Map Prisma JSON to any
        rules = dbRules.map(r => ({ ...r, condition: r.condition as any, actionPayload: r.actionPayload as any }));
    } else {
        // Fallback to memory for system events or if no org context
        rules = ACTIVE_RULES.filter(r => r.trigger === trigger);
    }

    for (const rule of rules) {
      try {
        const isMatch = jsonLogic.apply(rule.condition, context);
        if (isMatch) {
          logger.info({ ruleId: rule.id, trigger }, '✅ Rule Matched');
          await this.executeAction(rule.action, rule.actionPayload, context);
        }
      } catch (e) {
        logger.error({ ruleId: rule.id, error: e }, 'Rule evaluation failed');
      }
    }
  }

  private async executeAction(action: string, payload: any, context: any) {
    switch (action) {
      case 'log_vip':
        console.log(`[WORKFLOW ACTION] 🌟 ${payload.message} - Lead: ${context.email}`);
        break;
      // Add 'send_email', 'add_tag', 'assign_owner' here
      default:
        logger.warn({ action }, 'Unknown action');
    }
  }
}

// Singleton instance to start listeners
export const workflowEngine = new WorkflowEngine();
