import express from 'express';
import { Resend } from 'resend';
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

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@goldenpays.uk';

    // Admin email HTML
    const adminHtml = `
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
    `;

    // Client auto-response HTML
    const clientHtml = `
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
            For urgent matters, please contact us directly at <a href="mailto:${adminEmail}" style="color: #C5A059;">${adminEmail}</a>.
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
    `;

    // Send emails with Resend
    if (resend) {
      try {
        // Send admin notification
        await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          subject: `New Contact Form Submission - ${service}`,
          html: adminHtml,
        });

        // Send client auto-response
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Your Inquiry Has Been Received - GOLDENPAYS LTD',
          html: clientHtml,
        });

        console.log(`✅ Emails sent via Resend to ${adminEmail} and ${email}`);
      } catch (emailError) {
        console.error('❌ Resend email error:', emailError);
        // Continue anyway - inquiry still saved
      }
    } else {
      // Development mode: log emails
      console.log('\n📧 === EMAIL (Admin) ===');
      console.log(`To: ${adminEmail}`);
      console.log(`Subject: New Contact Form Submission - ${service}`);
      console.log(`From: ${name} (${email})`);
      
      console.log('\n📧 === EMAIL (Client) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: Your Inquiry Has Been Received - GOLDENPAYS LTD`);
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
