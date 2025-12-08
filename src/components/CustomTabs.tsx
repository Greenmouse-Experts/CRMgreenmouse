import type { Tab, useTabs } from "@/stores/client";

export default function CustomTabs({
  tabs,
  tabProps,
}: {
  tabs: Tab[];
  tabProps?: ReturnType<typeof useTabs>;
}) {
  return (
    <ul className="menu menu-horizontal bg-base-100 rounded-box space-x-1">
      {tabs.map((t) => (
        <li key={t.name}>
          <a
            className={tabProps?.tab.name === t.name ? "menu-active" : ""}
            onClick={() => tabProps?.setTab(t)}
          >
            {t.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
