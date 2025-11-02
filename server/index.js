import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sql from 'mssql';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Azure SQL config

const dbConfig = {
    user: 'sqladmin',
    password: 'Sql@1234',
    server: 'facultyleave-sql-server.database.windows.net',
    database: 'FacultyLeaveDB',
    options: { encrypt: true }
};

// Endpoint: get TeacherID by email
app.get('/api/teacher/:email', async (req, res) => {
    try {
        const { email } = req.params;
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT TeacherID, Name FROM Teachers WHERE Email = @Email');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


// Endpoint: get subjects for a teacher
app.get('/api/teacher/:id/subjects', async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('TeacherID', sql.Int, id)
            .query(`SELECT s.SubjectID, s.Name
                    FROM Teacher_Subject ts
                    JOIN Subjects s ON ts.SubjectID = s.SubjectID
                    WHERE ts.TeacherID = @TeacherID`);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
         res.status(500).json({ error: "Database error" });
    }
});


// GET timetable for a teacher
app.get('/api/teacher/:id/timetable', async (req, res) => {
    try {
        const { id } = req.params;
        let pool = await sql.connect(dbConfig);

        // Fetch recurring timetable and batch/group info
        const result = await pool.request()
            .input('TeacherID', sql.Int, id)
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


// Endpoint: submit leave
// Endpoint: submit leave
app.post('/api/leave', async (req, res) => {
    try {
        const { teacherID, subjectID, startDate, endDate, leaveType, reason } = req.body;
        let pool = await sql.connect(dbConfig);

        // 1️⃣ Fetch teacher name
        const teacherResult = await pool.request()
            .input('TeacherID', sql.Int, teacherID)
            .query('SELECT Name FROM Teachers WHERE TeacherID = @TeacherID');

        if (teacherResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const teacherName = teacherResult.recordset[0].Name;

        // 2️⃣ Insert into LeaveRequests with TeacherName
        await pool.request()
            .input('TeacherID', sql.Int, teacherID)
            .input('SubjectID', sql.Int, subjectID)
            .input('StartDate', sql.Date, startDate)
            .input('EndDate', sql.Date, endDate)
            .input('LeaveType', sql.NVarChar, leaveType)
            .input('Reason', sql.NVarChar, reason)
            .input('TeacherName', sql.NVarChar, teacherName)
            .query(`
                INSERT INTO LeaveRequests (TeacherID, SubjectID, StartDate, EndDate,Status, LeaveType, Reason, TeacherName)
                VALUES (@TeacherID,  @SubjectID, @StartDate, @EndDate,'Pending', @LeaveType, @Reason, @TeacherName)
            `);

        res.json({ message: 'Leave submitted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});




// Start server
app.listen(5000, () => console.log('Server running on port 5000'));

