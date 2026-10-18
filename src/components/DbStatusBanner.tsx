'use client';

import React, { useState } from 'react';
import { Database, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface DbStatusBannerProps {
  dbConnected: boolean | null;
  errorMessage?: string;
}

export default function DbStatusBanner({ dbConnected, errorMessage }: DbStatusBannerProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  // Jika terhubung, banner tidak perlu ditampilkan
  if (dbConnected === true || dbConnected === null) return null;

  const exampleEnvText = `DB_HOST=mysql-xxxx.aivencloud.com
DB_PORT=24789
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=money_tracker
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exampleEnvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#181d28] to-amber-500/5 border border-amber-500/30 p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <span>Koneksi Database Aiven Belum Terkonfigurasi</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Setup Diperlukan
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {errorMessage || 'Aplikasi membutuhkan kredensial database MySQL Aiven pada file .env.local untuk memuat dan menyimpan data secara nyata.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all whitespace-nowrap"
        >
          <Database className="w-3.5 h-3.5 mr-1.5" />
          {showGuide ? 'Tutup Panduan' : 'Panduan Koneksi Aiven'}
          {showGuide ? (
            <ChevronUp className="w-3.5 h-3.5 ml-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          )}
        </button>
      </div>

      {/* Accordion Guide */}
      {showGuide && (
        <div className="mt-4 pt-4 border-t border-amber-500/20 text-xs text-slate-300 space-y-3 animate-fadeIn">
          <p className="font-semibold text-amber-200">
            Langkah Cepat Menghubungkan ke MySQL Aiven:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
            <li>
              Buka console Aiven Anda dan pilih service MySQL yang berisi database <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono">money_tracker</code>.
            </li>
            <li>
              Salin nilai <strong>Host</strong>, <strong>Port</strong>, <strong>User</strong>, dan <strong>Password</strong> dari Overview Service Aiven.
            </li>
            <li>
              Buat file baru bernama <code className="px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 font-mono">.env.local</code> di folder root proyek ini (sejajar dengan package.json).
            </li>
            <li>
              Tempel konfigurasi berikut dan isi sesuai kredensial Aiven Anda:
            </li>
          </ol>

          <div className="relative mt-2">
            <pre className="p-3.5 rounded-xl bg-[#090d16] border border-[#1e293b] text-slate-300 font-mono text-[11px] overflow-x-auto">
              {exampleEnvText}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px]"
              title="Salin template"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Setelah membuat file <code className="font-mono text-slate-300">.env.local</code>, restart server pengembang (development server) Anda dengan <code className="px-1 py-0.5 bg-black/30 text-slate-300 font-mono">npm run dev</code>.
          </p>
        </div>
      )}
    </div>
  );
}
