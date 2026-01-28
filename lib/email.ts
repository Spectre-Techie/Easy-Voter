import { Resend } from "resend"

if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not defined in environment variables")
}

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to,
            subject,
            html,
        })

        if (error) {
            console.error("Email send error:", error)
            throw new Error(`Failed to send email: ${error.message}`)
        }

        console.log(`✅ Email sent successfully to ${to}`)
        return { success: true, data }
    } catch (error) {
        console.error("Email service error:", error)
        throw error
    }
}

// Email templates
export function getApplicationSubmittedEmail(data: {
    name: string
    applicationRef: string
}) {
    return {
        subject: "Application Submitted Successfully - EasyVoter",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Submitted</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">EasyVoter</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #16a34a; margin-top: 0;">Application Submitted Successfully!</h2>
        
        <p>Dear ${escapeHtml(data.name)},</p>
        
        <p>Thank you for submitting your voter registration application. We have received your application and it is now being reviewed by our team.</p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <p style="margin: 0;"><strong>Application Reference:</strong></p>
            <p style="font-size: 20px; color: #16a34a; margin: 10px 0; font-weight: bold;">${escapeHtml(data.applicationRef)}</p>
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ul style="padding-left: 20px;">
            <li>Our team will review your application and documents</li>
            <li>You will receive an email notification once your application is reviewed</li>
            <li>If approved, you'll be able to download your digital voter card</li>
        </ul>
        
        <p>You can check your application status anytime by logging into your dashboard.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            If you have any questions, please contact our support team.<br>
            <strong>EasyVoter Team</strong>
        </p>
    </div>
</body>
</html>
        `,
    }
}

export function getApplicationApprovedEmail(data: {
    name: string
    applicationRef: string
}) {
    return {
        subject: "🎉 Your Voter Registration is Approved! - EasyVoter",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">EasyVoter</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 60px;">🎉</div>
            <h2 style="color: #16a34a; margin: 10px 0;">Congratulations!</h2>
        </div>
        
        <p>Dear ${escapeHtml(data.name)},</p>
        
        <p>Great news! Your voter registration application has been <strong style="color: #16a34a;">APPROVED</strong>.</p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0;">
            <p style="margin: 0;"><strong>Application Reference:</strong></p>
            <p style="font-size: 20px; color: #16a34a; margin: 10px 0; font-weight: bold;">${escapeHtml(data.applicationRef)}</p>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ul style="padding-left: 20px;">
            <li>Log in to your dashboard to view your approval status</li>
            <li>Download your digital voter card (available soon)</li>
            <li>Keep your voter card safe for election day</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Access Your Dashboard</a>
        </div>
        
        <p style="background: #dbeafe; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
            <strong>Important:</strong> Make sure to bring your voter card and a valid ID on election day.
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            Thank you for registering with EasyVoter!<br>
            <strong>EasyVoter Team</strong>
        </p>
    </div>
</body>
</html>
        `,
    }
}

export function getApplicationRejectedEmail(data: {
    name: string
    applicationRef: string
    reason: string
}) {
    return {
        subject: "Application Update - EasyVoter",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">EasyVoter</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #dc2626; margin-top: 0;">Application Update</h2>
        
        <p>Dear ${escapeHtml(data.name)},</p>
        
        <p>Thank you for your voter registration application. After careful review, we regret to inform you that your application could not be approved at this time.</p>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p style="margin: 0;"><strong>Application Reference:</strong></p>
            <p style="font-size: 20px; color: #dc2626; margin: 10px 0; font-weight: bold;">${escapeHtml(data.applicationRef)}</p>
        </div>
        
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
            <p style="margin: 10px 0 0 0; color: #991b1b;">${escapeHtml(data.reason)}</p>
        </div>
        
        <p><strong>What you can do:</strong></p>
        <ul style="padding-left: 20px;">
            <li>Review the reason for rejection above</li>
            <li>Correct any issues with your documents or information</li>
            <li>Submit a new application with the corrected information</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/apply" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Submit New Application</a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            If you have questions about this decision, please contact our support team.<br>
            <strong>EasyVoter Team</strong>
        </p>
    </div>
</body>
</html>
        `,
    }
}

// Security: HTML escape function to prevent XSS
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
}
