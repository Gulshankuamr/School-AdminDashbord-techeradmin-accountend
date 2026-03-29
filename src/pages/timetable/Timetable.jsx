// src/pages/timetable/Timetable.jsx
import React, { useState } from 'react';
import { Calendar, Plus, Eye, LayoutGrid, CalendarDays } from 'lucide-react';
import CreateTimetable from './CreateTimetable';
import ViewAllTimetable from './ViewAllTimetable';

const Timetable = () => {
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'create'
  
  const tabs = [
    {
      id: 'view',
      name: 'View Timetable',
      icon: <Eye size={20} />,
      description: 'Browse and manage existing schedules'
    },
    {
      id: 'create',
      name: 'Create Timetable',
      icon: <Plus size={20} />,
      description: 'Design new class schedules'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full p-4 md:p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Calendar className="text-white" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Timetable Management
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Create, view, and manage class schedules with an intuitive interface
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 p-5 rounded-xl border-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`text-lg font-semibold ${
                      activeTab === tab.id ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {tab.name}
                    </h3>
                    <p className={`text-sm ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <LayoutGrid className="text-blue-600" size={20} />
              <span className="text-blue-800 font-medium">
                {activeTab === 'view' ? 'View Mode' : 'Create Mode'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="text-purple-600" size={20} />
              <span className="text-purple-700 text-sm">
                School Timetable System
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {activeTab === 'view' ? (
            <ViewAllTimetable />
          ) : (
            <CreateTimetable onSaveSuccess={() => setActiveTab('view')} />
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            💡 Tip: Use the View mode to quickly find and edit existing schedules.
            Use Create mode to design new timetables from scratch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timetable;