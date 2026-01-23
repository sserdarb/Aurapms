


import React, { useState } from 'react';
import { Room, RoomStatus, Language, MaintenanceTicket } from '../types';
import { CheckCircle, XCircle, AlertCircle, Wrench, Hammer, Plus, Trash2, Clock } from 'lucide-react';
import { translations } from '../utils/helpers';

interface HousekeepingProps {
  rooms: Room[];
  onUpdateStatus: (id: string, status: RoomStatus) => void;
  language: Language;
}

// Mock initial tickets if none passed (in real app, these come from parent)
const Housekeeping: React.FC<HousekeepingProps> = ({ rooms, onUpdateStatus, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'housekeeping' | 'maintenance'>('housekeeping');
  
  // Local state for tickets since we don't have a full backend hookup in this demo component for tickets yet
  // In a real app, this would be passed down from App.tsx like rooms
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
      { id: 't1', roomId: rooms.find(r => r.status === RoomStatus.MAINTENANCE)?.id || 'r5', description: 'AC leaking water', priority: 'High', status: 'Open', createdAt: new Date().toISOString(), reportedBy: 'Staff' }
  ]);
  
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ roomId: '', description: '', priority: 'Medium' });

  const handleCreateTicket = () => {
      if(!newTicket.roomId || !newTicket.description) return;
      
      const ticket: MaintenanceTicket = {
          id: Date.now().toString(),
          roomId: newTicket.roomId,
          description: newTicket.description,
          priority: newTicket.priority as any,
          status: 'Open',
          createdAt: new Date().toISOString(),
          reportedBy: 'Manager'
      };
      
      setTickets([...tickets, ticket]);
      // Automatically set room to Maintenance/OOO if High/Critical
      if (newTicket.priority === 'High' || newTicket.priority === 'Critical') {
          onUpdateStatus(newTicket.roomId, RoomStatus.MAINTENANCE);
      }
      setIsTicketModalOpen(false);
      setNewTicket({ roomId: '', description: '', priority: 'Medium' });
  };

  const resolveTicket = (id: string, roomId: string) => {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Resolved', resolvedAt: new Date().toISOString() } : t));
      // Prompt to set room to dirty (needs cleaning after maintenance)
      if (confirm('Ticket resolved. Set room status to Dirty for cleaning?')) {
          onUpdateStatus(roomId, RoomStatus.DIRTY);
      }
  };

  // Translation Helpers
  const getPriorityLabel = (p: string) => {
      if (p === 'Low') return t.priorityLow;
      if (p === 'Medium') return t.priorityMedium;
      if (p === 'High') return t.priorityHigh;
      if (p === 'Critical') return t.priorityCritical;
      return p;
  };

  const getStatusLabel = (s: string) => {
      if (s === 'Open') return t.statusOpen;
      if (s === 'In Progress') return t.statusInProgress;
      if (s === 'Resolved') return t.statusResolved;
      return s;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.operationsCenter}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.operationsDesc}</p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button 
                onClick={() => setActiveTab('housekeeping')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'housekeeping' ? 'bg-slate-900 text-white dark:bg-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
            >
                {t.housekeeping}
            </button>
            <button 
                onClick={() => setActiveTab('maintenance')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${activeTab === 'maintenance' ? 'bg-slate-900 text-white dark:bg-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
            >
                {t.maintenance}
                {tickets.filter(t => t.status !== 'Resolved').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{tickets.filter(t => t.status !== 'Resolved').length}</span>
                )}
            </button>
        </div>
      </div>

      {activeTab === 'housekeeping' && (
          <>
            <div className="flex gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-green-500"></span> {t.clean} ({rooms.filter(r => r.status === RoomStatus.CLEAN).length})</div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-red-500"></span> {t.dirty} ({rooms.filter(r => r.status === RoomStatus.DIRTY).length})</div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="w-3 h-3 rounded-full bg-orange-500"></span> {t.maintenance} ({rooms.filter(r => r.status === RoomStatus.MAINTENANCE || r.status === RoomStatus.OOO).length})</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {rooms.map(room => (
                <div key={room.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 transition-all hover:shadow-md ${
                    room.status === RoomStatus.CLEAN ? 'border-l-green-500' : 
                    room.status === RoomStatus.DIRTY ? 'border-l-red-500' : 
                    room.status === RoomStatus.INSPECTION ? 'border-l-yellow-500' : 'border-l-orange-500'
                }`}>
                    <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{room.number}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {/* @ts-ignore */}
                            {t.roomTypes[room.type] || room.type}
                        </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                        room.status === RoomStatus.CLEAN ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        room.status === RoomStatus.DIRTY ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        room.status === RoomStatus.INSPECTION ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                        {room.status === RoomStatus.CLEAN ? t.clean :
                        room.status === RoomStatus.DIRTY ? t.dirty :
                        room.status === RoomStatus.INSPECTION ? t.inspect : room.status}
                    </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                    <button 
                        onClick={() => onUpdateStatus(room.id, RoomStatus.CLEAN)}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors ${room.status === RoomStatus.CLEAN ? 'bg-green-50 text-green-600 ring-1 ring-green-200 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-slate-600'}`}
                    >
                        <CheckCircle size={16} />
                        {t.markClean}
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(room.id, RoomStatus.DIRTY)}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors ${room.status === RoomStatus.DIRTY ? 'bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-slate-600'}`}
                    >
                        <XCircle size={16} />
                        {t.markDirty}
                    </button>
                    <button 
                        onClick={() => {
                            setNewTicket({...newTicket, roomId: room.id});
                            setIsTicketModalOpen(true);
                        }}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 text-xs transition-colors ${room.status === RoomStatus.MAINTENANCE ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-500 dark:hover:bg-slate-600'}`}
                    >
                        <Wrench size={16} />
                        {t.reportIssue}
                    </button>
                    </div>
                </div>
                ))}
            </div>
          </>
      )}

      {activeTab === 'maintenance' && (
          <div>
              <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => setIsTicketModalOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors"
                  >
                      <Plus size={18}/> {t.createTicket}
                  </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                          <tr>
                              <th className="p-4">{t.room}</th>
                              <th className="p-4">{t.issue}</th>
                              <th className="p-4">{t.priority}</th>
                              <th className="p-4">{t.status}</th>
                              <th className="p-4">{t.reported}</th>
                              <th className="p-4 text-right">{t.actions}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {tickets.length === 0 && (
                              <tr><td colSpan={6} className="p-8 text-center text-slate-500">{t.noTickets}</td></tr>
                          )}
                          {tickets.map(ticket => {
                              const room = rooms.find(r => r.id === ticket.roomId);
                              return (
                                  <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{room?.number || 'Unknown'}</td>
                                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{ticket.description}</td>
                                      <td className="p-4">
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                                              ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                              ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                              'bg-blue-100 text-blue-700'
                                          }`}>
                                              {getPriorityLabel(ticket.priority)}
                                          </span>
                                      </td>
                                      <td className="p-4">
                                          <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 w-fit ${
                                              ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                              'bg-slate-100 text-slate-700'
                                          }`}>
                                              {ticket.status === 'Resolved' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                                              {getStatusLabel(ticket.status)}
                                          </span>
                                      </td>
                                      <td className="p-4 text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                      <td className="p-4 text-right">
                                          {ticket.status !== 'Resolved' && (
                                              <button 
                                                onClick={() => resolveTicket(ticket.id, ticket.roomId)}
                                                className="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-xs font-bold border border-green-200"
                                              >
                                                  {t.markResolved}
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Ticket Modal */}
      {isTicketModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                          <Hammer className="text-primary-600"/> {t.reportIssue}
                      </h3>
                      <button onClick={() => setIsTicketModalOpen(false)}><XCircle className="text-slate-400 hover:text-slate-600"/></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.room}</label>
                          <select 
                             value={newTicket.roomId} 
                             onChange={(e) => setNewTicket({...newTicket, roomId: e.target.value})}
                             className="w-full border p-2 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                          >
                              <option value="">{t.selectRoom}</option>
                              {rooms.map(r => <option key={r.id} value={r.id}>{r.number} ({r.type})</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.issueDesc}</label>
                          <textarea 
                             value={newTicket.description} 
                             onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                             className="w-full border p-2 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 h-24"
                             placeholder="e.g., TV remote not working"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{t.priority}</label>
                          <select 
                             value={newTicket.priority} 
                             onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                             className="w-full border p-2 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                          >
                              <option value="Low">{t.priorityLow}</option>
                              <option value="Medium">{t.priorityMedium}</option>
                              <option value="High">{t.priorityHigh}</option>
                              <option value="Critical">{t.priorityCritical}</option>
                          </select>
                      </div>
                      <button 
                        onClick={handleCreateTicket}
                        disabled={!newTicket.roomId || !newTicket.description}
                        className="w-full bg-slate-900 dark:bg-primary-600 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 mt-2"
                      >
                          {t.submitTicket}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Housekeeping;