import { dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

export const resourcesURL = pathToFileURL(`${currentDir}/resources/`);
