import { X, Image, BarChart2, Link2, FileTypeCorner } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, type JSX } from "react";
type PostType = "text" | "media" | "poll" | "link";
type Props = { open: boolean; onClose: () => void };

const CreatePost = ({ open, onClose }: Props) => {
  const [type, setType] = useState<PostType>("text");

  const postTypes: {
    key: PostType;
    label: string;
    icon: JSX.Element;
  }[] = [
    { key: "text", label: "Text", icon: <FileTypeCorner size={16}/> },
    { key: "media", label: "Media", icon: <Image size={16} /> },
    { key: "poll", label: "Poll", icon: <BarChart2 size={16} /> },
    { key: "link", label: "Link", icon: <Link2 size={16} /> },
  ];
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div
              className="w-full max-w-lg rounded-xl bg-base-200 border border-base-300 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Create Post</h2>
                <button onClick={onClose} className="btn btn-ghost btn-sm">
                  <X size={16} />
                </button>
              </div>

              {/* POST TYPE */}
              <div className="mb-4 grid grid-cols-4 gap-2">
                {postTypes.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setType(item.key)}
                    className={`btn btn-lg mt-1 flex p-0.5 flex-col ${
                      type === item.key ? "bg-blue-700 text-white" : "btn-ghost"
                    } focus:outline-none`}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* TITLE */}
              <input
                type="text"
                placeholder="Title (optional)"
                className="input input-bordered w-full mb-3 focus:border-blue-700"
              />

              {/* CONTENT */}
              <textarea
                placeholder="What's on your mind?"
                className="textarea textarea-bordered w-full min-h-[120px] focus:border-blue-700"
              />

              {/* FOOTER */}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="btn btn-sm btn-ghost">
                  Cancel
                </button>
                <button className="btn btn-sm bg-blue-700 text-white hover:bg-blue-800">
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePost;
