const app = require('./app');
const env = require('./config/env');

// Safety net level-proses: jangan biarin unhandled rejection/exception
// bikin server mati total (pernah kejadian sebelumnya karena ECONNRESET
// dari promise yang gak di-catch). Log aja, jangan process.exit().
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

app.listen(env.port, () => {
  console.log(`[server] Listening on port ${env.port} (${env.nodeEnv})`);
});
