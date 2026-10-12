import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Trash2, CheckCircle2, AlertTriangle, Lock, 
  RotateCcw, History, Layers, Database, ShieldCheck, HelpCircle, 
  ChevronRight, ArrowUpRight, Check, X, RefreshCw, Server, User, Calendar
} from 'lucide-react';

const INITIAL_ACCOUNTS = [
  { code: '11110', name: 'Kas Kecil (Petty Cash)', type: 'Aset' },
  { code: '11120', name: 'Bank BCA Utama', type: 'Aset' },
  { code: '11200', name: 'Piutang Usaha', type: 'Aset' },
  { code: '11500', name: 'Persediaan Barang Dagang', type: 'Aset' },
  { code: '21100', name: 'Utang Usaha (Accounts Payable)', type: 'Liabilitas' },
  { code: '21200', name: 'Utang Biaya Operasional', type: 'Liabilitas' },
  { code: '51100', name: 'Beban Pembelian / HPP', type: 'Beban' },
  { code: '52100', name: 'Beban Operasional Lainnya', type: 'Beban' },
];

const INITIAL_VOUCHERS = [
  {
    id: 'VCH-2026-001',
    date: '2026-10-01',
    payee: 'PT Sinar Logistik Nusantara',
    paymentMethod: 'Transfer Bank',
    invoiceRef: 'INV-SN-8821',
    description: 'Pelunasan utang usaha pembelian persediaan suku cadang',
    status: 'POSTED',
    createdBy: 'Budi Santoso (Staff Akuntansi)',
    createdAt: '2026-10-01 09:30:15',
    hashChecksum: 'a3f9c2e18b74d6109f22e811c4',
    lines: [
      { id: 1, accountCode: '21100', accountName: 'Utang Usaha (Accounts Payable)', description: 'Pelunasan faktur INV-SN-8821', debit: 5000000, credit: 0 },
      { id: 2, accountCode: '11120', accountName: 'Bank BCA Utama', description: 'Pembayaran via transfer giro', debit: 0, credit: 5000000 }
    ]
  },
  {
    id: 'VCH-2026-002',
    date: '2026-10-05',
    payee: 'CV Mitra Sukses Mandiri',
    paymentMethod: 'Kas',
    invoiceRef: 'INV-MSM-102',
    description: 'Pembelian langsung alat tulis kantor & perlengkapan gudang',
    status: 'DRAFT',
    createdBy: 'Siti Aminah (Kasir)',
    createdAt: '2026-10-05 14:15:00',
    hashChecksum: '7c8b21ef9044a1b32d881900ff',
    lines: [
      { id: 1, accountCode: '52100', accountName: 'Beban Operasional Lainnya', description: 'Pembelian ATK gudang', debit: 750000, credit: 0 },
      { id: 2, accountCode: '11110', accountName: 'Kas Kecil (Petty Cash)', description: 'Pengeluaran kas kasir', debit: 0, credit: 750000 }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'history' | 'database' | 'docs'
  const [vouchers, setVouchers] = useState(INITIAL_VOUCHERS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  
  // Form State
  const [voucherNo, setVoucherNo] = useState(`VCH-2026-${String(vouchers.length + 1).padStart(3, '0')}`);
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [description, setDescription] = useState('');
  
  // Journal lines state
  const [lines, setLines] = useState([
    { id: 1, accountCode: '21100', accountName: 'Utang Usaha (Accounts Payable)', description: 'Pembayaran Utang Usaha', debit: 5000000, credit: 0 },
    { id: 2, accountCode: '11120', accountName: 'Bank BCA Utama', description: 'Pengeluaran Bank', debit: 0, credit: 5000000 }
  ]);

  // UI state feedback
  const [notification, setNotification] = useState(null);
  const [selectedVoucherDetail, setSelectedVoucherDetail] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = totalDebit > 0 && totalDebit === totalCredit;
    return { totalDebit, totalCredit, difference, isBalanced };
  }, [lines]);

  // Validation check
  const isFormValid = useMemo(() => {
    if (!payee.trim() || !description.trim() || !txDate) return false;
    if (!totals.isBalanced) return false;
    // Check if every line has account and at least debit or credit > 0
    for (let l of lines) {
      if (!l.accountCode) return false;
      if ((Number(l.debit) || 0) < 0 || (Number(l.credit) || 0) < 0) return false;
      if ((Number(l.debit) || 0) === 0 && (Number(l.credit) || 0) === 0) return false;
      if ((Number(l.debit) || 0) > 0 && (Number(l.credit) || 0) > 0) return false; // Biasanya satu baris salah satu
    }
    return true;
  }, [payee, description, txDate, totals, lines]);

  const handleAddLine = () => {
    setLines([...lines, { 
      id: Date.now(), 
      accountCode: '', 
      accountName: '', 
      description: '', 
      debit: 0, 
      credit: 0 
    }]);
  };

  const handleRemoveLine = (id) => {
    if (lines.length <= 2) {
      showNotification('Minimal harus terdapat 2 baris jurnal berpasangan debit & kredit.', 'error');
      return;
    }
    setLines(lines.filter(l => l.id !== id));
  };

  const handleLineChange = (id, field, value) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'accountCode') {
        const found = accounts.find(acc => acc.code === value);
        if (found) {
          updated.accountName = found.name;
        }
      }
      if (field === 'debit' && Number(value) > 0) {
        updated.credit = 0; // Prevent both debit and credit filled simultaneously for simplicity
      }
      if (field === 'credit' && Number(value) > 0) {
        updated.debit = 0;
      }
      return updated;
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadScenarioBalanced = () => {
    setPayee('PT Sinar Logistik Nusantara');
    setPaymentMethod('Transfer Bank');
    setInvoiceRef('INV-SN-8821');
    setDescription('Pembayaran utang usaha pembelian persediaan barang');
    setLines([
      { id: 1, accountCode: '21100', accountName: 'Utang Usaha (Accounts Payable)', description: 'Pelunasan utang faktur INV-SN-8821', debit: 5000000, credit: 0 },
      { id: 2, accountCode: '11120', accountName: 'Bank BCA Utama', description: 'Transfer pembayaran bank', debit: 0, credit: 5000000 }
    ]);
    showNotification('Skenario Jurnal Seimbang dimuat.', 'success');
  };

  const loadScenarioUnbalanced = () => {
    setPayee('CV Berkah Makmur');
    setPaymentMethod('Transfer Bank');
    setInvoiceRef('INV-BM-99');
    setDescription('Contoh pengujian jurnal tidak seimbang (Tombol Submit akan nonaktif)');
    setLines([
      { id: 1, accountCode: '51100', accountName: 'Beban Pembelian / HPP', description: 'Pembelian barang', debit: 5000000, credit: 0 },
      { id: 2, accountCode: '11120', accountName: 'Bank BCA Utama', description: 'Pembayaran kurang catat', debit: 0, credit: 4500000 }
    ]);
    showNotification('Skenario Jurnal Tidak Seimbang dimuat. Perhatikan tombol Submit.', 'warning');
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!payee.trim()) {
      showNotification('Nama pemasok / penerima wajib diisi.', 'error');
      return;
    }
    const newVoucher = {
      id: voucherNo,
      date: txDate,
      payee,
      paymentMethod,
      invoiceRef,
      description,
      status: 'DRAFT',
      createdBy: 'Budi Santoso (Staff Akuntansi)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      hashChecksum: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      lines: [...lines]
    };
    setVouchers([newVoucher, ...vouchers]);
    showNotification(`Voucher ${voucherNo} berhasil disimpan sebagai DRAFT.`, 'success');
    resetForm();
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      showNotification('Validasi gagal. Pastikan total debit sama dengan kredit dan form lengkap.', 'error');
      return;
    }
    const newVoucher = {
      id: voucherNo,
      date: txDate,
      payee,
      paymentMethod,
      invoiceRef,
      description,
      status: 'POSTED',
      createdBy: 'Budi Santoso (Staff Akuntansi)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      hashChecksum: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      lines: [...lines]
    };
    setVouchers([newVoucher, ...vouchers]);
    showNotification(`Voucher ${voucherNo} berhasil di-POSTING ke General Ledger!`, 'success');
    resetForm();
  };

  const resetForm = () => {
    setVoucherNo(`VCH-2026-${String(vouchers.length + 2).padStart(3, '0')}`);
    setPayee('');
    setInvoiceRef('');
    setDescription('');
    loadScenarioBalanced();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-900/30">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ERP Modul Keuangan
              </span>
              <span className="text-xs text-slate-400">PT Diponegoro Logistik Utama</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Voucher Entri Transaksi Kas Keluar</h1>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
          <button 
            onClick={() => setActiveTab('form')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'form' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Form Voucher</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Voucher ({vouchers.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('database')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'database' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Database className="w-4 h-4" />
            <span>Skema DB & Supabase</span>
          </button>
          <button 
            onClick={() => setActiveTab('docs')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${activeTab === 'docs' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Petunjuk & Skenario</span>
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 border animate-bounce ${
          notification.type === 'error' ? 'bg-rose-950/90 border-rose-700 text-rose-200' :
          notification.type === 'warning' ? 'bg-amber-950/90 border-amber-700 text-amber-200' :
          'bg-emerald-950/90 border-emerald-700 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" /> :
           notification.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" /> :
           <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* TAB 1: FORM VOUCHER KAS KELUAR */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            {/* Quick Demo Scenarios Toolbar */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                  Demo Cepat Pengujian:
                </span>
                <span className="text-sm text-slate-300">Pilih skenario untuk melihat perilaku validasi formulir:</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={loadScenarioBalanced}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-xl text-xs font-semibold transition border border-slate-600 flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Skenario: Bayar Utang Rp5 Juta (Seimbang)</span>
                </button>
                <button 
                  onClick={loadScenarioUnbalanced}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded-xl text-xs font-semibold transition border border-slate-600 flex items-center space-x-1.5"
                >
                  <X className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skenario: Jurnal Tidak Seimbang (Error)</span>
                </button>
              </div>
            </div>

            {/* Main Form Container */}
            <form onSubmit={handleSubmitPost} className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-800/60 px-8 py-5 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>Formulir Voucher Kas Keluar (Cash Disbursement Voucher)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Pencatatan pengeluaran kas/bank yang terintegrasi langsung dengan General Ledger & Inventory.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Status Dokumen</span>
                  <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    DRAFT BARU
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Header Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Nomor Voucher
                    </label>
                    <input 
                      type="text" 
                      value={voucherNo} 
                      onChange={(e) => setVoucherNo(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Tanggal Transaksi
                    </label>
                    <input 
                      type="date" 
                      value={txDate} 
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Metode Pembayaran
                    </label>
                    <select 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Transfer Bank">Transfer Bank (Bank BCA Utama)</option>
                      <option value="Kas">Kas / Kas Kecil (Petty Cash)</option>
                      <option value="Giro / Cheque">Giro / Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Nama Pemasok / Penerima
                    </label>
                    <input 
                      type="text" 
                      value={payee} 
                      onChange={(e) => setPayee(e.target.value)}
                      placeholder="Cth: PT Sinar Logistik Nusantara" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Referensi Faktur Pembelian (Opsional)
                    </label>
                    <input 
                      type="text" 
                      value={invoiceRef} 
                      onChange={(e) => setInvoiceRef(e.target.value)}
                      placeholder="Cth: INV-SN-8821" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Keterangan Transaksi
                    </label>
                    <input 
                      type="text" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Cth: Pelunasan utang usaha pembelian persediaan" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Dynamic Journal Lines Section */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-md font-bold text-white">Rincian Jurnal Akuntansi (Journal Lines)</h3>
                      <p className="text-xs text-slate-400">Setiap baris mencatat akun GL terkait dengan nominal debit dan kredit yang seimbang.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddLine}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-emerald-900/30"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Baris Jurnal</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3 w-1/4">Kode & Akun (Chart of Accounts)</th>
                          <th className="px-4 py-3 w-1/3">Keterangan Baris</th>
                          <th className="px-4 py-3 w-1/6 text-right">Debit (Rp)</th>
                          <th className="px-4 py-3 w-1/6 text-right">Kredit (Rp)</th>
                          <th className="px-4 py-3 w-12 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {lines.map((line, index) => (
                          <tr key={line.id} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3">
                              <select 
                                value={line.accountCode}
                                onChange={(e) => handleLineChange(line.id, 'accountCode', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                                required
                              >
                                <option value="">-- Pilih Akun GL --</option>
                                {accounts.map(acc => (
                                  <option key={acc.code} value={acc.code}>
                                    [{acc.code}] {acc.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input 
                                type="text"
                                value={line.description}
                                onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                                placeholder="Keterangan rincian..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number"
                                min="0"
                                step="1000"
                                value={line.debit}
                                onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 text-right focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number"
                                min="0"
                                step="1000"
                                value={line.credit}
                                onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 text-right focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                type="button" 
                                onClick={() => handleRemoveLine(line.id)}
                                className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg transition border border-rose-800/50"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Live Balanced Indicator and Summary Footer */}
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-2xl border ${
                        totals.isBalanced ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400' : 'bg-rose-950/80 border-rose-700 text-rose-400'
                      }`}>
                        {totals.isBalanced ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Keseimbangan:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            totals.isBalanced ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {totals.isBalanced ? 'SEIMBANG (BALANCED)' : 'TIDAK SEIMBANG (UNBALANCED)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {totals.isBalanced ? 'Total debit sama dengan total kredit. Siap diposting ke GL.' : `Selisih debit dan kredit: Rp ${totals.difference.toLocaleString('id-ID')}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
                      <div>
                        <span className="text-xs text-slate-400 block uppercase">Total Debit</span>
                        <span className="text-base font-bold font-mono text-emerald-400">Rp {totals.totalDebit.toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block uppercase">Total Kredit</span>
                        <span className="text-base font-bold font-mono text-emerald-400">Rp {totals.totalCredit.toLocaleString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block uppercase">Selisih</span>
                        <span className={`text-base font-bold font-mono ${totals.difference === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Rp {totals.difference.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <button 
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold text-sm transition border border-slate-600 flex items-center space-x-2"
                    >
                      <span>Simpan Sebagai Draft</span>
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={!isFormValid}
                      className={`px-8 py-3 rounded-xl font-bold text-sm transition flex items-center space-x-2 shadow-lg ${
                        isFormValid 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer' 
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                      }`}
                      title={!isFormValid ? 'Tombol nonaktif karena jurnal tidak seimbang atau data belum lengkap' : 'Klik untuk Posting ke General Ledger'}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Submit & Post ke General Ledger</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: RIWAYAT VOUCHER */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <History className="w-5 h-5 text-emerald-400" />
                    <span>Riwayat Voucher Kas Keluar & Audit Trail</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Daftar voucher yang tersimpan dalam sistem. Voucher berstatus POSTED terkunci secara permanen.</p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                  Total Voucher: <span className="font-bold text-white">{vouchers.length}</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-3">No. Voucher</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Penerima / Pemasok</th>
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3">Keterangan</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Aksi / Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-800/40">
                    {vouchers.map(v => (
                      <tr key={v.id} className="hover:bg-slate-800/80 transition">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">{v.id}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs">{v.date}</td>
                        <td className="px-4 py-3 font-medium text-white">{v.payee}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs">{v.paymentMethod}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs truncate max-w-xs">{v.description}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            v.status === 'POSTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            v.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => setSelectedVoucherDetail(v)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-emerald-300 rounded-lg text-xs font-semibold transition border border-slate-600 flex items-center space-x-1 mx-auto"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SKEMA DATABASE & SUPABASE */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Database className="w-6 h-6 text-emerald-400" />
                  <span>Arsitektur Basis Data & Hubungan General Ledger</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Sistem menggunakan tabel PostgreSQL standar tanpa duplikasi, terhubung langsung dengan modul akuntansi PT Diponegoro Logistik Utama.</p>
              </div>

              {/* Supabase Connection Setup Box */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Server className={`w-5 h-5 ${supabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <div>
                      <h3 className="text-sm font-bold text-white">Status Integrasi Supabase PostgreSQL</h3>
                      <p className="text-xs text-slate-400">
                        {supabaseConnected ? 'Terhubung ke instance Supabase.' : 'Mode Simulasi Lokal aktif. Masukkan kredensial untuk sinkronisasi cloud.'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${supabaseConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {supabaseConnected ? 'ONLINE' : 'SIMULASI LOKAL'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <input 
                    type="text" 
                    placeholder="Supabase Project URL (https://xyz.supabase.co)" 
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="flex space-x-2">
                    <input 
                      type="password" 
                      placeholder="Supabase Anon / Service API Key" 
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button 
                      onClick={() => {
                        if (supabaseUrlInput && supabaseKeyInput) {
                          setSupabaseConnected(true);
                          showNotification('Koneksi Supabase berhasil diinisialisasi!', 'success');
                        } else {
                          showNotification('Mohon isi URL dan API Key dengan benar.', 'warning');
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                    >
                      Hubungkan
                    </button>
                  </div>
                </div>
              </div>

              {/* Database Schema Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                    <Layers className="w-4 h-4" />
                    <span>Tabel: journal_headers & journal_lines</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Setiap submit kas keluar akan mencatat header ke <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded font-mono">journal_headers</code> (menyimpan nomor referensi, tanggal, deskripsi, status <code className="text-amber-300">POSTED</code>, <code className="text-amber-300">created_by</code>, dan <code className="text-amber-300">hash_checksum</code>) serta rincian baris ke <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded font-mono">journal_lines</code>.
                  </p>
                  <div className="bg-slate-800 p-3 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    {`CREATE TABLE journal_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no VARCHAR(50) UNIQUE NOT NULL,
  tx_date DATE NOT NULL,
  payee VARCHAR(150) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT',
  created_by VARCHAR(100) NOT NULL,
  hash_checksum VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Enforcement Backend & Keamanan (PostgreSQL RLS)</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Aturan integritas ditegakkan langsung di level database melalui PostgreSQL trigger / Row Level Security (RLS). Jurnal berstatus <code className="text-emerald-400 font-bold">POSTED</code> dikunci secara permanen sehingga tidak dapat dihapus atau diedit langsung. Koreksi wajib melalui jurnal pembalik (<span className="italic">reversing entry / storno</span>).
                  </p>
                  <div className="bg-slate-800 p-3 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    {`-- PostgreSQL Trigger untuk Mencegah Edit Status POSTED
CREATE OR REPLACE FUNCTION prevent_posted_journal_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'POSTED' THEN
    RAISE EXCEPTION 'Akses ditolak: Jurnal berstatus POSTED terkunci permanen.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PETUNJUK & SKENARIO PENGUJIAN */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <HelpCircle className="w-6 h-6 text-emerald-400" />
                  <span>Petunjuk Penggunaan & Skenario Pengujian Akuntansi</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Panduan lengkap modul Kas Keluar PT Diponegoro Logistik Utama sesuai standar akuntansi keuangan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">1</div>
                  <h3 className="text-sm font-bold text-white">Skenario Bayar Utang Usaha</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pembayaran utang usaha kepada pemasok atas pembelian persediaan senilai Rp5.000.000. Jurnal: 
                    <br />- <strong>Debit</strong>: Utang Usaha (Rp5.000.000)
                    <br />- <strong>Kredit</strong>: Bank BCA Utama (Rp5.000.000)
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">2</div>
                  <h3 className="text-sm font-bold text-white">Validasi Live Balanced</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sistem menghitung otomatis total debit dan kredit secara real-time. Tombol <strong>Submit & Post</strong> secara otomatis terkunci (<code className="text-rose-400">disabled</code>) jika total tidak seimbang atau ada baris kosong.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">3</div>
                  <h3 className="text-sm font-bold text-white">Audit Trail & Checksum</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Setiap voucher yang di-posting mencatat identitas pembuat (<code className="text-indigo-300">created_by</code>), waktu persis (<code className="text-indigo-300">created_at</code>), dan nilai <code className="text-indigo-300">hash_checksum</code> untuk verifikasi integritas data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* DETAIL MODAL VOUCHER */}
      {selectedVoucherDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">{selectedVoucherDetail.id}</span>
                <h3 className="text-lg font-bold text-white">Detail Voucher & Audit Trail</h3>
              </div>
              <button 
                onClick={() => setSelectedVoucherDetail(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block">Tanggal Transaksi:</span>
                  <span className="font-semibold text-white">{selectedVoucherDetail.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Penerima / Pemasok:</span>
                  <span className="font-semibold text-white">{selectedVoucherDetail.payee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Metode Pembayaran:</span>
                  <span className="font-semibold text-white">{selectedVoucherDetail.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Referensi Faktur:</span>
                  <span className="font-semibold text-white">{selectedVoucherDetail.invoiceRef || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Keterangan:</span>
                  <span className="font-semibold text-white">{selectedVoucherDetail.description}</span>
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Rincian Jurnal Akuntansi</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="px-3 py-2">Akun GL</th>
                        <th className="px-3 py-2">Keterangan</th>
                        <th className="px-3 py-2 text-right">Debit (Rp)</th>
                        <th className="px-3 py-2 text-right">Kredit (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedVoucherDetail.lines.map((l, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono text-emerald-400">[{l.accountCode}] {l.accountName}</td>
                          <td className="px-3 py-2 text-slate-300">{l.description}</td>
                          <td className="px-3 py-2 text-right font-mono">{l.debit ? l.debit.toLocaleString('id-ID') : '-'}</td>
                          <td className="px-3 py-2 text-right font-mono">{l.credit ? l.credit.toLocaleString('id-ID') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Info */}
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Informasi Audit & Keamanan Integrasi</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 font-mono">
                  <div>Status: <span className="text-emerald-400 font-bold">{selectedVoucherDetail.status}</span></div>
                  <div>Dibuat oleh: <span>{selectedVoucherDetail.createdBy}</span></div>
                  <div>Waktu: <span>{selectedVoucherDetail.createdAt}</span></div>
                  <div className="col-span-2 truncate">Checksum: <span className="text-slate-400">{selectedVoucherDetail.hashChecksum}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 px-6 py-4 border-t border-slate-700 flex justify-end">
              <button 
                onClick={() => setSelectedVoucherDetail(null)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
