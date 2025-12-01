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

  if (!isVisible || !userName) return null;

  const letters = userName.toUpperCase().replace(/\s/g, "").split("");
  const radius = 32;

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
        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div
        className="relative w-32 h-32"
        style={{
          animation: "orbit 8s linear infinite",
        }}
      >
        {letters.map((letter, index) => {
          const angle = (index / letters.length) * 360;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);

          return (
            <div
              key={index}
              className="absolute text-sm font-bold text-primary"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );
};
