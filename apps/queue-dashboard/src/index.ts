import express from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import basicAuth from 'express-basic-auth';
import { scrapingQueue, aiQueue, emailQueue } from '@salesos/queue-core';

const app = express();
const port = process.env.PORT || 3001;

// Basic Auth Middleware
const user = process.env.ADMIN_USER || 'admin';
const pass = process.env.ADMIN_PASSWORD || 'admin';

const authMiddleware = basicAuth({
  users: { [user]: pass },
  challenge: true,
});

// Bull Board Setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(scrapingQueue),
    new BullMQAdapter(aiQueue),
    new BullMQAdapter(emailQueue),
  ],
  serverAdapter: serverAdapter,
});

// Apply auth to dashboard route
app.use('/admin/queues', authMiddleware, serverAdapter.getRouter());

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Queue Dashboard running on port ${port}`);
  console.log(`Access at /admin/queues`);
});
