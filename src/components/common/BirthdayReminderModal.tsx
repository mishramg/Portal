import React, { useState, useEffect } from 'react';
import { UserAccount, BirthdayWish, UserRole } from '../../types';
import { 
  X, 
  Send, 
  Calendar,
  Users,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Clock,
  Award,
  Heart,
  ThumbsUp,
  Sparkles
} from 'lucide-react';

interface BirthdayReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  allUsers: UserAccount[];
  wishes: BirthdayWish[];
  onSendWish: (wish: Omit<BirthdayWish, 'id' | 'createdAt'>) => void;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Parse date of birth strings like "07 September 2001", "21 March 1995", "05-11-1992", "1992-11-05"
export function parseDateOfBirth(dobStr?: string): { day: number; month: number } | null {
  if (!dobStr) return null;
  const str = dobStr.trim();
  
  const monthNamesLower = [
    "january", "february", "march", "april", "may", "june", 
    "july", "august", "september", "october", "november", "december"
  ];
  
  // Match "DD Month YYYY" or "DD Month"
  const wordMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)(?:\s+\d{4})?/);
  if (wordMatch) {
    const day = parseInt(wordMatch[1], 10);
    const monthIndex = monthNamesLower.indexOf(wordMatch[2].toLowerCase());
    if (!isNaN(day) && monthIndex !== -1) {
      return { day, month: monthIndex };
    }
  }

  // Match "DD-MM-YYYY" or "DD/MM/YYYY" or "YYYY-MM-DD"
  if (str.includes('-') || str.includes('/')) {
    const parts = str.split(/[-/]/);
    if (parts.length >= 2) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month)) return { day, month };
      } else {
        // DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        if (!isNaN(day) && !isNaN(month)) return { day, month };
      }
    }
  }

  return null;
}

// Get employees who have birthdays in the CURRENT MONTH ONLY (past months and future months are strictly excluded)
export function getCurrentMonthBirthdayEmployees(users: UserAccount[], date = new Date()): UserAccount[] {
  const currentMonth = date.getMonth();

  return users.filter(user => {
    if (!user.dateOfBirth || !user.active) return false;
    const parsed = parseDateOfBirth(user.dateOfBirth);
    if (!parsed) return false;
    // Strictly must match the current month only; past months are excluded
    return parsed.month === currentMonth;
  }).sort((a, b) => {
    const parsedA = parseDateOfBirth(a.dateOfBirth);
    const parsedB = parseDateOfBirth(b.dateOfBirth);
    const dayA = parsedA?.day || 0;
    const dayB = parsedB?.day || 0;
    return dayA - dayB;
  });
}

// Get employees who have birthdays TODAY (must also be in the current month)
export function getTodaysBirthdayEmployees(users: UserAccount[], date = new Date()): UserAccount[] {
  const currentDay = date.getDate();
  const currentMonth = date.getMonth();

  return users.filter(user => {
    if (!user.dateOfBirth || !user.active) return false;
    const parsed = parseDateOfBirth(user.dateOfBirth);
    if (!parsed) return false;
    return parsed.day === currentDay && parsed.month === currentMonth;
  });
}

const RECOGNITION_TAGS = [
  { label: 'Best Wishes', icon: Heart, color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { label: 'Appreciation', icon: Award, color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' },
  { label: 'Congratulations', icon: ThumbsUp, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Milestone', icon: Sparkles, color: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' }
];

const PRESET_WISHES = [
  "Wishing you a rewarding and successful year ahead at KDPL.",
  "Warmest regards on your special day. Thank you for your contributions to the team.",
  "Happy Birthday. Wishing you good health, happiness, and continued achievements.",
  "Best wishes on your birthday from the entire team.",
  "Congratulations on another milestone year. Keep up the excellent work."
];

export const BirthdayReminderModal: React.FC<BirthdayReminderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  wishes,
  onSendWish
}) => {
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMonthIndex = liveTime.getMonth();
  const currentDay = liveTime.getDate();
  const currentMonthName = MONTH_NAMES[currentMonthIndex];

  // Strictly filter for current month's birthdays only based on system date
  const currentMonthBirthdays = getCurrentMonthBirthdayEmployees(allUsers, liveTime);
  const todaysBirthdays = getTodaysBirthdayEmployees(allUsers, liveTime);

  // Separate current month birthdays into today, upcoming, and already passed this month
  const upcomingThisMonth = currentMonthBirthdays.filter(u => {
    const parsed = parseDateOfBirth(u.dateOfBirth);
    return parsed && parsed.day > currentDay;
  });

  const passedThisMonth = currentMonthBirthdays.filter(u => {
    const parsed = parseDateOfBirth(u.dateOfBirth);
    return parsed && parsed.day < currentDay;
  });

  const [selectedCelebrantId, setSelectedCelebrantId] = useState<string>('');
  const [customWishText, setCustomWishText] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Best Wishes');
  const [wishSentSuccess, setWishSentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (currentMonthBirthdays.length > 0) {
      const isCurrentSelectedValid = currentMonthBirthdays.some(u => u.id === selectedCelebrantId);
      if (!isCurrentSelectedValid) {
        if (todaysBirthdays.length > 0) {
          setSelectedCelebrantId(todaysBirthdays[0].id);
        } else {
          const nextUpcoming = upcomingThisMonth[0] || currentMonthBirthdays[0];
          setSelectedCelebrantId(nextUpcoming.id);
        }
      }
    } else {
      setSelectedCelebrantId('');
    }
  }, [currentMonthBirthdays, todaysBirthdays.length, selectedCelebrantId]);

  if (!isOpen) return null;

  const selectedCelebrant = currentMonthBirthdays.find(u => u.id === selectedCelebrantId) 
    || todaysBirthdays[0] 
    || currentMonthBirthdays[0];

  const isUserOwnBirthday = currentUser.id === selectedCelebrant?.id;
  const celebrantParsedDob = selectedCelebrant ? parseDateOfBirth(selectedCelebrant.dateOfBirth) : null;
  const isCelebrantBirthdayToday = celebrantParsedDob 
    ? celebrantParsedDob.day === currentDay && celebrantParsedDob.month === currentMonthIndex 
    : false;

  const celebrantWishes = selectedCelebrant 
    ? wishes.filter(w => w.targetEmployeeId === selectedCelebrant.id) 
    : [];

  const handleSubmitWish = (overrideTag?: string, overrideMessage?: string) => {
    if (!selectedCelebrant) return;

    const tagToSend = overrideTag || selectedTag;
    const messageToSend = overrideMessage !== undefined ? overrideMessage : customWishText;

    onSendWish({
      targetEmployeeId: selectedCelebrant.id,
      targetEmployeeName: selectedCelebrant.name,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      reaction: tagToSend,
      message: messageToSend.trim() ? messageToSend.trim() : undefined
    });

    setCustomWishText('');
    setWishSentSuccess(true);
    setTimeout(() => setWishSentSuccess(false), 3000);
  };

  const getRoleLabel = (role: UserRole) => {
    return String(role).replace(/_/g, ' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Enterprise Header */}
        <div className="bg-slate-900 p-5 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    Staff Recognition
                  </span>
                  <span className="text-slate-400">
                    {currentMonthName} Celebrations
                  </span>
                  {todaysBirthdays.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {todaysBirthdays.length} Today
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold mt-1 text-white">
                  {isCelebrantBirthdayToday
                    ? (isUserOwnBirthday ? "Happy Birthday, " + currentUser.name : selectedCelebrant?.name + "'s Birthday Today")
                    : currentMonthName + " Employee Recognition"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  System Date: {liveTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })} · Filtered to {currentMonthName} only
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Celebrant Tabs */}
          {currentMonthBirthdays.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap text-xs">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {currentMonthName} Celebrants ({currentMonthBirthdays.length})
                </span>

                <select
                  value={selectedCelebrantId}
                  onChange={(e) => setSelectedCelebrantId(e.target.value)}
                  className="bg-slate-800 text-white text-xs font-medium border border-slate-700 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {todaysBirthdays.length > 0 && (
                    <optgroup label={"Today's Birthday (" + currentMonthName + " " + currentDay + ")"}>
                      {todaysBirthdays.map(u => (
                        <option key={u.id} value={u.id} className="text-slate-900 bg-white">
                          {u.name} (Today)
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {upcomingThisMonth.length > 0 && (
                    <optgroup label={"Upcoming in " + currentMonthName}>
                      {upcomingThisMonth.map(u => {
                        const parsed = parseDateOfBirth(u.dateOfBirth);
                        return (
                          <option key={u.id} value={u.id} className="text-slate-900 bg-white">
                            {u.name} ({currentMonthName.slice(0, 3)} {parsed?.day})
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                  {passedThisMonth.length > 0 && (
                    <optgroup label={"Earlier in " + currentMonthName}>
                      {passedThisMonth.map(u => {
                        const parsed = parseDateOfBirth(u.dateOfBirth);
                        return (
                          <option key={u.id} value={u.id} className="text-slate-900 bg-white">
                            {u.name} ({currentMonthName.slice(0, 3)} {parsed?.day})
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Segmented Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {currentMonthBirthdays.map(emp => {
                  const parsed = parseDateOfBirth(emp.dateOfBirth);
                  const isToday = parsed && parsed.day === currentDay && parsed.month === currentMonthIndex;
                  const isSelected = selectedCelebrantId === emp.id;

                  return (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedCelebrantId(emp.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                        isSelected 
                          ? 'bg-blue-600 text-white border-blue-500' 
                          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                      }`}
                    >
                      <span>{emp.name}</span>
                      <span className="text-[10px] opacity-80">
                        {isToday ? 'Today' : `${currentMonthName.slice(0, 3)} ${parsed?.day}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {currentMonthBirthdays.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No Birthdays in {currentMonthName}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Only birthdays occurring in the active system month ({currentMonthName}) are displayed.
              </p>
            </div>
          ) : selectedCelebrant ? (
            <>
              {/* Celebrant Profile Dossier */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-slate-800 text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {selectedCelebrant.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{selectedCelebrant.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-800">
                      {getRoleLabel(selectedCelebrant.role)}
                    </span>
                    {selectedCelebrant.employeeCode && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700">
                        {selectedCelebrant.employeeCode}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                    <p>Department: <strong className="text-slate-800">{selectedCelebrant.department || 'Operations'}</strong></p>
                    {selectedCelebrant.dateOfBirth && (
                      <p>Date of Birth: <strong className="text-slate-800">{selectedCelebrant.dateOfBirth}</strong></p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {isCelebrantBirthdayToday ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Birthday Today ({currentMonthName} {celebrantParsedDob?.day})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        Upcoming ({celebrantParsedDob?.day} {currentMonthName})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Send Greeting Section */}
              <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {isUserOwnBirthday ? "Team Greetings & Notes" : "Send Birthday Message to " + selectedCelebrant.name}
                  </h4>
                  {wishSentSuccess && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Greeting Recorded
                    </span>
                  )}
                </div>

                {/* Recognition Type Selection */}
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-1.5">Recognition Category:</p>
                  <div className="flex flex-wrap gap-2">
                    {RECOGNITION_TAGS.map((t) => {
                      const Icon = t.icon;
                      const isSelected = selectedTag === t.label;
                      return (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setSelectedTag(t.label)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            isSelected ? 'bg-slate-900 text-white border-slate-900' : t.color
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Templates */}
                <div>
                  <p className="text-[11px] font-medium text-slate-500 mb-1.5">Pre-composed Templates:</p>
                  <div className="space-y-1">
                    {PRESET_WISHES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCustomWishText(preset);
                          handleSubmitWish(selectedTag, preset);
                        }}
                        className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitWish(); }} className="space-y-2 pt-1">
                  <div className="relative">
                    <textarea
                      value={customWishText}
                      onChange={(e) => setCustomWishText(e.target.value)}
                      placeholder={isUserOwnBirthday ? "Write an acknowledgment note to the team..." : "Write a personal message for " + selectedCelebrant.name + "..."}
                      rows={2}
                      className="w-full text-xs p-2.5 pr-10 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 bg-white placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!customWishText.trim() && !selectedTag}
                      className="absolute right-2 bottom-3 p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-md transition-colors cursor-pointer"
                      title="Send Message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Received Messages Log */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                    Recorded Messages ({celebrantWishes.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Internal Staff Log</span>
                </div>

                {celebrantWishes.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs">
                    No messages recorded yet for {selectedCelebrant.name}.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {celebrantWishes.map((w) => (
                      <div key={w.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs">
                        <div className="w-7 h-7 rounded bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {w.senderName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{w.senderName} ({getRoleLabel(w.senderRole)})</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {w.message && (
                            <p className="text-slate-700 mt-1 bg-white p-2 rounded border border-slate-200">
                              {w.message}
                            </p>
                          )}
                          {w.reaction && (
                            <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                              {w.reaction}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500">KDPL Staff Directory · {currentMonthName}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
