import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

function LeaveForm() {
  const { accounts } = useMsal();
  const account = accounts[0];

  const [teacherID, setTeacherID] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectID, setSubjectID] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [teacherName, setTeacherName] = useState('');


  const leaveOptions = [
    'Sick Leave',
    'Casual Leave',
    'Earned Leave',
    'Maternity/Paternity Leave',
    'Others'
  ];

  // Fetch teacherID & subjects using login email
  useEffect(() => {
    if (account && account.username) {
      console.log('Fetching teacher and subjects for:', account.username);

      fetch(`http://localhost:5000/api/teacher/${account.username}`)
        .then(res => res.json())
        .then(data => {
          if (!data?.TeacherID) throw new Error('No teacher found');
          setTeacherID(data.TeacherID);
          setTeacherName(data.Name);
          return fetch(`http://localhost:5000/api/teacher/${data.TeacherID}/subjects`);
        })
        .then(res => res.json())
        .then(subjectData => {
          setSubjects(subjectData);
          if (subjectData.length > 0) setSubjectID(subjectData[0].SubjectID);
        })
        .catch(err => console.error('Failed to fetch teacher or subjects:', err));
    }
  }, [account]);

  // Submit leave request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teacherID || !subjectID || !leaveType || !startDate || !endDate) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    const payload = {
      teacherID,
      subjectID,
      leaveType,
      startDate,
      endDate,
      reason: reason.trim() || 'N/A', // always send reason
       teacherName
    };

    console.log("Submitting leave request:", payload);

    try {
      const res = await fetch('http://localhost:5000/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ ' + data.message);
        // Reset form
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setReason('');
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to submit leave'));
      }
    } catch (err) {
      console.error('Error submitting leave:', err);
      alert('Server error. Check console for details.');
    }
  };

  if (!account) return <div>Please login first to submit leave.</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Submit Leave Request</h2>

      <label className="block mb-2">
        Leave Type:
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          className="block w-full border p-2 rounded"
          required
        >
          <option value="">Select Leave Type</option>
          {leaveOptions.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Subject:
        <select
          value={subjectID}
          onChange={(e) => setSubjectID(e.target.value)}
          className="block w-full border p-2 rounded"
          required
        >
          {subjects.map(sub => (
            <option key={sub.SubjectID} value={sub.SubjectID}>{sub.Name}</option>
          ))}
        </select>
      </label>

      <label className="block mb-2">
        Start Date:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full border p-2 rounded"
          required
        />
      </label>

      <label className="block mb-2">
        End Date:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="block w-full border p-2 rounded"
          required
        />
      </label>

      <label className="block mb-4">
        Reason:
        <textarea
          placeholder="Enter reason for leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="block w-full border p-2 rounded"
          required
        />
      </label>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Submit Leave
      </button>
    </form>
  );
}

export default LeaveForm;
