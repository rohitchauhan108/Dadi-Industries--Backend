import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config.js';

const start = async () => {
  await mongoose.connect(config.mongoUri);
  app.listen(config.port, () => console.log(`Dadi Industries API listening on http://localhost:${config.port}`));
};

start().catch(error => {
  console.error('Unable to start API:', error);
  process.exit(1);
});
