import React, { useState } from 'react';
import { WorkAssignment, UserAccount, DesignRequest } from '../../types';
import { DesignRequestManager } from './DesignRequestManager';
import { Palette, FolderSync, Send, Search, Filter, HardDrive, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Props {
  works: WorkAssignment[];
  onUpdateWork: (work: WorkAssignment) => void;
  activeUser: UserAccount;
  designers: UserAccount[];
}

export const DesignRequestGlobalDesk: React.FC<Props> = ({
  works,
  onUpdateWork,
  activeUser,
  designers
}) => {
  const [selectedWorkId, setSelectedWorkId] = useState<string>(works[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED_FOR_REVIEW' | 'REVISION_REQUESTED' | 'COMPLETED'>('ALL');

  const selectedWork = works.find(w => w.id === selectedWorkId) || works[0];

  // Aggregate all design requests across all works
  const allRequestsWithWork = works.flatMap(w => 
    (w.designRequests || []).map(req => ({
      ...req,
      workId: w.id,
      workTitle: w.workTitle || w.requirementTitle,
      brandName: w.brandName || w.clientCompanyName,
      workObj: w
    }))
  );

  const filteredRequests = allRequestsWithWork.filter(req => {
    const matchesSearch = 
      req.briefText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.workTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.assignedDesignerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = allRequestsWithWork.filter(r => r.status === 'PENDING').length;
  const inProgressCount = allRequestsWithWork.filter(r => r.status === 'IN_PROGRESS').length;
  const reviewCount = allRequestsWithWork.filter(r => r.status === 'SUBMITTED_FOR_REVIEW').length;
  const revisionCount = allRequestsWithWork.filter(r => r.status === 'REVISION_REQUESTED').length;
  const completedCount = allRequestsWithWork.filter(r => r.status === 'COMPLETED').length;

  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex flex-wrap items-center gap-2">
                <span>Design & File Requests Hub</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  GLOBAL TRACKER · PPT
                </span>
              </h1>
            </div>
          </div>

          <a
            href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-purple-950/80 hover:bg-purple-900 border border-purple-400/40 px-3.5 py-1.5 rounded-xl text-xs text-purple-200 transition-all cursor-pointer group shadow-sm"
            title="Click to Open OneDrive Folder"
          >
            <HardDrive className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Target Folder: <strong className="font-mono text-white underline">OneDrive / KAMLAWATI CRM PORTAL / {(activeUser?.name || 'User').replace(/\s+/g, '_')} - {todayDateStr} - [Project_Name]</strong> ↗</span>
          </a>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Total Requests</span>
            <span className="text-2xl font-black text-white">{allRequestsWithWork.length}</span>
          </div>
          <div className="bg-amber-500/20 backdrop-blur-md rounded-xl p-3 border border-amber-400/30">
            <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block">Pending</span>
            <span className="text-2xl font-black text-amber-300">{pendingCount}</span>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-3 border border-blue-400/30">
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-black text-blue-300">{inProgressCount}</span>
          </div>
          <div className="bg-purple-500/20 backdrop-blur-md rounded-xl p-3 border border-purple-400/30">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Needs Review</span>
            <span className="text-2xl font-black text-purple-300">{reviewCount}</span>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-md rounded-xl p-3 border border-emerald-400/30">
            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Approved</span>
            <span className="text-2xl font-black text-emerald-300">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Project & Request Component */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select Client / Project Work Assignment:
            </label>
            <select
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              className="w-full text-xs font-semibold p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.brandName || w.clientCompanyName} / {w.workTitle || w.requirementTitle} ({w.city || 'Site'})
                </option>
              ))}
            </select>
          </div>

          {selectedWork && (
            <DesignRequestManager
              work={selectedWork}
              onUpdateWork={onUpdateWork}
              activeUser={activeUser}
              role={activeUser.role}
              designers={designers}
            />
          )}
        </div>

        {/* Right Column: Global Design Requests Roster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                All Active Requests Stream
              </h3>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Live Overview
              </span>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search requests, brands or designers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1">
                {(['ALL', 'PENDING', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'REVISION_REQUESTED', 'COMPLETED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-purple-950 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'SUBMITTED_FOR_REVIEW' ? 'Review' : st === 'REVISION_REQUESTED' ? 'Edits' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed">
                  No design requests match your filters.
                </div>
              ) : (
                filteredRequests.map(r => (
                  <div 
                    key={r.id}
                    onClick={() => setSelectedWorkId(r.workId)}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all ${
                      selectedWorkId === r.workId
                        ? 'bg-purple-50/80 border-purple-300 ring-1 ring-purple-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-extrabold text-slate-900 text-xs truncate">
                        {r.brandName}: <span className="font-normal text-slate-600">{r.workTitle}</span>
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                        r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'SUBMITTED_FOR_REVIEW' ? 'bg-purple-100 text-purple-800' :
                        r.status === 'REVISION_REQUESTED' ? 'bg-amber-100 text-amber-900' :
                        r.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {r.status === 'SUBMITTED_FOR_REVIEW' ? 'Needs Review' : r.status === 'REVISION_REQUESTED' ? 'Edits Req' : r.status}
                      </span>
                    </div>

                    <p className="text-slate-700 text-[11px] line-clamp-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                      {r.briefText || 'File/Design request'}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>By: <strong>{r.requestedByName}</strong> ({r.requestedByRole})</span>
                      <span>To: <strong>{r.assignedDesignerName || 'Designers'}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
