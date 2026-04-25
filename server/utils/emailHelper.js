const nodemailer = require('nodemailer');

/**
 * Shared utility for sending emails using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 * @returns {Promise<boolean>} - Returns true if email was sent successfully
 */
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    };

    try {
        console.log(`Attempting to send email to ${to}`);
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] Email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error('FATAL EMAIL ERROR:', error);
        return false;
    }
};

module.exports = {
    sendEmail
};
