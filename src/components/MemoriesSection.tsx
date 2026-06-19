import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { Memory } from '../types';

interface MemoriesSectionProps {
  memories: Memory[];
  user: any;
  isAdmin: boolean;
  onAddMemory: (memory: Omit<Memory, 'id'>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

export default function MemoriesSection({
  memories,
  user,
  isAdmin,
  onAddMemory,
  onDeleteMemory
}: MemoriesSectionProps) {
  const [nama, setNama] = useState('');
  const [angkatan, setAngkatan] = useState('PAI D 2023');
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  React.useEffect(() => {
    if (user && user.displayName) {
      setNama(user.displayName);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !pesan) {
      alert('Nama dan Pesan wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      await onAddMemory({
        nama,
        angkatan,
        pesan,
        createdAt: new Date().toISOString(),
        userId: user ? user.uid : null
      });
      setPesan('');
      if (!user) setNama('');
      alert('Pesan kenangan berhasil dikirim! 💚');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirimkan pesan kenangan.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300" id="memories">
      <div className="section-head text-center flex flex-col items-center gap-2 mb-10 select-none">
        <p className="font-display font-black text-xs uppercase tracking-widest text-[#bfa14c] dark:text-[#dac17d]">
          + JEJAK UKHUWAH +
        </p>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#127054] dark:text-[#dac17d] uppercase tracking-tight">
          Wall of Memories
        </h2>
        <p className="text-sm text-[#1c473c] dark:text-zinc-300 max-w-xl font-medium">
          Tuliskan kenangan indahmu bersama PAI D. Setiap pesan adalah jejak yang akan selalu kita kenang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* Form to submit a new memory */}
        <div className="md:col-span-5 glass p-6 flex flex-col gap-4 bg-gradient-to-b from-white/90 to-white/75 dark:from-[#0d2a21]/90 dark:to-[#041410]/95">
          <div>
            <h3 className="font-display font-black text-lg text-[#127054] dark:text-[#dac17d] mb-1 flex items-center gap-2 select-none">
              ✍️ Tulis Kenanganmu
            </h3>
            <p className="text-xs text-[#1c473c]/85 dark:text-zinc-400">
              Bagikan momen berhargamu bersama PAI D 2023
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs text-[#1c473c] dark:text-zinc-200">
            <div className="flex flex-col gap-1 select-none">
              <label className="font-bold text-[#bfa14c] dark:text-[#dac17d] uppercase">Nama Pendengar</label>
              <input
                type="text"
                required
                placeholder="Nama lengkapmu"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full text-xs font-sans p-2 rounded-lg border border-emerald-medium/20 dark:border-[#113e31] bg-white dark:bg-[#041d15] text-[#0a3d2e] dark:text-white focus:border-[#dac17d]/60 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 select-none">
              <label className="font-bold text-[#bfa14c] dark:text-[#dac17d] uppercase">Deskripsi Angkatan</label>
              <input
                type="text"
                required
                placeholder="Contoh: PAI D 2023"
                value={angkatan}
                onChange={(e) => setAngkatan(e.target.value)}
                className="w-full text-xs font-sans p-2 rounded-lg border border-emerald-medium/20 dark:border-[#113e31] bg-white dark:bg-[#041d15] text-[#0a3d2e] dark:text-white focus:border-[#dac17d]/60 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 select-none">
              <label className="font-bold text-[#bfa14c] dark:text-[#dac17d] uppercase">Ceritakan Kenanganmu</label>
              <textarea
                required
                rows={4}
                placeholder="Ceritakan kenanganmu bersama PAI D..."
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                maxLength={500}
                className="w-full text-xs font-sans p-2 rounded-lg border border-emerald-medium/20 dark:border-[#113e31] bg-white dark:bg-[#041d15] text-[#0a3d2e] dark:text-white focus:border-[#dac17d]/60 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-2 flex items-center justify-center gap-2 btn-primary text-white font-bold rounded-lg cursor-pointer text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Mengirim...' : 'Kirim Kenangan'}
            </button>
          </form>
        </div>

        {/* List of latest memories */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-emerald-medium/10 dark:border-white/5 pb-2 select-none">
            <h3 className="font-display font-black text-[#127054] dark:text-[#dac17d] flex items-center gap-1.5 text-base">
              📜 Kenangan Terbaru
            </h3>
            <span className="text-[10px] text-[#1c473c] dark:text-zinc-400">Sinc otomatis via Firestore</span>
          </div>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
            {memories.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 glass rounded-xl">
                <Heart className="w-8 h-8 text-rose-300 mx-auto mb-2 animate-pulse-soft" />
                <p className="text-sm">Belum ada memori terdaftar. Jadilah yang pertama!</p>
              </div>
            ) : (
              memories.map((m) => (
                <div
                  key={m.id}
                  className="glass p-4 sm:p-5 flex flex-col gap-2 relative hover:border-emerald-medium/30 transition-all bg-gradient-to-b from-white/90 to-white/75 dark:from-[#0d2a21]/95 dark:to-[#041410]/98 overflow-hidden"
                >
                  {/* Custom Delete Confirmation Overlay */}
                  <AnimatePresence>
                    {deleteConfirmId === m.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-3 text-center"
                      >
                        <Trash2 className="w-6 h-6 text-rose-500 mb-1.5 animate-bounce" />
                        <p className="text-white text-[10px] font-bold mb-2 px-2 leading-normal">Hapus kenangan dari "{m.nama}"?</p>
                        <div className="flex items-center gap-1.5 w-full max-w-[125px]">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-zinc-700 hover:bg-zinc-650 text-white transition-all cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setDeleteConfirmId(null);
                              await onDeleteMemory(m.id!);
                            }}
                            className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-start gap-4 select-none">
                    <div className="flex flex-col">
                      <span className="font-display font-extrabold text-sm text-[#0a3d2e] dark:text-zinc-200">
                        {m.nama}
                      </span>
                      <span className="text-[10px] text-[#127054] dark:text-[#dac17d]/95 font-bold mt-0.5">
                        {m.angkatan || 'PAI D 2023'}
                      </span>
                    </div>

                    {/* Meta and deletions option */}
                    <div className="flex items-center gap-2 text-[10px] text-[#1c473c] dark:text-zinc-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#1c473c]/60 dark:text-zinc-400" />
                        {formatDate(m.createdAt)}
                      </span>
                      {(isAdmin || (user && m.userId === user.uid)) && (
                        <button
                          onClick={() => {
                            if (m.id) {
                              setDeleteConfirmId(m.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                          title="Hapus Kenangan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-line mt-1">
                    {m.pesan}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
