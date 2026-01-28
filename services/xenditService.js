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

    static async getInvoice(externalID) {
        return await Invoice.getInvoiceById({ invoiceId: externalID });
    }

    static async expireInvoice(invoiceId) {
        return await Invoice.expireInvoice({ invoiceId });
    }
}

module.exports = XenditService;