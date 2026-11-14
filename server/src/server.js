import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { User } from './models/index.js';
import { runSeed } from './seed/seed.js';

const startServer = async () => {
  // Bind port immediately so cloud platforms (Render, Railway, etc.) detect an active web service
  const server = app.listen(ENV.PORT, () => {
    console.log(`===============================================`);
    console.log(` School Management System API Server Running  `);
    console.log(` Environment : ${ENV.NODE_ENV}                `);
    console.log(` Port        : ${ENV.PORT}                    `);
    console.log(` API Base    : http://localhost:${ENV.PORT}/api/v1 `);
    console.log(` Swagger Docs: http://localhost:${ENV.PORT}/api/docs`);
    console.log(` Health Check: http://localhost:${ENV.PORT}/health `);
    console.log(`===============================================`);
  });

  // Connect to database in a non-blocking resilient loop
  connectDB()
    .then(async () => {
      // Auto-seed if database is empty (e.g. initial cloud Atlas deployment)
      try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('[MongoDB] Empty database detected. Auto-seeding initial records...');
          await runSeed();
          console.log('[MongoDB] Auto-seeding completed successfully!');
        }
      } catch (seedErr) {
        console.error('[MongoDB] Auto-seed check error:', seedErr.message);
      }
    })
    .catch((err) => {
      console.error(`[MongoDB] Initial connection error: ${err.message}`);
    });

  const shutdown = async () => {
    console.log('\nGracefully shutting down...');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();

