"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, X, ListCollapse } from "lucide-react";
import tabs from "@/lib/SideBarTabs";
import { toast } from "sonner";

export function MySideBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async() => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed:", error);
    }

  };

  const renderLink = (tab, index) => {
    const isActive = pathname === tab.path;
    return (
      <Link
        key={index}
        href={tab.path}
        className={`flex items-center p-4 transition-colors ${
          isActive ? "bg-primary text-white" : "hover:bg-primary hover:text-white"
        } ${isCollapsed ? "justify-center" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      >
        <span>{tab.icon}</span>
        {!isCollapsed && <span className="ml-3">{tab.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 right-6 z-40 p-2 bg-primary text-white rounded-lg"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobile}
      />

      {/* Combined Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-sidebar text-primary 
                    transition-all duration-300 ease-in-out
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
                    lg:translate-x-0 
                    ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            {!isCollapsed && <h1 className="text-xl font-bold">I Glow</h1>}
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-lg hover:bg-primary hover:text-white duration-150"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ListCollapse className={isCollapsed ? "" : "rotate-180"} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-2">
              {tabs.map((tab, index) => renderLink(tab, index))}
            </div>
          </nav>

          {/* Footer */}
          <button
            onClick={handleLogout}
            className={`p-4 border-t border-gray-700 flex items-center hover:bg-destructive hover:text-white cursor-pointer duration-150 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}