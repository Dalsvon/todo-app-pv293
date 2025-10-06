import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

// Create span processor with console exporter
const exporter = new ConsoleSpanExporter();
const spanProcessor = new SimpleSpanProcessor(exporter);

// Create provider with the span processor
const provider = new NodeTracerProvider({
  spanProcessors: [spanProcessor],
});

// Register the provider globally
provider.register();

console.log('OpenTelemetry tracing initialized');

export default provider;