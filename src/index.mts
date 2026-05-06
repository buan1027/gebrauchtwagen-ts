import Bun from 'bun'; // eslint-disable-line @typescript-eslint/naming-convention
import { app } from './app.mts';
import { serverConfig } from './config/server.mts';
import { banner } from './logger/banner.mts';

const { fetch } = app;
const { port } = serverConfig;

Bun.serve({ fetch, port });

banner();
