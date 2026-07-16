import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="fixed inset-0 bg-ink-900/60 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 max-w-sm w-full"
            >
              <div className="flex items-start gap-4 mb-5">
                {danger && <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
                <div>
                  <h3 className="text-base font-medium mb-1">{title}</h3>
                  <p className="text-sm text-ink-500">{message}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={onCancel} className="btn-outline !py-2 !px-4 text-xs">{cancelLabel}</button>
                <button onClick={onConfirm} className={`btn-primary !py-2 !px-4 text-xs ${danger ? '!bg-red-600 hover:!bg-red-700' : ''}`}>{confirmLabel}</button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
