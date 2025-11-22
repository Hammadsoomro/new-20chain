import { useTheme, type ThemeName } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette } from "lucide-react";

const themeConfig: Record<
  ThemeName,
  { label: string; description: string; icon: string }
> = {
  light: {
    label: "Light",
    description: "Clean and bright",
    icon: "☀️",
  },
  dark: {
    label: "Dark",
    description: "Easy on the eyes",
    icon: "🌙",
  },
  ocean: {
    label: "Ocean",
    description: "Cool blues and teals",
    icon: "🌊",
  },
  forest: {
    label: "Forest",
    description: "Natural greens",
    icon: "🌲",
  },
  sunset: {
    label: "Sunset",
    description: "Warm oranges",
    icon: "🌅",
  },
  midnight: {
    label: "Midnight",
    description: "Deep purples",
    icon: "✨",
  },
};

export const ThemeSwitcher = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          title="Switch theme"
        >
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
          Themes
        </div>
        {themes.map((t) => {
          const config = themeConfig[t];
          return (
            <DropdownMenuItem
              key={t}
              onClick={() => setTheme(t)}
              className={`cursor-pointer flex items-start gap-3 px-3 py-2 ${
                theme === t ? "bg-accent" : ""
              }`}
            >
              <div className="text-lg">{config.icon}</div>
              <div className="flex flex-col gap-0.5">
                <div
                  className={`font-medium ${
                    theme === t ? "text-accent-foreground" : ""
                  }`}
                >
                  {config.label}
                  {theme === t && " ✓"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {config.description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
