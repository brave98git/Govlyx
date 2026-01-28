import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";

type CommunityCardProps = {
  slug: string;
  name: string;
  description: string;
  members: number;
};

const CommunityCard = ({ slug, name, description, members }: CommunityCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-base-300 bg-base-200 p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm opacity-70">{description}</p>

      <div className="mt-3 flex items-center gap-2 text-sm opacity-70">
        <Users size={16} />
        {members} members
      </div>

      <button
        onClick={() => navigate(`/communities/${slug}`)}
        className="mt-4 w-full rounded-lg bg-blue-700 py-2 text-sm text-white hover:bg-blue-800"
      >
        View Community
      </button>
    </div>
  );
};

export default CommunityCard;
