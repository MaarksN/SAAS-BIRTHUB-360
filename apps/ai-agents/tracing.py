from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor

def initialize_tracing(app=None):
    # 1. Set Provider
    provider = TracerProvider()

    # 2. Set Exporter (Console for dev, OTLP for prod)
    processor = BatchSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)

    trace.set_tracer_provider(provider)

    # 3. Instrument Libraries
    if app:
        FastAPIInstrumentor.instrument_app(app)

    RedisInstrumentor().instrument()
    Psycopg2Instrumentor().instrument()

    print("OpenTelemetry initialized for Python")
