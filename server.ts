import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper for AI features using native fetch
async function generateAIText(contents: any, systemInstruction?: string, jsonMode?: boolean) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI key not configured");
  }

  const payload: any = {
    contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
  };

  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (jsonMode) {
    payload.generationConfig = { responseMimeType: "application/json" };
  }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API error: ${res.statusText} - ${errText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || '';
  return text;
}

// API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "AttendAI Server" });
});

// AI Chatbot & Insights Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, studentContext } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const systemInstruction = `You are AttendAI Assistant, an empathetic, highly intelligent, and motivating AI attendance advisor for school, college, and university students.
Context of user:
- Name: ${studentContext?.name || "Student"}
- Institution: ${studentContext?.institutionName || "College/School"} (${studentContext?.educationType || "College"})
- Degree/Class: ${studentContext?.degree || studentContext?.classGrade || "Student"}
- Minimum Goal: ${studentContext?.targetPercentage || 75}%
- Overall Attendance: ${studentContext?.overallAttendance || 0}%
- Subject Summaries: ${JSON.stringify(studentContext?.subjects || [])}

Answer concisely, accurately calculate required classes or safe skips when asked, and provide encouraging, practical advice using markdown formatting.`;

    const text = await generateAIText(message, systemInstruction);
    res.json({ text: text || "I'm sorry, I couldn't process that. Please try again." });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      error: "AI service unavailable",
      details: error.message || "Failed to process request",
    });
  }
});

// AI Attendance Prediction Endpoint
app.post("/api/ai/predict", async (req, res) => {
  try {
    const { subjects, targetPercentage = 75 } = req.body;

    const prompt = `Analyze this student's current attendance records and predict their risk level, safe missable classes, and personalized strategies.
Subjects: ${JSON.stringify(subjects)}
Target Attendance Goal: ${targetPercentage}%

Return JSON strictly with this schema:
{
  "overallForecast": "Predicted overall % by end of term",
  "riskLevel": "Low" | "Medium" | "High",
  "keyAdvice": "Summary strategy statement",
  "subjectPredictions": [
    {
      "subjectName": "string",
      "predictedPercentage": number,
      "riskStatus": "Safe" | "Warning" | "Critical",
      "recommendedAction": "string"
    }
  ]
}`;

    const text = await generateAIText(prompt, undefined, true);
    const parsed = JSON.parse(text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("AI Predict Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI predictions" });
  }
});

// AI OCR Attendance Scanner Endpoint
app.post("/api/ai/ocr-parse", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/png" } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Image data is required" });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const contents = [
      {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: "Extract all subjects, total conducted classes, and attended classes from this screenshot/document. Return strict JSON array of objects: [{ subjectName: string, attended: number, total: number, teacherName?: string, room?: string }]",
          },
        ],
      },
    ];

    const text = await generateAIText(contents, undefined, true);
    const parsed = JSON.parse(text || "[]");
    res.json({ subjects: parsed });
  } catch (error: any) {
    console.error("OCR Parse Error:", error);
    res.status(500).json({ error: error.message || "Failed to parse image with OCR" });
  }
});

// AI Timetable Generator Endpoint
app.post("/api/ai/generate-timetable", async (req, res) => {
  try {
    const { subjects, daysPerWeek = 5, classesPerDay = 4 } = req.body;

    const prompt = `Generate a realistic weekly class timetable for a student taking these subjects: ${JSON.stringify(subjects)}.
Days: Monday to ${daysPerWeek === 6 ? "Saturday" : "Friday"}.
Classes per day: ${classesPerDay}.
Return JSON strictly with array:
[
  {
    "day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday",
    "slots": [
      {
        "time": "09:00 AM - 10:00 AM",
        "subjectName": "string",
        "room": "string",
        "teacher": "string",
        "type": "Lecture" | "Practical" | "Tutorial" | "Lab"
      }
    ]
  }
]`;

    const text = await generateAIText(prompt, undefined, true);
    const parsed = JSON.parse(text || "[]");
    res.json({ timetable: parsed });
  } catch (error: any) {
    console.error("Timetable Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate timetable" });
  }
});

// AI Mood Check & Motivation Endpoint
app.post("/api/ai/mood-check", async (req, res) => {
  try {
    const { mood, subjectName, attendanceStatus } = req.body;

    const text = await generateAIText(`The student is feeling "${mood}" before attending their upcoming class "${subjectName || "next lecture"}". Their current attendance status in this subject is ${attendanceStatus || "Normal"}. Give a brief 2-sentence empathetic booster tip and reminder why going to class today matters!`);
    res.json({ text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed mood check" });
  }
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AttendAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
