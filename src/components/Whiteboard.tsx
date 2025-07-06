import React, { useRef, useEffect, useState } from 'react';
import './Whiteboard.css';

const CANVAS_WIDTH = 1000;

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#222');
  const [isEraser, setIsEraser] = useState(false);
  const [penThickness, setPenThickness] = useState(3);
  const [eraserThickness, setEraserThickness] = useState(16);

  const presetColors = ['#222', '#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#1abc9c', '#fff', '#000'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = isEraser ? eraserThickness : penThickness;
        ctx.strokeStyle = isEraser ? '#fff' : color;
      }
    }
  }, [color, penThickness, eraserThickness, isEraser]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = isEraser ? eraserThickness : penThickness;
    ctx.strokeStyle = isEraser ? '#fff' : color;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    setIsEraser(false);
  };

  const handleEraser = () => {
    setIsEraser(true);
  };

  const handlePen = () => {
    setIsEraser(false);
  };

  // Responsive canvas height based on viewport
  const canvasHeight = Math.max(window.innerHeight - 220, 300); // 220px for header, palette, toolbar, etc.

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-main-row">
        <div className="whiteboard-canvas-col">
          <div className="whiteboard-toolbar-horizontal">
            <input type="color" value={color} onChange={handleColorChange} disabled={isEraser} title="Pick color" />
          </div>
          <div className="whiteboard-canvas-toolbar-wrap">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={canvasHeight}
              className={`whiteboard-canvas${isEraser ? ' eraser-cursor' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <div className="whiteboard-toolbar-vertical">
              <button onClick={handlePen} disabled={!isEraser}>Pen</button>
              <label className="thickness-slider-label">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={penThickness}
                  onChange={e => setPenThickness(Number(e.target.value))}
                  disabled={isEraser}
                />
                <span>{penThickness}px</span>
              </label>
              <button onClick={handleEraser} disabled={isEraser}>Eraser</button>
              <label className="thickness-slider-label">
                <input
                  type="range"
                  min={5}
                  max={60}
                  value={eraserThickness}
                  onChange={e => setEraserThickness(Number(e.target.value))}
                  disabled={!isEraser}
                />
                <span>{eraserThickness}px</span>
              </label>
              <button onClick={handleClear}>Clear</button>
            </div>
          </div>
          <div className="whiteboard-palette">
            {presetColors.map((preset) => (
              <button
                key={preset}
                onClick={() => { setColor(preset); setIsEraser(false); }}
                className={`palette-color${color === preset && !isEraser ? ' selected' : ''}`}
                style={{ background: preset }}
                aria-label={`Select color ${preset}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard; 