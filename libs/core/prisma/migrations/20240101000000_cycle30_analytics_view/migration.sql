CREATE VIEW "AnalyticsAgentPerformance" AS
SELECT
  u.organizationId,
  af.agentRunId,
  AVG(af.rating) as avgRating,
  COUNT(af.id) as totalFeedback,
  DATE_TRUNC('day', af.createdAt) as date
FROM "agent_feedbacks" af
JOIN "users" u ON af.userId = u.id
GROUP BY u.organizationId, af.agentRunId, DATE_TRUNC('day', af.createdAt);
