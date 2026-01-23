
import React, { useState } from 'react';
import { FileText, Download, Plus, Send, Printer, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Currency, Language, Reservation, HotelDetails } from '../types';
import { formatCurrency, translations } from '../utils/helpers';

interface InvoicingProps {
    currency: Currency;
    language: Language;
    reservations: Reservation[];
    hotelDetails: HotelDetails;
}

// Mock Invoice Type
interface Invoice {
    id: string;
    number: string;
    date: string;
    guestName: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Cancelled';
    type: 'E-Fatura' | 'E-Arşiv';
    reservationId?: string;
}

const Invoicing: React.FC<InvoicingProps> = ({ currency, language, reservations, hotelDetails }) => {
    const t = translations[language];
    const locale = language === 'tr' ? 'tr-TR' : 'en-US';
    const [activeTab, setActiveTab] = useState<'list' | 'create' | 'integrations'>('list');
    
    // Mock Invoices
    const [invoices, setInvoices] = useState<Invoice[]>([
        { id: '1', number: 'GIB20230001', date: '2023-10-25', guestName: 'Ahmet Yilmaz', amount: 4500, status: 'Sent', type: 'E-Fatura', reservationId: 'r1' },
        { id: '2', number: 'GIB20230002', date: '2023-10-26', guestName: 'John Doe', amount: 12000, status: 'Paid', type: 'E-Arşiv', reservationId: 'r2' },
    ]);

    // Creation Form State
    const [selectedResId, setSelectedResId] = useState('');
    const [invoiceType, setInvoiceType] = useState<'E-Fatura' | 'E-Arşiv'>('E-Arşiv');
    const [creating, setCreating] = useState(false);

    const handleCreateInvoice = () => {
        setCreating(true);
        setTimeout(() => {
            const res = reservations.find(r => r.id === selectedResId);
            if (res) {
                const newInv: Invoice = {
                    id: Date.now().toString(),
                    number: `GIB${new Date().getFullYear()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                    date: new Date().toISOString().split('T')[0],
                    guestName: res.guestName,
                    amount: res.amount,
                    status: 'Sent',
                    type: invoiceType,
                    reservationId: res.id
                };
                setInvoices([newInv, ...invoices]);
                setActiveTab('list');
                setCreating(false);
                setSelectedResId('');
            }
        }, 1500);
    };

    const handlePrint = (invoice: Invoice) => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice ${invoice.number}</title>
                        <style>
                            body { font-family: 'Helvetica', sans-serif; padding: 40px; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                            .company { font-size: 24px; font-weight: bold; color: #333; }
                            .details { margin-bottom: 30px; }
                            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            .table th { text-align: left; border-bottom: 1px solid #ddd; padding: 10px; background: #f9f9f9; }
                            .table td { padding: 10px; border-bottom: 1px solid #eee; }
                            .total { text-align: right; font-size: 20px; font-weight: bold; }
                            .footer { margin-top: 50px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="company">${hotelDetails.companyName || 'Hotel Name'}</div>
                            <div style="text-align: right;">
                                <div><strong>${t.invoiceNumber}:</strong> ${invoice.number}</div>
                                <div><strong>${t.date}:</strong> ${invoice.date}</div>
                            </div>
                        </div>
                        <div class="details">
                            <strong>${t.customer}:</strong> ${invoice.guestName}<br>
                            <strong>${t.type}:</strong> ${invoice.type}<br>
                            ${hotelDetails.taxId ? `<strong>VKN:</strong> ${hotelDetails.taxId}` : ''}
                        </div>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Accommodation Services</td>
                                    <td>${formatCurrency(invoice.amount, currency, locale)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="total">
                            Total: ${formatCurrency(invoice.amount, currency, locale)}
                        </div>
                        <div class="footer">
                            Thank you for your business.<br>
                            Generated by Aura PMS
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const handleDownload = (invoice: Invoice) => {
        const content = `
INVOICE
--------------------------------
Invoice Number: ${invoice.number}
Date: ${invoice.date}
Type: ${invoice.type}
--------------------------------
Issuer: ${hotelDetails.companyName}
Tax ID: ${hotelDetails.taxId}
--------------------------------
Customer: ${invoice.guestName}
--------------------------------
Description              Amount
Accommodation Services   ${formatCurrency(invoice.amount, currency, locale)}
--------------------------------
TOTAL: ${formatCurrency(invoice.amount, currency, locale)}
--------------------------------
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_${invoice.number}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const eligibleReservations = reservations.filter(r => !invoices.find(i => i.reservationId === r.id));

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">{t.invoicesTitle}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t.invoicesDesc}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {t.allInvoices}
                    </button>
                    <button 
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-slate-700'}`}
                    >
                        <Plus size={16} /> {t.createInvoice}
                    </button>
                    <button 
                         onClick={() => setActiveTab('integrations')}
                         className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-slate-800 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {t.integrations}
                    </button>
                </div>
            </div>

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['GIB Portal', 'Paraşüt', 'Logo İşbaşı', 'Bizim Hesap'].map((provider, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{provider}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Seamless E-Fatura integration.</p>
                            <button className={`w-full py-2 rounded-lg text-sm font-bold ${i === 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-slate-900 dark:bg-slate-700 text-white'}`}>
                                {i === 0 ? t.connected : t.connect}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* List Tab */}
            {activeTab === 'list' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">{t.invoiceNumber}</th>
                                <th className="p-4">{t.date}</th>
                                <th className="p-4">{t.customer}</th>
                                <th className="p-4">{t.type}</th>
                                <th className="p-4">{t.amount}</th>
                                <th className="p-4">{t.status}</th>
                                <th className="p-4 text-right">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{inv.number}</td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{inv.date}</td>
                                    <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-200">{inv.guestName}</td>
                                    <td className="p-4 text-sm">
                                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-bold border border-blue-100 dark:border-blue-800">{inv.type}</span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(inv.amount, currency, locale)}</td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 w-fit ${
                                            inv.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                                            inv.status === 'Sent' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {inv.status === 'Paid' ? <CheckCircle size={12}/> : <Send size={12}/>}
                                            {
                                                // @ts-ignore
                                                t[inv.status.toLowerCase()] || inv.status
                                            }
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handlePrint(inv)}
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                                title="Print"
                                            >
                                                <Printer size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => handleDownload(inv)}
                                                className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700 rounded"
                                                title="Download"
                                            >
                                                <Download size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Tab */}
            {activeTab === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-primary-600 dark:text-primary-400" /> {t.createInvoice}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{t.selectReservation}</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <select 
                                        value={selectedResId}
                                        onChange={(e) => setSelectedResId(e.target.value)}
                                        className="w-full border border-slate-200 dark:border-slate-600 p-3 pl-10 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-slate-50 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="">{t.selectGuest}</option>
                                        {eligibleReservations.map(r => (
                                            <option key={r.id} value={r.id}>{r.guestName} - {r.checkIn} ({formatCurrency(r.amount, currency, locale)})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{t.invoiceType}</label>
                                    <select 
                                        value={invoiceType}
                                        onChange={(e) => setInvoiceType(e.target.value as any)}
                                        className="w-full border border-slate-200 dark:border-slate-600 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="E-Arşiv">E-Arşiv</option>
                                        <option value="E-Fatura">E-Fatura</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{t.date}</label>
                                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-200 dark:border-slate-600 p-3 rounded-lg dark:bg-slate-700 dark:text-white" />
                                </div>
                            </div>

                            {hotelDetails.taxId ? (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-lg flex gap-3 items-start">
                                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-green-800 dark:text-green-300">{t.issuerInfoReady}</h4>
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                            {hotelDetails.companyName}<br/>
                                            VKN: {hotelDetails.taxId}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-4 rounded-lg flex gap-3 items-start">
                                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-300">{t.missingBillingInfo}</h4>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">{t.missingBillingDesc}</p>
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleCreateInvoice}
                                disabled={!selectedResId || creating}
                                className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {creating ? t.generatingInvoice : t.issueInvoice}
                                {!creating && <Send size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-medium">{t.invoicePreview}</p>
                            <p className="text-xs mt-2">{t.previewDesc}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoicing;
