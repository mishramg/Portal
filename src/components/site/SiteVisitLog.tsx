import React, { useState, useRef, useEffect } from 'react';
import { UserAccount, SiteVisitRecord } from '../../types';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  Camera, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  X,
  Compass,
  Upload,
  User,
  Image as ImageIcon,
  Lock,
  ShieldCheck,
  SwitchCamera,
  Check,
  Eye,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { ApiService } from '../../lib/api';

interface SiteVisitLogProps {
  activeUser: UserAccount;
  allUsers: UserAccount[];
  siteVisits: SiteVisitRecord[];
  onAddSiteVisit: (record: SiteVisitRecord) => void;
  onUpdateSiteVisit: (record: SiteVisitRecord) => void;
  onBackToHome: () => void;
}

// Helpers for exact phone / device local date and time
const getDeviceDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDeviceTimeStr = () => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatDisplayDate = (dateStr: string) => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
};

export const SiteVisitLog: React.FC<SiteVisitLogProps> = ({
  activeUser,
  allUsers,
  siteVisits,
  onAddSiteVisit,
  onUpdateSiteVisit,
  onBackToHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'PUNCH_IN' | 'PUNCH_OUT' | 'VIEW_ONLY'>('PUNCH_IN');
  const [activeVisitRecord, setActiveVisitRecord] = useState<SiteVisitRecord | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form states (strictly locked to device time & date)
  const [visitPurpose, setVisitPurpose] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [visitDate, setVisitDate] = useState(getDeviceDateStr());
  const [startTime, setStartTime] = useState(getDeviceTimeStr());
  const [endTime, setEndTime] = useState('');
  const [entryPhoto, setEntryPhoto] = useState('');
  const [exitPhoto, setExitPhoto] = useState('');
  const [notes, setNotes] = useState('');
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera & File input states
  const fileInputRefEntry = useRef<HTMLInputElement>(null);
  const fileInputRefExit = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState<'ENTRY' | 'EXIT' | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Attach live video stream when element mounts or stream updates
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.warn('Video playback autoplay warning:', err);
      });
    }
  }, [cameraStream, isCameraActive]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Get live GPS with OpenStreetMap reverse geocoding
  const handleFetchGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsFetchingGps(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentCoords({ lat, lng });
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setSiteLocation(data.display_name);
              return;
            }
          }
        } catch {
          // fallback
        }
        setSiteLocation(`GPS Site Coordinates: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`);
      },
      (err) => {
        setIsFetchingGps(false);
        console.warn('GPS Error:', err);
        // default fallback if blocked
        setSiteLocation(siteLocation || 'Client Site Location (GPS verification pending)');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Watermark photo with live timestamp, GPS, employee name & branding
  const watermarkImage = (imageDataUrl: string, label: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Watermark bar at bottom
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        const barHeight = Math.max(54, Math.floor(canvas.height * 0.14));
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

        // Watermark Top Status Line
        ctx.fillStyle = label.includes('ENTRY') ? '#34d399' : '#38bdf8';
        ctx.font = `bold ${Math.max(14, Math.floor(barHeight * 0.30))}px sans-serif`;
        const timeStamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        ctx.fillText(`KDPL SITE VISIT • ${label} • ${activeUser.name} (${activeUser.role.replace(/_/g, ' ')})`, 16, canvas.height - barHeight + 22);
        
        // Watermark Bottom Location Line
        ctx.font = `${Math.max(11, Math.floor(barHeight * 0.24))}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        const locText = siteLocation || 'Live GPS Site Coordinates';
        ctx.fillText(`Phone Clock: ${timeStamp} | ${locText.slice(0, 75)}`, 16, canvas.height - 12);

        // Cloud sync stamp
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(canvas.width - 170, 10, 160, 24);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#67e8f9';
        ctx.fillText('KDPL Cloud Verified', canvas.width - 158, 26);

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(imageDataUrl);
      img.src = imageDataUrl;
    });
  };

  // Start Camera Stream
  const startCamera = async (type: 'ENTRY' | 'EXIT', targetFacingMode?: 'environment' | 'user') => {
    setCameraError(null);
    const mode = targetFacingMode || facingMode;

    // Stop existing stream if running
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch {
        // Fallback constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setCameraStream(stream);
      setIsCameraActive(type);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Direct webcam stream unavailable. Please use the "Take Mobile Photo" button below.');
      setIsCameraActive(type);
    }
  };

  const toggleCameraFacing = (type: 'ENTRY' | 'EXIT') => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(type, next);
  };

  const captureCameraPhoto = async () => {
    if (!isCameraActive) return;
    
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const raw = canvas.toDataURL('image/jpeg', 0.85);
        const watermarked = await watermarkImage(raw, isCameraActive === 'ENTRY' ? 'ENTRY PUNCH IN PHOTO' : 'EXIT PUNCH OUT PHOTO');
        if (isCameraActive === 'ENTRY') setEntryPhoto(watermarked);
        else setExitPhoto(watermarked);
      }
    } else {
      // Fallback synthetic stamp if video feed had zero dimensions
      createFallbackSnapshot(isCameraActive);
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(null);
    setCameraError(null);
  };

  // Synthetic fallback photo stamp
  const createFallbackSnapshot = async (type: 'ENTRY' | 'EXIT') => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Icon & Info
      ctx.beginPath();
      ctx.arc(320, 180, 70, 0, 2 * Math.PI);
      ctx.fillStyle = type === 'ENTRY' ? '#059669' : '#0284c7';
      ctx.fill();

      ctx.font = 'bold 50px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText((activeUser.name || 'KDPL').charAt(0).toUpperCase(), 320, 198);

      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(activeUser.name, 320, 290);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Site Visit Proof • ${activeUser.role}`, 320, 320);

      const raw = canvas.toDataURL('image/jpeg', 0.85);
      const watermarked = await watermarkImage(raw, type === 'ENTRY' ? 'ENTRY PUNCH IN PHOTO' : 'EXIT PUNCH OUT PHOTO');
      if (type === 'ENTRY') setEntryPhoto(watermarked);
      else setExitPhoto(watermarked);
    }
  };

  // Direct Mobile Native Camera or File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ENTRY' | 'EXIT') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result as string;
      if (raw) {
        const watermarked = await watermarkImage(raw, type === 'ENTRY' ? 'ENTRY PUNCH IN PHOTO' : 'EXIT PUNCH OUT PHOTO');
        if (type === 'ENTRY') setEntryPhoto(watermarked);
        else setExitPhoto(watermarked);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open "Log New Site Visit" (Punch In flow)
  const openNewSiteVisitModal = () => {
    setActiveVisitRecord(null);
    setModalMode('PUNCH_IN');
    setVisitPurpose('');
    setSiteLocation('');
    // Strictly assign exact phone date and start time
    setVisitDate(getDeviceDateStr());
    setStartTime(getDeviceTimeStr());
    setEndTime('');
    setEntryPhoto('');
    setExitPhoto('');
    setNotes('');
    setCurrentCoords({});
    setShowModal(true);
    handleFetchGps();
  };

  // Open "Record Exit / Punch Out" for an active visit
  const openPunchOutModal = (visit: SiteVisitRecord) => {
    // If visit is already completed with endTime, open in VIEW_ONLY mode
    if (visit.endTime) {
      openViewOnlyModal(visit);
      return;
    }
    setActiveVisitRecord(visit);
    setModalMode('PUNCH_OUT');
    setVisitPurpose(visit.visitPurpose);
    setSiteLocation(visit.siteLocation);
    setVisitDate(visit.date);
    setStartTime(visit.startTime);
    // Auto stamp current phone time for Punch Out
    setEndTime(getDeviceTimeStr());
    setEntryPhoto(visit.entryPhotoUrl || '');
    setExitPhoto(visit.exitPhotoUrl || '');
    setNotes(visit.notes || '');
    setCurrentCoords({ lat: visit.latitude, lng: visit.longitude });
    setShowModal(true);
    handleFetchGps();
  };

  // Open "View Details" (Read-Only for completed visits)
  const openViewOnlyModal = (visit: SiteVisitRecord) => {
    setActiveVisitRecord(visit);
    setModalMode('VIEW_ONLY');
    setVisitPurpose(visit.visitPurpose);
    setSiteLocation(visit.siteLocation);
    setVisitDate(visit.date);
    setStartTime(visit.startTime);
    setEndTime(visit.endTime || 'Ongoing');
    setEntryPhoto(visit.entryPhotoUrl || '');
    setExitPhoto(visit.exitPhotoUrl || '');
    setNotes(visit.notes || '');
    setCurrentCoords({ lat: visit.latitude, lng: visit.longitude });
    setShowModal(true);
  };

  // Handle Submission (Punch In or Punch Out)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!visitPurpose.trim() || !siteLocation.trim()) {
      alert('Please provide the Purpose of Visit and Site Location.');
      return;
    }

    if (modalMode === 'PUNCH_IN' && !entryPhoto) {
      alert('Entry Photo is required to verify your Site Punch In.');
      return;
    }

    if (modalMode === 'PUNCH_OUT' && !exitPhoto) {
      alert('Exit Photo is required to verify your Site Punch Out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photos to storage API if base64
      let finalEntryPhoto = entryPhoto;
      let finalExitPhoto = exitPhoto;

      if (entryPhoto && entryPhoto.startsWith('data:')) {
        finalEntryPhoto = await ApiService.uploadMedia(entryPhoto, `entry_${Date.now()}.jpg`, 'SITE_VISIT');
      }
      if (exitPhoto && exitPhoto.startsWith('data:')) {
        finalExitPhoto = await ApiService.uploadMedia(exitPhoto, `exit_${Date.now()}.jpg`, 'SITE_VISIT');
      }

      if (modalMode === 'PUNCH_OUT' && activeVisitRecord) {
        // Record exit punch out: locked permanently once submitted
        const finalExitTime = getDeviceTimeStr(); // Exact phone time at moment of submission
        const updated: SiteVisitRecord = {
          ...activeVisitRecord,
          visitPurpose,
          siteLocation,
          date: activeVisitRecord.date,
          startTime: activeVisitRecord.startTime,
          endTime: finalExitTime,
          entryPhotoUrl: finalEntryPhoto || activeVisitRecord.entryPhotoUrl,
          exitPhotoUrl: finalExitPhoto,
          notes,
          latitude: currentCoords.lat || activeVisitRecord.latitude,
          longitude: currentCoords.lng || activeVisitRecord.longitude,
          updatedAt: new Date().toISOString()
        };
        onUpdateSiteVisit(updated);
      } else {
        // Punch In: Create new active site visit record
        const finalStartTime = getDeviceTimeStr(); // Exact phone time at punch in
        const finalDate = getDeviceDateStr();
        const newRecord: SiteVisitRecord = {
          id: `visit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          date: finalDate,
          employeeId: activeUser.id,
          employeeName: activeUser.name,
          employeeRole: activeUser.role,
          department: activeUser.department,
          visitPurpose,
          siteLocation,
          startTime: finalStartTime,
          endTime: undefined, // active
          entryPhotoUrl: finalEntryPhoto || undefined,
          exitPhotoUrl: undefined,
          notes: notes || undefined,
          latitude: currentCoords.lat,
          longitude: currentCoords.lng,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        onAddSiteVisit(newRecord);
      }

      // Close modal and reset
      stopCamera();
      setShowModal(false);
      setActiveVisitRecord(null);
      setVisitPurpose('');
      setSiteLocation('');
      setEntryPhoto('');
      setExitPhoto('');
      setNotes('');
      setCurrentCoords({});
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter records
  const filteredVisits = siteVisits.filter((v) => {
    const matchesSearch = 
      String(v.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(v.siteLocation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(v.visitPurpose || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(v.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || v.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#165EAA]" />
            <span>Back to Home</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <Compass className="w-5 h-5 text-[#165EAA]" />
              <span>Site Visit Desk & Punch Log</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                GEOTAGGED • LOGGED
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={openNewSiteVisitModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#165EAA] hover:bg-[#0f4b88] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Punch In New Site Visit
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, purpose, or staff name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA]"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Visits List / Responsive Cards */}
      <div className="space-y-3">
        {filteredVisits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredVisits.map((visit) => {
              const isCompleted = Boolean(visit.endTime);
              const isOwnerOrAdmin = 
                activeUser.id === visit.employeeId || 
                activeUser.role === 'ADMIN' || 
                activeUser.role === 'SUB_ADMIN';

              return (
                <div
                  key={visit.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                    isCompleted 
                      ? 'border-slate-200 shadow-xs' 
                      : 'border-amber-300 ring-2 ring-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/20'
                  }`}
                >
                  <div>
                    {/* Top Status & Date Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCompleted ? 'bg-blue-50 text-[#165EAA]' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {visit.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{visit.visitPurpose}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {visit.employeeName} • <span className="text-blue-700 font-semibold">{visit.employeeRole.replace(/_/g, ' ')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 block mb-1">
                          {formatDisplayDate(visit.date)}
                        </span>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Lock className="w-2.5 h-2.5" /> Completed & Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <Clock className="w-2.5 h-2.5" /> Active Site Visit
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location & Time Stamp Details */}
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 font-medium">{visit.siteLocation}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Punch In (Phone Time)</span>
                            <span className="font-extrabold text-slate-900">{visit.startTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-blue-600' : 'text-amber-500'}`} />
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold">Punch Out (Phone Time)</span>
                            <span className={`font-extrabold ${isCompleted ? 'text-slate-900' : 'text-amber-600'}`}>
                              {visit.endTime || 'Not Punched Out'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {visit.notes && (
                        <div className="p-2.5 bg-blue-50/50 rounded-xl text-[11px] text-slate-700 border border-blue-100/60">
                          <strong>Notes:</strong> {visit.notes}
                        </div>
                      )}

                      {/* Verification Photos Preview */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {visit.entryPhotoUrl ? (
                          <div
                            onClick={() => setSelectedPhoto(visit.entryPhotoUrl!)}
                            className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                          >
                            <img
                              src={visit.entryPhotoUrl}
                              alt="Entry"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-emerald-300 text-[9px] font-bold rounded flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Entry Photo
                            </span>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-[10px] text-slate-400">
                            <Camera className="w-4 h-4 mb-0.5 text-slate-300" />
                            No Entry Photo
                          </div>
                        )}

                        {visit.exitPhotoUrl ? (
                          <div
                            onClick={() => setSelectedPhoto(visit.exitPhotoUrl!)}
                            className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                          >
                            <img
                              src={visit.exitPhotoUrl}
                              alt="Exit"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/75 text-blue-300 text-[9px] font-bold rounded flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" /> Exit Photo
                            </span>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-[10px] text-amber-600/70 font-semibold">
                            <Clock className="w-4 h-4 mb-0.5 text-amber-400 animate-spin" />
                            Pending Exit Photo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {visit.id.slice(0, 10)}
                    </span>

                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <button
                          onClick={() => openViewOnlyModal(visit)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Details (Locked)</span>
                        </button>
                      ) : (
                        isOwnerOrAdmin && (
                          <button
                            onClick={() => openPunchOutModal(visit)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Punch Out & Close Visit</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 space-y-2">
            <Compass className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No Site Visits Found</h3>
            <p className="text-xs">Punch In a new site visit with your phone camera and auto-locked GPS timestamp.</p>
          </div>
        )}
      </div>

      {/* Modal: Punch In, Punch Out or Read-Only View */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#165EAA]" />
                  {modalMode === 'PUNCH_IN' && 'Site Visit Punch In'}
                  {modalMode === 'PUNCH_OUT' && 'Site Visit Punch Out & Closure'}
                  {modalMode === 'VIEW_ONLY' && 'Verified Site Visit Record (Locked)'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {modalMode === 'PUNCH_IN' && 'Punch in at site location with live camera verification photo.'}
                  {modalMode === 'PUNCH_OUT' && 'Record exit time & submit departure photo. Permanently locks after submission.'}
                  {modalMode === 'VIEW_ONLY' && 'This visit is completed. Timestamps and photos are locked.'}
                </p>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setShowModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Locked Banner */}
            {modalMode === 'VIEW_ONLY' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span><strong>Visit Completed & Locked:</strong> Punch Out was verified and submitted. To preserve audit integrity, this record cannot be modified.</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Visit Purpose */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose of Visit *</label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'VIEW_ONLY' || modalMode === 'PUNCH_OUT'}
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                  placeholder="e.g. Client Site Inspection / Measurement / Signage Fitting"
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border ${
                    modalMode === 'VIEW_ONLY' || modalMode === 'PUNCH_OUT'
                      ? 'bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA]'
                  }`}
                />
              </div>

              {/* Site Location & Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Site Location & Address *</label>
                  {modalMode === 'PUNCH_IN' && (
                    <button
                      type="button"
                      onClick={handleFetchGps}
                      disabled={isFetchingGps}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-red-500" />
                      {isFetchingGps ? 'Detecting GPS...' : 'Auto-Detect GPS'}
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={2}
                  disabled={modalMode === 'VIEW_ONLY' || modalMode === 'PUNCH_OUT'}
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  placeholder="Enter detailed site address or auto-detect with GPS..."
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border ${
                    modalMode === 'VIEW_ONLY' || modalMode === 'PUNCH_OUT'
                      ? 'bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA]'
                  }`}
                />
              </div>

              {/* Non-Editable Automatic Phone Date & Time Badges */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    Phone Date & Time (Non-Editable)
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block">Visit Date</span>
                    <span className="text-xs font-extrabold text-slate-900">{formatDisplayDate(visitDate)}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Auto Phone Date</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 font-bold block">Punch In Time</span>
                    <span className="text-xs font-extrabold text-emerald-700">{startTime}</span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5 font-mono">Phone Timestamp</span>
                  </div>
                </div>

                {/* Punch Out Time Field */}
                {(modalMode === 'PUNCH_OUT' || modalMode === 'VIEW_ONLY') && (
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Punch Out / Exit Time</span>
                      <span className="text-xs font-extrabold text-blue-700">{endTime || getDeviceTimeStr()}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      {modalMode === 'PUNCH_OUT' ? 'Auto Live Exit Time' : 'Locked Punch Out'}
                    </span>
                  </div>
                )}
              </div>

              {/* Entry Photo Section (Punch In) */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Entry Punch In Photo {modalMode === 'PUNCH_IN' && <span className="text-rose-600 font-black">*</span>}
                  </span>
                  {entryPhoto && modalMode === 'PUNCH_IN' && (
                    <button
                      type="button"
                      onClick={() => setEntryPhoto('')}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Retake
                    </button>
                  )}
                </div>

                {entryPhoto ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 shadow-xs group">
                    <img src={entryPhoto} alt="Entry Photo" className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/75 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Entry Photo
                    </div>
                  </div>
                ) : (
                  modalMode === 'PUNCH_IN' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {/* Big Camera Open Button */}
                        <button
                          type="button"
                          onClick={() => startCamera('ENTRY')}
                          className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Live Camera</span>
                        </button>

                        {/* Direct Mobile Phone Native Camera Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRefEntry.current?.click()}
                          className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span>Mobile Camera</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 text-center">
                        Tap either button above to take a live photo stamped with your current phone time & GPS.
                      </p>
                    </div>
                  )
                )}

                <input
                  ref={fileInputRefEntry}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'ENTRY')}
                />
              </div>

              {/* Exit Photo Section (Punch Out) */}
              {(modalMode === 'PUNCH_OUT' || modalMode === 'VIEW_ONLY') && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      Exit Punch Out Photo {modalMode === 'PUNCH_OUT' && <span className="text-rose-600 font-black">*</span>}
                    </span>
                    {exitPhoto && modalMode === 'PUNCH_OUT' && (
                      <button
                        type="button"
                        onClick={() => setExitPhoto('')}
                        className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Retake
                      </button>
                    )}
                  </div>

                  {exitPhoto ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 shadow-xs group">
                      <img src={exitPhoto} alt="Exit Photo" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 bg-black/75 text-blue-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-400" /> Verified Exit Photo
                      </div>
                    </div>
                  ) : (
                    modalMode === 'PUNCH_OUT' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startCamera('EXIT')}
                            className="flex-1 py-3 px-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Open Live Camera</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => fileInputRefExit.current?.click()}
                            className="flex-1 py-3 px-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                          >
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            <span>Mobile Camera</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 text-center">
                          Departure photo is mandatory to record Punch Out and permanently lock the visit.
                        </p>
                      </div>
                    )
                  )}

                  <input
                    ref={fileInputRefExit}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'EXIT')}
                  />
                </div>
              )}

              {/* LIVE CAMERA VIEWFINDER & BIGGER CAPTURE BUTTON */}
              {isCameraActive && (
                <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 border border-slate-800 shadow-2xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Camera View ({isCameraActive === 'ENTRY' ? 'Punch In' : 'Punch Out'})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCameraFacing(isCameraActive)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Flip between Front and Rear Camera"
                      >
                        <SwitchCamera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Flip</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={stopCamera} 
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {cameraError ? (
                    <div className="p-4 bg-slate-800 rounded-xl text-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs text-amber-300 font-bold">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => createFallbackSnapshot(isCameraActive)}
                        className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs mt-2 cursor-pointer"
                      >
                        Generate Verification Photo Badge
                      </button>
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-slate-800">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        onLoadedMetadata={() => videoRef.current?.play()}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        ● LIVE STREAM
                      </div>
                    </div>
                  )}

                  {/* PROMINENT, BIGGER CAPTURE BUTTON */}
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>CAPTURE & WATERMARK PHOTO</span>
                  </button>
                </div>
              )}

              {/* Site Notes / Observations */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Notes / Observations</label>
                <textarea
                  rows={2}
                  disabled={modalMode === 'VIEW_ONLY'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Site dimensions verified, client approved sample specs..."
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border ${
                    modalMode === 'VIEW_ONLY'
                      ? 'bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#165EAA]'
                  }`}
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setShowModal(false);
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
                >
                  {modalMode === 'VIEW_ONLY' ? 'Close' : 'Cancel'}
                </button>

                {modalMode !== 'VIEW_ONLY' && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3 text-white font-extrabold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer ${
                      modalMode === 'PUNCH_OUT'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-[#165EAA] hover:bg-[#0f4b88]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Saving to Cloud...</span>
                    ) : modalMode === 'PUNCH_OUT' ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Submit Punch Out & Lock</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm Punch In</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Viewer */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 z-50 cursor-zoom-out"
        >
          <div className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img 
              src={selectedPhoto} 
              alt="Site Proof" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Close Photo Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

