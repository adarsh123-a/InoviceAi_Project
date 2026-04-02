import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';


dotenv.config();


const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


app.use('/api', invoiceRoutes);


app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Invoice Backend is running with MVC Architecture!' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(` Invoice Extraction Backend running on port ${port}`);
    });
}

export default app;
