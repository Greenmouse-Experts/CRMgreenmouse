import { Check } from "lucide-react";
import {
  DASHBOARD_THEMES,
  useDashboardTheme,
  type DashboardScope,
} from "@/helpers/dashboardTheme";

interface DashboardThemePickerProps {
  scope: DashboardScope;
}

export default function DashboardThemePicker({
  scope,
}: DashboardThemePickerProps) {
  const [activeTheme, setTheme] = useDashboardTheme(scope);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-1">Theme Settings</h2>
      <p className="text-sm text-base-content/70 mb-4">
        Select a theme for this dashboard. Your preference is saved in a cookie
        and only applies to this portal.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {DASHBOARD_THEMES.map((theme) => {
          const isSelected = activeTheme === theme;
          return (
            <div
              key={theme}
              data-theme={theme}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              className={`card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-200 ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setTheme(theme)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTheme(theme);
                }
              }}
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="card-title text-lg capitalize">{theme}</h3>
                  {isSelected && (
                    <span className="badge badge-sm badge-primary gap-1">
                      <Check className="size-3" />
                      Active
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1 mt-2">
                  <div className="bg-primary w-full h-6 rounded"></div>
                  <div className="bg-secondary w-full h-6 rounded"></div>
                  <div className="bg-accent w-full h-6 rounded"></div>
                  <div className="bg-neutral w-full h-6 rounded"></div>
                  <div className="bg-base-100 w-full h-6 rounded border border-base-content/20"></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-base-content">Text</span>
                  <button type="button" className="btn btn-sm btn-primary">
                    {isSelected ? "Selected" : "Apply"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
