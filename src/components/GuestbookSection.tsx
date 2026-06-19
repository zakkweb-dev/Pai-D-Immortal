import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, Calendar } from 'lucide-react';
import { GuestbookEntry } from '../types';

interface GuestbookSectionProps {
  entries: GuestbookEntry[];
  user: any;
  isAdmin: boolean;
  onAddEntry: (entry: Omit<GuestbookEntry, 'id'>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export default function GuestbookSection({
  entries,
  user,
  isAdmin,
  onAddEntry,
  onDeleteEntry
}: GuestbookSectionProps) {
  const [nama, setNama] = useState('');
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
      await onAddEntry({
        nama,
        pesan,
        createdAt: new Date().toISOString(),
        userId: user ? user.uid : null
      });
      setPesan('');
      if (!user) setNama('');
      alert('Pesan terima kasih berhasil dikirim! 🌿');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirimkan tanggapan tamu.');
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
    <section className="section bg-emerald-medium/5 dark:bg-[#021c14]/40 py-16 transition-colors duration-300" id="buku-tamu">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-head text-center flex flex-col items-center gap-2 mb-10 select-none">
          <p className="font-display font-black text-xs uppercase tracking-widest text-[#bfa14c] dark:text-[#dac17d]">
            + TAMU KAMI +
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#127054] dark:text-[#dac17d] uppercase tracking-tight">
            Buku Tamu Digital
          </h2>
          <p className="text-sm text-[#1c473c] dark:text-zinc-300 max-w-xl font-medium">
            Tinggalkan jejakmu di sini. Siapapun yang mengunjungi halaman ini, kami senang kalian hadir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Guestbook Submission Form */}
          <div className="md:col-span-5 glass p-6 flex flex-col gap-4 bg-gradient-to-b from-white/90 to-white/75 dark:from-[#0d2a21]/90 dark:to-[#041410]/95">
            <div>
              <h3 className="font-display font-black text-lg text-[#127054] dark:text-[#dac17d] mb-1 select-none">
                📝 Tulis Pesan Tamu
              </h3>
              <p className="text-xs text-[#1c473c]/85 dark:text-zinc-400">
                Bagikan kesan, doa, dan harapan untuk PAI D IMMORTAL
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs text-[#1c473c] dark:text-zinc-200">
              <div className="flex flex-col gap-1 select-none">
                <label className="font-bold text-[#bfa14c] dark:text-[#dac17d] uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap atau instansi"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full text-xs font-sans p-2 rounded-lg border border-emerald-medium/20 dark:border-[#113e31] bg-white dark:bg-[#041d15] text-[#0a3d2e] dark:text-white focus:border-[#dac17d]/60 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 select-none">
                <label className="font-bold text-[#bfa14c] dark:text-[#dac17d] uppercase">Pesan Singkat</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tulis pesan atau ucapan Anda di sini..."
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
                {loading ? 'Mengirim...' : 'Kirim Pesan Tamu'}
              </button>
            </form>
          </div>

          {/* List of guest book messages */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <h3 className="font-display font-black text-[#127054] dark:text-[#dac17d] border-b border-emerald-medium/10 dark:border-white/5 pb-2 text-base select-none">
              💬 Kritik & Saran Pengunjung
            </h3>

            <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-2">
              {entries.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 glass rounded-xl">
                  <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs">Belum ada pesan tamu. Jadilah yang pertama!</p>
                </div>
              ) : (
                entries.map((ent) => (
                  <div
                    key={ent.id}
                    className="glass p-4 rounded-xl flex flex-col gap-1 relative border border-emerald-medium/10 dark:border-white/5 hover:border-gold-classic/20 bg-gradient-to-b from-white/90 to-white/75 dark:from-[#0d2a21]/95 dark:to-[#041410]/98 transition-all overflow-hidden"
                  >
                    {/* Custom Delete Confirmation Overlay */}
                    <AnimatePresence>
                      {deleteConfirmId === ent.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/95 z-20 flex flex-col items-center justify-center p-2 text-center"
                        >
                          <Trash2 className="w-5 h-5 text-rose-500 mb-1 animate-bounce" />
                          <p className="text-white text-[10px] font-bold mb-2 px-2 leading-normal">Hapus pesan tamu dari "{ent.nama}"?</p>
                          <div className="flex items-center gap-1.5 w-full max-w-[125px]">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-zinc-700 hover:bg-zinc-650 text-white transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setDeleteConfirmId(null);
                                await onDeleteEntry(ent.id!);
                              }}
                              className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-start gap-4 select-none">
                      <span className="font-display font-extrabold text-sm text-[#0a3d2e] dark:text-zinc-200">
                        {ent.nama}
                      </span>

                      <div className="flex items-center gap-2 text-[9px] text-[#1c473c]/70 dark:text-zinc-400 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#1c473c]/50 dark:text-zinc-400" />
                          {formatDate(ent.createdAt)}
                        </span>
                        {(isAdmin || (user && ent.userId === user.uid)) && (
                          <button
                            onClick={() => {
                              if (ent.id) {
                                setDeleteConfirmId(ent.id);
                              }
                            }}
                            className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                            title="Hapus Pesan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-650 dark:text-zinc-300 leading-relaxed font-sans mt-1">
                      {ent.pesan}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
