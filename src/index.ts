import { buildServer } from './server';

const start = async (): Promise<void> => {
  try {
    const server = await buildServer();

    await server.listen({
      port: 3000,
      host: '0.0.0.0'
    });

    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
