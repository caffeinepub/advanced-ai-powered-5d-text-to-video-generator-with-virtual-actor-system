// MediaRecorder utility for capturing canvas streams

export interface RecordingOptions {
  duration: number; // in seconds
  mimeType?: string;
  videoBitsPerSecond?: number;
}

export interface RecordingResult {
  bytes: Uint8Array;
  mimeType: string;
  duration: number;
}

const SUPPORTED_MIME_TYPES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
  'video/mp4',
];

export function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function';
}

export function getSupportedMimeType(): string | null {
  if (!isMediaRecorderSupported()) {
    return null;
  }

  for (const mimeType of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return null;
}

export function getRecordingErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('not supported')) {
      return 'Video recording is not supported in your browser';
    }
    if (error.message.includes('permission')) {
      return 'Permission denied for video recording';
    }
    if (error.message.includes('Canvas not available')) {
      return 'Canvas not ready for recording';
    }
    return error.message;
  }
  return 'Unknown recording error occurred';
}

export async function recordCanvas(
  canvas: HTMLCanvasElement,
  options: RecordingOptions
): Promise<RecordingResult> {
  return new Promise((resolve, reject) => {
    try {
      if (!canvas) {
        throw new Error('Canvas not available for recording');
      }

      const mimeType = options.mimeType || getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported video MIME type found');
      }

      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: options.videoBitsPerSecond || 2500000,
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          const arrayBuffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          resolve({
            bytes,
            mimeType,
            duration: options.duration,
          });
        } catch (error) {
          reject(new Error('Failed to process recorded video'));
        }
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error(`MediaRecorder error: ${event}`));
      };

      mediaRecorder.start();

      // Stop recording after specified duration
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, options.duration * 1000);
    } catch (error) {
      reject(error);
    }
  });
}
