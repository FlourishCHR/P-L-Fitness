const { Xendit } = require('xendit-node');

const xendit = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY
});
const Invoice = xendit.Invoice;

class XenditService {
    static async createInvoice(invoiceData) {
        try {
            const result = await Invoice.createInvoice({ 
                data: invoiceData 
            });
            return result;
        } catch (error) {
            console.error('Xendit error:', error.message);
            console.error('Full error:', error);
            throw error;
        }
    }

    static async getInvoice(invoiceId) {
        try {

            const result = await Invoice.getInvoiceById({ 
                invoiceId: invoiceId 
            });
            return result;
        } catch (error) {
            console.error('Xendit getInvoice error:', error.message);
            throw error;
        }
    }

    static async expireInvoice(invoiceId) {
        try {

            const result = await Invoice.expireInvoice({ 
                invoiceId: invoiceId 
            });
            return result;
        } catch (error) {
            console.error('Xendit expireInvoice error:', error.message);
            throw error;
        }
    }
}

module.exports = XenditService;