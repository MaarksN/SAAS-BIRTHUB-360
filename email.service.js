export class MockEmailService {
    async send(payload) {
        console.log(`[MockEmailService] Sending email to ${payload.to} with subject: ${payload.subject}`);
        // Simulate API call to Resend/SendGrid
        return {
            id: `email_${Math.random().toString(36).substr(2, 9)}`,
            status: 'sent'
        };
    }
}
