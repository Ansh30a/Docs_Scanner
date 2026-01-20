import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes.js';
import path from 'node:path';

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    '/uploads',
    express.static(path.join(process.cwd(), "uploads"))
);

app.use(
    '/api/upload',
    uploadRoutes
);

export default app;
