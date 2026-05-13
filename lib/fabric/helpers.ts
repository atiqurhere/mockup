// Fabric.js helper utilities

export const BLEND_MODES = [
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Normal', value: 'normal' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Difference', value: 'difference' },
  { label: 'Exclusion', value: 'exclusion' },
];

export function getCanvasDimensions(containerWidth: number, containerHeight: number, templateW: number, templateH: number) {
  const ratio = templateW / templateH;
  const containerRatio = containerWidth / containerHeight;
  let width, height;
  if (ratio > containerRatio) {
    width = containerWidth;
    height = containerWidth / ratio;
  } else {
    height = containerHeight;
    width = containerHeight * ratio;
  }
  return { width: Math.floor(width), height: Math.floor(height) };
}

export function getScaledPrintArea(
  printArea: { x: number; y: number; width: number; height: number; rotation: number },
  canvasW: number,
  canvasH: number,
  templateW: number,
  templateH: number
) {
  const scaleX = canvasW / templateW;
  const scaleY = canvasH / templateH;
  return {
    x: printArea.x * scaleX,
    y: printArea.y * scaleY,
    width: printArea.width * scaleX,
    height: printArea.height * scaleY,
    rotation: printArea.rotation,
  };
}
