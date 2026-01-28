import { ArrowUp, ArrowDown, MessageSquare, Share2 } from "lucide-react";
import { motion } from "framer-motion";

type PostCardProps = {
  author: string;
  location: string;
  title: string;
  time?: string;
};

const PostCard = ({
  author,
  location,
  title,
  time = "2h ago",
}: PostCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-base-300 bg-base-200 p-4"
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 text-sm opacity-70">
        <span className="font-mono">{author}</span>
        <span>•</span>
        <span>{time}</span>
        <span>•</span>
        <span>{location}</span>
      </div>

      {/* Title */}
      <h2 className="mb-3 text-base font-semibold leading-snug">
        {title}
      </h2>

      {/* Actions */}
      <div className="flex items-center gap-4 text-sm opacity-80">
        <button className="flex items-center gap-1 hover:opacity-100">
          <ArrowUp size={18} />
          125
        </button>

        <button className="flex items-center gap-1 hover:opacity-100">
          <ArrowDown size={18} />
          12
        </button>

        <button className="flex items-center gap-1 hover:opacity-100">
          <MessageSquare size={18} />
          34
        </button>

        <button className="ml-auto flex items-center gap-1 hover:opacity-100">
          <Share2 size={18} />
          Share
        </button>
      </div>
    </motion.div>
  );
};

export default PostCard;
