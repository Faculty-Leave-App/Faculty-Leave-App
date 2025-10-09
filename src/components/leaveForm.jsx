import React, { useState } from 'react';

function LeaveForm() {
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ leaveType, startDate, endDate, reason });
    alert("Leave request submitted!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Leave Type:
        <input value={leaveType} onChange={(e) => setLeaveType(e.target.value)} />
      </label>
      <br />

      <label>
        Start Date:
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      <br />

      <label>
        End Date:
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </label>
      <br />

      <label>
        Reason:
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <br />

      <button type="submit">Submit Leave</button>
    </form>
  );
}

export default LeaveForm;
