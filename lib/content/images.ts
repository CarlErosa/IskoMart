export const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

/**
 * Check the file signature instead of trusting the browser-provided MIME type.
 */
export async function hasValidImageSignature(file: File): Promise<boolean> {
  if (!allowedImageTypes.has(file.type)) {
    return false;
  }

  const buffer = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (startsWith(buffer, JPEG_SIGNATURE) || startsWith(buffer, PNG_SIGNATURE)) {
    return true;
  }

  // WebP: RIFF....WEBP
  return (
    buffer[0] === 0x52
    && buffer[1] === 0x49
    && buffer[2] === 0x46
    && buffer[3] === 0x46
    && buffer[8] === 0x57
    && buffer[9] === 0x45
    && buffer[10] === 0x42
    && buffer[11] === 0x50
  );
}
