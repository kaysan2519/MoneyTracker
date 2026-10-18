'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      <div 
        className="w-full max-w-sm rounded-lg bg-[#121316] border border-[#23262D] shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-[#F4F4F6] mb-1.5">{title}</h3>
        <p className="text-xs text-[#8E929B] leading-relaxed mb-3">
          {message}
        </p>

        {itemName && (
          <div className="p-2.5 rounded bg-[#0C0D0E] border border-[#1C1E23] mb-4">
            <p className="text-xs font-medium text-[#D1D3D8] truncate">
              {itemName}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[#8E929B] hover:text-[#F4F4F6] hover:bg-[#181A1E] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
