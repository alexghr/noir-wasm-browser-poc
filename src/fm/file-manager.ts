/**
 * A file manager that writes file to a specific directory but reads globally.
 */
export interface FileManager {
  /**
   * Saves a file to the data directory.
   * @param name - File to save
   * @param stream - File contents
   */
  writeFile(name: string, stream: ReadableStream<Uint8Array>): Promise<void>;

  /**
   * Reads a file from the disk and returns a buffer
   * @param name - File to read
   * @param encoding - Binary encoding
   */
  readFileSync(name: string, encoding: 'binary'): Uint8Array;

  /**
   * Reads a file from the disk and returns a string
   * @param name - File to read
   * @param encoding - Encoding to use
   */
  readFileSync(name: string, encoding: 'utf-8'): string;

  /**
   * Checks if a file exists and is accessible
   * @param name - File to check
   */
  hasEntrySync(name: string): boolean;
}
