const { Xendit } = require('xendit-node');

const xendit = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY
});
const Invoice = xendit.Invoice;

class XenditService {
    static async createInvoice(invoiceData) {
        try {

            const response = await fetch('https://api.xendit.co/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')}`
                },
                body: JSON.stringify({
                    external_id: invoiceData.external_id,
                    payer_email: invoiceData.payer_email,
                    amount: invoiceData.amount,
                    description: invoiceData.description || 'PLFitness Payment',
                    currency: invoiceData.currency || 'PHP',
                    days_active: invoiceData.days_active || 1,
                    success_redirect_url: invoiceData.success_redirect_url,
                    failure_redirect_url: invoiceData.failure_redirect_url
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(JSON.stringify(result));
            }

            console.log('Xendit Success:', result.id);
            return result;

        } catch (error) {
            console.error('Xendit Error:', error.message);
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