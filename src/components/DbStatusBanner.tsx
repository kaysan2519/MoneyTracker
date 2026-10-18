'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface DbStatusBannerProps {
  dbConnected: boolean | null;
  errorMessage?: string;
}

export default function DbStatusBanner({ dbConnected, errorMessage }: DbStatusBannerProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <div className="mb-6 rounded-lg bg-[#141518] border border-[#262830] p-4 text-xs text-[#8E929B]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <div>
            <span className="font-medium text-[#F4F4F6] mr-2">
              Koneksi Aiven belum aktif
            </span>
            <span className="text-[#8E929B]">
              {errorMessage || 'Konfigurasikan variabel lingkungan database pada .env.local untuk memuat data aktual.'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center text-xs font-medium text-[#D1D3D8] hover:text-white transition-colors flex-shrink-0"
        >
          {showGuide ? 'Sembunyikan Panduan' : 'Lihat Panduan Setup'}
          {showGuide ? (
            <ChevronUp className="w-3.5 h-3.5 ml-1" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-1" />
          )}
        </button>
      </div>

      {showGuide && (
        <div className="mt-3.5 pt-3 border-t border-[#1E2026] space-y-2.5 text-[#8E929B]">
          <p className="text-xs text-[#D1D3D8]">
            Buat file <code className="text-[#F4F4F6] font-mono bg-[#0C0D0E] px-1.5 py-0.5 rounded border border-[#23262D]">.env.local</code> di folder root dan isi sesuai kredensial Aiven:
          </p>

          <div className="relative">
            <pre className="p-3 rounded bg-[#0C0D0E] border border-[#1C1E23] text-[#8E929B] font-mono text-[11px] overflow-x-auto">
              {exampleEnvText}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-1 rounded bg-[#181A1E] text-[#8E929B] hover:text-[#F4F4F6] transition-colors flex items-center gap-1 text-[11px]"
              title="Salin konfigurasi"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
