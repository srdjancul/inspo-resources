// Hexagon "go" selector from the reference — the one decorative signature of the site.
export default function HexArrow({ size = 48, direction = 'up-right' }) {
  const rotate = { 'up-right': 0, right: 45, down: 135 }[direction] ?? 0;
  return (
    <span className="hex" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <path
          className="hex-shape"
          d="M16.2 6.5h15.6a4 4 0 0 1 3.46 2l7.8 13.5a4 4 0 0 1 0 4l-7.8 13.5a4 4 0 0 1-3.46 2H16.2a4 4 0 0 1-3.46-2L4.94 26a4 4 0 0 1 0-4l7.8-13.5a4 4 0 0 1 3.46-2z"
        />
        <g transform={`rotate(${rotate} 24 24)`}>
          {/* centred on (24,24), nudged half a unit down-left to balance the arrowhead */}
          <path className="hex-arrow" d="M19.5 28.5l8-8M21 20.5h6.5V27" />
        </g>
      </svg>
    </span>
  );
}
