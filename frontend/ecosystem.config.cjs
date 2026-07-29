module.exports = {
  apps: [
    {
      name: 'pdf-qr-frontend',
      script: 'serve-static.js',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      env: { PORT: 4000 },
    },
  ],
};
