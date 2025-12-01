import { useEffect, useState } from "react";

interface CursorFollowerProps {
  userName: string | undefined;
}

export const CursorFollower = ({ userName }: CursorFollowerProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        transition: "all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg border-2 border-white/20">
        <span className="text-xs font-bold text-white">
          {userName?.[0]?.toUpperCase() || "U"}
        </span>
      </div>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/40 border-r-white/40"
        style={{
          animation: "spin 3s linear infinite",
        }}
      />
    </div>
  );
};
