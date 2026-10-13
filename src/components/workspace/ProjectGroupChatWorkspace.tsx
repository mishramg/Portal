import React, { useState, useRef, useEffect } from 'react';
import { 
  ProjectGroup, 
  ProjectGroupMessage, 
  ProjectGroupFile, 
  ProjectGroupReminder,
  UserAccount, 
  UserRole,
  MaterialRequest
} from '../../types';
import { 
  Search, 
  Send, 
  Paperclip, 
  Check, 
  X, 
  Clock, 
  Plus, 
  Users, 
  UserPlus, 
  UserMinus, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Image, 
  FileCode, 
  MessageSquare, 
  ShoppingCart, 
  Bell, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  Edit3, 
  ShieldCheck, 
  ArrowRight, 
  Trash2, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface ProjectGroupChatWorkspaceProps {
  groups: ProjectGroup[];
  messages: ProjectGroupMessage[];
  users: UserAccount[];
  activeUser: UserAccount;
  onUpdateGroup: (group: ProjectGroup) => void;
  onAddGroup: (group: ProjectGroup) => void;
  onSendMessage: (message: ProjectGroupMessage) => void;
  onUpdateMessage: (message: ProjectGroupMessage) => void;
  onCreateMaterialRequest?: (req: Partial<MaterialRequest>) => void;
}

export const ProjectGroupChatWorkspace: React.FC<ProjectGroupChatWorkspaceProps> = ({
  groups,
  messages,
  users,
  activeUser,
  onUpdateGroup,
  onAddGroup,
  onSendMessage,
  onUpdateMessage,
  onCreateMaterialRequest
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => groups[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'COMPLETED' | 'ON_HOLD'>('ALL');
  
  const [messageText, setMessageText] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showMaterialRequestModal, setShowMaterialRequestModal] = useState(false);
  const [showOneDriveDrawer, setShowOneDriveDrawer] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  // File Upload State
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'IMAGE' | 'PDF' | 'CAD' | 'PPT' | 'DOCUMENT'>('IMAGE');
  const [selectedDesktopFile, setSelectedDesktopFile] = useState<File | null>(null);
  const [uploadFileSize, setUploadFileSize] = useState('3.5 MB');

  // Inline correction reply state (keyed by file ID)
  const [activeCorrectionFileId, setActiveCorrectionFileId] = useState<string | null>(null);
  const [correctionFeedbackText, setCorrectionFeedbackText] = useState('');

  // Inline reject feedback state (keyed by file ID)
  const [activeRejectFileId, setActiveRejectFileId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  // Reminder form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('14:00');
  const [reminderNotes, setReminderNotes] = useState('');

  // Material request form state
  const [matItemName, setMatItemName] = useState('');
  const [matQuantity, setMatQuantity] = useState('');
  const [matUrgency, setMatUrgency] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY_IMMEDIATE'>('HIGH');
  const [matEstCost, setMatEstCost] = useState('45000');
  const [matNotes, setMatNotes] = useState('');

  // New Group state
  const [newGroupName, setNewGroupName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || groups[0];

  // Helper to parse message timestamp to epoch ms
  const getMessageTimestampMs = (m: ProjectGroupMessage): number => {
    if (m.createdAt) {
      const parsed = new Date(m.createdAt).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Try extract numeric epoch from msg id e.g. msg_1728456789012 or msg_sys_1728...
    const match = m.id.match(/\d{10,}/);
    if (match) {
      return parseInt(match[0], 10);
    }
    // Try parsing timestamp string (e.g. "2026-10-06 09:30 AM")
    const dateParsed = new Date(m.timestamp).getTime();
    if (!isNaN(dateParsed)) return dateParsed;

    return 0;
  };

  // Helper to parse member join date to epoch ms
  const getMemberJoinTimestampMs = (joinedAtStr?: string): number => {
    if (!joinedAtStr) return 0;
    const parsed = new Date(joinedAtStr).getTime();
    if (!isNaN(parsed)) return parsed;
    return 0;
  };

  // Management auditors (Admin, Sub-Admin, and assigned CRM lead for the project) have master operational audit
  const isManagementAuditor = 
    activeUser.role === 'ADMIN' || 
    activeUser.role === 'SUB_ADMIN' || 
    (selectedGroup && selectedGroup.assignedCrmId === activeUser.id);

  const activeMemberRecord = selectedGroup?.members.find((m) => m.userId === activeUser.id);

  // Filter messages for current group, strictly enforcing:
  // "the person will join he/she will see message from the time of joining not previous"
  const groupMessages = messages.filter((m) => {
    if (m.groupId !== selectedGroup?.id) return false;
    // Admins, Sub-Admins, and CRM project lead have master audit clearance
    if (isManagementAuditor) return true;
    if (!activeMemberRecord) return true; // If not in member roster, allow viewing

    const userJoinMs = getMemberJoinTimestampMs(activeMemberRecord.joinedAt);
    if (userJoinMs === 0) return true;

    const msgMs = getMessageTimestampMs(m);
    if (msgMs === 0) return true;

    // The person will see message from the time of joining, not previous
    return msgMs >= userJoinMs;
  });

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages.length, selectedGroupId]);

  // Filter groups: visible only to the person who made the group or added members
  const userGroups = groups.filter((g) => {
    const isCreator = g.createdByUserId === activeUser.id;
    const isMember = g.members && g.members.some((m) => m.userId === activeUser.id);
    if (!g.createdByUserId) {
      return isMember || activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN' || g.assignedCrmId === activeUser.id;
    }
    return isCreator || isMember;
  });

  const filteredGroups = userGroups.filter((g) => {
    if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.projectName.toLowerCase().includes(q) ||
      g.clientCompanyName.toLowerCase().includes(q) ||
      (g.brandName && g.brandName.toLowerCase().includes(q))
    );
  });

  // Approved files in this group (for OneDrive drawer)
  const approvedFiles = groupMessages
    .filter((m) => m.file && m.file.status === 'APPROVED')
    .map((m) => m.file as ProjectGroupFile);

  const handleSendTextMessage = () => {
    if (!messageText.trim() || !selectedGroup) return;
    const newMsg: ProjectGroupMessage = {
      id: `msg_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'TEXT',
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(newMsg);
    setMessageText('');

    // Update group's last activity
    onUpdateGroup({
      ...selectedGroup,
      lastActivity: 'Just now'
    });
  };

  // Handle File 3-Actions
  const handleApproveFile = (msg: ProjectGroupMessage, file: ProjectGroupFile) => {
    const updatedFile: ProjectGroupFile = {
      ...file,
      status: 'APPROVED',
      statusUpdatedByName: activeUser.name,
      statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      savedToOneDrive: true,
      oneDrivePath: `${selectedGroup.oneDriveSyncedFolder}Approved_Assets/${file.fileName}`
    };

    onUpdateMessage({
      ...msg,
      file: updatedFile
    });

    // Post an announcement in the group
    const approvalNotice: ProjectGroupMessage = {
      id: `msg_sys_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'SYSTEM',
      text: `✅ ${activeUser.name} APPROVED "${file.fileName}". File locked and automatically backed up to OneDrive at "${updatedFile.oneDrivePath}".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(approvalNotice);
  };

  const handleOpenCorrection = (fileId: string) => {
    setActiveCorrectionFileId(fileId);
    setActiveRejectFileId(null);
    setCorrectionFeedbackText('');
  };

  const handleSubmitCorrection = (msg: ProjectGroupMessage, file: ProjectGroupFile) => {
    if (!correctionFeedbackText.trim()) return;

    const updatedFile: ProjectGroupFile = {
      ...file,
      status: 'CORRECTION_REQUESTED',
      statusUpdatedByName: activeUser.name,
      statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      correctionNotes: correctionFeedbackText.trim(),
      correctionReplyBy: activeUser.name,
      savedToOneDrive: false
    };

    onUpdateMessage({
      ...msg,
      file: updatedFile
    });

    // Also post text message in thread
    const replyNotice: ProjectGroupMessage = {
      id: `msg_reply_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'TEXT',
      text: `✏️ CORRECTION REQUEST for "${file.fileName}": ${correctionFeedbackText.trim()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(replyNotice);

    setActiveCorrectionFileId(null);
    setCorrectionFeedbackText('');
  };

  const handleOpenReject = (fileId: string) => {
    setActiveRejectFileId(fileId);
    setActiveCorrectionFileId(null);
    setRejectionReasonText('Design specifications or dimensions do not comply with site measurements.');
  };

  const handleSubmitReject = (msg: ProjectGroupMessage, file: ProjectGroupFile) => {
    const reason = rejectionReasonText.trim() || 'Design rejected by reviewer';

    const updatedFile: ProjectGroupFile = {
      ...file,
      status: 'REJECTED',
      statusUpdatedByName: activeUser.name,
      statusUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rejectionReason: reason,
      savedToOneDrive: false
    };

    onUpdateMessage({
      ...msg,
      file: updatedFile
    });

    const rejectNotice: ProjectGroupMessage = {
      id: `msg_rej_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'SYSTEM',
      text: `❌ ${activeUser.name} REJECTED "${file.fileName}". Reason: ${reason}. Fresh revision requested.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(rejectNotice);

    setActiveRejectFileId(null);
    setRejectionReasonText('');
  };

  // Upload file to group
  const handleSendUploadedFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim() || !selectedGroup) return;

    const defaultUrls: Record<string, string> = {
      IMAGE: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
      PDF: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
      CAD: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      PPT: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      DOCUMENT: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80'
    };

    const fileUrlToUse = selectedDesktopFile ? URL.createObjectURL(selectedDesktopFile) : defaultUrls[uploadFileType];

    const newFile: ProjectGroupFile = {
      id: `file_${Date.now()}`,
      fileName: uploadFileName.trim().includes('.') ? uploadFileName.trim() : `${uploadFileName.trim()}.${uploadFileType === 'CAD' ? 'dwg' : uploadFileType === 'PDF' ? 'pdf' : uploadFileType === 'PPT' ? 'pptx' : 'png'}`,
      fileUrl: fileUrlToUse,
      fileType: uploadFileType,
      fileSize: uploadFileSize || '4.2 MB',
      uploadedByUserId: activeUser.id,
      uploadedByName: activeUser.name,
      uploadedByRole: activeUser.role,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_REVIEW',
      savedToOneDrive: false
    };

    const newMsg: ProjectGroupMessage = {
      id: `msg_file_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'FILE',
      file: newFile,
      text: `Uploaded new ${uploadFileType} deliverable: ${newFile.fileName}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    onSendMessage(newMsg);
    setShowFileUploadModal(false);
    setUploadFileName('');
    setSelectedDesktopFile(null);
  };

  // Add Reminder
  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !selectedGroup) return;

    const newRem: ProjectGroupReminder = {
      id: `rem_${Date.now()}`,
      title: reminderTitle.trim(),
      dueDate: reminderDate,
      dueTime: reminderTime,
      notes: reminderNotes,
      setByUserId: activeUser.id,
      setByName: activeUser.name,
      createdAt: new Date().toISOString().split('T')[0],
      completed: false
    };

    const updatedReminders = [...(selectedGroup.reminders || []), newRem];
    onUpdateGroup({
      ...selectedGroup,
      reminders: updatedReminders
    });

    // Announce in chat
    const remMsg: ProjectGroupMessage = {
      id: `msg_rem_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'REMINDER_ALERT',
      reminder: newRem,
      text: `⏰ Action Reminder set by ${activeUser.name}: "${newRem.title}" due on ${newRem.dueDate} at ${newRem.dueTime || '12:00'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(remMsg);

    setShowReminderModal(false);
    setReminderTitle('');
    setReminderNotes('');
  };

  // Toggle Reminder completion
  const handleToggleReminder = (remId: string) => {
    if (!selectedGroup) return;
    const updated = (selectedGroup.reminders || []).map((r) =>
      r.id === remId ? { ...r, completed: !r.completed } : r
    );
    onUpdateGroup({
      ...selectedGroup,
      reminders: updated
    });
  };

  // Submit Material Requisition from Group
  const handleSubmitMaterialRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matItemName.trim() || !selectedGroup) return;

    const reqId = `mat_req_${Date.now()}`;
    const estCostNum = Number(matEstCost) || 25000;

    const newReq: Partial<MaterialRequest> = {
      id: reqId,
      requestNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedByUserId: activeUser.id,
      requestedByName: activeUser.name,
      requestedByRole: activeUser.role,
      siteOrProjectName: selectedGroup.projectName,
      workId: selectedGroup.id,
      category: 'RAW_MATERIALS',
      itemName: matItemName.trim(),
      quantity: matQuantity || '10 Units',
      estimatedCost: estCostNum,
      urgency: matUrgency,
      requiredByDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: matNotes || 'Required on site for fabrication assembly.',
      status: 'PENDING_ACCOUNTS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onCreateMaterialRequest) {
      onCreateMaterialRequest(newReq);
    }

    // Post to group chat
    const reqMsg: ProjectGroupMessage = {
      id: `msg_mat_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'PURCHASE_REQUEST',
      text: `🛒 MATERIAL PURCHASE REQUEST: ${matItemName.trim()} (${matQuantity}) - Urgency: ${matUrgency}. Sent to Central Accounts Bucket.`,
      purchaseRequestId: reqId,
      purchaseRequestDetails: {
        itemName: matItemName.trim(),
        quantity: matQuantity || '10 Units',
        urgency: matUrgency,
        estimatedCost: estCostNum,
        status: 'PENDING_ACCOUNTS'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(reqMsg);

    setShowMaterialRequestModal(false);
    setMatItemName('');
    setMatQuantity('');
    setMatNotes('');
  };

  // Add/Remove Member from Group
  const handleToggleMember = (u: UserAccount) => {
    if (!selectedGroup) return;
    const exists = selectedGroup.members.some((m) => m.userId === u.id);
    let updatedMembers = [...selectedGroup.members];

    if (exists) {
      updatedMembers = updatedMembers.filter((m) => m.userId !== u.id);
      const leaveNotice: ProjectGroupMessage = {
        id: `msg_mem_${Date.now()}`,
        groupId: selectedGroup.id,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderRole: activeUser.role,
        type: 'SYSTEM',
        text: `👤 ${u.name} (${u.role.replace(/_/g, ' ')}) was removed from the project group by ${activeUser.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };
      onSendMessage(leaveNotice);
    } else {
      updatedMembers.push({
        userId: u.id,
        name: u.name,
        role: u.role,
        designation: u.designation,
        joinedAt: new Date().toISOString()
      });
      const joinNotice: ProjectGroupMessage = {
        id: `msg_mem_${Date.now()}`,
        groupId: selectedGroup.id,
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderRole: activeUser.role,
        type: 'SYSTEM',
        text: `👤 ${activeUser.name} added ${u.name} (${u.role.replace(/_/g, ' ')}) to this project group.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };
      onSendMessage(joinNotice);
    }

    onUpdateGroup({
      ...selectedGroup,
      members: updatedMembers
    });
  };

  // Change Group Status (e.g. Order Confirmed -> COMPLETED)
  const handleChangeGroupStatus = (newStatus: 'ONGOING' | 'COMPLETED' | 'ON_HOLD') => {
    if (!selectedGroup) return;
    onUpdateGroup({
      ...selectedGroup,
      status: newStatus
    });

    const statusNotice: ProjectGroupMessage = {
      id: `msg_stat_${Date.now()}`,
      groupId: selectedGroup.id,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'SYSTEM',
      text: newStatus === 'COMPLETED' 
        ? `🎉 ORDER CONFIRMED & DELIVERED! Project status marked as COMPLETED by ${activeUser.name}. Project handover archived to OneDrive.`
        : `⚡ Project status updated to ${newStatus} by ${activeUser.name}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    onSendMessage(statusNotice);
  };

  // Create New Group
  const handleCreateNewGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newClientName.trim()) return;

    const newId = `group_${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Default members: CRM person + Admin + Sub-Admin
    const adminUser = users.find((u) => u.role === 'ADMIN') || {
      id: 'user_admin',
      name: 'Shailesh Pandey',
      role: 'ADMIN' as UserRole,
      designation: 'Founder / MD'
    };
    const subAdminUser = users.find((u) => u.role === 'SUB_ADMIN') || {
      id: 'user_sub_admin',
      name: 'Dolly Dubey',
      role: 'SUB_ADMIN' as UserRole,
      designation: 'Operations & Management Head'
    };
    const crmUser = users.find((u) => u.role === 'CRM_EMPLOYEE') || {
      id: 'user_crm_1',
      name: 'Sonali Jamdulkar',
      role: 'CRM_EMPLOYEE' as UserRole,
      designation: 'Sales & Marketing Executive'
    };

    const initialMembers = [
      {
        userId: activeUser.id,
        name: activeUser.name,
        role: activeUser.role,
        designation: activeUser.designation,
        joinedAt: nowIso
      }
    ];

    const assignedCrmPerson = activeUser.role === 'CRM_EMPLOYEE' ? activeUser : crmUser;

    const newGrp: ProjectGroup = {
      id: newId,
      projectName: newGroupName.trim(),
      clientCompanyName: newClientName.trim(),
      clientId: `client_${Date.now()}`,
      brandName: newBrandName.trim() || newClientName.trim(),
      assignedCrmId: assignedCrmPerson.id,
      assignedCrmName: assignedCrmPerson.name,
      createdByUserId: activeUser.id,
      createdByName: activeUser.name,
      createdByRole: activeUser.role,
      status: 'ONGOING',
      oneDriveSyncedFolder: `OneDrive/KDPL_Projects/${newGroupName.trim().replace(/\s+/g, '_')}/`,
      createdAt: nowIso.split('T')[0],
      lastActivity: 'Just created',
      members: initialMembers,
      reminders: []
    };

    onAddGroup(newGrp);
    setSelectedGroupId(newId);

    // Initial Welcome Message
    const welcomeMsg: ProjectGroupMessage = {
      id: `msg_init_${Date.now()}`,
      groupId: newId,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      type: 'SYSTEM',
      text: `🚀 Project Group created for "${newGrp.projectName}". CRM Owner: ${activeUser.name}. Admin & Sub-Admin added by default. OneDrive cloud archive initialized at "${newGrp.oneDriveSyncedFolder}".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: nowIso
    };
    onSendMessage(welcomeMsg);

    setShowNewGroupModal(false);
    setNewGroupName('');
    setNewClientName('');
    setNewBrandName('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[640px]">
      {/* LEFT PANEL: WhatsApp-Style Project Group List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0">
        {/* Header with Search and New Group Action */}
        <div className="p-3.5 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                💬
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Project Chat Groups</h3>
                <span className="text-[10px] text-slate-400">WhatsApp-Style Dedicated Rooms</span>
              </div>
            </div>

            <button
              onClick={() => setShowNewGroupModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title="Create New Project Group"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">New Group</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search project groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-all"
            />
          </div>

          {/* Status Quick Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 text-[11px] font-bold">
            {(['ALL', 'ONGOING', 'COMPLETED', 'ON_HOLD'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer shrink-0 border ${
                  statusFilter === tab
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'ON_HOLD' ? 'Hold' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Group Cards List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No project groups match search.</p>
            </div>
          ) : (
            filteredGroups.map((g) => {
              const isSelected = selectedGroup?.id === g.id;
              const lastMsg = messages.filter((m) => m.groupId === g.id).slice(-1)[0];
              const pendingFilesCount = messages
                .filter((m) => m.groupId === g.id && m.file && m.file.status === 'PENDING_REVIEW')
                .length;

              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGroupId(g.id)}
                  className={`p-3 transition-colors cursor-pointer select-none flex items-start gap-2.5 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-100/70 bg-white'
                  }`}
                >
                  {/* Group Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                    g.status === 'COMPLETED' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {g.projectName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {g.projectName}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {lastMsg ? lastMsg.timestamp.split(' ')[0] : g.lastActivity}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium truncate mb-1">
                      {g.clientCompanyName}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[10px]">
                      <span className="text-slate-400 truncate flex-1">
                        {lastMsg?.type === 'FILE' 
                          ? `📎 File: ${lastMsg.file?.fileName}`
                          : lastMsg?.type === 'PURCHASE_REQUEST'
                          ? `🛒 Purchase Req: ${lastMsg.purchaseRequestDetails?.itemName}`
                          : lastMsg?.text || 'No messages yet'}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        {pendingFilesCount > 0 && (
                          <span className="bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full text-[9px] animate-pulse">
                            {pendingFilesCount} req
                          </span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded font-extrabold uppercase text-[9px] ${
                          g.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : g.status === 'ON_HOLD'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {g.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: Active Project Group Chat Room */}
      {selectedGroup ? (
        <div className="flex-1 flex flex-col bg-slate-100/50 min-w-0 h-full">
          {/* Top Bar of Active Chat */}
          <div className="p-3 sm:p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                {selectedGroup.projectName.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {selectedGroup.projectName}
                  </h3>
                  
                  {/* Status Dropdown */}
                  <select
                    value={selectedGroup.status}
                    onChange={(e) => handleChangeGroupStatus(e.target.value as any)}
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border cursor-pointer ${
                      selectedGroup.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : selectedGroup.status === 'ON_HOLD'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-blue-100 text-blue-900 border-blue-300'
                    }`}
                  >
                    <option value="ONGOING">🚀 Ongoing</option>
                    <option value="ON_HOLD">⏸️ On Hold</option>
                    <option value="COMPLETED">✅ Order Confirmed (Completed)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium truncate">
                  <span>Client: <strong className="text-slate-700">{selectedGroup.clientCompanyName}</strong></span>
                  <span>·</span>
                  <span>CRM Lead: <strong className="text-blue-600">{selectedGroup.assignedCrmName}</strong></span>
                  <span>·</span>
                  <span>{selectedGroup.members.length} Members</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Header Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Order Confirmation Quick Action */}
              {selectedGroup.status !== 'COMPLETED' ? (
                <button
                  type="button"
                  onClick={() => handleChangeGroupStatus('COMPLETED')}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                  title="Confirm Order & Complete Handover"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Order</span>
                </button>
              ) : (
                <div className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-black flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Order Confirmed (Completed)</span>
                </div>
              )}

              {/* Add/Remove Members Button */}
              <button
                type="button"
                onClick={() => setShowMemberModal(true)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                title="Add or Remove Project Members"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Members ({selectedGroup.members.length})</span>
              </button>

              {/* Set Reminder Button */}
              <button
                type="button"
                onClick={() => setShowReminderModal(true)}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-amber-200"
                title="Set Action Reminder for CRM / Project Updates"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Set Reminder</span>
                {(selectedGroup.reminders || []).filter(r => !r.completed).length > 0 && (
                  <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                    {(selectedGroup.reminders || []).filter(r => !r.completed).length}
                  </span>
                )}
              </button>

              {/* OneDrive Vault Button */}
              <button
                type="button"
                onClick={() => setShowOneDriveDrawer(true)}
                className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-sky-200"
                title="View Files Auto-Saved to Microsoft OneDrive"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">OneDrive ({approvedFiles.length})</span>
              </button>
            </div>
          </div>

          {/* Active Reminders Alert Bar (if any pending) */}
          {(selectedGroup.reminders || []).filter(r => !r.completed).length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-semibold gap-2">
              <div className="flex items-center gap-2 truncate">
                <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-bounce" />
                <span className="truncate">
                  Upcoming Action: <strong>{(selectedGroup.reminders || []).filter(r => !r.completed)[0].title}</strong> (Due: {(selectedGroup.reminders || []).filter(r => !r.completed)[0].dueDate})
                </span>
              </div>
              <button
                onClick={() => handleToggleReminder((selectedGroup.reminders || []).filter(r => !r.completed)[0].id)}
                className="text-[11px] bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded font-bold cursor-pointer shrink-0"
              >
                Mark Done
              </button>
            </div>
          )}

          {/* MESSAGE FEED (WhatsApp Style) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
            {/* Time-of-joining audit banner for members */}
            {!isManagementAuditor && activeMemberRecord && (
              <div className="flex justify-center my-1">
                <div className="bg-blue-50 border border-blue-200 text-blue-900 text-[10px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Privacy Active: You joined on {new Date(activeMemberRecord.joinedAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}. Showing messages from your joining time onwards.
                  </span>
                </div>
              </div>
            )}
            {isManagementAuditor && (
              <div className="flex justify-center my-1">
                <div className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium px-3 py-0.5 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Admin & CRM Master Audit View · All history visible (new members see messages from time of joining).</span>
                </div>
              </div>
            )}

            {groupMessages.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs">No messages yet in this project group.</p>
                <p className="text-[11px] text-slate-400">Send an update or upload design files below to start collaborating.</p>
              </div>
            ) : (
              groupMessages.map((msg) => {
                const isMe = msg.senderId === activeUser.id;

                // SYSTEM MESSAGE
                if (msg.type === 'SYSTEM') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-slate-200/80 text-slate-700 text-[11px] px-3 py-1 rounded-full font-medium max-w-lg text-center shadow-2xs">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                // REMINDER ALERT MESSAGE
                if (msg.type === 'REMINDER_ALERT') {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs px-3.5 py-1.5 rounded-xl font-bold max-w-md text-center shadow-2xs flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                // ACCOUNTS BUCKET UPDATE MESSAGE
                if (msg.type === 'ACCOUNTS_UPDATE') {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs p-3.5 rounded-2xl max-w-xl shadow-xs space-y-1.5">
                        <div className="flex items-center gap-2 font-black text-emerald-800 uppercase tracking-wide">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Accounts & Purchase Fulfillment Update</span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed font-medium">{msg.text}</p>
                        <div className="text-[10px] text-emerald-700 font-semibold text-right">
                          Verified at {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-2xl ${isMe ? 'ml-auto' : 'mr-auto'}`}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5 px-1">
                      <span className="font-bold text-slate-800">{msg.senderName}</span>
                      <span className="text-[9px] bg-slate-200 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                        {msg.senderRole.replace(/_/g, ' ')}
                      </span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Bubble Container */}
                    <div
                      className={`p-3 rounded-2xl shadow-xs text-xs space-y-2.5 ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                      }`}
                    >
                      {/* Text content if present */}
                      {msg.text && (
                        <p className="leading-relaxed font-normal whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* FILE CARD WITH 3-OPTION ACTION VERIFICATION */}
                      {msg.file && (
                        <div className={`rounded-xl p-3 border space-y-2.5 ${
                          isMe 
                            ? 'bg-blue-700/60 border-blue-400 text-white' 
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                                {msg.file.fileType === 'IMAGE' ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="truncate">
                                <h5 className="font-bold text-xs truncate">{msg.file.fileName}</h5>
                                <span className="text-[10px] opacity-80">{msg.file.fileType} · {msg.file.fileSize}</span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                              msg.file.status === 'APPROVED'
                                ? 'bg-emerald-500 text-white'
                                : msg.file.status === 'CORRECTION_REQUESTED'
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : msg.file.status === 'REJECTED'
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              {msg.file.status === 'APPROVED' ? '✅ Approved' : msg.file.status === 'CORRECTION_REQUESTED' ? '✏️ Correction' : msg.file.status === 'REJECTED' ? '❌ Rejected' : '⏳ Pending'}
                            </span>
                          </div>

                          {/* Image Thumbnail preview if image file */}
                          {msg.file.fileType === 'IMAGE' && msg.file.fileUrl && (
                            <div className="rounded-lg overflow-hidden border border-black/10 max-h-48 bg-slate-900">
                              <img src={msg.file.fileUrl} alt={msg.file.fileName} className="w-full h-auto object-cover max-h-48" />
                            </div>
                          )}

                          {/* OneDrive auto-saved banner if approved */}
                          {msg.file.savedToOneDrive && (
                            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold flex items-center gap-1.5 text-emerald-200">
                              <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Auto-Saved to OneDrive: {msg.file.oneDrivePath}</span>
                            </div>
                          )}

                          {/* Correction feedback note if present */}
                          {msg.file.correctionNotes && (
                            <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-400/40 text-[11px] space-y-0.5">
                              <span className="font-bold text-amber-300 block">Correction Notes ({msg.file.correctionReplyBy}):</span>
                              <p className="text-slate-100">{msg.file.correctionNotes}</p>
                            </div>
                          )}

                          {/* 3-ACTION BUTTONS (APPROVE / CORRECTION / REJECT) */}
                          <div className="pt-1.5 border-t border-white/20 flex flex-wrap items-center gap-1.5">
                            {/* 1. APPROVE BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleApproveFile(msg, msg.file!)}
                              disabled={msg.file.status === 'APPROVED'}
                              className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                msg.file.status === 'APPROVED'
                                  ? 'bg-emerald-600 text-white opacity-80 cursor-default'
                                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-2xs'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Approve</span>
                            </button>

                            {/* 2. CORRECTION BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenCorrection(msg.file!.id)}
                              className="flex-1 py-1 px-2 rounded-lg text-[11px] font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Correction</span>
                            </button>

                            {/* 3. REJECT BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenReject(msg.file!.id)}
                              className="flex-1 py-1 px-2 rounded-lg text-[11px] font-bold bg-rose-500 hover:bg-rose-400 text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>

                          {/* INLINE CORRECTION REPLY INPUT BOX */}
                          {activeCorrectionFileId === msg.file.id && (
                            <div className="p-2.5 rounded-lg bg-white text-slate-900 border border-amber-300 shadow-md space-y-2 animate-in fade-in duration-150">
                              <label className="block text-[11px] font-bold text-slate-800">
                                Write Correction & Markup Reply:
                              </label>
                              <textarea
                                rows={2}
                                value={correctionFeedbackText}
                                onChange={(e) => setCorrectionFeedbackText(e.target.value)}
                                placeholder="e.g. Please revise acrylic thickness to 5mm and adjust letter spacing..."
                                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveCorrectionFileId(null)}
                                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitCorrection(msg, msg.file!)}
                                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black rounded-lg cursor-pointer"
                                >
                                  Send Correction Reply
                                </button>
                              </div>
                            </div>
                          )}

                          {/* INLINE REJECTION REPLY INPUT BOX */}
                          {activeRejectFileId === msg.file.id && (
                            <div className="p-2.5 rounded-lg bg-white text-slate-900 border border-rose-300 shadow-md space-y-2 animate-in fade-in duration-150">
                              <label className="block text-[11px] font-bold text-rose-800">
                                Reason for Rejecting Deliverable:
                              </label>
                              <textarea
                                rows={2}
                                value={rejectionReasonText}
                                onChange={(e) => setRejectionReasonText(e.target.value)}
                                placeholder="Enter rejection reason (e.g. Dimensions mismatch, artwork non-compliant)..."
                                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-900"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveRejectFileId(null)}
                                  className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitReject(msg, msg.file!)}
                                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black rounded-lg cursor-pointer"
                                >
                                  Confirm Rejection
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MATERIAL REQUISITION CARD */}
                      {msg.type === 'PURCHASE_REQUEST' && msg.purchaseRequestDetails && (
                        <div className={`p-3 rounded-xl border space-y-1.5 ${
                          isMe ? 'bg-blue-700/60 border-blue-400 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-1.5">
                              <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                              <span>Material Requisition</span>
                            </span>
                            <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">
                              {msg.purchaseRequestDetails.urgency}
                            </span>
                          </div>
                          <div className="text-xs font-bold">{msg.purchaseRequestDetails.itemName}</div>
                          <div className="text-[11px] opacity-90">Qty: {msg.purchaseRequestDetails.quantity} · Est: ₹{msg.purchaseRequestDetails.estimatedCost?.toLocaleString('en-IN')}</div>
                          
                          {/* Accounts Reply in Card */}
                          {msg.purchaseRequestDetails.accountsReply ? (
                            <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-[11px] mt-1 text-emerald-100">
                              <strong className="block text-emerald-300">Accounts Bucket Reply:</strong>
                              <span>{msg.purchaseRequestDetails.accountsReply}</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-300 italic">
                              Pending Accounts Team verification in Central Bucket...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* CHAT INPUT BAR */}
          <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span className="text-[11px] text-slate-400">
                Active Group: <strong className="text-slate-800">{selectedGroup.projectName}</strong>
              </span>

              {/* Quick Actions Shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFileUploadModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Paperclip className="w-3 h-3" /> Attach File
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setShowMaterialRequestModal(true)}
                  className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ShoppingCart className="w-3 h-3" /> Request Material
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFileUploadModal(true)}
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-slate-200 shrink-0"
                title="Attach 2D/3D File or Drawing"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowMaterialRequestModal(true)}
                className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-slate-200 shrink-0"
                title="Request Material Purchase for Project"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder={`Type a message to ${selectedGroup.projectName}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendTextMessage();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              />

              <button
                type="button"
                onClick={handleSendTextMessage}
                disabled={!messageText.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select or create a project group to open the workspace.
        </div>
      )}

      {/* MODAL 1: ADD / REMOVE MEMBERS */}
      {showMemberModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Manage Project Group Members</h3>
              </div>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Add or remove internal stakeholders (Designers, PM, Site Supervisors, Accounts) for <strong>{selectedGroup.projectName}</strong>.
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              {users.map((u) => {
                const isMember = selectedGroup.members.some((m) => m.userId === u.id);
                return (
                  <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.designation || u.role.replace(/_/g, ' ')} · {u.email}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleMember(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isMember
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-2xs'
                      }`}
                    >
                      {isMember ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{isMember ? 'Remove' : 'Add to Group'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMemberModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SET ACTION REMINDER */}
      {showReminderModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveReminder} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Set Action Reminder for Project</h3>
              </div>
              <button type="button" onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reminder Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3D Render Sign-Off Call with Client"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details of action needed for CRM updates..."
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-xs"
              >
                Set Reminder Alert
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: FILE UPLOAD WITH 3-OPTION GATE */}
      {showFileUploadModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSendUploadedFile} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Upload Deliverable / Drawing</h3>
              </div>
              <button type="button" onClick={() => setShowFileUploadModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">File Category *</label>
                <select
                  value={uploadFileType}
                  onChange={(e) => setUploadFileType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="IMAGE">🖼️ 2D/3D Graphic Visual Render</option>
                  <option value="CAD">📐 Structural Engineering CAD Drawing</option>
                  <option value="PDF">📄 PDF Technical Blueprint / Document</option>
                  <option value="PPT">📊 Client Presentation Deck (.pptx)</option>
                  <option value="DOCUMENT">📑 Material Specifications Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">File Name / Deliverable Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Facade_3D_LED_Elevation_Rev2"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File from Desktop *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedDesktopFile(file);
                      setUploadFileName(file.name);
                      setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                      const ext = file.name.split('.').pop()?.toLowerCase();
                      if (ext === 'pdf') setUploadFileType('PDF');
                      else if (['dwg', 'dxf', 'cad'].includes(ext || '')) setUploadFileType('CAD');
                      else if (['ppt', 'pptx'].includes(ext || '')) setUploadFileType('PPT');
                      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) setUploadFileType('IMAGE');
                      else setUploadFileType('DOCUMENT');
                    }
                  }}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium text-xs bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <strong>Verification Workflow:</strong>
                <p>Once posted in the group, CRM and team can review with 3 buttons: <strong>Approve</strong> (auto-saves to OneDrive), <strong>Correction</strong> (inline markup reply), or <strong>Reject</strong>.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFileUploadModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Post to Project Group
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: REQUEST MATERIAL / PURCHASE INTO CENTRAL BUCKET */}
      {showMaterialRequestModal && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitMaterialRequest} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Request Material for Project</h3>
              </div>
              <button type="button" onClick={() => setShowMaterialRequestModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name & Specs *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50x50x2mm MS Hollow Square Pipes & SS Fasteners"
                  value={matItemName}
                  onChange={(e) => setMatItemName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30 Pcs / 15 Sheets"
                    value={matQuantity}
                    onChange={(e) => setMatQuantity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={matUrgency}
                    onChange={(e) => setMatUrgency(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="NORMAL">Normal (3-4 Days)</option>
                    <option value="HIGH">High (Tomorrow)</option>
                    <option value="EMERGENCY_IMMEDIATE">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={matEstCost}
                  onChange={(e) => setMatEstCost(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Delivery Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific delivery gate, receiver supervisor contact..."
                  value={matNotes}
                  onChange={(e) => setMatNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 space-y-1">
                <strong>Central Bucket Flow:</strong>
                <p>This request will appear in the <strong>Accounts Team's Central Purchase Bucket</strong>. When Accounts replies with PO/dispatch status, the update automatically appears right here in this project group!</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMaterialRequestModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Submit Requisition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DRAWER: ONEDRIVE AUTO-SAVED FILES */}
      {showOneDriveDrawer && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-5 shadow-2xl flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Microsoft OneDrive Cloud Vault</h3>
                  <span className="text-[10px] text-slate-400">Auto-Saved Approved Project Files</span>
                </div>
              </div>
              <button onClick={() => setShowOneDriveDrawer(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 font-mono flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="truncate">{selectedGroup.oneDriveSyncedFolder}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {approvedFiles.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                  <Cloud className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No approved files yet.</p>
                  <p className="text-[11px] text-slate-400">When CRM or team clicks "Approve" on any design, it automatically saves to this OneDrive folder.</p>
                </div>
              ) : (
                approvedFiles.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 hover:border-sky-400 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{f.fileName}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        Approved
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Approved by: {f.statusUpdatedByName || 'CRM Lead'} · {f.fileSize}
                    </div>
                    <div className="text-[10px] text-sky-700 font-mono truncate">
                      Path: {f.oneDrivePath || selectedGroup.oneDriveSyncedFolder}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowOneDriveDrawer(false)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE NEW PROJECT GROUP */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewGroup} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Create New Project Group Room</h3>
              </div>
              <button type="button" onClick={() => setShowNewGroupModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks Coffee - Connaught Place Outer Circle"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Starbucks Private Limited"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks Reserve"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                A separate group chat room will be created with automated OneDrive folders. You can immediately add Designers, PM, and Supervisors.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Create Group Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
