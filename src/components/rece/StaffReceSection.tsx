import React, { useState, useRef } from 'react';
import { WorkAssignment, ClientCompany, UserAccount } from '../../types';
import { compressImageFile } from '../../lib/fileUtils';
import { 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  CheckCircle, 
  Clock, 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  X, 
  Video, 
  CheckCircle2, 
  AlertCircle,
  Briefcase
} from 'lucide-react';

interface StaffReceSectionProps {
  works: WorkAssignment[];
  clients: ClientCompany[];
  activeUser: UserAccount;
  onUpdateWork: (updatedWork: WorkAssignment) => void;
}

export const StaffReceSection: React.FC<StaffReceSectionProps> = ({
  works,
  clients,
  activeUser,
  onUpdateWork
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'ASSIGNED' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Submission Modal state
  const [selectedWorkForRece, setSelectedWorkForRece] = useState<WorkAssignment | null>(null);
  const [receNotes, setReceNotes] = useState('');
  
  // Camera capture states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Document files uploaded
  const [uploadedDocNames, setUploadedDocNames] = useState<string[]>([]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera hardware unavailable or permission denied. Using simulated snapshot.");
      setCapturedImages((prev) => [...prev, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80']);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImages((prev) => [...prev, dataUrl]);
      }
    } else {
      setCapturedImages((prev) => [...prev, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80']);
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const names: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      names.push(f.name);
      if (f.type.startsWith('image/')) {
        compressImageFile(f).then((dataUrl) => {
          if (dataUrl) {
            setCapturedImages((prev) => [...prev, dataUrl]);
          }
        });
      }
    }
    setUploadedDocNames((prev) => [...prev, ...names]);
  };

  const handleSubmitReceCompletion = () => {
    if (!selectedWorkForRece) return;
    const updated: WorkAssignment = {
      ...selectedWorkForRece,
      receStatus: 'COMPLETED',
      receUpdatedByName: activeUser.name,
      receUpdatedByRole: activeUser.role,
      receSubmission: {
        notes: receNotes || 'Completed RECE visit & documentation as assigned.',
        imageUrls: capturedImages,
        documentNames: uploadedDocNames,
        submittedAt: new Date().toLocaleString(),
        submittedBy: `${activeUser.name} (${activeUser.role})`
      },
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    stopCamera();
    setSelectedWorkForRece(null);
    setReceNotes('');
    setCapturedImages([]);
    setUploadedDocNames([]);
  };

  const filteredWorks = works.filter((w) => {
    const client = clients.find((c) => c.id === w.clientId);
    const matchesSearch = 
      w.workTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.clientCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.assignedPersonName && w.assignedPersonName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client && (client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm)));

    if (!matchesSearch) return false;
    if (filterTab === 'ASSIGNED') return w.receStatus !== 'COMPLETED';
    if (filterTab === 'COMPLETED') return w.receStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold uppercase tracking-wider mb-2 border border-indigo-500/30">
              <MapPin className="w-3.5 h-3.5" /> Client & Site RECE Visit Hub
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex flex-wrap items-center gap-2">
              <span>Assigned Client & Site RECE Visits</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-mono">
                12' x 18' PLAN • BLUEPRINT
              </span>
            </h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
            <div className="text-[10px] text-indigo-300 uppercase font-bold">Staff Member</div>
            <div className="text-sm font-extrabold text-white">{activeUser.name} ({activeUser.role})</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Assigned ({works.length})
          </button>
          <button
            onClick={() => setFilterTab('ASSIGNED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'ASSIGNED'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pending RECE Visits ({works.filter(w => w.receStatus !== 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilterTab('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'COMPLETED'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed & Submitted ({works.filter(w => w.receStatus === 'COMPLETED').length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client, brand or assigned person..."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Work / Client / Site Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWorks.map((work) => {
          const client = clients.find((c) => c.id === work.clientId);
          const isCompleted = work.receStatus === 'COMPLETED';

          return (
            <div 
              key={work.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      Work ID: {work.id}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{work.workTitle}</h3>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {isCompleted ? 'COMPLETED' : 'ASSIGNED VISIT'}
                  </span>
                </div>

                {/* Assignment Info Badge */}
                <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex justify-between items-center text-indigo-900 font-bold">
                    <span>Assigned Person:</span>
                    <span className="bg-indigo-200/80 text-indigo-950 px-2 py-0.5 rounded text-[11px]">
                      {work.assignedPersonName || work.submittedByCrmName || 'Assigned by Meenakshi'}
                    </span>
                  </div>
                  {work.assignmentNotes && (
                    <div className="text-[11px] text-slate-700 italic">Instructions: "{work.assignmentNotes}"</div>
                  )}
                </div>

                {/* Client & Site Details Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{work.clientCompanyName} ({work.brandName})</span>
                  </div>

                  {client && (
                    <>
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Contact: <strong>{client.contactPerson}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Phone: <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">{client.phone}</a></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600 pt-1 border-t border-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed">{client.address}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Submission Preview if completed */}
                {work.receSubmission && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> RECE Completed Submission:
                    </div>
                    <p className="text-slate-700 text-[11px] italic">"{work.receSubmission.notes}"</p>
                    <div className="text-[10px] text-emerald-700 font-mono">
                      By {work.receSubmission.submittedBy} on {work.receSubmission.submittedAt}
                    </div>
                    {work.receSubmission.imageUrls?.length > 0 && (
                      <div className="flex gap-1.5 pt-1 overflow-x-auto">
                        {work.receSubmission.imageUrls.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Submission"
                            onClick={() => {
                              if (window.showGlobalImageViewer) {
                                window.showGlobalImageViewer(img, `Site Submission Picture ${idx + 1} - ${work.brandName}`);
                              }
                            }}
                            className="w-10 h-10 object-cover rounded border border-emerald-300 cursor-pointer hover:scale-110 hover:border-emerald-500 duration-200 transition-all shadow-xs"
                            title="Click to view full screen"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Upload Documents / Camera & Submit */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedWorkForRece(work);
                    setReceNotes(work.receSubmission?.notes || '');
                    setCapturedImages(work.receSubmission?.imageUrls || []);
                    setUploadedDocNames(work.receSubmission?.documentNames || []);
                  }}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCompleted ? 'Edit / Update RECE Submission' : 'Upload Files & Camera Snap to Complete'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredWorks.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No assigned client or site visits found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or filter category.</p>
          </div>
        )}
      </div>

      {/* Modal: Submit RECE Completion with Camera & File Upload */}
      {selectedWorkForRece && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-indigo-600" />
                  RECE Completion & Submission Desk
                </h3>
                <p className="text-xs text-slate-500">
                  Site/Client: {selectedWorkForRece.clientCompanyName} / {selectedWorkForRece.workTitle}
                </p>
              </div>
              <button 
                onClick={() => { stopCamera(); setSelectedWorkForRece(null); }} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* OneDrive Folder Sync Path Banner */}
              <a
                href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium transition-all cursor-pointer group shadow-2xs"
                title="Open Central OneDrive Storage"
              >
                <div className="flex items-center gap-2 font-bold">
                  <Briefcase className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
                  <span>OneDrive Folder Sync Target:</span>
                </div>
                <span className="font-mono font-bold text-blue-950 underline">{`OneDrive / KAMLAWATI CRM PORTAL / ${activeUser.name.replace(/\s+/g, '_')} - ${new Date().toISOString().split('T')[0]} - ${selectedWorkForRece.brandName.replace(/\s+/g, '_')}`} ↗</span>
              </a>

              {/* Notes input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">RECE Visit & Execution Completion Notes:</label>
                <textarea
                  value={receNotes}
                  onChange={(e) => setReceNotes(e.target.value)}
                  placeholder="Enter detailed notes regarding site visit, client discussion, measurements, or completion status..."
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              {/* Camera Capture Section */}
              <div className="space-y-3 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2 text-indigo-300">
                    <Camera className="w-4 h-4" /> Live Camera / Site Photo Capture
                  </span>
                  <span className="text-[10px] text-slate-400">Captured: {capturedImages.length} photos</span>
                </div>

                {cameraError && (
                  <p className="text-[11px] text-amber-300 bg-amber-900/40 p-2 rounded border border-amber-700/50">
                    {cameraError}
                  </p>
                )}

                {/* Viewfinder */}
                <div className="relative aspect-video max-h-56 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  {isCameraActive ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        LIVE CAMERA
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2 text-slate-400">
                      <Video className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">Camera ready</p>
                      <p className="text-[11px] text-slate-500">Click below to open live camera and snap site/visit photo.</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {isCameraActive ? (
                    <button
                      type="button"
                      onClick={takeSnapshot}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4" /> TAKE SNAPSHOT NOW
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Camera className="w-4 h-4" /> Open Camera Feed
                    </button>
                  )}
                </div>

                {/* Captured Images Thumbnail Preview */}
                {capturedImages.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-300">Captured Photos (Click to view full screen):</div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {capturedImages.map((img, idx) => (
                        <div key={idx} className="relative shrink-0 group">
                          <img
                            src={img}
                            alt={`Capture ${idx}`}
                            onClick={() => {
                              if (window.showGlobalImageViewer) {
                                window.showGlobalImageViewer(img, `Live Captured Photo #${idx + 1}`);
                              }
                            }}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-700 cursor-pointer hover:scale-105 duration-200 transition-all shadow-md"
                            title="Click to view full screen"
                          />
                          <button
                            onClick={() => setCapturedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm cursor-pointer font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Document / File Upload Section */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" /> Upload Documents or Images (PDF, DOC, JPG, PNG):
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />

                {uploadedDocNames.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-bold text-slate-600">Attached Files:</div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {uploadedDocNames.map((name, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                          <span className="truncate text-slate-800 font-medium flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" /> {name}
                          </span>
                          <button
                            onClick={() => setUploadedDocNames(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-600 hover:text-rose-800 font-bold px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => { stopCamera(); setSelectedWorkForRece(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReceCompletion}
                className="px-6 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Save & Submit RECE Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
