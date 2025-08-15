interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface MedicalReport {
  id: string
  patientName: string
  imageType: string
  bodyPart: string
  diagnosis: string
  confidenceScore: number
  riskLevel: string
  findings: string[]
  recommendations: string[]
  createdAt: string
}

export function generateReportEmailTemplate(report: MedicalReport, language = "en"): EmailTemplate {
  const translations = {
    en: {
      subject: `Medical Report - ${report.imageType} Analysis`,
      greeting: "Dear Patient,",
      reportReady: "Your medical image analysis report is ready.",
      reportDetails: "Report Details",
      imageType: "Image Type",
      bodyPart: "Body Part",
      diagnosis: "Diagnosis",
      confidenceScore: "Confidence Score",
      riskLevel: "Risk Level",
      keyFindings: "Key Findings",
      recommendations: "Recommendations",
      disclaimer: "Medical Disclaimer",
      disclaimerText:
        "This AI analysis is for informational purposes only and should not replace professional medical diagnosis. Always consult with qualified healthcare professionals.",
      footer: "Thank you for using MediScan AI",
      viewOnline: "View Full Report Online",
    },
    // Add other languages as needed
  }

  const t = translations[language as keyof typeof translations] || translations.en

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #64748b;
          font-size: 16px;
        }
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .detail-label {
          font-weight: 500;
          color: #475569;
        }
        .detail-value {
          color: #1e293b;
          font-weight: 500;
        }
        .risk-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .risk-low { background: #dcfce7; color: #166534; }
        .risk-medium { background: #fef3c7; color: #92400e; }
        .risk-high { background: #fee2e2; color: #991b1b; }
        .findings-list {
          list-style: none;
          padding: 0;
        }
        .findings-list li {
          padding: 8px 0;
          padding-left: 20px;
          position: relative;
        }
        .findings-list li:before {
          content: "•";
          color: #3b82f6;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        .disclaimer {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        .disclaimer-title {
          font-weight: 600;
          color: #991b1b;
          margin-bottom: 8px;
        }
        .disclaimer-text {
          color: #7f1d1d;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          margin: 16px 0;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MediScan AI</div>
          <div class="subtitle">Advanced Medical Image Analysis</div>
        </div>

        <div class="section">
          <p>${t.greeting}</p>
          <p>${t.reportReady}</p>
        </div>

        <div class="section">
          <div class="section-title">${t.reportDetails}</div>
          <div class="detail-row">
            <span class="detail-label">${t.imageType}:</span>
            <span class="detail-value">${report.imageType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${t.bodyPart}:</span>
            <span class="detail-value">${report.bodyPart}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${t.diagnosis}:</span>
            <span class="detail-value">${report.diagnosis}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${t.confidenceScore}:</span>
            <span class="detail-value">${Math.round(report.confidenceScore * 100)}%</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${t.riskLevel}:</span>
            <span class="detail-value">
              <span class="risk-badge risk-${report.riskLevel}">${report.riskLevel} Risk</span>
            </span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">${t.keyFindings}</div>
          <ul class="findings-list">
            ${report.findings.map((finding) => `<li>${finding}</li>`).join("")}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">${t.recommendations}</div>
          <ul class="findings-list">
            ${report.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
          </ul>
        </div>

        <div class="disclaimer">
          <div class="disclaimer-title">${t.disclaimer}</div>
          <div class="disclaimer-text">${t.disclaimerText}</div>
        </div>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/reports/${report.id}" class="button">
            ${t.viewOnline}
          </a>
        </div>

        <div class="footer">
          <p>${t.footer}</p>
          <p>Generated on ${new Date(report.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
${t.greeting}

${t.reportReady}

${t.reportDetails}:
- ${t.imageType}: ${report.imageType}
- ${t.bodyPart}: ${report.bodyPart}
- ${t.diagnosis}: ${report.diagnosis}
- ${t.confidenceScore}: ${Math.round(report.confidenceScore * 100)}%
- ${t.riskLevel}: ${report.riskLevel} Risk

${t.keyFindings}:
${report.findings.map((finding) => `• ${finding}`).join("\n")}

${t.recommendations}:
${report.recommendations.map((rec) => `• ${rec}`).join("\n")}

${t.disclaimer}:
${t.disclaimerText}

${t.viewOnline}: ${process.env.NEXT_PUBLIC_SITE_URL}/reports/${report.id}

${t.footer}
Generated on ${new Date(report.createdAt).toLocaleDateString()}
  `

  return {
    subject: t.subject,
    html,
    text,
  }
}

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  try {
    // This is a placeholder for email service integration
    // You can integrate with services like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP

    console.log("[v0] Email would be sent to:", to)
    console.log("[v0] Subject:", template.subject)
    console.log("[v0] HTML length:", template.html.length)

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For now, we'll simulate successful sending
    // In production, replace this with actual email service
    return true
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    return false
  }
}

export async function sendReportEmail(userEmail: string, report: MedicalReport, language = "en"): Promise<boolean> {
  const template = generateReportEmailTemplate(report, language)
  return await sendEmail(userEmail, template)
}
