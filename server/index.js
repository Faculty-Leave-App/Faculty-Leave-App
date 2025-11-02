import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import sql from "mssql";
import path from "path";
import { fileURLToPath } from "url";
import { AzureOpenAI } from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const aiClient = new AzureOpenAI({
    apiKey: process.env.OPEN_API_KEY, 
    apiVersion: "2024-05-01-preview",
    endpoint: "https://facultyleavegenaiservice.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview"
});

// ✅ Serve frontend (Vite build output)
app.use(express.static(path.join(__dirname, "..", "dist")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// ✅ Azure SQL config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: { encrypt: true },
};

// ✅ API Endpoints

// Get TeacherID by email
app.get("/api/teacher/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT TeacherID, Name FROM Teachers WHERE Email = @Email");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get subjects for a teacher
app.get("/api/teacher/:id/subjects", async (req, res) => {
  try {
    const { id } = req.params;
    let pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("TeacherID", sql.Int, id)
      .query(`
        SELECT s.SubjectID, s.Name
        FROM Teacher_Subject ts
        JOIN Subjects s ON ts.SubjectID = s.SubjectID
        WHERE ts.TeacherID = @TeacherID
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get timetable for a teacher
app.get("/api/teacher/:id/timetable", async (req, res) => {
  try {
    const { id } = req.params;
    let pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("TeacherID", sql.Int, id)
      .query(`
        SELECT tr.TimetableID, s.Name AS Subject, g.GroupName, b.BatchName, tr.DayOfWeek, tr.Slot
        FROM TimetableRecurring tr
        JOIN Subjects s ON tr.SubjectID = s.SubjectID
        JOIN GroupsTbl g ON tr.GroupID = g.GroupID
        JOIN Batches b ON tr.BatchID = b.BatchID
        WHERE tr.TeacherID = @TeacherID
        ORDER BY tr.DayOfWeek, tr.Slot
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Submit leave request
app.post("/api/leave", async (req, res) => {
  try {
    const { teacherID, subjectID, startDate, endDate, leaveType, reason } = req.body;
    let pool = await sql.connect(dbConfig);

    const teacherResult = await pool
      .request()
      .input("TeacherID", sql.Int, teacherID)
      .query("SELECT Name FROM Teachers WHERE TeacherID = @TeacherID");

    if (teacherResult.recordset.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherName = teacherResult.recordset[0].Name;

    await pool
      .request()
      .input("TeacherID", sql.Int, teacherID)
      .input("SubjectID", sql.Int, subjectID)
      .input("StartDate", sql.Date, startDate)
      .input("EndDate", sql.Date, endDate)
      .input("LeaveType", sql.NVarChar, leaveType)
      .input("Reason", sql.NVarChar, reason)
      .input("TeacherName", sql.NVarChar, teacherName)
      .query(`
        INSERT INTO LeaveRequests (TeacherID, SubjectID, StartDate, EndDate, Status, LeaveType, Reason, TeacherName)
        VALUES (@TeacherID, @SubjectID, @StartDate, @EndDate, 'Pending', @LeaveType, @Reason, @TeacherName)
      `);

    res.json({ message: "Leave submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// ⬇️ 3. ADD THIS NEW CHATBOT ENDPOINT
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await aiClient.chat.completions.create({
            model: "Phi-4", 
            messages: [
                // ✅ Use the detailed playground instructions
                {"role": "system", "content": `
                    You are a polite and helpful assistant for the Faculty Leave Management System. 
                    Your job is to help faculty apply for leave. You must collect four pieces of information:
                    1. The start date of the leave.
                    2. The end date of the leave.
                    3. The type of leave (e.g., Casual Leave, Sick Leave, On-Duty).
                    4. A brief reason.

                    Be conversational. Do not ask for all four things at once. Ask one question at a time. 
                    When you have all four, confirm the details with the user and say "I am now submitting this for approval."
                `},
                {"role": "user", "content": message}
            ]
        });

        const aiReply = response.choices[0].message.content;
        res.json({ reply: aiReply });

    } catch (err) {
        console.error('AI Chat Error:', err);
        res.status(500).json({ error: 'Error communicating with AI service' });
    }
});

// ✅ Start server (Azure will assign port dynamically)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));





