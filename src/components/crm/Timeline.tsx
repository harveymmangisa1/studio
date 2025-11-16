"use client";
import React from 'react';

type Event = {
  id: string;
  date: string;
  type: string;
  detail: string;
};

const Timeline: React.FC<{ events: Event[] }> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="text-sm text-gray-500">No interactions yet.</div>;
  }
  return (
    <ul className="border rounded p-2 space-y-2 max-h-60 overflow-auto">
      {events.map((e) => (
        <li key={e.id} className="flex items-start space-x-2 text-sm">
          <span className="font-medium text-gray-700" style={{ width: 90 }}>
            {e.date}
          </span>
          <span className="text-gray-800">[{e.type}]</span>
          <span className="text-gray-600">{e.detail}</span>
        </li>
      ))}
    </ul>
  );
};

export default Timeline;
