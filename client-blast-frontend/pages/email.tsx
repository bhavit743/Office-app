import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { Client, Group } from "@/types";

// ✅ Dynamically import CKEditor
const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

let ClassicEditor: any;
if (typeof window !== "undefined") {
  ClassicEditor = require("@ckeditor/ckeditor5-build-classic");
}

// ✅ Popup Component
function Popup({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 bg-white shadow-xl border border-[#ECE4B7] rounded-xl p-4 z-50 animate-fade-in">
      <p
        className={`font-medium ${
          type === "success" ? "text-[#306B34]" : "text-red-500"
        }`}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="mt-2 text-sm text-[#253D5B] underline hover:text-[#E6AA68] transition"
      >
        Close
      </button>
    </div>
  );
}

// ✅ Helper: Split into chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default function EmailPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [mode, setMode] = useState<"all" | "selected" | "groups">("all");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("📩 New Update from Us");

  const [progress, setProgress] = useState<{ sent: number; total: number } | null>(null);
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  const [sending, setSending] = useState(false);
  const [editorData, setEditorData] = useState("<p>Type your email here...</p>");

  // ✅ Fetch clients and groups
  useEffect(() => {
    api.get<Client[]>("clients/").then((res) => setClients(res.data));
    api.get<Group[]>("groups/").then((res) => setGroups(res.data));
  }, []);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Send Email with batching
  const sendEmail = async () => {
    setSending(true);
    setProgress({ sent: 0, total: 0 });

    try {
      const res = await api.post("send-email/", {
        mode,
        clients: selectedClients,
        group: selectedGroup,
        subject,
        body: editorData,
        preview: true,
      });

      const recipients: string[] = res.data.recipients || [];
      setProgress({ sent: 0, total: recipients.length });

      const batches = chunkArray(recipients, 20);

      for (let i = 0; i < batches.length; i++) {
        await api.post("send-email/", {
          mode: "batch",
          clients: batches[i],
          subject,
          body: editorData,
        });

        setProgress({
          sent: Math.min((i + 1) * batches[i].length, recipients.length),
          total: recipients.length,
        });
      }

      setPopup({ message: "✅ Emails sent successfully!", type: "success" });
      setEditorData("<p>Type your email here...</p>");
      setSubject("📩 New Update from Us");
      setSelectedClients([]);
      setSelectedGroup(null);
    } catch (err) {
      console.error("❌ Failed to send emails", err);
      setPopup({ message: "❌ Failed to send emails.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-6 font-sans">
      <div className="bg-white rounded-2xl shadow-lg border border-[#ECE4B7] p-8 space-y-8 max-w-5xl mx-auto transition-all duration-300 hover:shadow-xl">
        <h1 className="text-3xl font-extrabold text-[#253D5B]">
          ✉️ Send Email
        </h1>

        {/* Mode selection */}
        <div className="flex space-x-4">
          {["all", "selected", "groups"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                mode === m
                  ? "bg-gradient-to-r from-[#306B34] to-[#254C27] text-white shadow-md"
                  : "bg-[#ECE4B7]/40 text-[#253D5B] hover:bg-[#ECE4B7]/60 border border-[#ECE4B7]"
              }`}
            >
              {m === "all"
                ? "All Clients"
                : m === "selected"
                ? "Selected Clients"
                : "Groups"}
            </button>
          ))}
        </div>

        {/* Subject */}
        <input
          className="w-full p-3 border border-[#ECE4B7] rounded-xl text-[#020122] bg-[#ECE4B7]/20 focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
          placeholder="Email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {/* Recipient selection */}
        {mode === "selected" && (
          <div>
            <input
              className="w-full mb-3 p-2 border border-[#ECE4B7] rounded-xl bg-[#ECE4B7]/10 focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="border border-[#ECE4B7] rounded-xl p-3 max-h-40 overflow-y-auto bg-[#ECE4B7]/20 shadow-inner">
              {filteredClients.map((c) => (
                <label key={c.id} className="flex items-center space-x-2 py-1 text-[#253D5B]">
                  <input
                    type="checkbox"
                    className="accent-[#306B34]"
                    checked={selectedClients.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClients([...selectedClients, c.id]);
                      } else {
                        setSelectedClients(
                          selectedClients.filter((id) => id !== c.id)
                        );
                      }
                    }}
                  />
                  <span>
                    {c.name} ({c.email})
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {mode === "groups" && (
          <select
            className="w-full p-3 border border-[#ECE4B7] rounded-xl bg-[#ECE4B7]/20 focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
            value={selectedGroup || ""}
            onChange={(e) =>
              setSelectedGroup(e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Select a group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        )}

        {/* CKEditor */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-[#253D5B]">
            Message
          </h2>
          <div className="border border-[#ECE4B7] rounded-xl p-3 bg-[#ECE4B7]/20">
            {ClassicEditor && (
              <CKEditor
                editor={ClassicEditor}
                data={editorData}
                onChange={(event, editor) => {
                  setEditorData(editor.getData());
                }}
              />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress && progress.total > 0 && (
          <div>
            <div className="w-full bg-[#ECE4B7]/60 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-[#306B34] to-[#254C27] h-4 rounded-full transition-all"
                style={{
                  width: `${(progress.sent / progress.total) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-[#253D5B] mt-2">
              Sent {progress.sent} of {progress.total}
            </p>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={sendEmail}
          disabled={sending}
          className="px-6 py-3 bg-gradient-to-r from-[#253D5B] to-[#1B2E45] text-white font-semibold rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Email"}
        </button>

        {/* Popup */}
        {popup && (
          <Popup
            message={popup.message}
            type={popup.type}
            onClose={() => setPopup(null)}
          />
        )}
      </div>
    </div>
  );
}
