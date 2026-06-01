import { useState } from 'react';
import { ImageOff, Maximize2, Minimize2 } from 'lucide-react';
import { Weld, Part } from '@/types/weldcloud';

interface DrawingWithHighlightProps {
  selectedWeld: Weld | null;
  currentPart: Part | undefined;
  compact?: boolean;
}

export function DrawingWithHighlight({ selectedWeld, currentPart, compact = false }: DrawingWithHighlightProps) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pos = selectedWeld?.drawingPosition;


  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative bg-white rounded-xl border border-[#2a2a2a] overflow-hidden cursor-pointer group transition-all duration-300 ${
          isExpanded ? '' : compact ? 'max-h-48' : 'max-h-80'
        }`}
      >
        {/* Expand/collapse button */}
        <div className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 hover:bg-black/70 rounded-md backdrop-blur-sm transition-colors">
          {isExpanded ? (
            <Minimize2 className="w-4 h-4 text-white" />
          ) : (
            <Maximize2 className="w-4 h-4 text-white" />
          )}
        </div>

        {!imageError ? (
          <img
            src="/.dyad/media/91d0dd50d18370a2fe22dec401e802b5ba0fe0d7a7b3d51d20842996537eba11.png"
            alt={`Drawing for ${currentPart?.id || 'part'}`}
            className="w-full h-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-3 bg-[#f5f5f5]">
            <ImageOff className="w-10 h-10 text-gray-400" />
            <span className="text-sm text-gray-500">Part drawing for {currentPart?.id}</span>
            <span className="text-xs text-gray-400">CAD view · Section B</span>
          </div>
        )}

        {pos && !imageError && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
          >
            <div className="breathe-ring" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 1;
          }
        }
        .breathe-ring {
          width: 24px;
          height: 24px;
          border: 2px solid #ef4444;
          border-radius: 50%;
          background: transparent;
          animation: breathe 1.8s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
        }
      `}</style>
    </div>
  );
}