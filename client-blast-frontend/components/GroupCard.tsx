import { useState } from "react";
import { Group, Client } from "@/types";
import {
  UsersIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";

export default function GroupCard({
  group,
  clients,
  refresh,
}: {
  group: Group;
  clients: Client[];
  refresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: group.name,
    description: group.description,
    members: group.members ? group.members.map((m: any) => m.id || m) : [],
  });

  const updateGroup = async () => {
    await api.put(`groups/${group.id}/`, {
      name: form.name,
      description: form.description,
      members: form.members,
    });
    await refresh();
    setIsEditing(false);
    setExpanded(false);
  };

  const toggleMember = (id: number) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter((m) => m !== id)
        : [...prev.members, id],
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECE4B7] shadow-sm hover:shadow-lg transition-all duration-300 p-5 space-y-4">
      {/* Compact row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-[#ECE4B7] to-[#E6AA68] rounded-full shadow-md">
            <UsersIcon className="h-6 w-6 text-[#253D5B]" />
          </div>
          <div>
            <p className="font-semibold text-[#253D5B] text-lg">{group.name}</p>
            <p className="text-sm text-[#020122]/70">
              {group.members?.length || 0} members
            </p>
          </div>
        </div>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-[#ECE4B7] to-[#E6AA68] text-[#020122] rounded-lg shadow-sm hover:shadow-md hover:opacity-90 transition-all duration-200"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-[#ECE4B7] pt-4">
          {/* Group name */}
          <input
            readOnly={!isEditing}
            className={`w-full p-2.5 rounded-lg text-[#020122] shadow-sm focus:outline-none ${
              isEditing
                ? "border border-[#306B34] bg-white focus:ring-2 focus:ring-[#306B34]/60"
                : "border border-[#ECE4B7] bg-[#ECE4B7]/40"
            }`}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* Group description */}
          <textarea
            readOnly={!isEditing}
            rows={2}
            className={`w-full p-2.5 rounded-lg text-[#020122] shadow-sm focus:outline-none ${
              isEditing
                ? "border border-[#306B34] bg-white focus:ring-2 focus:ring-[#306B34]/60"
                : "border border-[#ECE4B7] bg-[#ECE4B7]/40"
            }`}
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Members list */}
          <div className="border border-[#ECE4B7] rounded-xl p-3 max-h-40 overflow-y-auto bg-[#ECE4B7]/20 shadow-inner">
            {clients.map((c) => (
              <label key={c.id} className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  disabled={!isEditing}
                  checked={form.members.includes(c.id)}
                  onChange={() => toggleMember(c.id)}
                  className="accent-[#306B34] h-4 w-4"
                />
                <span className="text-sm text-[#253D5B]">
                  {c.name} ({c.email})
                </span>
              </label>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setExpanded(false);
                setIsEditing(false);
                setForm({
                  name: group.name,
                  description: group.description,
                  members: group.members
                    ? group.members.map((m: any) => m.id || m)
                    : [],
                });
              }}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#ECE4B7] to-[#E6AA68] text-[#020122] rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Close
            </button>

            {isEditing ? (
              <button
                onClick={updateGroup}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#306B34] to-[#254C27] text-white rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Update
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#E6AA68] to-[#EBC189] text-[#020122] rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}