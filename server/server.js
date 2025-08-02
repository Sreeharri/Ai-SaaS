import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';


const app = express();
await connectCloudinary()

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

app.get('/', (req,res) => {
    res.send('Server is running');
})
app.use(requireAuth());

app.use('/api/ai', aiRouter)

app.listen
(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;


