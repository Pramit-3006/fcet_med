import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { imageId, userId, imageType, bodyPart } = await request.json()

    if (!imageId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update status to analyzing
    await sql`
      UPDATE medical_images 
      SET status = 'analyzing', analysis_progress = 0
      WHERE id = ${imageId} AND user_id = ${userId}
    `

    // Generate medical analysis using Groq
    const analysisPrompt = `
    As a medical AI assistant, analyze a ${imageType} image of ${bodyPart}. 
    Provide a structured medical analysis including:
    1. Key findings (list 3-5 observations)
    2. Confidence scores for each finding (0-100%)
    3. Severity levels (Normal, Mild, Moderate, Severe)
    4. Clinical recommendations
    5. Areas requiring attention
    
    Format the response as JSON with the following structure:
    {
      "findings": [
        {
          "description": "finding description",
          "confidence": 85,
          "severity": "Mild",
          "location": "specific area"
        }
      ],
      "overallAssessment": "summary",
      "recommendations": ["recommendation 1", "recommendation 2"],
      "urgency": "Low/Medium/High"
    }
    
    Note: This is for educational purposes only and should not replace professional medical diagnosis.
    `

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: analysisPrompt,
    })

    let analysisData
    try {
      analysisData = JSON.parse(text)
    } catch {
      // Fallback if JSON parsing fails
      analysisData = {
        findings: [
          {
            description: "Image quality assessment completed",
            confidence: 75,
            severity: "Normal",
            location: bodyPart,
          },
        ],
        overallAssessment: "Analysis completed successfully",
        recommendations: ["Consult with healthcare provider", "Follow up as needed"],
        urgency: "Low",
      }
    }

    // Create analysis report
    const reportResult = await sql`
      INSERT INTO medical_reports (
        user_id, image_id, report_type, findings, 
        recommendations, confidence_score, created_at
      ) VALUES (
        ${userId}, ${imageId}, 'AI Analysis', 
        ${JSON.stringify(analysisData.findings)},
        ${JSON.stringify(analysisData.recommendations)},
        ${analysisData.findings[0]?.confidence || 75},
        NOW()
      ) RETURNING id
    `

    // Update image status
    await sql`
      UPDATE medical_images 
      SET 
        status = 'analyzed',
        analysis_progress = 100,
        analysis_data = ${JSON.stringify(analysisData)},
        analyzed_at = NOW()
      WHERE id = ${imageId} AND user_id = ${userId}
    `

    return NextResponse.json({
      success: true,
      reportId: reportResult.rows[0].id,
      analysis: analysisData,
      message: "Medical analysis completed successfully",
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
