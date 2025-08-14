const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
/**
 * Sends an OTP using SMS Misr API.
 * @param {string} mobile - The recipient's mobile number.
 * @param {string} otp - The OTP to send.
 * @example
 * const response = await sendOTP('201096466813', '165112');
 * console.log(response);
 */
async function sendOTP(mobile, otp) { 
    // Load environment variables
    const SMS_MISR_ENV = process.env.SMS_MISR_ENV || '2'; // Default to development
    const SMS_MISR_USERNAME = process.env.SMS_MISR_USERNAME;
    const SMS_MISR_PASSWORD = process.env.SMS_MISR_PASSWORD;
    const SMS_MISR_SENDER_ID = process.env.SMS_MISR_SENDER_ID;
    const SMS_MISR_TEMPLATE = process.env.SMS_MISR_TEMPLATE;

    if (!SMS_MISR_USERNAME || !SMS_MISR_PASSWORD || !SMS_MISR_SENDER_ID || !SMS_MISR_TEMPLATE) {
        throw new Error('Missing required environment variables for SMS Misr.');
    }

    // Construct the URL with query parameters
    const url = `https://smsmisr.com/api/OTP/?environment=${SMS_MISR_ENV}&username=${SMS_MISR_USERNAME}&password=${SMS_MISR_PASSWORD}&sender=${SMS_MISR_SENDER_ID}&mobile=${mobile}&template=${SMS_MISR_TEMPLATE}&otp=${otp}`;
    try {
        // Send the request
        const response = await axios.post(url);
        const responseData = response.data;

        // Map response codes to messages
        const responseMessages = {
            "4901": "Success, Message Submitted Successfully",
            "4906": "Insufficient Credit",
            "4907": "Server under updating",
            "4908": "Invalid OTP",
        };

        const message = responseMessages[responseData.Code] || "Unknown response code";
        console.log('SMS Misr Response:', message);

        return {
            code: responseData.Code,
            message,
            data: responseData
        };
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        throw error;
    }
}

module.exports = sendOTP;