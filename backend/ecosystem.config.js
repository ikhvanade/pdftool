module.exports = {
  apps: [
    {
      name: 'pdf-qr-backend',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1, // single instance karena job queue in-memory (lihat pdfJobQueue.js) -
                    // kalau di-scale ke cluster mode, guest_usage race condition ke-handle
                    // di level DB, tapi job queue HARUS pindah ke Redis/BullMQ dulu.
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: { NODE_ENV: 'production' },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      time: true,
    },
  ],
};
