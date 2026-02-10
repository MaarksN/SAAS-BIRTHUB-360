/**
 * Simulates chunking an audio stream for low-latency playback.
 * In a real scenario, this would wrap the LLM/TTS stream.
 */
export async function* chunkAudioStream(
  audioBuffer: Buffer,
  chunkSize: number = 1024 // Small chunks for low latency
): AsyncGenerator<Buffer> {
  let offset = 0;
  while (offset < audioBuffer.length) {
    const end = Math.min(offset + chunkSize, audioBuffer.length);
    yield audioBuffer.subarray(offset, end);
    offset = end;

    // Simulate network jitter if needed
    // await new Promise(res => setTimeout(res, 10));
  }
}

/**
 * Helper to process text chunks for TTS streaming (sentence boundary detection).
 */
export function* chunkTextForTTS(textStream: string): Generator<string> {
  let buffer = '';
  const sentenceEnd = /[.!?]/;

  for (const char of textStream) {
    buffer += char;
    if (sentenceEnd.test(char)) {
      yield buffer.trim();
      buffer = '';
    }
  }
  if (buffer.trim()) yield buffer.trim();
}
