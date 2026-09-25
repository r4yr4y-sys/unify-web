import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Always resolve secrets next to the backend package, regardless of where Node is launched.
dotenv.config({
  path: fileURLToPath(new URL('../.env', import.meta.url)),
  quiet: true,
});
