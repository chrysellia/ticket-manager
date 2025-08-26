import React from 'react';
import { TeamList } from '../components/team/TeamList';

export function TeamsPage() {
  return (
    <div className="bg-gray-50">
      <div className="pt-6 px-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <p className="text-gray-600 mt-2">Manage your teams</p>
      </div>

      <div className="px-6 pb-6">
        <TeamList />
      </div>
    </div>
  );
}
