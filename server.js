const app = require('./app');
const { init } = require('./db');

async function start() {
  // Retry so the app survives starting before the database is ready
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await init();
      break;
    } catch (err) {
      console.error(`DB not ready (attempt ${attempt}/10): ${err.message}`);
      if (attempt === 10) process.exit(1);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

start();
