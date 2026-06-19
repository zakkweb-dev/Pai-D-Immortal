import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit, Trash2, Heart, Award, ArrowRight, UserCheck, X } from 'lucide-react';
import { Student } from '../types';

interface StudentsSectionProps {
  students: Student[];
  user: any;
  isAdmin: boolean;
  onAddStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  onUpdateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export default function StudentsSection({
  students,
  user,
  isAdmin,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  const [foto, setFoto] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim?.includes(searchQuery)
  );

  const openAddModal = () => {
    setEditingStudent(null);
    setNama('');
    setNim('');
    setMotto('');
    setInstagram('');
    setFoto('');
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setNama(student.nama);
    setNim(student.nim);
    setMotto(student.motto || '');
    setInstagram(student.instagram || '');
    setFoto(student.foto || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nim) {
      alert('Nama dan NIM wajib diisi!');
      return;
    }

    try {
      if (editingStudent && editingStudent.id) {
        await onUpdateStudent(editingStudent.id, { nama, nim, motto, instagram, foto });
      } else {
        await onAddStudent({ nama, nim, motto, instagram, foto, ownerId: null });
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses data mahasiswa.');
    }
  };

  const handleClaimProfile = async (studentId: string) => {
    if (!user) {
      alert('Silakan Masuk terlebih dahulu untuk mengklaim profil Anda!');
      return;
    }
    try {
      await onUpdateStudent(studentId, { ownerId: user.uid });
      alert('Profil berhasil diklaim! Anda dapat mengedit profil Anda melalui Dashboard.');
    } catch (err) {
      console.error(err);
      alert('Gagal mengklaim profil.');
    }
  };

  const handleReleaseProfile = async (studentId: string) => {
    try {
      await onUpdateStudent(studentId, { ownerId: null });
      alert('Klaim profil dilepas.');
    } catch (err) {
      console.error(err);
      alert('Gagal melepas klaim.');
    }
  };

  return (
    <section className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300" id="mahasiswa">
      <div className="section-head text-center flex flex-col items-center gap-2 mb-10 select-none">
        <p className="font-display font-black text-xs uppercase tracking-widest text-[#bfa14c] dark:text-[#dac17d]">
          + KELUARGA BESAR +
        </p>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#127054] dark:text-[#dac17d] uppercase tracking-tight">
          Mahasiswa PAI D 2023
        </h2>
        <p className="text-sm text-[#1c473c] dark:text-zinc-300 max-w-xl font-medium">
          {students.length} jiwa yang bersatu dalam satu ukhuwah. Setiap nama, setiap wajah, adalah bagian dari keluarga besar PAI D IMMORTAL.
        </p>

        {/* Admin additions option */}
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-[#127054] hover:bg-emerald-medium text-white rounded-full text-xs font-bold border border-gold-classic/20 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Mahasiswa Baru
          </button>
        )}
      </div>

      {/* Search Input Filter & Filter metrics */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 max-w-6xl mx-auto select-none">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-emerald-medium/60" />
          <input
            type="text"
            placeholder="Cari mahasiswa berdasarkan nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans pl-10 pr-4 py-2 bg-white dark:bg-[#041d15] rounded-full border border-emerald-medium/30 dark:border-[#113e31] focus:border-[#dac17d]/60 focus:outline-[#dac17d]/65 focus:outline-none focus:ring-0 text-[#0a3d2e] dark:text-white"
          />
        </div>
        <div className="text-xs text-[#1c473c] dark:text-zinc-300">
          Menampilkan <span className="text-[#bfa14c] dark:text-[#dac17d] font-bold">{filteredStudents.length}</span> dari {students.length} Mahasiswa
        </div>
      </div>

      {/* Students Listings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-center max-w-7xl mx-auto">
        {filteredStudents.map((st) => {
          const initials = st.nama
            ? st.nama
                .split(' ')
                .slice(0, 2)
                .map((x) => x[0])
                .join('')
                .toUpperCase()
            : 'S';

          return (
            <motion.div
              layout
              key={st.id}
              className="p-5 pb-7 rounded-[2rem] flex flex-col items-center text-center relative hover:scale-[1.03] transition-all bg-gradient-to-br from-white/95 to-white/80 dark:from-[#051f16] dark:to-[#02120e] border border-emerald-medium/15 dark:border-[#113e31] hover:border-[#dac17d]/65 group shadow-xl overflow-hidden"
              whileHover={{ y: -6 }}
            >
              {/* Custom Delete Confirmation Overlay */}
              <AnimatePresence>
                {deleteConfirmId === st.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/95 backdrop-blur-xs rounded-[2rem] z-30 flex flex-col items-center justify-center p-3 text-center"
                  >
                    <Trash2 className="w-7 h-7 text-rose-500 mb-2 animate-bounce" />
                    <p className="text-white text-[10px] font-bold mb-3 px-1.5 leading-normal">Hapus data mahasiswa "{st.nama}"?</p>
                    <div className="flex items-center gap-1.5 w-full px-2 max-w-[130px]">
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
                          await onDeleteStudent(st.id!);
                        }}
                        className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Card Admin Control panel */}
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                  <button
                    onClick={() => openEditModal(st)}
                    className="p-1.5 bg-white/80 dark:bg-[#03140e]/80 hover:bg-emerald-medium hover:text-white dark:hover:bg-[#127054] rounded-full text-zinc-500 dark:text-zinc-300 transition-colors shadow-sm cursor-pointer"
                    title="Edit Profil"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => {
                      if (st.id) {
                        setDeleteConfirmId(st.id);
                      }
                    }}
                    className="p-1.5 bg-white/80 dark:bg-[#03140e]/80 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 rounded-full text-zinc-400 transition-colors shadow-sm cursor-pointer"
                    title="Hapus Profil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Student Photo or Elegant Initial sphere */}
              <div className="mb-4 select-none">
                {st.foto ? (
                  <div className="w-20 h-20 rounded-full border-2 border-[#bfa14c] dark:border-[#dac17d] shadow-lg overflow-hidden flex items-center justify-center bg-[#03140e] group-hover:scale-105 transition-all">
                    <img
                      src={st.foto}
                      alt={st.nama}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-medium/10 dark:bg-[#0a2f24] border-2 border-emerald-medium/30 dark:border-[#139b72] flex items-center justify-center shadow-lg text-emerald-deep dark:text-[#09bc8a] group-hover:text-[#dac17d] group-hover:border-[#dac17d] font-display font-bold text-base tracking-wide group-hover:scale-105 transition-all">
                    {initials}
                  </div>
                )}
              </div>

              <h3 className="font-display font-black text-sm text-[#0a3d2e] dark:text-white capitalize tracking-tight line-clamp-2 min-h-[40px] mb-1 select-text">
                {st.nama}
              </h3>
              <p className="text-xs text-[#bfa14c] dark:text-[#dac17d]/90 mb-3 font-mono tracking-wide select-text">{st.nim}</p>

              <p className="text-[11px] text-zinc-650 dark:text-[#8ea79e] line-clamp-3 italic leading-relaxed min-h-[50px] px-1 select-text font-medium font-sans">
                "{st.motto || 'Ukhuwah yang abadi kelas PAI D.'}"
              </p>

              {st.instagram && (
                <a
                  href={`https://instagram.com/${st.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[10px] text-[#127054] dark:text-[#dac17d] hover:underline leading-none flex items-center gap-1 font-semibold select-none"
                >
                  @{st.instagram.replace('@', '')}
                </a>
              )}

              {/* Claim or Ownership visual indicators */}
              <div className="mt-3 w-full border-t border-emerald-medium/5 dark:border-white/5 pt-2 flex justify-center select-none">
                {st.ownerId ? (
                  <div className="flex items-center gap-1 text-[9px] text-[#1c473c] dark:text-zinc-500">
                    <UserCheck className="w-3 h-3 text-emerald-medium" />
                    <span>Telah diklaim</span>
                    {isAdmin && (
                      <button
                        onClick={() => st.id && handleReleaseProfile(st.id)}
                        className="text-[8px] text-rose-400 hover:underline cursor-pointer ml-1"
                      >
                        [Lepas]
                      </button>
                    )}
                  </div>
                ) : user && !students.some((s) => s.ownerId === user.uid) ? (
                  <button
                    onClick={() => st.id && handleClaimProfile(st.id)}
                    className="text-[9px] font-bold text-emerald-medium dark:text-gold-soft hover:underline leading-none flex items-center gap-0.5 cursor-pointer"
                  >
                    Klaim Profil Ini <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                ) : (
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-medium">Bebas</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal - Add or Edit Student */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-strong w-full max-w-md p-6 relative flex flex-col gap-4"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-emerald-deep dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display font-black text-xl text-emerald-deep dark:text-gold-soft border-b border-gold-classic/10 pb-2">
                {editingStudent ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 select-none">
                  <label className="text-[11px] font-bold text-emerald-deep dark:text-gold-soft uppercase">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Ali"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white/50 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic"
                  />
                </div>

                <div className="flex flex-col gap-1 select-none">
                  <label className="text-[11px] font-bold text-emerald-deep dark:text-gold-soft uppercase">NIM (Nomor Induk Mahasiswa)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 20100123001"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white/50 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic"
                  />
                </div>

                <div className="flex flex-col gap-1 select-none">
                  <label className="text-[11px] font-bold text-emerald-deep dark:text-gold-soft uppercase">Semboyan / Motto Pribadi</label>
                  <textarea
                    placeholder="Contoh: Hidup adalah perjuangan mulia."
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    rows={3}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white/50 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 select-none">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-emerald-deep dark:text-gold-soft uppercase">Username Instagram</label>
                    <input
                      type="text"
                      placeholder="Contoh: @ali_husain"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white/50 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-emerald-deep dark:text-gold-soft uppercase">URL Foto (Opsional)</label>
                    <input
                      type="url"
                      placeholder="Link foto eksternal"
                      value={foto}
                      onChange={(e) => setFoto(e.target.value)}
                      className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white/50 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full py-2 bg-emerald-deep hover:bg-emerald-medium text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm border border-gold-classic/20"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Mahasiswa'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
