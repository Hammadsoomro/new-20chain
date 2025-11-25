import { User } from "@shared/api";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const cardStyles = [
  {
    gradient: "from-gray-400 via-gray-300 to-gray-200",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-gray-800",
    brand: "PREMIUM",
  },
  {
    gradient: "from-gray-700 via-gray-600 to-gray-800",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-white",
    brand: "ELITE",
  },
  {
    gradient: "from-blue-500 via-blue-600 to-blue-700",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-white",
    brand: "CHASE",
  },
  {
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-white",
    brand: "VISA",
  },
  {
    gradient: "from-green-400 via-green-500 to-emerald-600",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-white",
    brand: "AMEX",
  },
  {
    gradient: "from-gray-200 via-gray-100 to-white",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-gray-800",
    brand: "DISCOVER",
  },
  {
    gradient: "from-gray-500 via-gray-600 to-slate-700",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-white",
    brand: "BANK",
  },
  {
    gradient: "from-purple-600 via-purple-500 to-purple-700",
    chipColor: "from-yellow-300 to-amber-400",
    textColor: "text-white",
    brand: "ELITE",
  },
];

const getCardStyle = (index: number) => {
  return cardStyles[index % cardStyles.length];
};

interface TeamMemberCardProps {
  member: User;
  index?: number;
}

export function TeamMemberCard({ member, index = 0 }: TeamMemberCardProps) {
  const style = getCardStyle(index);
  const maskedNumber = `•••• •••• •••• ${member._id.slice(-4).toUpperCase()}`;

  return (
    <div className="h-56 w-full">
      <div
        className={`h-full w-full rounded-2xl bg-gradient-to-br ${style.gradient} shadow-2xl border border-white/10 p-6 flex flex-col justify-between overflow-hidden relative`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20"></div>

        {/* Top section: Chip and Brand */}
        <div className="flex justify-between items-start relative z-10">
          {/* Chip */}
          <div className={`w-12 h-10 bg-gradient-to-br ${style.chipColor} rounded-lg shadow-lg`}>
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">
              ◆◆
            </div>
          </div>

          {/* Brand name */}
          <div className={`${style.textColor} font-bold text-xl tracking-widest`}>
            {style.brand}
          </div>
        </div>

        {/* Middle section: Card number and holder name */}
        <div className="flex flex-col gap-4 relative z-10">
          {/* Card number */}
          <div className={`${style.textColor} font-mono tracking-widest text-sm font-bold`}>
            {maskedNumber}
          </div>

          {/* Cardholder name */}
          <div className="flex justify-between items-end">
            <div>
              <p className={`${style.textColor} text-xs opacity-70 uppercase tracking-wider`}>
                Cardholder
              </p>
              <p className={`${style.textColor} font-bold text-lg uppercase truncate max-w-xs`}>
                {member.name}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section: Expiry and role */}
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className={`${style.textColor} text-xs opacity-70 uppercase tracking-wider`}>
              Role
            </p>
            <p className={`${style.textColor} font-semibold capitalize`}>
              {member.role}
            </p>
          </div>

          {/* Initials circle */}
          <div className={`h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center`}>
            <span className={`${style.textColor} font-bold text-sm`}>
              {getInitials(member.name)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
