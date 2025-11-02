import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Profile() {
  const { accounts } = useMsal();
  const account = accounts[0];
  const [teacherID, setTeacherID] = useState(null);
  const [events, setEvents] = useState([]);

  if (!account) return <div>Please login first.</div>;

  // Helper: convert DayOfWeek + Slot to real date (current week)
  const getDateFromDaySlot = (dayOfWeek, slot, isEnd=false) => {
    const today = new Date();
    const currDay = today.getDay() || 7; // Sunday=0 → 7
    const diff = dayOfWeek - currDay;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    const [start, end] = slot.split('-');
    const timeStr = isEnd ? end : start;
    const [h, m] = timeStr.split(':');
    date.setHours(parseInt(h), parseInt(m));
    return date;
  };

  useEffect(() => {
    // Step 1: Get TeacherID from backend
    const fetchTeacherID = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teacher/${account.username}`);
        const data = await res.json();
        if (data && data.TeacherID) setTeacherID(data.TeacherID);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeacherID();
  }, [account.username]);

  useEffect(() => {
    if (!teacherID) return;

    // Step 2: Fetch timetable for this teacher
    const fetchTimetable = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teacher/${teacherID}/timetable`);
        const data = await res.json();
        // Map to FullCalendar events
        const calEvents = data.map(e => ({
          title: `${e.Subject} (${e.GroupName}-${e.BatchName})`,
          start: getDateFromDaySlot(e.DayOfWeek, e.Slot),
          end: getDateFromDaySlot(e.DayOfWeek, e.Slot, true)
        }));
        setEvents(calEvents);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTimetable();
  }, [teacherID]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <p><strong>Name:</strong> {account.name}</p>
      <p><strong>Email:</strong> {account.username}</p>

      <h3 className="mt-6 mb-2 text-lg font-medium">My Timetable</h3>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        events={events}
        height="auto"
      />
    </div>
  );
}
