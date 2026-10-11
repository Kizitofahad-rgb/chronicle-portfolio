import { useState, useRef, type ReactNode, type MouseEvent } from 'react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glowColor?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card3D({
  children,
  className = '',
  maxTilt = 10,
  scale = 1.02,
  glowColor = 'rgba(0, 240, 255, 0.28)',
  onClick,
  style = {},
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setGlarePos({ x: percentX, y: percentY, opacity: 0.6 });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.25s ease',
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={`relative group ${className}`}
    >
      {/* Specular Holographic Glare layer */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, ${glowColor}, transparent 75%)`,
          mixBlendMode: 'screen',
        }}
      />
      {children}
    </div>
  );
}
