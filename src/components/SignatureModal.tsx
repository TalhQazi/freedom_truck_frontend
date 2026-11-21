import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, CheckCircle, PenTool } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title: string;
  subtitle?: string;
  declarationText?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  subtitle,
  declarationText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        setHasDrawn(false);
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    if (!hasDrawn) {
      alert('Please provide a signature before confirming.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-lg border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white text-slate-900 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-md border border-slate-200">
              <PenTool className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{title}</h3>
              {subtitle && <p className="text-sm text-slate-700">{subtitle}</p>}
            </div>
          </div>
          <button aria-label="Close"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {declarationText && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 leading-relaxed font-sans">
              {declarationText}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>Sign within the boundary below:</span>
              <span className="text-xs text-slate-500">Touchscreen &amp; Mouse Enabled</span>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-md bg-slate-50/50 hover:border-slate-400 transition-colors">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                className="w-full h-40 touch-none cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="absolute bottom-3 left-4 right-4 border-b border-slate-300 pointer-events-none flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  X Digital Signature Line
                </span>
                <span className="text-xs text-slate-500">SOP Validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Canvas</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirm &amp; Record Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
