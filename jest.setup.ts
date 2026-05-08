
// Loads .env.test values before every test run

import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());