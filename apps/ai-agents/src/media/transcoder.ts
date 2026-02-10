import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { logger } from '@salesos/core';

const streamPipeline = promisify(pipeline);

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const transcoder = {
  /**
   * Downloads an audio file from S3, normalizes it to MP3 and WAV, and uploads back.
   */
  processAudio: async (bucket: string, key: string, outputBucket: string) => {
    const tempDir = path.join('/tmp', 'transcoding', Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });

    const localInputPath = path.join(tempDir, 'input');
    const localMp3Path = path.join(tempDir, 'output.mp3');
    const localWavPath = path.join(tempDir, 'output.wav');

    try {
      logger.info(`Starting transcoding for ${key}`);

      // 1. Download
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3.send(getCommand);

      if (!response.Body) throw new Error('Empty body');

      // @ts-ignore
      await streamPipeline(response.Body, fs.createWriteStream(localInputPath));

      // 2. Convert to MP3 (128kbps mono)
      await new Promise<void>((resolve, reject) => {
        ffmpeg(localInputPath)
          .toFormat('mp3')
          .audioBitrate('128k')
          .audioChannels(1)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .save(localMp3Path);
      });

      // 3. Convert to WAV (16kHz mono for STT)
      await new Promise<void>((resolve, reject) => {
        ffmpeg(localInputPath)
          .toFormat('wav')
          .audioFrequency(16000)
          .audioChannels(1)
          .audioCodec('pcm_s16le')
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .save(localWavPath);
      });

      // 4. Upload
      const baseName = path.basename(key, path.extname(key));

      await s3.send(new PutObjectCommand({
        Bucket: outputBucket,
        Key: `${baseName}.mp3`,
        Body: fs.createReadStream(localMp3Path),
        ContentType: 'audio/mpeg',
      }));

      await s3.send(new PutObjectCommand({
        Bucket: outputBucket,
        Key: `${baseName}.wav`,
        Body: fs.createReadStream(localWavPath),
        ContentType: 'audio/wav',
      }));

      logger.info(`Transcoding complete for ${key}`);
      return { mp3: `${baseName}.mp3`, wav: `${baseName}.wav` };

    } catch (error) {
      logger.error(`Transcoding failed for ${key}`, error);
      throw error;
    } finally {
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
};
