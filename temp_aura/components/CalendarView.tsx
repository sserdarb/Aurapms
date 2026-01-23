
import React, { useState, useEffect, useRef } from 'react';
import { Room, Reservation, Language, BoardType, RoomType, ServiceItem } from '../types';
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle, CheckSquare, Square, CreditCard, ArrowRight, Edit2, Trash2, RefreshCcw, LogIn, LogOut, RefreshCw, DownloadCloud, CalendarDays, Grid3X3, Columns, Crown, Repeat, Lock, Coffee, Car, Sparkles } from 'lucide-react';
import { translations, formatCurrency } from '../utils/helpers';

interface CalendarViewProps {
  rooms: Room[];
  reservations: Reservation[];
  language: Language;
  onAddReservation: (res: Reservation) => void;
  onUpdateReservation: (res: Reservation) => void;
  autoSync?: boolean;
}

type ViewMode = '3day' | 'week' | '2week';

const CalendarView: React.FC<CalendarViewProps> = ({ rooms, reservations, language, onAddReservation, onUpdateReservation, autoSync = true }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('2week');
  
  // Detect screen size
  useEffect(() => {
      const handleResize = () => {
          if (window.innerWidth < 768) {
              setViewMode('3day');
          } else if (window.innerWidth < 1024) {
              setViewMode('week');
          } else {
              setViewMode('2week');
          }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ x: number; y: number; roomId: string; date: string; roomType: RoomType; } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; reservationId: string; } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [incomingAlert, setIncomingAlert] = useState<{name: string, source: string} | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  
  const prevReservationsRef = useRef<Reservation[]>(reservations);
  const popoverRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [amount, setAmount] = useState(0);
  const [source, setSource] = useState('Direct');
  const [status, setStatus] = useState<Reservation['status']>('confirmed');
  const [isPaid, setIsPaid] = useState(false);
  const [boardType, setBoardType] = useState<BoardType | ''>('');
  const [extras, setExtras] = useState<ServiceItem[]>([]);
  const [newExtraName, setNewExtraName] = useState('MiniBar');
  const [newExtraPrice, setNewExtraPrice] = useState(100);
  const [error, setError] = useState('');

  const t = translations[language];
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  
  // Enhanced Input Style: Explicit Light/Dark mode colors + Stylish Border/Shadow
  const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm font-medium";

  // --- Logic & Handlers ---
  
  const simulateSync = () => {
      if (!autoSync) {
          setSyncMessage('Saved locally (Auto-Sync Off)');
          setTimeout(() => setSyncMessage(''), 2000);
          return;
      }
      setIsSyncing(true);
      setSyncMessage(t.syncingChannels);
      setTimeout(() => {
          setIsSyncing(false);
          setSyncMessage(t.syncedSuccessfully);
          setTimeout(() => setSyncMessage(''), 2000);
      }, 1500);
  };

  // Detect Incoming Bookings
  useEffect(() => {
      const prev = prevReservationsRef.current;
      if (reservations.length > prev.length) {
          const addedRes = reservations.find(r => !prev.some(p => p.id === r.id));
          if (addedRes && addedRes.source !== 'Direct') {
              setIncomingAlert({ name: addedRes.guestName, source: addedRes.source });
              setTimeout(() => setIncomingAlert(null), 5000);
          }
      }
      prevReservationsRef.current = reservations;
  }, [reservations]);

  // Click Outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
              setSelection(null);
          }
          if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
              setContextMenu(null);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Price Calculation & Board Types
  const selectedRoom = rooms.find(r => r.id === roomId);
  const allowedBoardTypes = selectedRoom ? (selectedRoom.boardTypes && selectedRoom.boardTypes.length > 0 ? selectedRoom.boardTypes : [BoardType.RO, BoardType.BB]) : [];

  useEffect(() => {
      if (isModalOpen && allowedBoardTypes.length > 0 && (!boardType || !allowedBoardTypes.includes(boardType as BoardType))) {
          setBoardType(allowedBoardTypes[0]);
      }
  }, [roomId, isModalOpen]);

  // Advanced Price Calculation Logic
  useEffect(() => {
    if (roomId && checkIn && checkOut && selectedRoom) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        let calculatedBasePrice = 0;
        let days = 0;

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dStr = d.toISOString().split('T')[0];
            const dailyRate = selectedRoom.dailyRates?.[dStr];
            
            if (dailyRate) {
                // If source is an OTA, use the appropriate rate
                if (source === 'Booking.com' || source === 'Expedia') {
                     calculatedBasePrice += dailyRate.onlinePrice || dailyRate.price;
                } else if (source === 'Agency') {
                     calculatedBasePrice += dailyRate.agencyPrice || dailyRate.price;
                } else {
                     calculatedBasePrice += dailyRate.price;
                }
            } else {
                // Fallback to room base price
                calculatedBasePrice += selectedRoom.price; 
            }
            days++;
        }
        
        if (days > 0) {
            let surcharge = boardType === BoardType.AI ? 2000 : boardType === BoardType.FB ? 1200 : boardType === BoardType.HB ? 750 : boardType === BoardType.BB ? 250 : 0;
            const extrasTotal = extras.reduce((sum, item) => sum + item.price, 0);
            
            if (!isEditMode) {
               setAmount(calculatedBasePrice + (surcharge * days) + extrasTotal);
            }
        }
    }
  }, [roomId, checkIn, checkOut, boardType, selectedRoom, extras, isEditMode, source]);

  const resetForm = () => {
      setGuestName('');
      setRoomId('');
      setCheckIn(new Date().toISOString().split('T')[0]);
      setCheckOut(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      setAmount(0);
      setSource('Direct');
      setIsPaid(false);
      setBoardType('');
      setStatus('confirmed');
      setExtras([]);
      setIsEditMode(false);
      setCurrentReservationId(null);
      setError('');
  };

  const openEditModal = (res: Reservation) => {
      setGuestName(res.guestName);
      setRoomId(res.roomId);
      setCheckIn(res.checkIn);
      setCheckOut(res.checkOut);
      setAmount(res.amount);
      setSource(res.source);
      setIsPaid(res.paid);
      setBoardType(res.boardType || '');
      setStatus(res.status);
      setExtras(res.extras || []);
      setIsEditMode(true);
      setCurrentReservationId(res.id);
      setIsModalOpen(true);
      setContextMenu(null);
  };

  const handleAddExtra = () => {
      if (newExtraName && newExtraPrice > 0) {
          const item: ServiceItem = {
              id: Date.now().toString(),
              name: newExtraName,
              price: newExtraPrice,
              date: new Date().toISOString().split('T')[0]
          };
          setExtras([...extras, item]);
          setAmount(prev => prev + newExtraPrice); // Add to total immediately
          setNewExtraName('');
          setNewExtraPrice(0);
      }
  };

  const handleRemoveExtra = (id: string) => {
      const item = extras.find(e => e.id === id);
      if (item) {
          setExtras(extras.filter(e => e.id !== id));
          setAmount(prev => prev - item.price);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if(!roomId || !guestName) return;
      if (checkIn >= checkOut) { setError(t.invalidDates); return; }

      const room = rooms.find(r => r.id === roomId);

      let isStopSale = false;
      if (room) {
          const start = new Date(checkIn);
          const end = new Date(checkOut);
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
              const dStr = d.toISOString().split('T')[0];
              if (room.dailyRates?.[dStr]?.stopSale) {
                  isStopSale = true;
                  break;
              }
          }
      }

      if (isStopSale) {
          setError('Stop Sale active for selected dates!');
          return;
      }

      const hasConflict = reservations.some(res => {
        if (isEditMode && res.id === currentReservationId) return false;
        if (res.roomId !== roomId || res.status === 'cancelled') return false;
        return checkIn < res.checkOut && checkOut > res.checkIn;
      });

      if (hasConflict) { setError(t.roomOccupied); return; }

      const resData: Reservation = {
          id: currentReservationId || Date.now().toString(),
          guestName, roomId, checkIn, checkOut, source, status, amount, paid: isPaid,
          boardType: boardType as BoardType,
          extras: extras
      };

      isEditMode ? onUpdateReservation(resData) : onAddReservation(resData);
      simulateSync();
      setIsModalOpen(false);
      resetForm();
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, res: Reservation, sourceDateStr: string) => {
      e.dataTransfer.setData('resId', res.id);
      const diffDays = Math.round((new Date(sourceDateStr).getTime() - new Date(res.checkIn).getTime()) / 86400000);
      e.dataTransfer.setData('offset', diffDays.toString());
      e.dataTransfer.effectAllowed = 'move';
      e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.style.opacity = '1';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetRoomId: string, targetDateStr: string) => {
      e.preventDefault();
      const resId = e.dataTransfer.getData('resId');
      const offset = parseInt(e.dataTransfer.getData('offset') || '0');
      const res = reservations.find(r => r.id === resId);

      if (res) {
          const newStart = new Date(targetDateStr);
          newStart.setDate(newStart.getDate() - offset);
          const newCheckIn = newStart.toISOString().split('T')[0];
          
          const duration = (new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime());
          const newCheckOut = new Date(newStart.getTime() + duration).toISOString().split('T')[0];

          // Conflict Check
          const hasConflict = reservations.some(existingRes => {
              if (existingRes.id === res.id) return false; // Ignore self
              if (existingRes.roomId !== targetRoomId || existingRes.status === 'cancelled') return false;
              return newCheckIn < existingRes.checkOut && newCheckOut > existingRes.checkIn;
          });

          if (hasConflict) {
              setDragError(t.roomOccupied);
              setTimeout(() => setDragError(null), 3000);
              return;
          }

          // Stop Sale Check
          const room = rooms.find(r => r.id === targetRoomId);
          let isStopSale = false;
          if (room) {
              const start = new Date(newCheckIn);
              const end = new Date(newCheckOut);
              for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                  const dStr = d.toISOString().split('T')[0];
                  if (room.dailyRates?.[dStr]?.stopSale) {
                      isStopSale = true;
                      break;
                  }
              }
          }

          if (isStopSale) {
              setDragError('Stop Sale active!');
              setTimeout(() => setDragError(null), 3000);
              return;
          }

          onUpdateReservation({ ...res, roomId: targetRoomId, checkIn: newCheckIn, checkOut: newCheckOut });
          simulateSync();
      }
  };

  const getDays = () => {
      const len = viewMode === '3day' ? 3 : viewMode === 'week' ? 7 : 14;
      return Array.from({ length: len }, (_, i) => {
          const d = new Date(startDate); d.setDate(d.getDate() + i); return d;
      });
  };
  const dates = getDays();

  const getRes = (rId: string, date: Date) => {
      const dStr = date.toISOString().split('T')[0];
      return reservations.find(r => r.roomId === rId && dStr >= r.checkIn && dStr < r.checkOut && r.status !== 'cancelled');
  };

  const handleSelectSlot = (e: React.MouseEvent, room: Room, dateStr: string) => {
      if (room.dailyRates?.[dateStr]?.stopSale) {
          setError('Stop Sale!');
          setTimeout(() => setError(''), 1000);
          return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setSelection({ x: rect.left, y: rect.bottom, roomId: room.id, date: dateStr, roomType: room.type });
  };

  const confirmSelection = (rId: string) => {
      if (!selection) return;
      resetForm();
      setRoomId(rId);
      setCheckIn(selection.date);
      const next = new Date(selection.date); next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().split('T')[0]);
      setSelection(null);
      setIsModalOpen(true);
  };
  
  const handleQuickAction = (action: string) => {
      const res = reservations.find(r => r.id === contextMenu?.reservationId);
      if (!res) return;
      let updates: any = {};
      if (action === 'check-in') updates.status = 'checked-in';
      if (action === 'check-out') updates.status = 'checked-out';
      if (action === 'cancel') updates.status = 'cancelled';
      if (action === 'refund') { updates.status = 'refunded'; updates.paid = false; }
      onUpdateReservation({ ...res, ...updates });
      simulateSync();
      setContextMenu(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[calc(100vh-140px)] flex flex-col overflow-hidden relative transition-colors">
      
      {/* Notifications Overlay */}
      {(syncMessage || dragError || incomingAlert) && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
              {syncMessage && (
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in text-sm font-bold">
                      <RefreshCw size={16} className="animate-spin" /> {syncMessage}
                  </div>
              )}
              {dragError && (
                  <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in text-sm font-bold">
                      <AlertTriangle size={16} /> {dragError}
                  </div>
              )}
              {incomingAlert && (
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in text-sm font-bold">
                      <DownloadCloud size={16} /> New booking from {incomingAlert.source}: {incomingAlert.name}
                  </div>
              )}
          </div>
      )}

      {/* ... Top Toolbar ... */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center bg-slate-50 dark:bg-slate-900 gap-2">
         <div className="flex flex-wrap items-center gap-2">
             <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                 <button onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><ChevronLeft size={18}/></button>
                 <span className="px-3 text-sm font-bold w-28 text-center text-slate-700 dark:text-slate-200">{startDate.toLocaleDateString(locale, { month: 'short', year: 'numeric' })}</span>
                 <button onClick={() => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><ChevronRight size={18}/></button>
             </div>
             <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                 {['3day', 'week', '2week'].map(m => (
                     <button key={m} onClick={() => setViewMode(m as ViewMode)} className={`p-1.5 px-3 text-xs font-bold rounded ${viewMode === m ? 'bg-slate-900 text-white dark:bg-primary-600' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                         {/* @ts-ignore */}
                         {m === '3day' ? t.threeDays : m === 'week' ? t.week : t.twoWeeks}
                     </button>
                 ))}
             </div>
         </div>
         <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm w-full md:w-auto justify-center">
             <Plus size={16} /> {t.newReservation}
         </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="w-32 p-3 font-bold text-xs text-slate-600 dark:text-slate-400 uppercase border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-900 z-20">{t.room}</div>
              <div className="flex-1 flex relative">
                  {dates.map((d, i) => {
                      const isToday = d.toDateString() === new Date().toDateString();
                      return (
                        <div key={i} className={`flex-1 text-center p-2 border-r border-slate-200 dark:border-slate-800 ${d.getDay() === 0 || d.getDay() === 6 ? 'bg-slate-100/50 dark:bg-slate-800/30' : ''} relative`}>
                            <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold">{d.toLocaleDateString(locale, { weekday: 'short' })}</div>
                            <div className={`text-sm font-bold mt-1 ${isToday ? 'text-primary-600' : 'text-slate-700 dark:text-slate-300'}`}>{d.getDate()}</div>
                            {isToday && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500"></div>}
                        </div>
                      )
                  })}
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
              {rooms.map(room => (
                  <div key={room.id} className="flex border-b border-slate-100 dark:border-slate-800 h-16 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <div className="w-32 p-3 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-center bg-white dark:bg-slate-900 z-10 sticky left-0">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{room.number}</span>
                          <span className="text-[10px] text-slate-500 truncate">{t.roomTypes[room.type] || room.type}</span>
                      </div>
                      <div className="flex-1 flex relative">
                          {dates.map((d, i) => {
                              const dStr = d.toISOString().split('T')[0];
                              const res = getRes(room.id, d);
                              const isStart = res && res.checkIn === dStr;
                              const isSelected = selection?.roomId === room.id && selection.date === dStr;
                              const isToday = dStr === new Date().toISOString().split('T')[0];

                              return (
                                  <div 
                                    key={i} 
                                    className={`flex-1 border-r border-slate-100 dark:border-slate-800 relative p-1 
                                        ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                                    `}
                                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                    onDrop={(e) => handleDrop(e, room.id, dStr)}
                                  >
                                      {isToday && <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-500/20 pointer-events-none z-0"></div>}
                                      
                                      {res ? (
                                          <div 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, res, dStr)}
                                            onDragEnd={handleDragEnd}
                                            onClick={(e) => { e.stopPropagation(); openEditModal(res); }}
                                            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, reservationId: res.id }); }}
                                            className={`h-full rounded-md border text-xs flex items-center px-2 cursor-pointer shadow-sm relative overflow-hidden group transition-all z-10 ${
                                                res.status === 'checked-in' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-800 dark:text-green-200' :
                                                res.status === 'checked-out' ? 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400' :
                                                'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-200'
                                            }`}
                                          >
                                              {isStart && (
                                                  <div className="flex items-center gap-1 truncate font-bold w-full">
                                                      <span className="truncate">{res.guestName}</span>
                                                  </div>
                                              )}
                                          </div>
                                      ) : (
                                          <div onClick={(e) => handleSelectSlot(e, room, dStr)} className="w-full h-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded flex items-center justify-center group z-10 relative">
                                              <Plus size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                          </div>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Context Menu & Popover */}
      {contextMenu && (
          <div ref={contextMenuRef} className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 w-48 py-1" style={{ top: contextMenu.y, left: contextMenu.x }}>
              {['check-in', 'check-out', 'refund', 'cancel'].map(action => (
                  <button key={action} onClick={() => handleQuickAction(action)} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 capitalize">
                      {/* @ts-ignore */}
                      {t[action + 'Action'] || action}
                  </button>
              ))}
          </div>
      )}
      
      {selection && (
          <div ref={popoverRef} className="fixed z-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 w-64 p-4" style={{ top: selection.y + 10, left: Math.min(window.innerWidth - 280, selection.x) }}>
              <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                  <h4 className="font-bold text-slate-800 dark:text-white">{t.availableRooms}</h4>
                  <button onClick={() => setSelection(null)}><X size={14} className="text-slate-400"/></button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                  {rooms.filter(r => r.type === selection.roomType && !getRes(r.id, new Date(selection.date))).map(r => (
                      <button key={r.id} onClick={() => confirmSelection(r.id)} className="w-full text-left p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 text-xs flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                          <span>{t.room} {r.number}</span>
                          {r.id === selection.roomId && <CheckSquare size={14} className="text-primary-500"/>}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Enhanced Reservation Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-slide-up my-8">
                  <div className="flex justify-between mb-6">
                      <h3 className="font-serif font-bold text-xl text-slate-800 dark:text-white">{isEditMode ? t.editReservation : t.createReservation}</h3>
                      <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Col: Details */}
                      <div className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.guestName}</label>
                              <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required className={inputClass} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.room}</label>
                                  <select value={roomId} onChange={e => setRoomId(e.target.value)} className={inputClass}>
                                      {rooms.map(r => <option key={r.id} value={r.id}>{r.number} ({t.roomTypes[r.type] || r.type})</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.selectBoardType}</label>
                                  <select value={boardType} onChange={e => setBoardType(e.target.value as any)} className={inputClass}>
                                      {allowedBoardTypes.map(b => (
                                          // @ts-ignore
                                          <option key={b} value={b}>{t.boardTypes[b] || b}</option>
                                      ))}
                                  </select>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.checkInDate}</label>
                                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.checkOutDate}</label>
                                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className={inputClass} />
                              </div>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.source}</label>
                              <select value={source} onChange={e => setSource(e.target.value)} className={inputClass}>
                                  <option value="Direct">Direct</option>
                                  <option value="Booking.com">Booking.com</option>
                                  <option value="Expedia">Expedia</option>
                                  <option value="Agency">Agency</option>
                              </select>
                          </div>
                      </div>

                      {/* Right Col: Financials & Extras */}
                      <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                              <Sparkles size={12}/> Folio & Extras
                          </h4>
                          
                          <div className="max-h-32 overflow-y-auto space-y-2 mb-2">
                              {extras.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-900 dark:text-white">{item.price}</span>
                                          <button onClick={() => handleRemoveExtra(item.id)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                      </div>
                                  </div>
                              ))}
                              {extras.length === 0 && <div className="text-xs text-slate-400 text-center py-2">No extras added</div>}
                          </div>

                          <div className="flex gap-2">
                               <select value={newExtraName} onChange={e=>setNewExtraName(e.target.value)} className="flex-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-white outline-none">
                                   <option value="MiniBar">MiniBar</option>
                                   <option value="Spa">Spa</option>
                                   <option value="Transfer">Transfer</option>
                                   <option value="Laundry">Laundry</option>
                                   <option value="Late Check-out">Late C/O</option>
                               </select>
                               <input type="number" value={newExtraPrice} onChange={e=>setNewExtraPrice(Number(e.target.value))} className="w-20 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded px-2 py-1 text-xs text-slate-700 dark:text-white outline-none" placeholder="Price"/>
                               <button onClick={handleAddExtra} className="bg-slate-800 text-white rounded px-2 py-1"><Plus size={14}/></button>
                          </div>

                          <div className="border-t border-slate-200 dark:border-slate-600 my-4"></div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">{t.totalAmount}</label>
                                  <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className={inputClass} />
                              </div>
                              <div className="flex items-end">
                                  <label className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-3 rounded-lg w-full cursor-pointer h-[50px] shadow-sm">
                                      <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.paid}</span>
                                  </label>
                              </div>
                          </div>
                      </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50 mt-4">
                        <AlertTriangle size={16} className="text-red-500" /> {error}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button onClick={handleSubmit} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg">
                          {t.saveChanges}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CalendarView;
