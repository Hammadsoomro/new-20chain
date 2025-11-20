import { useState, useEffect } from "react";

export const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  const formattedHours = String(hours12).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-1">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent/20 rounded-lg blur-xl" />
          <div className="relative bg-gradient-to-br from-sidebar-primary/10 to-sidebar-accent/10 border border-sidebar-primary/30 rounded-lg px-3 py-2">
            <div className="font-mono text-2xl font-bold text-sidebar-primary tracking-wider">
              {formattedHours}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center h-12">
          <div className="text-2xl font-bold text-sidebar-primary animate-pulse">
            :
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent/20 rounded-lg blur-xl" />
          <div className="relative bg-gradient-to-br from-sidebar-primary/10 to-sidebar-accent/10 border border-sidebar-primary/30 rounded-lg px-3 py-2">
            <div className="font-mono text-2xl font-bold text-sidebar-primary tracking-wider">
              {formattedMinutes}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center h-12">
          <div className="text-2xl font-bold text-sidebar-primary animate-pulse">
            :
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent/20 rounded-lg blur-xl" />
          <div className="relative bg-gradient-to-br from-sidebar-primary/10 to-sidebar-accent/10 border border-sidebar-primary/30 rounded-lg px-3 py-2">
            <div className="font-mono text-sm font-bold text-sidebar-primary/70 tracking-wider">
              {formattedSeconds}
            </div>
          </div>
        </div>

        <div className="ml-2 px-2 py-1 bg-sidebar-primary/20 border border-sidebar-primary/30 rounded text-xs font-semibold text-sidebar-primary">
          {ampm}
        </div>
      </div>

      <div className="text-xs text-sidebar-foreground/60 font-medium">
        {time.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>
  );
};
