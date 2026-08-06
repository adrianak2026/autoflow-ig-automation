import zlib from "node:zlib";

/**
 * Compresses a UTF-8 text string into a zlib compressed Buffer (binary/BYTEA storage).
 */
export function compressText(textToCompress: string): Buffer {
  if (!textToCompress) return Buffer.alloc(0);
  return zlib.deflateSync(Buffer.from(textToCompress, "utf-8"));
}

/**
 * Decompresses a zlib compressed Buffer or Uint8Array back into a UTF-8 text string.
 */
export function decompressText(compressedBuffer: Buffer | Uint8Array | null | undefined): string {
  if (!compressedBuffer || compressedBuffer.length === 0) return "";
  const decompressed = zlib.inflateSync(compressedBuffer);
  return decompressed.toString("utf-8");
}
