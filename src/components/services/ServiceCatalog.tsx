import React, { useState } from 'react';
import { ServiceAssignment, WorkAssignment, UserAccount } from '../../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  Trash2, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  PlusCircle, 
  Building2,
  Tag,
  Pencil
} from 'lucide-react';

interface ServiceCatalogProps {
  services: ServiceAssignment[];
  works: WorkAssignment[];
  staffUsers: UserAccount[];
  activeUser: UserAccount;
  onAddService: (newService: ServiceAssignment) => void;
  onDeleteService: (serviceId: string) => void;
  onUpdateServiceStatus?: (serviceId: string, status: ServiceAssignment['status']) => void;
  onUpdateService?: (updatedService: ServiceAssignment) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  works,
  staffUsers,
  activeUser,
  onAddService,
  onDeleteService,
  onUpdateServiceStatus,
  onUpdateService
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingService, setDeletingService] = useState<ServiceAssignment | null>(null);
  const [editingService, setEditingService] = useState<ServiceAssignment | null>(null);

  // Edit form state
  const [editServiceName, setEditServiceName] = useState('');
  const [editCategory, setEditCategory] = useState<ServiceAssignment['category']>('ELECTRICAL');
  const [editAssignedPersonId, setEditAssignedPersonId] = useState('');
  const [editWorkId, setEditWorkId] = useState('');
  const [editManpowerCount, setEditManpowerCount] = useState(3);
  const [editPriority, setEditPriority] = useState<ServiceAssignment['priority']>('NORMAL');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const openEditService = (service: ServiceAssignment) => {
    setEditingService(service);
    setEditServiceName(service.serviceName);
    setEditCategory(service.category);
    setEditAssignedPersonId(service.assignedPersonId);
    setEditWorkId(service.workId);
    setEditManpowerCount(service.manpowerCount);
    setEditPriority(service.priority);
    setEditScheduledDate(service.scheduledDate);
    setEditNotes(service.notes || '');
  };

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<ServiceAssignment['category']>('ELECTRICAL');
  const [assignedPersonId, setAssignedPersonId] = useState(staffUsers[0]?.id || '');
  const [workId, setWorkId] = useState(works[0]?.id || '');
  const [manpowerCount, setManpowerCount] = useState(3);
  const [priority, setPriority] = useState<ServiceAssignment['priority']>('NORMAL');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const filteredServices = services.filter((s) => {
    const matchesSearch = 
      s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignedPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.workTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientCompanyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const assignedUserObj = staffUsers.find((u) => u.id === assignedPersonId) || staffUsers[0];
    const workObj = works.find((w) => w.id === workId) || works[0];

    const newServiceObj: ServiceAssignment = {
      id: `srv_${Date.now()}`,
      serviceName: serviceName.trim(),
      category,
      assignedPersonId: assignedUserObj?.id || 'user_sup_1',
      assignedPersonName: assignedUserObj?.name || 'Suresh Kumar',
      assignedRole: assignedUserObj?.role?.replace('_', ' ') || 'Site Supervisor',
      workId: workObj?.id || 'work_1',
      workTitle: workObj?.workTitle || 'Site Execution Work',
      clientCompanyName: workObj?.clientCompanyName || 'Client Enterprise',
      status: 'IN_PROGRESS',
      manpowerCount: Number(manpowerCount) || 1,
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      priority,
      notes: notes.trim() || 'Execute trade deliverables according to project specifications.',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
    };

    onAddService(newServiceObj);
    setShowAddModal(false);

    // Reset Form
    setServiceName('');
    setNotes('');
  };

  const getCategoryBadgeClass = (cat: ServiceAssignment['category']) => {
    switch (cat) {
      case 'REAL_ESTATE_ADVERTISING': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'INTERIOR_WORKS': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'EXTERIOR_FACADE': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'ELECTRICAL': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SIGNAGE': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CARPENTRY': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'PAINTING': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'HVAC': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'PLUMBING': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CIVIL': return 'bg-stone-100 text-stone-800 border-stone-300';
      case 'SAFETY': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusBadgeClass = (st: ServiceAssignment['status']) => {
    switch (st) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ON_HOLD': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Service Trade Roster & Staff Assignments</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-300 font-mono">
                TRADE ROSTER • EXECUTIONS
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Assign New Service Trade
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service, assigned staff name, or client company..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="REAL_ESTATE_ADVERTISING">Real Estate Advertising & Hoardings</option>
              <option value="INTERIOR_WORKS">Interior Works & Experience Centres</option>
              <option value="EXTERIOR_FACADE">Exterior Facade & ACP Cladding</option>
              <option value="CARPENTRY">Carpentry & Joinery</option>
              <option value="ELECTRICAL">Electrical & Lighting</option>
              <option value="SIGNAGE">Signage & Branding</option>
              <option value="PAINTING">Painting & Coating</option>
              <option value="HVAC">HVAC & Ducting</option>
              <option value="PLUMBING">Plumbing & Drainage</option>
              <option value="CIVIL">Civil & Tiling</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
            <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">No service trade assignments found.</p>
            <p className="text-xs text-slate-400">Click "Assign New Service Trade" above to create a record.</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative group"
            >
              <div className="space-y-3">
                {/* Header: Category & Priority */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadgeClass(
                      service.category
                    )}`}
                  >
                    {service.category.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        service.priority === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : service.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {service.priority}
                    </span>

                    {/* Edit Service Button */}
                    <button
                      onClick={() => openEditService(service)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Service Trade Assignment"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete Service Button */}
                    <button
                      onClick={() => setDeletingService(service)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Service Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="text-sm font-black text-slate-900 leading-snug">{service.serviceName}</h3>

                {/* Assigned Staff Box (PROMINENT NAME DISPLAY) */}
                <div className="p-3 bg-cyan-50/70 rounded-xl border border-cyan-200/80 space-y-1">
                  <div className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-600" /> Assigned Staff / Trade Leader:
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">{service.assignedPersonName}</div>
                  <div className="text-[11px] text-cyan-700 font-semibold">{service.assignedRole}</div>
                </div>

                {/* Project Details */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold truncate">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{service.clientCompanyName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{service.workTitle}</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date: {service.scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Crew: {service.manpowerCount} members</span>
                  </div>
                </div>

                {service.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    "{service.notes}"
                  </p>
                )}
              </div>

              {/* Status Change Selector & Footer */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                {service.lastUpdatedByName && (
                  <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                    <span className="uppercase text-slate-400">Last Updated By:</span>
                    <span className="font-extrabold text-blue-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {service.lastUpdatedByName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                  <select
                    value={service.status}
                    onChange={(e) => {
                      if (onUpdateServiceStatus) {
                        onUpdateServiceStatus(service.id, e.target.value as ServiceAssignment['status']);
                      }
                    }}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadgeClass(
                      service.status
                    )}`}
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add New Service Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-600" /> Assign New Service Trade
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateServiceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service / Trade Title *</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Sales Experience Centre Interior Fit-Out, 3D Facade Signage..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trade Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="REAL_ESTATE_ADVERTISING">Real Estate Advertising & Hoardings</option>
                    <option value="INTERIOR_WORKS">Interior Works & Experience Centres</option>
                    <option value="EXTERIOR_FACADE">Exterior Facade & ACP Cladding</option>
                    <option value="CARPENTRY">Carpentry & Joinery</option>
                    <option value="ELECTRICAL">Electrical & Lighting</option>
                    <option value="SIGNAGE">Signage & Branding</option>
                    <option value="PAINTING">Painting & Coating</option>
                    <option value="HVAC">HVAC & Ducting</option>
                    <option value="PLUMBING">Plumbing & Drainage</option>
                    <option value="CIVIL">Civil & Tiling</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign Staff Member / Leader *</label>
                  <select
                    value={assignedPersonId}
                    onChange={(e) => setAssignedPersonId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-blue-700"
                  >
                    {staffUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Site Project *</label>
                <select
                  value={workId}
                  onChange={(e) => setWorkId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                >
                  {works.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.clientCompanyName} - {w.workTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crew Size</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={manpowerCount}
                    onChange={(e) => setManpowerCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specific requirements, safety instructions..."
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-cyan-600 font-bold shadow-md shadow-cyan-600/20 cursor-pointer"
                >
                  Save Service Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Service Assignment */}
      {deletingService && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Service Assignment</h3>
                <p className="text-xs text-slate-500">Confirm service trade removal</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Service:</span>{' '}
                <strong className="text-slate-900">{deletingService.serviceName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned Staff:</span>{' '}
                <strong className="text-blue-700">{deletingService.assignedPersonName} ({deletingService.assignedRole})</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Project:</span>{' '}
                <strong className="text-slate-800">{deletingService.clientCompanyName} - {deletingService.workTitle}</strong>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              Are you sure you want to delete this service trade assignment?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingService(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold uppercase text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteService(deletingService.id);
                  setDeletingService(null);
                }}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold uppercase text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Service Trade */}
      {editingService && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Service Trade Assignment</h3>
                  <p className="text-xs text-slate-500">Update service title, assigned staff, manpower & schedule</p>
                </div>
              </div>
              <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingService && onUpdateService) {
                  const assignedStaff = staffUsers.find((u) => u.id === editAssignedPersonId) || staffUsers[0];
                  const linkedWork = works.find((w) => w.id === editWorkId) || works[0];
                  const updated: ServiceAssignment = {
                    ...editingService,
                    serviceName: editServiceName,
                    category: editCategory,
                    assignedPersonId: assignedStaff ? assignedStaff.id : editingService.assignedPersonId,
                    assignedPersonName: assignedStaff ? assignedStaff.name : editingService.assignedPersonName,
                    assignedRole: assignedStaff ? (assignedStaff.designation || assignedStaff.role.replace('_', ' ')) : editingService.assignedRole,
                    workId: linkedWork ? linkedWork.id : editingService.workId,
                    workTitle: linkedWork ? linkedWork.workTitle : editingService.workTitle,
                    clientCompanyName: linkedWork ? linkedWork.clientCompanyName : editingService.clientCompanyName,
                    manpowerCount: editManpowerCount,
                    priority: editPriority,
                    scheduledDate: editScheduledDate,
                    notes: editNotes,
                    lastUpdatedByName: activeUser.name,
                    lastUpdatedByRole: activeUser.role,
                  };
                  onUpdateService(updated);
                  setEditingService(null);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service / Trade Title *</label>
                <input
                  type="text"
                  required
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ServiceAssignment['category'])}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="PEST_CONTROL">PEST CONTROL</option>
                    <option value="SIGNAGE">SIGNAGE / BRANDING</option>
                    <option value="HVAC">HVAC / DUCTING</option>
                    <option value="CARPENTRY">CARPENTRY & FITOUT</option>
                    <option value="CIVIL_WORKS">CIVIL WORKS</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="PAINTING">PAINTING & FINISHING</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority *</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as ServiceAssignment['priority'])}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Staff / Trade Leader *</label>
                <select
                  value={editAssignedPersonId}
                  onChange={(e) => setEditAssignedPersonId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {staffUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Linked Work Request / Client *</label>
                <select
                  value={editWorkId}
                  onChange={(e) => setEditWorkId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {works.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.clientCompanyName} - {w.workTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Manpower</label>
                  <input
                    type="number"
                    min={1}
                    value={editManpowerCount}
                    onChange={(e) => setEditManpowerCount(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={editScheduledDate}
                    onChange={(e) => setEditScheduledDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Instructions & Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold uppercase text-xs shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
