import EventEmitter from 'events';
import { logger } from '../logger';

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase limit for scale
    this.setMaxListeners(50);
  }

  emit(event: string, payload: any) {
    logger.debug({ event, payloadId: payload?.id }, '📢 Event Emitted');
    return super.emit(event, payload);
  }
}

export const eventBus = new AppEventBus();

// Type-safe triggers
export const EVENTS = {
  LEAD: {
    CREATED: 'lead.created',
    UPDATED: 'lead.updated',
    DELETED: 'lead.deleted',
  },
  EMAIL: {
    SENT: 'email.sent',
    OPENED: 'email.opened',
  }
};
