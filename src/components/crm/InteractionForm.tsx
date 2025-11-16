"use client";
import React, { useState } from 'react';

type Props = {
  customerId: string;
  onSubmit: (payload: any) => void;
};

const InteractionForm: React.FC<Props> = ({ customerId, onSubmit }) => {
  const [type, setType] = useState('call');
  const [note, setNote] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    onSubmit({ customerId, type, note, date: new Date().toISOString() });
    setNote('');
  }

  return (
    <form onSubmit={submit} className="space-y-2 p-2 border rounded">
      <div className="flex items-center space-x-2">
        <label className="text-sm">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>
      <textarea
        className="w-full border rounded p-2 text-sm"
        placeholder="Note about interaction"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" type="submit">
        Add Interaction
      </button>
    </form>
  );
};

export default InteractionForm;
