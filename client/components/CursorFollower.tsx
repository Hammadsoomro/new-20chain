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
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary"
          style={{
            animation: "spin 2s linear infinite",
          }}
        />
        <span className="text-xs font-bold text-primary whitespace-nowrap">
          {userName?.split(" ")[0] || "U"}
        </span>
      </div>
    </div>
  );
};
