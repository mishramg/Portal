import React, { useState } from 'react';
import { ClientCompany, WorkAssignment, UserAccount } from '../../types';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Briefcase, 
  PlusCircle, 
  CheckCircle,
  X,
  Trash2,
  Pencil
} from 'lucide-react';

interface ClientManagerProps {
  clients: ClientCompany[];
  works: WorkAssignment[];
  crmUsers: UserAccount[];
  activeUser: UserAccount;
  onAddClient: (newClient: ClientCompany) => void;
  onCreateNewWork: (newWork: WorkAssignment) => void;
  onDeleteClient?: (clientId: string) => void;
  onDeleteWork?: (workId: string) => void;
  onUpdateClient?: (updatedClient: ClientCompany) => void;
  onUpdateWork?: (updatedWork: WorkAssignment) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  works,
  crmUsers,
  activeUser,
  onAddClient,
  onCreateNewWork,
  onDeleteClient,
  onDeleteWork,
  onUpdateClient,
  onUpdateWork
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientCompany | null>(clients[0] || null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAssignWorkModal, setShowAssignWorkModal] = useState(false);
  const [deletingClient, setDeletingClient] = useState<ClientCompany | null>(null);
  const [deletingWorkId, setDeletingWorkId] = useState<string | null>(null);

  // Edit states
  const [editingClient, setEditingClient] = useState<ClientCompany | null>(null);
  const [editingWork, setEditingWork] = useState<WorkAssignment | null>(null);

  // Edit Client form fields
  const [editCompName, setEditCompName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Edit Work form fields
  const [editWorkTitle, setEditWorkTitle] = useState('');
  const [editBrandName, setEditBrandName] = useState('');
  const [editAssignedCrmId, setEditAssignedCrmId] = useState('');

  if (activeUser.role !== 'ADMIN') {
    return (
      <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl text-center space-y-3 max-w-md mx-auto my-12">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto font-bold">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">Access Restricted (Admin Only)</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Clients & Past History directory is restricted and accessible strictly to System Administrators.
        </p>
      </div>
    );
  }

  const openEditClient = (client: ClientCompany) => {
    setEditingClient(client);
    setEditCompName(client.companyName);
    setEditContactPerson(client.contactPerson);
    setEditEmail(client.email);
    setEditPhone(client.phone);
    setEditAddress(client.address || '');
  };

  const openEditWork = (work: WorkAssignment) => {
    setEditingWork(work);
    setEditWorkTitle(work.workTitle);
    setEditBrandName(work.brandName);
    setEditAssignedCrmId(work.assignedCrmId);
  };

  // New Client Form
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [industry, setIndustry] = useState('');

  // New Work Assign Form
  const [workTitle, setWorkTitle] = useState('');
  const [brandName, setBrandName] = useState('');
  const [assignedCrmId, setAssignedCrmId] = useState(crmUsers[0]?.id || '');

  const filteredClients = clients.filter((c) =>
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientHistoryWorks = works.filter((w) => w.clientId === selectedClient?.id);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson) return;

    const newClientObj: ClientCompany = {
      id: `client_${Date.now()}`,
      companyName,
      contactPerson,
      email: email || 'contact@company.com',
      phone: phone || '+91 98000 00000',
      address: address || 'Corporate Plaza, Delhi',
      gstNumber: gstNumber || '07AAAAA0000A1Z5',
      industry: industry || 'Commercial Enterprise',
      createdAt: new Date().toISOString().split('T')[0],
      totalWorksCount: 0,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
    };

    onAddClient(newClientObj);
    setSelectedClient(newClientObj);
    setShowAddClientModal(false);

    // Reset Form
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setGstNumber('');
  };

  const handleAssignWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !workTitle) return;

    const crmObj = crmUsers.find((u) => u.id === assignedCrmId) || crmUsers[0];

    const newWorkObj: WorkAssignment = {
      id: `work_${Date.now()}`,
      workTitle,
      clientId: selectedClient.id,
      clientCompanyName: selectedClient.companyName,
      brandName: brandName || selectedClient.companyName,
      assignedCrmId: crmObj?.id || crmUsers[0]?.id || 'user_crm_1',
      assignedCrmName: crmObj?.name || crmUsers[0]?.name || 'Unassigned',
      currentStep: 'STEP_A_VISIT_REPORT',
      crmCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
    };

    onCreateNewWork(newWorkObj);
    setShowAssignWorkModal(false);
    setWorkTitle('');
    setBrandName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Previous Client Database & Work History</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-cyan-300 font-mono">
              CORPORATE MASTER RECORDS
            </span>
          </h2>
        </div>

        <div className="flex gap-2">
          {(activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') && (
            <button
              onClick={() => setShowAddClientModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Company / Client
            </button>
          )}

          {selectedClient && (
            <button
              onClick={() => setShowAssignWorkModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Assign New Work Request
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Directory List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter company or contact..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {filteredClients.map((client) => {
              const isSelected = client.id === selectedClient?.id;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-3.5 transition-all text-xs flex flex-col gap-1 border-l-4 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 font-semibold text-slate-900'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">{client.companyName}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full">
                      {client.industry || 'Client'}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-2">
                    <span>Contact: {client.contactPerson}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Client Details & Work History */}
        {selectedClient ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Client Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    Client Profile
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">{selectedClient.companyName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Contact Person: {selectedClient.contactPerson}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAssignWorkModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Assign New Request
                  </button>

                  <button
                    onClick={() => openEditClient(selectedClient)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Edit Client Company Record"
                  >
                    <Pencil className="w-4 h-4 text-amber-600" /> Edit Client
                  </button>

                  {onDeleteClient && (
                    <button
                      onClick={() => setDeletingClient(selectedClient)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Delete Client Company Record"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Client
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Phone</div>
                    <div className="font-semibold">{selectedClient.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Email</div>
                    <div className="font-semibold truncate">{selectedClient.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">GSTIN / Tax ID</div>
                    <div className="font-semibold">{selectedClient.gstNumber || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Address: </span>
                  {selectedClient.address}
                </div>
              </div>
            </div>

            {/* Historical Work Requests for this Client */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Work Requests History for {selectedClient.companyName} ({clientHistoryWorks.length})
              </h4>

              {clientHistoryWorks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No work requests logged for this client yet. Click "Assign New Work Request" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {clientHistoryWorks.map((work) => (
                    <div
                      key={work.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{work.workTitle}</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">
                            Step: {work.currentStep}
                          </span>

                          <button
                            onClick={() => openEditWork(work)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                            title="Edit Work Request"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteWork && (
                            <button
                              onClick={() => setDeletingWorkId(work.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete Work Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-slate-600 flex flex-wrap gap-4 text-[11px]">
                        <span>Brand: {work.brandName}</span>
                        <span>Assigned CRM: {work.assignedCrmName}</span>
                        <span>Created: {work.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            Select a client from the directory list.
          </div>
        )}
      </div>

      {/* Modal: Add New Company/Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Add New Company / Client
              </h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Client Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Retail Services Ltd"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Rajesh Sharma"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98230 00000"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Full office address..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-blue-600 font-bold shadow-md shadow-blue-500/20"
                >
                  Save Client to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign New Work Request */}
      {showAssignWorkModal && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" /> Assign New Work Request
              </h3>
              <button onClick={() => setShowAssignWorkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignWorkSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-900 font-semibold">
                Client: {selectedClient.companyName} ({selectedClient.contactPerson})
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work / Project Title *</label>
                <input
                  type="text"
                  required
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  placeholder="e.g. Commercial Pest Treatment & Signage Upgrade"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand / Location Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Apex Retail (DLF Mall Site)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to CRM Employee *</label>
                <select
                  value={assignedCrmId}
                  onChange={(e) => setAssignedCrmId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold"
                >
                  {crmUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignWorkModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-blue-600 font-bold shadow-md"
                >
                  Create Work Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Client */}
      {deletingClient && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Client Company</h3>
                <p className="text-xs text-slate-500">Confirm permanent record removal</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Company Name:</span>{' '}
                <strong className="text-slate-900">{deletingClient.companyName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Contact Person:</span>{' '}
                <strong className="text-slate-800">{deletingClient.contactPerson}</strong>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              Are you sure you want to delete this client company profile?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingClient(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold uppercase text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteClient) {
                    onDeleteClient(deletingClient.id);
                    if (selectedClient?.id === deletingClient.id) {
                      setSelectedClient(clients.find((c) => c.id !== deletingClient.id) || null);
                    }
                    setDeletingClient(null);
                  }
                }}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold uppercase text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Work Request */}
      {deletingWorkId && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Work Request</h3>
                <p className="text-xs text-slate-500">Confirm project removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to remove this work request assignment from the client history?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingWorkId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold uppercase text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteWork && deletingWorkId) {
                    onDeleteWork(deletingWorkId);
                    setDeletingWorkId(null);
                  }
                }}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold uppercase text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Client Profile */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Client Profile</h3>
                  <p className="text-xs text-slate-500">Update company details & contact info</p>
                </div>
              </div>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingClient && onUpdateClient) {
                  const updated: ClientCompany = {
                    ...editingClient,
                    companyName: editCompName,
                    contactPerson: editContactPerson,
                    email: editEmail,
                    phone: editPhone,
                    address: editAddress,
                    lastUpdatedByName: activeUser.name,
                    lastUpdatedByRole: activeUser.role,
                  };
                  onUpdateClient(updated);
                  if (selectedClient?.id === editingClient.id) {
                    setSelectedClient(updated);
                  }
                  setEditingClient(null);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Client Name *</label>
                <input
                  type="text"
                  required
                  value={editCompName}
                  onChange={(e) => setEditCompName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
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

      {/* Modal: Edit Work Request */}
      {editingWork && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Work Request</h3>
                  <p className="text-xs text-slate-500">Update title, brand & assigned CRM exec</p>
                </div>
              </div>
              <button onClick={() => setEditingWork(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingWork && onUpdateWork) {
                  const assignedCrmObj = crmUsers.find((u) => u.id === editAssignedCrmId) || crmUsers[0];
                  const updated: WorkAssignment = {
                    ...editingWork,
                    workTitle: editWorkTitle,
                    brandName: editBrandName,
                    assignedCrmId: assignedCrmObj ? assignedCrmObj.id : editingWork.assignedCrmId,
                    assignedCrmName: assignedCrmObj ? assignedCrmObj.name : editingWork.assignedCrmName
                  };
                  onUpdateWork(updated);
                  setEditingWork(null);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Request Title *</label>
                <input
                  type="text"
                  required
                  value={editWorkTitle}
                  onChange={(e) => setEditWorkTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned CRM Executive *</label>
                <select
                  value={editAssignedCrmId}
                  onChange={(e) => setEditAssignedCrmId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {crmUsers.map((crm) => (
                    <option key={crm.id} value={crm.id}>
                      {crm.name} ({crm.employeeCode || 'CRM Exec'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
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
