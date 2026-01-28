import { Users } from "lucide-react";

type CommunityHeaderProps = {
  name: string;
  description: string;
  members: number;
};

const CommunityHeader = ({
  name,
  description,
  members,
}: CommunityHeaderProps) => {
  return (
    <div className="rounded-xl border border-base-300 bg-base-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{name}</h1>
          <p className="mt-1 text-sm opacity-70">
            {description}
          </p>

          <div className="mt-2 flex items-center gap-2 text-sm opacity-70">
            <Users size={16} />
            {members.toLocaleString()} members
          </div>
        </div>

        <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
          Join
        </button>
      </div>
    </div>
  );
};

export default CommunityHeader;
