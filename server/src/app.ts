import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://anshuman-doc-scanner.web.app',
    'https://anshuman-doc-scanner.firebaseapp.com'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use('/api/upload', uploadRoutes);

export default app;