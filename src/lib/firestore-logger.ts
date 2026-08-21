/**
 * Temporary Instrumentation Logger for Firestore Reads, Writes and Listeners
 */

export function logFirestoreRead(functionName: string, path: string, docCount?: number) {
  const countInfo = docCount !== undefined ? ` (${docCount} docs)` : '';
  console.log(`[FIRESTORE READ] ${functionName} -> ${path}${countInfo}`);
}

export function logFirestoreWrite(functionName: string, path: string, opType: string) {
  console.log(`[FIRESTORE WRITE] ${functionName} -> ${path} [${opType.toUpperCase()}]`);
}

export function logFirestoreListenerStart(functionName: string, path: string) {
  console.log(`[FIRESTORE LISTENER START] ${functionName} -> ${path}`);
}

export function logFirestoreListenerStop(functionName: string, path: string) {
  console.log(`[FIRESTORE LISTENER STOP] ${functionName} -> ${path}`);
}
