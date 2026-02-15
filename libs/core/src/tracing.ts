import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

// In production, use OTLPTraceExporter to send to Jaeger/SigNoz
// const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

export const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'salesos-core-node',
});

export function initializeTracing() {
  sdk.start();
  console.log('OpenTelemetry initialized for Node.js');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
