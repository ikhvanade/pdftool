const app = require('./app');
const env = require('./config/env');

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

app.listen(env.port, () => {
  console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`);
});
