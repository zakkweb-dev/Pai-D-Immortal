import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Heart, MessageSquare, Shield, Check, Edit, Trash2, ArrowRight, Camera, Key } from 'lucide-react';
import { Student, Memory, GuestbookEntry } from '../types';

interface DashboardProps {
  user: any;
  studentProfile: Student | null; // Student profile matching current user ownerId
  userMemories: Memory[];
  userGuestbooks: GuestbookEntry[];
  isAdmin: boolean;
  onUpdateProfile: (updated: Partial<Student>) => Promise<void>;
  onUpdateMemory: (id: string, updated: Partial<Memory>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  onUpdateGuestbook: (id: string, updated: Partial<GuestbookEntry>) => Promise<void>;
  onDeleteGuestbook: (id: string) => Promise<void>;
  onClose: () => void;
  onBecomAdmin: (username?: string, password?: string) => void;
  onDeactivateAdmin?: () => void;
}

export default function Dashboard({
  user,
  studentProfile,
  userMemories,
  userGuestbooks,
  isAdmin,
  onUpdateProfile,
  onUpdateMemory,
  onDeleteMemory,
  onUpdateGuestbook,
  onDeleteGuestbook,
  onClose,
  onBecomAdmin,
  onDeactivateAdmin
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'memories' | 'guestbook' | 'admin'>('profile');
  const [verifyUser, setVerifyUser] = useState('');
  const [verifyPass, setVerifyPass] = useState('');

  // Profile Edit states
  const [profileMotto, setProfileMotto] = useState(studentProfile?.motto || '');
  const [profileIG, setProfileIG] = useState(studentProfile?.instagram || '');
  const [profilePhoto, setProfilePhoto] = useState(studentProfile?.foto || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Editable Memory state
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [memoryPesan, setMemoryPesan] = useState('');

  // Editable Guestbook state
  const [editingGbId, setEditingGbId] = useState<string | null>(null);
  const [gbPesan, setGbPesan] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Update form inputs if studentProfile loads later
  React.useEffect(() => {
    if (studentProfile) {
      setProfileMotto(studentProfile.motto || '');
      setProfileIG(studentProfile.instagram || '');
      setProfilePhoto(studentProfile.foto || '');
    }
  }, [studentProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile) return;

    setSavingProfile(true);
    try {
      await onUpdateProfile({
        motto: profileMotto,
        instagram: profileIG,
        foto: profilePhoto
      });
      alert('Profil Anda berhasil diperbarui! ✨');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleStartEditMemory = (mem: Memory) => {
    if (mem.id) {
      setEditingMemoryId(mem.id);
      setMemoryPesan(mem.pesan);
    }
  };

  const handleSaveMemory = async (id: string) => {
    if (!memoryPesan.trim()) return;
    try {
      await onUpdateMemory(id, { pesan: memoryPesan.trim() });
      setEditingMemoryId(null);
      alert('Memori berhasil didekorasi ulang! 💚');
    } catch {
      alert('Gagal mengupdate memori.');
    }
  };

  const handleStartEditGb = (gb: GuestbookEntry) => {
    if (gb.id) {
      setEditingGbId(gb.id);
      setGbPesan(gb.pesan);
    }
  };

  const handleSaveGb = async (id: string) => {
    if (!gbPesan.trim()) return;
    try {
      await onUpdateGuestbook(id, { pesan: gbPesan.trim() });
      setEditingGbId(null);
      alert('Ucapan buku tamu direnovasi! 🌿');
    } catch {
      alert('Gagal mengupdate pesan tamu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-strong w-full max-w-3xl h-[85vh] flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Left Side Navigation Pane */}
        <div className="md:w-1/3 bg-emerald-deep px-4 py-6 border-r border-gold-classic/15 flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            {/* User Profile Summary */}
            <div className="flex items-center gap-3 select-none pb-4 border-b border-white/10">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  referrerPolicy="no-referrer"
                  alt={user.displayName}
                  className="w-11 h-11 rounded-full border-2 border-gold-classicobject-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center font-bold text-gold-classic font-display">
                  {user?.displayName?.substring(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-display font-black text-xs sm:text-sm text-white select-text truncate max-w-[140px]">
                  {user?.displayName || 'Student User'}
                </span>
                <span className="text-[10px] text-zinc-300 select-text truncate max-w-[140px]">{user?.email}</span>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 select-none pr-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 md:flex-initial text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-gold-classic text-emerald-deep font-bold shadow-sm'
                    : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Urus Profil Anda</span>
              </button>

              <button
                onClick={() => setActiveTab('memories')}
                className={`flex-1 md:flex-initial text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'memories'
                    ? 'bg-gold-classic text-emerald-deep font-bold shadow-sm'
                    : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Memories ({userMemories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('guestbook')}
                className={`flex-1 md:flex-initial text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'guestbook'
                    ? 'bg-gold-classic text-emerald-deep font-bold shadow-sm'
                    : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Buku Tamu ({userGuestbooks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 md:flex-initial text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gold-classic text-emerald-deep font-bold shadow-sm'
                    : 'text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Kunci Pengembang</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer select-none"
          >
            Kembali ke Portal
          </button>
        </div>

        {/* Right Side Tab Panel Contents */}
        <div className="flex-1 bg-white dark:bg-emerald-deep/20 overflow-y-auto p-6 sm:p-8 flex flex-col">
          {activeTab === 'profile' && (
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="font-display font-black text-xl text-emerald-deep dark:text-gold-soft border-b border-gold-classic/10 pb-2 select-none">
                Urus Profil Mahasiswa Anda
              </h3>

              {studentProfile ? (
                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 text-xs font-sans text-zinc-700">
                  <div className="p-3 bg-emerald-medium/10 dark:bg-emerald-light/5 border border-gold-classic/10 rounded-xl flex items-center gap-3 select-none">
                    <User className="w-6 h-6 text-gold-classic" />
                    <div>
                      <p className="font-bold text-emerald-deep dark:text-gold-soft">{studentProfile.nama}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">Profil terhubung • NIM {studentProfile.nim}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 select-none">
                    <label className="font-bold text-emerald-deep dark:text-gold-soft uppercase">Motto / Semboyan Anda</label>
                    <textarea
                      value={profileMotto}
                      onChange={(e) => setProfileMotto(e.target.value)}
                      placeholder="Tulis motto pribadi terbaik Anda..."
                      rows={3}
                      className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic"
                    />
                  </div>

                  <div className="flex flex-col gap-1 select-none">
                    <label className="font-bold text-emerald-deep dark:text-gold-soft uppercase">Username Instagram</label>
                    <input
                      type="text"
                      value={profileIG}
                      onChange={(e) => setProfileIG(e.target.value)}
                      placeholder="Contoh: @kreatif_23"
                      className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1 select-none">
                    <label className="font-bold text-emerald-deep dark:text-gold-soft uppercase">URL Link Foto Profil</label>
                    <input
                      type="url"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="mt-2 py-2.5 bg-emerald-deep hover:bg-emerald-medium disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer shadow border border-gold-classic/10"
                  >
                    {savingProfile ? 'Memperbarui...' : 'Simpan Profil Mahasiswa'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 text-zinc-400 border border-dashed border-gold-classic/25 rounded-2xl max-w-md mx-auto select-none mt-4 p-6">
                  <User className="w-10 h-10 text-gold-classic mx-auto mb-2 animate-pulse-soft" />
                  <p className="font-display font-extrabold text-sm text-emerald-deep dark:text-zinc-200 mb-1">
                    Klaim Akun Belum Terdeteksi
                  </p>
                  <p className="text-xs leading-relaxed">
                    Anda belum mengklaim data mahasiswa apapun. Buka daftar **Mahasiswa**, cari nama Anda, lalu klik **"Klaim Profil Ini"** untuk menghubungkannya ke akun login Anda, kemudian Anda dapat mengatur moto dan tautan sosial Anda di sini.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'memories' && (
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="font-display font-black text-xl text-emerald-deep dark:text-gold-soft border-b border-gold-classic/10 pb-2 select-none">
                Jejak Memories Anda di Wall
              </h3>

              <div className="flex flex-col gap-4">
                {userMemories.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-10 text-center select-none">Anda belum memposting memori apapun di Wall of Memories.</p>
                ) : (
                  userMemories.map((mem) => (
                    <div key={mem.id} className="p-4 border border-gold-classic/10 dark:border-white/5 rounded-xl flex flex-col gap-2">
                      {editingMemoryId === mem.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={memoryPesan}
                            onChange={(e) => setMemoryPesan(e.target.value)}
                            rows={3}
                            className="w-full text-xs font-sans p-2 rounded bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none border border-gold-classic/30"
                          />
                          <div className="flex justify-end gap-1.5 text-xs select-none">
                            <button
                              onClick={() => mem.id && handleSaveMemory(mem.id)}
                              className="px-3 py-1 bg-emerald-deep text-white rounded font-bold cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingMemoryId(null)}
                              className="px-3 py-1 bg-zinc-200 text-zinc-700 rounded font-bold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs italic text-zinc-600 dark:text-zinc-300">"{mem.pesan}"</p>
                          <div className="flex justify-between items-center text-[10px] mt-2 border-t border-zinc-100 dark:border-white/5 pt-1.5 select-none">
                            <span className="text-zinc-400">{mem.angkatan || 'PAI D 2023'}</span>
                            <div className="flex items-center gap-1.5">
                              {deleteConfirmId === mem.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-500/10 px-2 py-0.5 rounded text-[9px]">
                                  <span className="text-rose-600 dark:text-rose-300 font-bold mr-1">Hapus?</span>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-zinc-650 hover:underline cursor-pointer font-bold font-sans"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    onClick={async () => {
                                      setDeleteConfirmId(null);
                                      await onDeleteMemory(mem.id!);
                                    }}
                                    className="text-rose-600 hover:underline cursor-pointer font-bold font-sans"
                                  >
                                    Ya
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEditMemory(mem)}
                                    className="text-emerald-deep hover:underline font-bold dark:text-gold-soft cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Edit className="w-3 h-3" /> Sunting
                                  </button>
                                  <button
                                    onClick={() => mem.id && setDeleteConfirmId(mem.id)}
                                    className="text-rose-500 hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" /> Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'guestbook' && (
            <div className="flex-1 flex flex-col gap-4">
              <h3 className="font-display font-black text-xl text-emerald-deep dark:text-gold-soft border-b border-gold-classic/10 pb-2 select-none">
                Riwayat Komentar Buku Tamu Anda
              </h3>

              <div className="flex flex-col gap-4">
                {userGuestbooks.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-10 text-center select-none">Anda belum meninggalkan tanda tangan apapun di Buku Tamu.</p>
                ) : (
                  userGuestbooks.map((gb) => (
                    <div key={gb.id} className="p-4 border border-gold-classic/10 dark:border-white/5 rounded-xl flex flex-col gap-2">
                      {editingGbId === gb.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={gbPesan}
                            onChange={(e) => setGbPesan(e.target.value)}
                            rows={3}
                            className="w-full text-xs font-sans p-2 rounded bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none border border-gold-classic/30"
                          />
                          <div className="flex justify-end gap-1.5 text-xs select-none">
                            <button
                              onClick={() => gb.id && handleSaveGb(gb.id)}
                              className="px-3 py-1 bg-emerald-deep text-white rounded font-bold cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingGbId(null)}
                              className="px-3 py-1 bg-zinc-200 text-zinc-700 text-xs font-bold rounded cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-normal">"{gb.pesan}"</p>
                          <div className="flex justify-between items-center text-[10px] mt-2 border-t border-zinc-100 dark:border-white/5 pt-1.5 select-none">
                            <span className="text-zinc-400">Tamu Terdaftar</span>
                            <div className="flex items-center gap-1.5">
                              {deleteConfirmId === gb.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-500/10 px-2 py-0.5 rounded text-[9px]">
                                  <span className="text-rose-600 dark:text-rose-300 font-bold mr-1">Hapus?</span>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-zinc-650 hover:underline cursor-pointer font-bold font-sans"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    onClick={async () => {
                                      setDeleteConfirmId(null);
                                      await onDeleteGuestbook(gb.id!);
                                    }}
                                    className="text-rose-600 hover:underline cursor-pointer font-bold font-sans"
                                  >
                                    Ya
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEditGb(gb)}
                                    className="text-emerald-deep hover:underline font-bold dark:text-gold-soft cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Edit className="w-3 h-3" /> Sunting
                                  </button>
                                  <button
                                    onClick={() => gb.id && setDeleteConfirmId(gb.id)}
                                    className="text-rose-500 hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Trash2 className="w-3 h-3" /> Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="flex-1 flex flex-col gap-4 select-none">
              <h3 className="font-display font-black text-xl text-emerald-deep dark:text-gold-soft border-b border-gold-classic/10 pb-2 flex items-center gap-1">
                <Shield className="w-5 h-5 text-gold-classic animate-pulse-soft" />
                Mode Admin Pengembang
              </h3>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-emerald-deep dark:text-amber-200 text-xs rounded-xl flex flex-col gap-2">
                <p className="font-bold leading-none flex items-center gap-1 select-none">
                  🔐 Penyetelan Hak Istimewa Pengembang
                </p>
                <p className="leading-normal">
                  Ingin merasakan kontrol mutlak Admin? Akun Google Anda <strong className="font-bold">{user?.email}</strong> dapat ditingkatkan hak aksesnya secara instan menjadi Administrator. Ini akan memberi Anda wewenang penuh untuk mengubah visi prodi, mendaftarkan mahasiswa, memposting, dan menyapu galeri.
                </p>

                {isAdmin ? (
                  <div className="flex flex-col gap-2 mt-1 select-none">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-display select-none">
                      <Check className="w-4 h-4" /> Anda adalah Administrator PAI D Immortal!
                    </div>
                    {onDeactivateAdmin && (
                      <button
                        onClick={onDeactivateAdmin}
                        className="self-start mt-1 px-3 py-1 text-[10px] bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Nonaktifkan Akses Admin
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    onBecomAdmin(verifyUser, verifyPass);
                    setVerifyUser('');
                    setVerifyPass('');
                  }} className="flex flex-col gap-2.5 mt-2 max-w-xs text-left">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-zinc-400 font-bold">Username Admin</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Al Rasyak Izwar"
                        value={verifyUser}
                        onChange={(e) => setVerifyUser(e.target.value)}
                        className="p-2 text-xs font-sans rounded-xl border border-gold-classic/20 bg-emerald-medium/10 text-emerald-deep dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-zinc-400 font-bold">Password Admin</label>
                      <input
                        type="password"
                        required
                        placeholder="Masukkan kata sandi"
                        value={verifyPass}
                        onChange={(e) => setVerifyPass(e.target.value)}
                        className="p-2 text-xs font-sans rounded-xl border border-gold-classic/20 bg-emerald-medium/10 text-emerald-deep dark:text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-1 self-start px-4 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-deep font-bold transition-all rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm text-xs"
                    >
                      <Key className="w-3.5 h-3.5" /> Verifikasi & Aktifkan Admin
                    </button>
                  </form>
                )}
              </div>

              <div className="text-xs text-zinc-400 flex flex-col gap-1 select-text">
                <p className="font-bold text-zinc-500">Panduan Admin:</p>
                <p>• Setelah mengaktifkan Hak Admin, kembalilah ke dashboard website utama.</p>
                <p>• Pergi ke seksi **Profil** untuk menyunting visi-misi secara offline tanpa menyentuh source code.</p>
                <p>• Pergi ke seksi **Mahasiswa** untuk menambah/menghapus entri mahasiswa baru secara interaktif.</p>
                <p>• Pergi ke seksi **Lounge Chat** untuk memoderasi obrolan atau membilas riwayat lounge.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
