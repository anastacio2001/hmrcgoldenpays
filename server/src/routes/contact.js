import express from 'express';
import nodemailer from 'nodemailer';
import Joi from 'joi';

const router = express.Router();

// Store inquiries in memory (will be exported for admin routes)
export const inquiries = [];

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  company: Joi.string().max(200).allow('').optional(),
  email: Joi.string().email().required(),
  service: Joi.string().valid('Infrastructure Audit', 'Strategic Advisory', 'Cloud Migration', 'Compliance Review', 'Other').required(),
  message: Joi.string().min(10).max(2000).required(),
});

// Email transporter configuration
const createTransporter = () => {
  // Check if SendGrid API key is valid (not placeholder)
  const hasValidSendGrid = process.env.SENDGRID_API_KEY && 
                          process.env.SENDGRID_API_KEY !== 'your-sendgrid-api-key';
  
  if (hasValidSendGrid) {
    // SendGrid configuration
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Development: Log to console
    console.log('📧 Running in DEV mode - emails will be logged to console');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }
};

// POST /api/contact/submit
router.post('/submit', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: error.details[0].message 
      });
    }

    const { name, company, email, service, message } = value;

    // Create email transporter
    const transporter = createTransporter();

    // Email to admin
    const adminEmailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@goldenpays.uk',
      to: process.env.ADMIN_EMAIL || 'admin@goldenpays.uk',
      subject: `New Contact Form Submission - ${service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #001F3F; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">GOLDENPAYS LTD</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">NEW INQUIRY</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <h2 style="color: #001F3F; margin-top: 0;">Contact Form Submission</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px 0; font-weight: bold; color: #495057;">Name:</td>
                <td style="padding: 12px 0; color: #212529;">${name}</td>
              </tr>
              ${company ? `
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px 0; font-weight: bold; color: #495057;">Company:</td>
                <td style="padding: 12px 0; color: #212529;">${company}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px 0; font-weight: bold; color: #495057;">Email:</td>
                <td style="padding: 12px 0; color: #212529;"><a href="mailto:${email}" style="color: #C5A059;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px 0; font-weight: bold; color: #495057;">Service:</td>
                <td style="padding: 12px 0; color: #212529;">${service}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <p style="font-weight: bold; color: #495057; margin-bottom: 10px;">Message:</p>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #C5A059; color: #212529; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
          
          <div style="background-color: #001F3F; color: #C5A059; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Received: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
            <p style="margin: 5px 0 0 0;">GOLDENPAYS LTD | Company No. 16227513</p>
          </div>
        </div>
      `
    };

    // Auto-response to client
    const clientEmailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@goldenpays.uk',
      to: email,
      subject: 'Your Inquiry Has Been Received - GOLDENPAYS LTD',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #001F3F; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">GOLDENPAYS LTD</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; letter-spacing: 2px;">CORPORATE TECH BOUTIQUE</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e9ecef;">
            <h2 style="color: #001F3F; margin-top: 0;">Thank You for Your Inquiry</h2>
            
            <p style="color: #495057; line-height: 1.6;">Dear ${name},</p>
            
            <p style="color: #495057; line-height: 1.6;">
              We acknowledge receipt of your inquiry regarding <strong>${service}</strong>. 
              Our team will review your request and respond within 2 business days.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #C5A059; margin: 20px 0;">
              <p style="margin: 0; color: #495057; font-size: 14px;">
                <strong>Reference Details:</strong><br>
                Service: ${service}<br>
                Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
              </p>
            </div>
            
            <p style="color: #495057; line-height: 1.6;">
              For urgent matters, please contact us directly at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #C5A059;">${process.env.ADMIN_EMAIL}</a>.
            </p>
            
            <p style="color: #495057; line-height: 1.6;">
              Best regards,<br>
              <strong>GOLDENPAYS LTD</strong><br>
              Strategic Technology Advisory
            </p>
          </div>
          
          <div style="background-color: #001F3F; color: #C5A059; padding: 15px; text-align: center; font-size: 11px;">
            <p style="margin: 0;">GOLDENPAYS LTD | Company No. 16227513</p>
            <p style="margin: 5px 0;">Office 12, Initial Business Centre, Wilson Business Park, Manchester M40 8WN, UK</p>
          </div>
        </div>
      `
    };

    // Send emails
    const hasValidSendGrid = process.env.SENDGRID_API_KEY && 
                            process.env.SENDGRID_API_KEY !== 'your-sendgrid-api-key';
    
    if (hasValidSendGrid) {
      await transporter.sendMail(adminEmailOptions);
      await transporter.sendMail(clientEmailOptions);
      console.log('✅ Emails sent via SendGrid');
    } else {
      // Development mode: log emails
      console.log('\n📧 === EMAIL (Admin) ===');
      const info1 = await transporter.sendMail(adminEmailOptions);
      console.log(info1.message.toString());
      
      console.log('\n📧 === EMAIL (Client) ===');
      const info2 = await transporter.sendMail(clientEmailOptions);
      console.log(info2.message.toString());
      console.log('\n✅ Emails logged to console (DEV mode)');
    }

    // Store inquiry in memory for admin panel
    const newInquiry = {
      id: Date.now().toString(),
      name,
      email,
      company: company || 'N/A',
      service,
      message,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    inquiries.unshift(newInquiry); // Add to beginning of array

    console.log(`✅ New inquiry stored (ID: ${newInquiry.id}). Total inquiries: ${inquiries.length}`);

    // Success response
    res.status(200).json({ 
      success: true,
      message: 'Your inquiry has been submitted successfully. We will respond within 2 business days.'
    });

  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ 
      error: 'Submission Failed',
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

export default router;
