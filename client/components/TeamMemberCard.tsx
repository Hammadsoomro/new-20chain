import { useState } from "react";
import { User } from "@shared/api";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const gradients = [
  "from-slate-900 via-slate-800 to-slate-900",
  "from-blue-600 via-purple-600 to-pink-600",
  "from-teal-500 via-emerald-500 to-cyan-500",
  "from-red-600 via-rose-600 to-pink-600",
  "from-purple-600 via-violet-600 to-indigo-600",
  "from-orange-500 via-red-600 to-pink-600",
  "from-cyan-500 via-blue-600 to-purple-600",
  "from-green-600 via-emerald-600 to-teal-600",
];

const getGradientByIndex = (index: number) => {
  return gradients[index % gradients.length];
};

interface TeamMemberCardProps {
  member: User;
  index?: number;
}

export function TeamMemberCard({ member, index = 0 }: TeamMemberCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const gradientClass = getGradientByIndex(index);

  return (
    <div
      className="h-56 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className={`absolute w-full h-full p-6 rounded-2xl bg-gradient-to-br ${gradientClass} text-white shadow-2xl border border-white/10 flex flex-col justify-between hover:shadow-3xl transition-shadow`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                Team Member
              </p>
              <p className="text-2xl font-bold mt-2 break-words">{member.name}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ml-4">
              <span className="text-lg">{getInitials(member.name)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-60 mb-2">
              Role
            </p>
            <p className="text-sm font-semibold capitalize">{member.role}</p>
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-white/10">
            <div className="text-xs opacity-50">Tap to view details</div>
            <div className="w-12 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <span className="text-xs font-semibold">✓</span>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute w-full h-full p-6 rounded-2xl bg-gradient-to-br ${gradientClass} text-white shadow-2xl border border-white/10 flex flex-col justify-between`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-50 font-semibold">
                Email
              </p>
              <p className="text-sm font-mono mt-1 break-all opacity-90">
                {member.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest opacity-50 font-semibold">
                Member Since
              </p>
              <p className="text-sm mt-1">
                {new Date(member.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest opacity-50 font-semibold">
                Status
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></div>
                <p className="text-sm font-medium">Active</p>
              </div>
            </div>
          </div>

          <p className="text-xs opacity-50 text-center pt-4 border-t border-white/10">
            Tap to return
          </p>
        </div>
      </div>
    </div>
  );
}
