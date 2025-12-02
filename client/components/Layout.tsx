import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { useTheme } from "@/context/ThemeContext";
import { formatTime, formatDateOnly } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  X,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  Moon,
  Sun,
  List,
  Clock,
  ArrowRight,
  ChevronDown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";
import { CursorFollower } from "@/components/CursorFollower";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCounts } = useChat();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calculate total unread messages for Team Chat
  const totalUnread = Array.from(unreadCounts.values()).reduce(
    (sum, count) => sum + count,
    0,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarCollapsed") === "true";
    }
    return false;
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Toggle sidebar collapse and save to localStorage
  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem("sidebarCollapsed", String(newValue));
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Team Chat", icon: MessageSquare, path: "/chat" },
    { label: "Numbers Inbox", icon: Clock, path: "/inbox" },
    { label: "History", icon: Clock, path: "/history" },
    ...(isAdmin
      ? [
          { label: "Numbers Sorter", icon: BarChart3, path: "/sorter" },
          { label: "Queued List", icon: List, path: "/queued" },
        ]
      : []),
  ];

  return (
    <>
      <CursorFollower userName={user?.name} />
      <div className="flex h-screen bg-transparent">
        {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 flex flex-col md:relative md:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 ${sidebarCollapsed ? "md:w-20" : "md:w-64"}`}
      >
          {/* Fixed Header - Logo */}
          <div
            className={`flex items-center border-b border-sidebar-border flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "p-2 justify-center" : "p-6"}`}
          >
            <Link
              to="/dashboard"
              className="flex items-center gap-2 group w-full"
            >
              <div className="h-10 w-10 rounded-lg bg-sidebar-primary flex items-center justify-center group-hover:shadow-lg transition-shadow flex-shrink-0">
                <div className="text-sidebar-primary-foreground font-bold text-lg">
                  ◆
                </div>
              </div>
              <span
                className={`font-bold text-lg text-sidebar-foreground transition-all duration-300 overflow-hidden ${
                  sidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                }`}
              >
                TaskFlow
              </span>
            </Link>
          </div>

          {/* Scrollable Content */}
          <div
            className={`flex flex-col h-full overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "px-2 py-4" : "px-6 py-4"}`}
          >
            {/* User Info Card */}
            <div
              className={`bg-sidebar-primary/10 border border-sidebar-border rounded-lg transition-all duration-300 overflow-hidden mb-4 ${sidebarCollapsed ? "p-2" : "p-4"}`}
            >
              <div
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} mb-3`}
              >
                <div className="h-10 w-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                  <div className="text-sidebar-primary-foreground font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">
                      {user?.role}
                    </p>
                  </div>
                )}
              </div>

              {/* Clock and Date */}
              {!sidebarCollapsed && (
                <div className="space-y-1 text-xs text-sidebar-foreground/70">
                  <p className="font-mono font-semibold">
                    {formatTime(currentTime.toISOString())}
                  </p>
                  <p>{formatDateOnly(currentTime.toISOString())}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isTeamChat = item.path === "/chat";
                const hasUnread = isTeamChat && totalUnread > 0;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center py-3 rounded-lg transition-all relative group w-full ${
                      isActive(item.path)
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${sidebarCollapsed ? "px-2 justify-center" : "px-4 gap-3"}`}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.label : ""}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="transition-all duration-300 whitespace-nowrap overflow-hidden flex-1">
                        {item.label}
                      </span>
                    )}

                    {/* Red dot indicator for unread messages */}
                    {hasUnread && (
                      <div
                        className={`flex items-center ${sidebarCollapsed ? "" : "gap-2"}`}
                      >
                        {!sidebarCollapsed && totalUnread > 0 && (
                          <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                            {totalUnread > 99 ? "99+" : totalUnread}
                          </span>
                        )}
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                      </div>
                    )}

                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              className={`space-y-3 pt-4 border-t border-sidebar-border transition-all duration-300 flex flex-col ${
                sidebarCollapsed ? "items-center" : ""
              }`}
            >
              <Link
                to="/settings"
                className={`flex items-center px-4 py-3 rounded-lg transition-all relative group w-full ${
                  isActive("/settings")
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                } ${sidebarCollapsed ? "justify-center px-2" : "gap-3"}`}
                title={sidebarCollapsed ? "Settings" : ""}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    Settings
                  </div>
                )}
              </Link>
              <button
                onClick={logout}
                className={`flex items-center px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all relative group w-full ${
                  sidebarCollapsed ? "justify-center px-2" : "gap-3"
                }`}
                title={sidebarCollapsed ? "Logout" : ""}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Logout</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 bg-sidebar-accent text-sidebar-accent-foreground text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    Logout
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
          {/* Top Navbar */}
          <nav className="sticky top-0 z-30 h-16 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="px-4 md:px-6 h-full flex items-center justify-between">
              {/* Left */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {/* Desktop Sidebar Collapse Button */}
                <button
                  onClick={toggleSidebarCollapse}
                  className="hidden md:flex p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Toggle sidebar"
                  title={
                    sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
                </button>

                {/* Breadcrumb */}
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {menuItems.find((item) => isActive(item.path))?.label ||
                      "Dashboard"}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                {/* Theme Selector */}
                <ThemeSelector />

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Toggle light/dark theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-2 text-sm">
                      <p className="font-semibold text-foreground">
                        {user?.name}
                      </p>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-b from-transparent to-transparent">
            {children}
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};
