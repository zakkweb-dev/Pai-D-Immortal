import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Award, Landmark, Sparkles, Edit, Check, X } from 'lucide-react';
import { ClassSettings } from '../types';

interface ProfileSectionProps {
  settings: ClassSettings;
  isAdmin: boolean;
  onSaveSettings: (newSettings: ClassSettings) => Promise<void>;
}

export default function ProfileSection({ settings, isAdmin, onSaveSettings }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [visi, setVisi] = useState(settings.visi);
  const [misi, setMisi] = useState(settings.misi);
  const [aboutProdi, setAboutProdi] = useState(settings.aboutProdi);
  const [mottoKelas, setMottoKelas] = useState(settings.mottoKelas);
  const [loading, setLoading] = useState(false);

  // Sync state if settings props changes
  React.useEffect(() => {
    setVisi(settings.visi);
    setMisi(settings.misi);
    setAboutProdi(settings.aboutProdi);
    setMottoKelas(settings.mottoKelas);
  }, [settings]);

  const handleCancel = () => {
    setVisi(settings.visi);
    setMisi(settings.misi);
    setAboutProdi(settings.aboutProdi);
    setMottoKelas(settings.mottoKelas);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaveSettings({ visi, misi, aboutProdi, mottoKelas });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil kelas.');
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Visi Angkatan',
      icon: <Award className="w-8 h-8 text-gold-classic" />,
      text: visi,
      setText: setVisi,
      placeholder: 'Tulis visi angkatan...',
    },
    {
      title: 'Misi Angkatan',
      icon: <BookOpen className="w-8 h-8 text-gold-classic" />,
      text: misi,
      setText: setMisi,
      placeholder: 'Tulis misi angkatan...',
    },
    {
      title: 'Tentang Program Studi',
      icon: <Landmark className="w-8 h-8 text-gold-classic" />,
      text: aboutProdi,
      setText: setAboutProdi,
      placeholder: 'Tulis tentang program studi...',
    },
    {
      title: 'Semboyan Kelas',
      icon: <Sparkles className="w-8 h-8 text-gold-classic" />,
      text: mottoKelas,
      setText: setMottoKelas,
      placeholder: 'Tulis semboyan kelas...',
    }
  ];

  return (
    <section className="section bg-emerald-medium/5 dark:bg-[#021c14]/40 py-16 transition-colors duration-300" id="profil">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-head text-center flex flex-col items-center gap-2 mb-12 select-none">
          <p className="font-display font-black text-xs uppercase tracking-widest text-[#bfa14c] dark:text-[#dac17d]">
            + TENTANG KAMI +
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#127054] dark:text-[#dac17d] uppercase tracking-tight">
            Profil Angkatan
          </h2>
          <p className="text-sm text-[#1c473c] dark:text-zinc-300 max-w-xl mb-2 font-medium">
            Mengenal lebih dalam siapa kami, dari mana kami berasal, dan ke mana kami melangkah bersama.
          </p>

          {/* Admin Control to Toggle Editing */}
          {isAdmin && (
            <div className="mt-2 text-zinc-700">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-medium/10 hover:bg-emerald-medium/20 text-[#127054] dark:text-gold-soft dark:hover:bg-white/5 rounded-full text-xs font-bold border border-gold-classic/20 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profil Angkatan (Mode Admin)
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#127054] hover:bg-emerald-medium text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              className="glass p-6 sm:p-7 flex flex-col gap-4 group hover:border-gold-classic/40 relative bg-gradient-to-b from-white/90 to-white/75 dark:from-[#0d2a21]/90 dark:to-[#041410]/95"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center text-center gap-3 select-none">
                <div className="p-3 bg-emerald-medium/10 dark:bg-[#081e17] rounded-2xl flex items-center justify-center border border-emerald-medium/20 shadow-inner group-hover:scale-105 transition-all">
                  {card.icon}
                </div>
                <h3 className="font-display font-black text-lg text-[#127054] dark:text-[#dac17d] uppercase tracking-wide">
                  {card.title}
                </h3>
              </div>

              {isEditing ? (
                <textarea
                  value={card.text}
                  onChange={(e) => card.setText(e.target.value)}
                  placeholder={card.placeholder}
                  rows={4}
                  className="w-full text-xs font-sans focus:outline-none focus:ring-1 focus:ring-gold-classic p-2.5 rounded-xl border border-gold-classic/20 bg-emerald-medium/5 dark:bg-emerald-deep/40 text-[#127054] dark:text-zinc-200 transition-all font-medium leading-relaxed resize-none"
                />
              ) : (
                <p className="text-xs text-[#1c473c]/90 dark:text-zinc-300 leading-relaxed font-sans text-center font-medium opacity-90 block">
                  {card.text || `Belum ada data untuk ${card.title}.`}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
