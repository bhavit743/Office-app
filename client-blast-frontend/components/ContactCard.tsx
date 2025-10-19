import { useState } from "react";
import { Client } from "@/types";
import {
  UserIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";

export default function ContactCard({
  client,
  refresh,
}: {
  client: Client;
  refresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(client);

  const updateClient = async () => {
    await api.put(`clients/${client.id}/`, form);
    await refresh();
    setIsEditing(false);
    setExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECE4B7] shadow-sm hover:shadow-lg transition-all duration-300 p-5 space-y-4">
      {/* Compact row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-[#ECE4B7] to-[#E6AA68] rounded-full shadow-md">
            <UserIcon className="h-6 w-6 text-[#253D5B]" />
          </div>
          <p className="font-semibold text-[#253D5B] text-lg">{client.name}</p>
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

          <input
            readOnly={!isEditing}
            className={`w-full p-2.5 rounded-lg text-[#020122] shadow-sm focus:outline-none ${
              isEditing
                ? "border border-[#306B34] bg-white focus:ring-2 focus:ring-[#306B34]/60"
                : "border border-[#ECE4B7] bg-[#ECE4B7]/40"
            }`}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            readOnly={!isEditing}
            className={`w-full p-2.5 rounded-lg text-[#020122] shadow-sm focus:outline-none ${
              isEditing
                ? "border border-[#306B34] bg-white focus:ring-2 focus:ring-[#306B34]/60"
                : "border border-[#ECE4B7] bg-[#ECE4B7]/40"
            }`}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setExpanded(false);
                setIsEditing(false);
                setForm(client);
              }}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#ECE4B7] to-[#E6AA68] text-[#020122] rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Close
            </button>

            {isEditing ? (
              <button
                onClick={updateClient}
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
