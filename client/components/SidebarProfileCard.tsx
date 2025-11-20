import { useState, useEffect } from "react";

interface SidebarProfileCardProps {
  name: string;
  role: string;
  collapsed?: boolean;
}

export const SidebarProfileCard = ({
  name,
  role,
  collapsed = false,
}: SidebarProfileCardProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  const formattedHours = String(hours12).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return (
    <div
      className={`bg-gradient-to-br from-sidebar-primary/15 to-sidebar-accent/10 border border-sidebar-primary/30 rounded-xl transition-all duration-300 overflow-hidden ${
        collapsed ? "p-2" : "p-4"
      }`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sidebar-primary to-sidebar-accent rounded-xl" />

      <div className="relative">
        {/* Avatar and User Info */}
        <div
          className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-3"} mb-4`}
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center flex-shrink-0 shadow-lg">
            <div className="text-sidebar-primary-foreground font-bold text-lg">
              {name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {role}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        {!collapsed && (
          <div className="h-px bg-gradient-to-r from-sidebar-primary/20 via-sidebar-primary/40 to-transparent mb-4" />
        )}

        {/* Digital Clock */}
        {!collapsed && (
          <div className="space-y-3">
            {/* Time Display */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-sidebar-primary font-mono">
                  {formattedHours}
                </span>
                <span className="text-3xl font-bold text-sidebar-primary/60 animate-pulse">
                  :
                </span>
                <span className="text-3xl font-bold text-sidebar-primary font-mono">
                  {formattedMinutes}
                </span>
              </div>
              <span className="text-xs font-bold text-sidebar-primary/80 bg-sidebar-primary/20 px-2 py-1 rounded">
                {ampm}
              </span>
            </div>

            {/* Date */}
            <div className="text-center">
              <p className="text-xs text-sidebar-foreground/70 font-medium">
                {time.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
