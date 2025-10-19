import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Client, Group } from "@/types";
import ContactCard from "@/components/ContactCard";
import GroupCard from "@/components/GroupCard";
import Popup from "@/components/Popup";

export default function ContactsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupData, setPopupData] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const refresh = async () => {
    const [resClients, resGroups] = await Promise.all([
      api.get<Client[]>("clients/"),
      api.get<Group[]>("groups/"),
    ]);
    setClients(resClients.data);
    setGroups(resGroups.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const showPopup = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setPopupData({ title, message, type });
    setPopupOpen(true);
  };

  const addClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("clients/", form);
      await refresh();
      setForm({ name: "", email: "", phone: "" });
      showPopup("Success", "Client added successfully!", "success");
    } catch {
      showPopup("Error", "Failed to add client", "error");
    }
  };

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("groups/", {
        name: groupForm.name,
        description: groupForm.description,
        members: selectedClients,
      });
      await refresh();
      setGroupForm({ name: "", description: "" });
      setSelectedClients([]);
      showPopup("Success", "Group created successfully!", "success");
    } catch {
      showPopup("Error", "Failed to create group", "error");
    }
  };

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return showPopup("Error", "Please select a CSV file", "error");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("upload_csv/", formData);
      await refresh();
      showPopup("Success", res.data.message || "Contacts uploaded successfully!", "success");
      setFile(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to upload contacts";
      showPopup("Error", errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Contacts Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-[#ECE4B7] p-8 space-y-6">
          <h1 className="text-3xl font-extrabold text-[#253D5B]">Contacts</h1>
          <form
            onSubmit={addClient}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <input
              className="p-3 rounded-xl border border-[#ECE4B7] focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="p-3 rounded-xl border border-[#ECE4B7] focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="p-3 rounded-xl border border-[#ECE4B7] focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button className="col-span-1 md:col-span-3 py-3 bg-gradient-to-r from-[#306B34] to-[#254C27] text-white font-medium rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all duration-200">
              Add Contact
            </button>
          </form>

          {/* Search + List */}
          <div className="space-y-3 max-h-96 overflow-y-auto border border-[#ECE4B7] rounded-xl p-3 bg-[#ECE4B7]/20">
            <input
              type="text"
              placeholder="Search contacts..."
              className="mb-3 w-full p-2 border border-[#ECE4B7] rounded-lg focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredClients.map((c) => (
              <ContactCard key={c.id} client={c} refresh={refresh} />
            ))}
          </div>
        </section>

        {/* Groups Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-[#ECE4B7] p-8 space-y-6">
          <h1 className="text-3xl font-extrabold text-[#253D5B]">Groups</h1>
          <form onSubmit={addGroup} className="space-y-4">
            <input
              className="w-full p-3 rounded-xl border border-[#ECE4B7] focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Group Name"
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm({ ...groupForm, name: e.target.value })
              }
            />
            <textarea
              className="w-full p-3 rounded-xl border border-[#ECE4B7] focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Description"
              value={groupForm.description}
              onChange={(e) =>
                setGroupForm({ ...groupForm, description: e.target.value })
              }
            />
            <input
              type="text"
              className="w-full p-3 rounded-xl border border-[#ECE4B7] focus:ring-2 focus:ring-[#306B34]/60 focus:border-[#306B34]"
              placeholder="Search clients to add"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="border border-[#ECE4B7] rounded-xl p-3 max-h-40 overflow-y-auto bg-[#ECE4B7]/20">
              {filteredClients.map((c) => (
                <label key={c.id} className="flex items-center space-x-2 py-1">
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
                  <span className="text-[#253D5B]">
                    {c.name} ({c.email})
                  </span>
                </label>
              ))}
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#306B34] to-[#254C27] text-white font-medium rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Create Group
            </button>
          </form>

          {/* Group List */}
          <div className="space-y-3 max-h-96 overflow-y-auto border border-[#ECE4B7] rounded-xl p-3 bg-[#ECE4B7]/20">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} clients={clients} refresh={refresh} />
            ))}
          </div>
        </section>

        {/* Upload Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-[#ECE4B7] p-8 space-y-6">
          <h1 className="text-3xl font-extrabold text-[#253D5B]">
            Upload Contacts (CSV)
          </h1>
          <form onSubmit={uploadFile} className="space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block"
            />
            <button
              disabled={uploading}
              className="px-4 py-2 bg-gradient-to-r from-[#253D5B] to-[#1B2E45] text-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
            <a
              href="https://office-app-wu8a.onrender.com/download-template/"
              className="px-4 py-2 bg-gradient-to-r from-[#ECE4B7] to-[#E6AA68] text-[#020122] rounded-xl shadow hover:shadow-md hover:scale-105 transition-all duration-200 inline-block"
              download
            >
              📥 Download CSV Template
            </a>
          </form>
        </section>
      </div>

      <Popup
        open={popupOpen}
        setOpen={setPopupOpen}
        title={popupData.title}
        message={popupData.message}
        type={popupData.type}
      />
    </div>
  );
}
