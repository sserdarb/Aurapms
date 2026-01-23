
import React, { useEffect, useState } from 'react';
import { getAllHotels, getSystemLogs, logSystemAction, getAllUsers, addUserCredits, getStorageMode, getFallbackReason, retryConnection, testConnection } from '../services/db';
import { Hotel, SystemLog, User } from '../types';
import { Building2, LogOut, Eye, Activity, Moon, Sun, Zap, AlertTriangle, CheckCircle, PlusCircle, X, Coins, Loader2, Database, ExternalLink, RefreshCw, Stethoscope, Copy, Check, Users } from 'lucide-react';

interface MasterAdminProps {
    onLogout: () => void;
    onImpersonate: (hotelId: string) => void;
}

const MasterAdmin: React.FC<MasterAdminProps> = ({ onLogout, onImpersonate }) => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [activeTab, setActiveTab] = useState<'hotels' | 'users' | 'logs'>('hotels');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const storageMode = getStorageMode();
    const fallbackReason = getFallbackReason();

    // Diagnostic State
    const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
    const [testing, setTesting] = useState(false);
    const [copiedRule, setCopiedRule] = useState(false);

    // Credit Modal State
    const [creditModalOpen, setCreditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [creditAmount, setCreditAmount] = useState<number>(1000);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [hotelsData, logsData, usersData] = await Promise.all([
                getAllHotels(),
                getSystemLogs(),
                getAllUsers()
            ]);
            setHotels(hotelsData);
            setLogs(logsData);
            setUsers(usersData);
        } catch (e) {
            console.error("Error loading admin data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleRetryConnection = async () => {
        setLoading(true);
        await retryConnection();
        await loadData();
        setTestResult(null); // Reset test result on reload
        setLoading(false);
    };

    const handleTestConnection = async () => {
        setTesting(true);
        const result = await testConnection();
        setTestResult(result);
        setTesting(false);
    };

    const handleImpersonate = async (hotel: Hotel) => {
        await logSystemAction('sserdarb@gmail.com', 'Impersonate', `Admin accessed hotel: ${hotel.name}`);
        onImpersonate(hotel.id);
    };

    const openCreditModal = (user: User) => {
        setSelectedUser(user);
        setCreditAmount(1000);
        setCreditModalOpen(true);
    };

    const handleAddCredits = async () => {
        if (selectedUser) {
            await addUserCredits(selectedUser.id, creditAmount);
            setCreditModalOpen(false);
            setSelectedUser(null);
            await loadData(); // Refresh to show new limits
        }
    };

    const copyRuleToClipboard = () => {
        const rule = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
        navigator.clipboard.writeText(rule);
        setCopiedRule(true);
        setTimeout(() => setCopiedRule(false), 2000);
    };

    // Theme classes
    const bgMain = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
    const textMain = isDarkMode ? 'text-slate-100' : 'text-slate-800';
    const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const headerBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const tableHeadBg = isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-500';
    const tableRowHover = isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
    const mutedText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

    if (loading) {
        return (
            <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
                <Loader2 className={`animate-spin ${textMain}`} size={32} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bgMain} ${textMain} transition-colors duration-300`}>
            {/* Top Bar */}
            <div className={`${headerBg} border-b p-4 flex justify-between items-center shadow-md sticky top-0 z-20`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">M</div>
                    <div>
                        <h1 className="font-serif font-bold text-xl tracking-wide">AURA MASTER</h1>
                        <p className={`text-xs ${mutedText}`}>Super Admin Control Panel</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Storage Indicator */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${storageMode.includes('Cloud') ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-orange-900/30 text-orange-400 border-orange-800'}`}>
                        <Database size={14} /> {storageMode}
                    </div>

                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>sserdarb@gmail.com</span>
                    <button onClick={onLogout} className="bg-red-900/50 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-red-900">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto">
                
                {/* Connectivity Diagnostic Panel */}
                {storageMode.includes('Local') && (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 animate-fade-in shadow-xl">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-orange-500/20 rounded-full text-orange-500">
                                <Stethoscope size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">Connection Diagnostics</h3>
                                <p className="text-sm text-slate-400 mb-4">
                                    System is currently in <b>Offline Mode</b>. Use this tool to diagnose why the connection to Firebase is failing.
                                </p>
                                
                                <div className="flex gap-3 mb-4">
                                    <button 
                                        onClick={handleTestConnection} 
                                        disabled={testing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                                    >
                                        {testing ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16} />}
                                        Bağlantıyı Test Et (Test Connection)
                                    </button>
                                    <button 
                                        onClick={handleRetryConnection} 
                                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md transition-colors"
                                    >
                                        <RefreshCw size={16} /> Sistemi Yeniden Başlat (Reload)
                                    </button>
                                </div>

                                {/* Live Test Results */}
                                {testResult && (
                                    <div className={`p-4 rounded-lg border mb-4 ${testResult.success ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
                                        <div className="flex items-center gap-2 font-bold mb-1">
                                            {testResult.success ? <CheckCircle size={18} className="text-green-500"/> : <AlertTriangle size={18} className="text-red-500"/>}
                                            <span className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                                                {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-mono text-slate-300 bg-black/20 p-2 rounded">
                                            {testResult.message}
                                        </p>
                                    </div>
                                )}

                                {/* PERMISSION DENIED SOLUTION */}
                                {testResult && !testResult.success && (testResult.message.includes('permission-denied') || testResult.message.includes('Missing or insufficient permissions')) && (
                                    <div className="bg-black/20 p-4 rounded-lg border border-yellow-600/50">
                                        <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2"><Zap size={14} className="fill-yellow-400"/> Hızlı Çözüm (Quick Fix): Security Rules</h4>
                                        <p className="text-sm text-slate-300 mb-3">
                                            Firebase varsayılan olarak veritabanını kilitli başlatır. Aşağıdaki kodu kopyalayıp Firebase Konsolu'ndaki "Rules" sekmesine yapıştırmanız gerekmektedir.
                                        </p>
                                        
                                        <div className="relative bg-slate-900 p-3 rounded border border-slate-700 mb-3">
                                            <code className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                                                {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
                                            </code>
                                            <button 
                                                onClick={copyRuleToClipboard}
                                                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded transition-colors text-xs flex items-center gap-1"
                                            >
                                                {copiedRule ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedRule ? 'Copied' : 'Copy Code'}
                                            </button>
                                        </div>

                                        <a 
                                            href="https://console.firebase.google.com/project/hotel-ac054/firestore/rules" 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold inline-flex items-center gap-2"
                                        >
                                            <ExternalLink size={16}/> 1. Firebase Kurallarını Aç
                                        </a>
                                        <span className="text-slate-400 text-xs ml-3">Linke git, kodu yapıştır ve "Publish" butonuna bas. Sonra buraya gelip "Sistemi Yeniden Başlat" de.</span>
                                    </div>
                                )}

                                {/* DATABASE NOT FOUND SOLUTION */}
                                {testResult && !testResult.success && (testResult.message.includes('not-found') || testResult.message.includes('does not exist')) && (
                                    <div className="bg-black/20 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle size={14} className="text-yellow-500"/> Database Not Found</h4>
                                        <p className="text-sm text-slate-300 mb-2">
                                            Veritabanı henüz oluşturulmamış. Firebase konsoluna gidip "Create Database" butonuna basmanız gerekiyor.
                                        </p>
                                        <a href="https://console.firebase.google.com/project/hotel-ac054/firestore" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs inline-flex items-center gap-1">
                                            <ExternalLink size={12}/> Open Firestore Console
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className={`${mutedText} text-sm font-bold uppercase mb-2`}>Total Hotels</h3>
                        <div className="text-3xl font-bold">{hotels.length}</div>
                    </div>
                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className={`${mutedText} text-sm font-bold uppercase mb-2`}>Total Users</h3>
                        <div className="text-3xl font-bold text-accent-500">{users.length}</div>
                    </div>
                    <div className={`${cardBg} p-6 rounded-xl border shadow-sm`}>
                        <h3 className={`${mutedText} text-sm font-bold uppercase mb-2`}>System Status</h3>
                        <div className="text-3xl font-bold text-green-500 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span> Online
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className={`flex gap-4 mb-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} pb-1 overflow-x-auto`}>
                    <button 
                        onClick={() => setActiveTab('hotels')}
                        className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'hotels' ? `border-b-2 border-accent-500 ${textMain}` : `${mutedText} hover:opacity-80`}`}
                    >
                        <Building2 size={18} /> Registered Hotels
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? `border-b-2 border-accent-500 ${textMain}` : `${mutedText} hover:opacity-80`}`}
                    >
                        <Users size={18} /> Registered Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'logs' ? `border-b-2 border-accent-500 ${textMain}` : `${mutedText} hover:opacity-80`}`}
                    >
                        <Activity size={18} /> Audit Logs
                    </button>
                </div>

                {/* Hotels Table */}
                {activeTab === 'hotels' && (
                    <div className={`${cardBg} rounded-xl border overflow-hidden`}>
                        <table className="w-full text-left">
                            <thead className={`${tableHeadBg} text-xs uppercase`}>
                                <tr>
                                    <th className="p-4">Hotel Name</th>
                                    <th className="p-4">Owner</th>
                                    <th className="p-4">Credits Usage</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                {hotels.map(hotel => {
                                    const owner = users.find(u => u.id === hotel.ownerId);
                                    const credits = owner?.creditsUsed || 0;
                                    const limit = owner?.creditLimit || 1000;
                                    const isOverLimit = credits > limit;
                                    const isDemo = hotel.id.includes('demo');

                                    return (
                                        <tr key={hotel.id} className={`${tableRowHover} transition-colors`}>
                                            <td className="p-4 font-medium">
                                                <div className={`flex items-center gap-2 ${textMain}`}>
                                                    {hotel.name}
                                                    {isDemo && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full">Demo</span>
                                                    )}
                                                </div>
                                                <div className={`text-xs ${mutedText}`}>{hotel.id}</div>
                                            </td>
                                            <td className={`p-4 text-sm ${mutedText}`}>
                                                <div>{owner?.name || 'Unknown'}</div>
                                                <div className="text-xs opacity-70">{owner?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-[100px]">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-xs font-mono font-bold ${isOverLimit ? 'text-red-500' : mutedText}`}>
                                                                {credits}/{limit}
                                                            </span>
                                                            {owner && (
                                                                <button 
                                                                    onClick={() => openCreditModal(owner)}
                                                                    className="bg-primary-600 hover:bg-primary-500 text-white rounded-full p-1 transition-colors shadow-sm"
                                                                    title="Add Credits"
                                                                >
                                                                    <PlusCircle size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${isOverLimit ? 'bg-red-500' : 'bg-green-500'}`} 
                                                                style={{ width: `${Math.min(100, (credits/limit)*100)}%`}}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {isOverLimit ? (
                                                     <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                         <AlertTriangle size={12} /> Restricted
                                                     </span>
                                                ) : (
                                                     <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1 w-fit">
                                                        <CheckCircle size={12} /> Active
                                                     </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleImpersonate(hotel)}
                                                    className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 ml-auto shadow-sm"
                                                >
                                                    <Eye size={14} /> Manage
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {hotels.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className={`p-8 text-center ${mutedText}`}>No hotels registered yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Users Table */}
                {activeTab === 'users' && (
                    <div className={`${cardBg} rounded-xl border overflow-hidden`}>
                        <table className="w-full text-left">
                            <thead className={`${tableHeadBg} text-xs uppercase`}>
                                <tr>
                                    <th className="p-4">User Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Hotel ID</th>
                                    <th className="p-4">Credits Limit</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                {users.map(user => (
                                    <tr key={user.id} className={`${tableRowHover} transition-colors`}>
                                        <td className="p-4 font-medium text-sm text-slate-200">
                                            {user.name}
                                        </td>
                                        <td className={`p-4 text-sm ${mutedText}`}>
                                            {user.email}
                                        </td>
                                        <td className={`p-4 text-xs ${mutedText} font-mono`}>
                                            {user.hotelId || 'No Hotel'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-green-500 text-sm">{user.creditLimit || 0}</span>
                                                <span className="text-xs text-slate-500">credits</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => openCreditModal(user)}
                                                className="bg-accent-600 hover:bg-accent-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 ml-auto shadow-sm"
                                            >
                                                <PlusCircle size={14} /> Add Credits
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className={`p-8 text-center ${mutedText}`}>No users registered yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Logs Table */}
                {activeTab === 'logs' && (
                    <div className={`${cardBg} rounded-xl border overflow-hidden`}>
                         <table className="w-full text-left">
                            <thead className={`${tableHeadBg} text-xs uppercase`}>
                                <tr>
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                                {logs.map(log => (
                                    <tr key={log.id} className={`${tableRowHover} transition-colors`}>
                                        <td className={`p-4 text-xs ${mutedText} font-mono`}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-accent-400">{log.userEmail}</td>
                                        <td className={`p-4 text-sm font-bold ${textMain}`}>{log.action}</td>
                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                )}
            </div>

            {/* Add Credit Modal */}
            {creditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className={`w-full max-w-md ${cardBg} rounded-xl shadow-2xl p-6 transform transition-all scale-100`}>
                         <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                             <h3 className={`font-serif font-bold text-xl ${textMain} flex items-center gap-2`}>
                                 <Coins className="text-accent-500" /> Add Credits
                             </h3>
                             <button onClick={() => setCreditModalOpen(false)} className={`${mutedText} hover:text-slate-200 transition-colors`}>
                                 <X size={20} />
                             </button>
                         </div>
                         
                         <div className="mb-6">
                             <p className={`${mutedText} text-sm mb-2`}>User:</p>
                             <div className={`font-bold ${textMain} bg-slate-900/30 p-3 rounded-lg border border-slate-700/50`}>
                                 {selectedUser.name} <span className="text-xs font-normal opacity-60">({selectedUser.email})</span>
                             </div>
                             <div className="flex justify-between mt-2 text-xs">
                                 <span className={mutedText}>Current Limit:</span>
                                 <span className="font-bold text-green-500">{selectedUser.creditLimit}</span>
                             </div>
                         </div>

                         <div className="mb-8">
                             <label className={`block text-xs font-bold uppercase mb-2 ${mutedText}`}>Amount to Add</label>
                             <div className="grid grid-cols-4 gap-2 mb-3">
                                 {[1000, 5000, 10000, 1000000].map(amt => (
                                     <button 
                                        key={amt}
                                        onClick={() => setCreditAmount(amt)}
                                        className={`py-2 rounded-lg text-xs font-bold transition-colors border ${creditAmount === amt ? 'bg-accent-600 border-accent-500 text-white' : 'bg-transparent border-slate-600 text-slate-400 hover:border-slate-400'}`}
                                     >
                                         +{amt >= 1000000 ? '1M' : amt.toLocaleString()}
                                     </button>
                                 ))}
                             </div>
                             <div className="relative">
                                 <input 
                                    type="number" 
                                    value={creditAmount}
                                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                                    className={`w-full p-3 rounded-lg bg-slate-900/50 border border-slate-600 ${textMain} focus:border-accent-500 outline-none font-bold text-lg text-center`}
                                 />
                                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold uppercase">Custom</div>
                             </div>
                         </div>

                         <div className="flex gap-3">
                             <button 
                                onClick={() => setCreditModalOpen(false)}
                                className="flex-1 py-3 rounded-lg font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                             >
                                 Cancel
                             </button>
                             <button 
                                onClick={handleAddCredits}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
                             >
                                 <PlusCircle size={18} /> Confirm
                             </button>
                         </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MasterAdmin;
