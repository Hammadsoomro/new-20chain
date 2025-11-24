import { useState } from "react";
import { User } from "@shared/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface TeamMemberCardProps {
  member: User;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="h-56 cursor-pointer perspective"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 transform-gpu"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full p-6 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg border border-white/20 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold opacity-70">TEAM MEMBER</p>
              <p className="text-lg font-bold mt-1">{member.name}</p>
            </div>
            <div className="text-2xl">👤</div>
          </div>

          <div>
            <p className="text-xs opacity-70 mb-1">Role</p>
            <p className="text-sm font-semibold capitalize">{member.role}</p>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex gap-1">
              <div className="w-8 h-6 rounded border border-white/50"></div>
              <div className="w-8 h-6 rounded border border-white/50"></div>
            </div>
            <p className="text-xs opacity-70">Click to flip</p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg border border-white/20 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs opacity-60 uppercase tracking-wider">
                Email
              </p>
              <p className="text-sm font-mono break-all">{member.email}</p>
            </div>

            <div>
              <p className="text-xs opacity-60 uppercase tracking-wider">
                Member Since
              </p>
              <p className="text-sm">
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs opacity-60 uppercase tracking-wider">
                Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-sm">Active</p>
              </div>
            </div>
          </div>

          <p className="text-xs opacity-60 text-center">Click to flip back</p>
        </div>
      </div>
    </div>
  );
}
