type Tab = "posts" | "about" | "activity";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const ProfileTabs = ({ active, onChange }: Props) => {
  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "about", label: "About" },
    { key: "activity", label: "Activity" },
  ];

  return (
    <div className="flex gap-2 border-b border-base-300">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm rounded-t-lg ${
            active === tab.key
              ? "bg-blue-700 text-white"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
