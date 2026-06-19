import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Plus, Trash2, X, ZoomIn, Upload, Check } from 'lucide-react';
import { GalleryItem } from '../types';
import { compressImage } from '../utils/imageCompressor';

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

  const [compressing, setCompressing] = useState(false);
  const [compressError, setCompressError] = useState('');

  const handleLocalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    setCompressError('');
    try {
      const compressedDataUrl = await compressImage(file, 600, 600, 0.7);
      setSrc(compressedDataUrl);
    } catch (err: any) {
      console.error(err);
      setCompressError(err.message || 'Gagal memproses gambar.');
    } finally {
      setCompressing(false);
    }
  };

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
                <div className="flex flex-col gap-2 b-2 border-b border-zinc-100 dark:border-white/5 pb-3">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-[#127054] dark:text-gold-soft uppercase">Sumber Berkas/Link Foto</label>
                    <span className="text-[9px] text-[#0a3d2e]/60 dark:text-gold-soft/60 italic">Bisa upload langsung / pakai link</span>
                  </div>

                  {/* Local file selector */}
                  <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-dashed border-gold-classic/30 bg-gold-classic/5 dark:bg-white/5">
                    <p className="text-[10px] text-[#0a3d2e] dark:text-white font-semibold">1. Unggah Langsung dari Laptop / HP:</p>
                    <label className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-deep text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-emerald-medium transition-colors shadow">
                      <Upload className="w-3.5 h-3.5" />
                      {compressing ? 'Memproses Berkas...' : 'Pilih File / Foto Kamera'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageChange}
                        disabled={compressing}
                        className="hidden"
                      />
                    </label>
                    {compressError && (
                      <p className="text-[9px] text-red-500 font-semibold">{compressError}</p>
                    )}
                    {src.startsWith('data:image/') && (
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Foto berhasil dimuat dari berkas lokal!
                      </p>
                    )}
                  </div>

                  {/* URL fallback */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-[#0a3d2e] dark:text-white font-semibold">2. Atau Masukkan Link/URL Foto (Opsional jika sudah memilih file):</p>
                    <input
                      type="url"
                      required={!src}
                      placeholder="https://alamatlink.com/foto.jpg"
                      value={src.startsWith('data:image/') ? '' : src}
                      onChange={(e) => setSrc(e.target.value)}
                      className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-white dark:bg-emerald-deep/40 text-[#0a3d2e] dark:text-white focus:outline-none focus:ring-1"
                    />
                  </div>
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
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fail gracefully by serving a high quality fallback icon/image rather than hiding the block
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop';
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
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop';
                }}
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
