import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token: string) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error("reCAPTCHA secret key is not defined")
    throw new Error("reCAPTCHA configuration error")
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      console.error("reCAPTCHA verification failed:", data["error-codes"])
      throw new Error("reCAPTCHA verification failed")
    }

    // Check the score - 0.0 is bot, 1.0 is human
    if (data.score < 0.5) {
      console.error("reCAPTCHA score too low:", data.score)
      throw new Error("Suspicious activity detected")
    }

    return data
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error)
    throw new Error("Failed to verify reCAPTCHA")
  }
}

export async function POST(request: Request) {
  try {
    // Get form data from request
    const formData = await request.json()
    const { name, email, subject, message, recaptchaToken } = formData

    // Validate form data
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 })
    }

    try {
      await verifyRecaptcha(recaptchaToken)
    } catch (error) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 })
    }

    // Check if environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD || !process.env.EMAIL_RECIPIENT) {
      console.error("Missing required environment variables for email sending")
      return NextResponse.json({ error: "Server configuration error. Please try again later." }, { status: 500 })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      secure: true,
    })

    // Email content
    const mailOptions = {
      from: `"Zimbabwe Groceries" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECIPIENT,
      subject: `Zimbabwe Groceries: New Customer Enquiry - ${subject}`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .email-container {
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
        }
        .email-header {
          background: linear-gradient(to right, #0f766e, #115e59);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .email-body {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .email-footer {
          background-color: #f1f1f1;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .customer-info {
          background-color: white;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
          border-left: 4px solid #0f766e;
        }
        .message-content {
          background-color: white;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }
        h1 {
          color: #0f766e;
          margin-top: 0;
          font-size: 24px;
        }
        h2 {
          color: #0f766e;
          font-size: 18px;
          margin-top: 25px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }
        .label {
          font-weight: bold;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1 style="color: white; margin: 0;">Zimbabwe Groceries</h1>
          <p style="margin: 5px 0 0 0;">New Customer Enquiry</p>
        </div>
        
        <div class="email-body">
          <p>A customer has submitted an enquiry through the website contact form. Details are below:</p>
          
          <div class="customer-info">
            <p><span class="label">Name:</span> ${name}</p>
            <p><span class="label">Email:</span> ${email}</p>
            <p><span class="label">Subject:</span> ${subject}</p>
          </div>
          
          <h2>Customer Message</h2>
          <div class="message-content">
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          
          <p style="margin-top: 25px;">Please respond to this customer enquiry as soon as possible.</p>
        </div>
        
        <div class="email-footer">
          <p>© ${new Date().getFullYear()} Zimbabwe Groceries | This is an automated message from your website contact form</p>
          <p>Authentic Zimbabwean flavors, delivered with care.</p>
        </div>
      </div>
    </body>
    </html>
  `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}

