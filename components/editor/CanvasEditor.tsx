'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/lib/store/editorStore';
import { getScaledPrintArea } from '@/lib/fabric/helpers';

export default function CanvasEditor({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const artworkObjRef = useRef<any>(null);
  const bgObjRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 700 });

  const { selectedTemplate, blendMode, opacity, setArtwork, setIsDirty, saveActiveProject, activeProject } = useEditorStore();

  // Initialize/resize canvas
  const initCanvas = useCallback(async () => {
    if (!containerRef.current || !canvasRef.current) return;

    const { fabric } = await import('fabric');

    const containerW = containerRef.current.clientWidth - 40;
    const containerH = containerRef.current.clientHeight - 40;

    const templateW = selectedTemplate?.width || 1000;
    const templateH = selectedTemplate?.height || 1200;
    const ratio = templateW / templateH;
    const containerRatio = containerW / containerH;

    let canvasW, canvasH;
    if (ratio > containerRatio) {
      canvasW = Math.min(containerW, 700);
      canvasH = canvasW / ratio;
    } else {
      canvasH = Math.min(containerH, 800);
      canvasW = canvasH * ratio;
    }

    setCanvasSize({ w: Math.floor(canvasW), h: Math.floor(canvasH) });

    if (fabricRef.current) {
      fabricRef.current.setWidth(Math.floor(canvasW));
      fabricRef.current.setHeight(Math.floor(canvasH));
      fabricRef.current.renderAll();
      return fabricRef.current;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: Math.floor(canvasW),
      height: Math.floor(canvasH),
      backgroundColor: '#1a1a1a',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    canvas.on('object:modified', () => setIsDirty(true));

    return canvas;
  }, [selectedTemplate]);

  // Load template background
  const loadTemplateBackground = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedTemplate) return;

    const { fabric } = await import('fabric');

    // Remove existing background
    if (bgObjRef.current) {
      canvas.remove(bgObjRef.current);
      bgObjRef.current = null;
    }

    // Draw a stylized placeholder for the template
    const { width: cW, height: cH } = canvas;
    const printArea = getScaledPrintArea(
      selectedTemplate.printArea,
      cW, cH,
      selectedTemplate.width,
      selectedTemplate.height
    );

    // Create print area guide rect
    const guideRect = new fabric.Rect({
      left: printArea.x,
      top: printArea.y,
      width: printArea.width,
      height: printArea.height,
      fill: 'transparent',
      stroke: 'rgba(255, 77, 0, 0.4)',
      strokeWidth: 1,
      strokeDashArray: [6, 4],
      selectable: false,
      evented: false,
    });

    canvas.add(guideRect);
    bgObjRef.current = guideRect;
    canvas.renderAll();
  }, [selectedTemplate]);

  // Initialize canvas on mount
  useEffect(() => {
    initCanvas().then(canvas => {
      if (canvas && selectedTemplate) {
        loadTemplateBackground();
      }
    });
  }, [selectedTemplate]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !fabricRef.current) return;
      const containerW = containerRef.current.clientWidth - 40;
      const containerH = containerRef.current.clientHeight - 40;
      const templateW = selectedTemplate?.width || 1000;
      const templateH = selectedTemplate?.height || 1200;
      const ratio = templateW / templateH;
      const containerRatio = containerW / containerH;
      let canvasW, canvasH;
      if (ratio > containerRatio) {
        canvasW = Math.min(containerW, 700);
        canvasH = canvasW / ratio;
      } else {
        canvasH = Math.min(containerH, 800);
        canvasW = canvasH * ratio;
      }
      fabricRef.current.setWidth(Math.floor(canvasW));
      fabricRef.current.setHeight(Math.floor(canvasH));
      setCanvasSize({ w: Math.floor(canvasW), h: Math.floor(canvasH) });
      fabricRef.current.renderAll();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedTemplate]);

  // Update blend mode and opacity when they change
  useEffect(() => {
    if (!fabricRef.current || !artworkObjRef.current) return;
    const obj = artworkObjRef.current;
    obj.set({
      globalCompositeOperation: blendMode,
      opacity: opacity / 100,
    });
    fabricRef.current.renderAll();
    setIsDirty(true);
  }, [blendMode, opacity]);

  // Load artwork image onto canvas
  const loadArtwork = useCallback(async (dataUrl: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const { fabric } = await import('fabric');

    if (artworkObjRef.current) {
      canvas.remove(artworkObjRef.current);
      artworkObjRef.current = null;
    }

    fabric.Image.fromURL(dataUrl, (img: any) => {
      if (!img || !canvas) return;

      const printArea = selectedTemplate
        ? getScaledPrintArea(
            selectedTemplate.printArea,
            canvas.width!, canvas.height!,
            selectedTemplate.width, selectedTemplate.height
          )
        : { x: 50, y: 50, width: canvas.width! - 100, height: canvas.height! - 100, rotation: 0 };

      const scaleX = printArea.width / (img.width || 1);
      const scaleY = printArea.height / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);

      img.set({
        left: printArea.x + printArea.width / 2,
        top: printArea.y + printArea.height / 2,
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        globalCompositeOperation: blendMode,
        opacity: opacity / 100,
        cornerStyle: 'circle',
        cornerColor: '#FF4D00',
        cornerStrokeColor: '#FF4D00',
        borderColor: '#FF4D00',
        transparentCorners: false,
        cornerSize: 10,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      artworkObjRef.current = img;
      canvas.renderAll();
      setArtwork(dataUrl);
      setIsDirty(true);

      // Auto-save thumbnail
      const thumbnail = canvas.toDataURL({ format: 'png', quality: 0.5 });
      saveActiveProject(canvas.toJSON(), thumbnail);
    }, { crossOrigin: 'anonymous' });
  }, [selectedTemplate, blendMode, opacity]);

  // Export canvas as dataURL (called by ExportModal via store or event)
  useEffect(() => {
    (window as any).__getCanvasDataUrl = () => {
      return fabricRef.current?.toDataURL({ format: 'png', quality: 1 }) || null;
    };
    (window as any).__getCanvasJSON = () => {
      return fabricRef.current?.toJSON() || {};
    };
    (window as any).__getCanvasThumbnail = () => {
      return fabricRef.current?.toDataURL({ format: 'png', quality: 0.4 }) || null;
    };
  }, []);

  // File upload
  const handleFileUpload = async (file: File) => {
    if (!selectedTemplate) {
      showToast('Please select a template first', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) loadArtwork(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-4 sm:p-5"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {/* Canvas */}
      <div
        className={`canvas-wrapper relative shadow-2xl shadow-black/60 rounded-lg overflow-hidden transition-all duration-200 ${dragging ? 'ring-2 ring-forge-accent scale-[1.01]' : ''}`}
        style={{ width: canvasSize.w, height: canvasSize.h }}
      >
        <canvas ref={canvasRef} />

        {/* Upload prompt overlay - shown when no artwork */}
        {!artworkObjRef.current && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer z-10"
            style={{ backgroundColor: 'rgba(17,17,19,0.85)' }}
            onClick={() => selectedTemplate ? fileInputRef.current?.click() : showToast('Select a template first', 'info')}
          >
            {selectedTemplate ? (
              <>
                <div className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${dragging ? 'border-forge-accent bg-forge-accent/10' : 'border-forge-muted'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12l7-7 7 7" stroke={dragging ? '#FF4D00' : '#6B6B7B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-center px-4">
                  <p className="font-semibold text-forge-text text-sm">{dragging ? 'Drop your image' : 'Upload your artwork'}</p>
                  <p className="text-forge-subtle text-xs mt-1">Drop here or tap to browse</p>
                  <p className="text-forge-subtle text-xs">PNG, JPG, SVG, WebP</p>
                </div>
                <div className="absolute top-3 left-3 bg-forge-accent/20 text-forge-accent text-xs px-2 py-0.5 rounded font-semibold">
                  {selectedTemplate.name}
                </div>
                {/* Print area guide */}
                {selectedTemplate && (
                  <div
                    className="absolute border border-dashed border-forge-accent/30 rounded pointer-events-none"
                    style={{
                      left: `${(selectedTemplate.printArea.x / selectedTemplate.width) * 100}%`,
                      top: `${(selectedTemplate.printArea.y / selectedTemplate.height) * 100}%`,
                      width: `${(selectedTemplate.printArea.width / selectedTemplate.width) * 100}%`,
                      height: `${(selectedTemplate.printArea.height / selectedTemplate.height) * 100}%`,
                    }}
                  />
                )}
              </>
            ) : (
              <div className="text-center px-6">
                <div className="text-4xl mb-3">🎨</div>
                <p className="font-display font-bold text-forge-text text-base">Choose a template</p>
                <p className="text-forge-subtle text-xs mt-1">Select from the left panel to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag indicator overlay */}
      {dragging && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-forge-accent/10 border-2 border-forge-accent rounded-xl px-8 py-4">
            <p className="text-forge-accent font-semibold">Drop your image</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = '';
        }}
      />

      {/* Upload button (when template selected and artwork exists) */}
      {selectedTemplate && artworkObjRef.current && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-forge-surface/90 backdrop-blur border border-forge-border text-forge-text text-xs font-semibold px-3 py-2 rounded-full hover:border-forge-accent/50 transition-colors shadow-lg"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v7M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Change artwork
        </button>
      )}
    </div>
  );
}
