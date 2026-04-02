import express from 'express';
import multer from 'multer';
import { uploadInvoice, uploadInvoiceFileOnly, getInvoices, getAnalytics, getInvoiceById, updateInvoice } from '../controllers/invoiceController.js';

const router = express.Router();


const upload = multer({ storage: multer.memoryStorage() });


router.post('/upload', upload.single('file'), uploadInvoice);
router.post('/upload-invoice', upload.single('file'), uploadInvoiceFileOnly);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);
router.put('/invoices/:id', updateInvoice);
router.get('/analytics', getAnalytics);

export default router;
