import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Plus, Trash2, X, ZoomIn } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  isAdmin: boolean;
  user: any;
  onAddPhoto: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

export default function GallerySection({
  galleryItems,
  isAdmin,
  user,
  onAddPhoto,
  onDeletePhoto
}: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [src, setSrc] = useState('');
  const [caption, setCaption] = useState('');
  const [tall, setTall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!src || !caption) {
      alert('URL Foto dan Keterangan wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      await onAddPhoto({
        src,
        caption,
        tall,
        addedBy: user?.uid || 'anonymous',
        createdAt: new Date().toISOString()
      });
      setSrc('');
      setCaption('');
      setTall(false);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Gagal mengupload kenangan foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
    }
  };

  const handlePrevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  return (
    <section className="section bg-emerald-medium/5 dark:bg-[#021c14]/40 py-16 transition-colors duration-300" id="galeri">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-head text-center flex flex-col items-center gap-2 mb-10 select-none">
          <p className="font-display font-black text-xs uppercase tracking-widest text-[#bfa14c] dark:text-[#dac17d]">
            + DOKUMENTASI +
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#127054] dark:text-[#dac17d] uppercase tracking-tight">
            Galeri Kenangan
          </h2>
          <p className="text-sm text-[#1c473c] dark:text-zinc-300 max-w-xl font-medium">
            Setiap foto menyimpan seribu cerita. Momen bersama yang terukir dalam ingatan selamanya.
          </p>

          {(isAdmin || user) && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-emerald-medium/10 hover:bg-emerald-medium/25 text-[#127054] dark:text-gold-soft rounded-full text-xs font-bold border border-gold-classic/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {showAddForm ? 'Sembunyikan Form' : 'Tambah Kenangan Foto'}
            </button>
          )}
        </div>

        {/* Add Photo Form Panel */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass max-w-md mx-auto p-6 mb-10 overflow-hidden"
            >
              <h3 className="font-display font-bold text-[#127054] dark:text-gold-soft text-sm uppercase mb-3">
                Baru: Tambah Kenangan Foto
              </h3>
              <form onSubmit={handleCreatePhoto} className="flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#127054] dark:text-gold-soft uppercase">Link/URL Foto</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={src}
                    onChange={(e) => setSrc(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white dark:bg-emerald-deep/40 text-[#0a3d2e] dark:text-white focus:outline-none focus:ring-1"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#127054] dark:text-gold-soft uppercase">Keterangan Foto</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Diskusi materi tafsir sore hari"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white dark:bg-emerald-deep/40 text-[#0a3d2e] dark:text-white focus:outline-none focus:ring-1"
                  />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="tall"
                    checked={tall}
                    onChange={(e) => setTall(e.target.checked)}
                    className="w-4 h-4 rounded border-emerald-medium text-emerald-medium focus:ring-emerald-medium cursor-pointer"
                  />
                  <label htmlFor="tall" className="font-bold text-zinc-500 dark:text-zinc-300 cursor-pointer select-none">
                    Format Foto Vertikal/Tinggi (Tall Layout)
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 py-2 bg-emerald-deep hover:bg-emerald-medium disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
                >
                  {loading ? 'Menyimpan...' : 'Tambahkan Ke Galeri'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Masonry Layout Grid */}
        {galleryItems.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 glass rounded-2xl max-w-md mx-auto border border-dashed border-gold-classic/20">
            <Camera className="w-10 h-10 text-zinc-300 mx-auto mb-2 animate-bounce-soft" />
            <p className="text-sm">Belum ada foto dalam galeri.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4 max-w-6xl mx-auto space-y-4">
            {galleryItems.map((img, idx) => (
              <div
                key={img.id}
                className={`break-inside-avoid relative rounded-2xl overflow-hidden group shadow-md border border-white/20 dark:border-white/5 hover:scale-[1.02] transition-all cursor-zoom-in ${
                  img.tall ? 'aspect-[3/4]' : 'aspect-square'
                }`}
                onClick={() => setLightboxIndex(idx)}
              >
                {/* Custom Delete Confirmation Overlay */}
                <AnimatePresence>
                  {deleteConfirmId === img.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={(e) => e.stopPropagation()} // Prevent triggering lightbox on click
                      className="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center p-3 text-center"
                    >
                      <Trash2 className="w-6 h-6 text-rose-500 mb-1.5 animate-bounce" />
                      <p className="text-white text-[10px] font-bold mb-3 px-2 leading-normal">Hapus foto ini dari galeri?</p>
                      <div className="flex items-center gap-1.5 w-full max-w-[120px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-zinc-700 hover:bg-zinc-650 text-white transition-all cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                            await onDeletePhoto(img.id!);
                          }}
                          className="flex-1 py-1 text-[9px] font-bold uppercase rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <img
                  src={img.src}
                  alt={img.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="font-display font-semibold text-xs text-white leading-tight drop-shadow">
                    {img.caption}
                  </p>
                  <span className="text-[9px] text-zinc-300 mt-1 flex items-center gap-1">
                    <ZoomIn className="w-3 h-3 text-gold-classic" /> Klik untuk memperbesar
                  </span>
                </div>

                {/* Admin Delete Action overlay */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (img.id) {
                        setDeleteConfirmId(img.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600/95 hover:bg-rose-700 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm z-10"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal picture expanded view */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] flex flex-col gap-2 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryItems[lightboxIndex]?.src}
                alt={galleryItems[lightboxIndex]?.caption}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <p className="text-center font-display font-black text-sm sm:text-base text-gold-soft drop-shadow px-4 max-w-xl">
                {galleryItems[lightboxIndex]?.caption}
              </p>

              {/* Next/Prev simple carousel helpers */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[-50px] md:left-[-70px] select-none">
                <button
                  onClick={handlePrevPhoto}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-bold flex items-center justify-center cursor-pointer"
                >
                  ‹
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-[-50px] md:right-[-70px] select-none">
                <button
                  onClick={handleNextPhoto}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-bold flex items-center justify-center cursor-pointer"
                >
                  ›
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
