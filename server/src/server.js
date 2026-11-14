import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(ENV.PORT, () => {
      console.log(`===============================================`);
      console.log(` School Management System API Server Running  `);
      console.log(` Environment : ${ENV.NODE_ENV}                `);
      console.log(` Port        : ${ENV.PORT}                    `);
      console.log(` API Base    : http://localhost:${ENV.PORT}/api/v1 `);
      console.log(` Swagger Docs: http://localhost:${ENV.PORT}/api/docs`);
      console.log(`===============================================`);
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
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

