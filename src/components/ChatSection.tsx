import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, MessageSquare, Shield, Circle, User, HelpCircle, Lock, UserCheck } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatSectionProps {
  messages: ChatMessage[];
  user: any;
  isAdmin: boolean;
  onSendMessage: (msg: string) => Promise<void>;
  onClearChat: () => Promise<void>;
  onLoginClick: () => void;
  onVerifyStudent: (nama: string, nim: string) => boolean;
}

export default function ChatSection({
  messages,
  user,
  isAdmin,
  onSendMessage,
  onClearChat,
  onLoginClick,
  onVerifyStudent
}: ChatSectionProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // States for student verification
  const [inputNama, setInputNama] = useState('');
  const [inputNim, setInputNim] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Auto-scroll on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await onSendMessage(text.trim());
      setText('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirimkan pesan.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    if (!inputNama.trim() || !inputNim.trim()) {
      setVerifyError('Harap isi Nama Lengkap dan NIM Anda.');
      return;
    }

    const success = onVerifyStudent(inputNama, inputNim);
    if (!success) {
      setVerifyError('Nama atau NIM Anda tidak terdaftar dalam direktori mahasiswa PAI D.');
    }
  };

  const getTimeString = (createdAt: any) => {
    if (!createdAt) return 'Baru saja';
    try {
      const d = createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <section className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-300" id="chat">
      <div className="section-head text-center flex flex-col items-center gap-2 mb-10 select-none">
        <p className="font-display font-black text-xs uppercase tracking-widest text-[#bfa14c] dark:text-[#dac17d]">
          + FORUM INTERAKSI +
        </p>
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#127054] dark:text-[#dac17d] uppercase tracking-tight">
          Lounge Chat Real-Time
        </h2>
        <p className="text-sm text-[#1c473c] dark:text-zinc-300 max-w-xl font-medium">
          Komunikasi antar mahasiswa PAI D 2023 menjadi lebih cepat, responsif, dan akrab. Sambung ukhuwah setiap waktu.
        </p>
      </div>

      <div className="max-w-4xl mx-auto glass rounded-2xl overflow-hidden border border-gold-classic/10 flex flex-col h-[550px] shadow-lg">
        {/* Chat Header Status Bar */}
        <div className="bg-emerald-deep/95 dark:bg-emerald-deep px-4 py-3 border-b border-gold-classic/10 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-gold-classic fill-gold-classic/20" />
              <Circle className="absolute -bottom-0.5 -right-0.5 w-2 h-2 text-emerald-light fill-emerald-light" />
            </div>
            <div>
              <h3 className="font-display font-black text-xs sm:text-sm text-cream-soft">Forum PAI D IMMORTAL</h3>
              <p className="text-[9px] text-zinc-300">Live chat aktif antar mahasiswa terverifikasi</p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1.5 select-none text-[10px]">
              {showClearConfirm ? (
                <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  <span className="text-rose-300 font-bold text-[9px] mr-1">Hapus semua chat?</span>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="bg-zinc-700 hover:bg-zinc-650 text-white px-2 py-0.5 rounded text-[8px] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      setShowClearConfirm(false);
                      await onClearChat();
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded text-[8px] cursor-pointer font-bold"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[10px] bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-full border border-rose-500/20 font-bold transition-all cursor-pointer"
                >
                  Kosongkan Lounge Chat
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chat Messages Log */}
        <div ref={containerRef} className="flex-1 bg-cream-soft/20 dark:bg-black/10 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
          {!user ? (
            /* Locked state greeting with Student Validation form */
            <div className="h-full w-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-6 flex flex-col gap-4 bg-gradient-to-br from-white to-[#f4faf8] dark:from-[#0c2e23] dark:to-[#041511] border border-emerald-medium/20 dark:border-gold-classic/30 rounded-2xl shadow-xl select-none"
              >
                <div className="text-center flex flex-col items-center gap-1.5">
                  <div className="p-2.5 bg-emerald-medium/10 dark:bg-gold-classic/10 rounded-full border border-emerald-medium/20 dark:border-gold-classic/20 text-[#127054] dark:text-gold-classic mb-1">
                    <Lock className="w-5 h-5 text-[#127054] dark:text-gold-classic animate-pulse-soft" />
                  </div>
                  <h4 className="font-display font-black text-sm text-[#127054] dark:text-gold-classic uppercase tracking-wider">Akses Lounge Chat</h4>
                  <p className="text-[11px] text-[#1c473c] dark:text-[#dec891] leading-normal max-w-xs">
                    Lounge Chat ini khusus untuk keluarga besar PAI D 2023. Silakan masukkan Nama Lengkap & NIM Anda sesuai database kelas.
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[9px] font-black tracking-wider text-[#127054] dark:text-[#dec891] uppercase">Nama Lengkap Anda</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Muhammad Fauzan"
                      value={inputNama}
                      onChange={(e) => setInputNama(e.target.value)}
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-emerald-medium/20 dark:border-gold-classic/20 bg-white dark:bg-black/35 text-[#0a3d2e] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#127054] dark:focus:ring-gold-classic transition-all font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[9px] font-black tracking-wider text-[#127054] dark:text-[#dec891] uppercase">Nomor Induk Mahasiswa (NIM)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 20300123045"
                      value={inputNim}
                      onChange={(e) => setInputNim(e.target.value)}
                      className="w-full text-xs font-sans px-3.5 py-2.5 rounded-xl border border-emerald-medium/20 dark:border-gold-classic/20 bg-white dark:bg-black/35 text-[#0a3d2e] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#127054] dark:focus:ring-gold-classic transition-all font-medium"
                    />
                  </div>

                  {verifyError && (
                    <p className="text-[10px] text-rose-500 dark:text-rose-300 font-bold bg-rose-500/15 dark:bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg leading-normal text-left">
                      ⚠ {verifyError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#127054] to-emerald-medium dark:from-gold-classic dark:to-[#dac17d] text-white dark:text-emerald-deep hover:brightness-105 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-emerald-medium/10 dark:border-gold-classic/30 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verifikasi & Masuk Lounge</span>
                  </button>
                </form>

                <div className="text-center pt-1 border-t border-emerald-medium/10 dark:border-white/5">
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-[9px] text-[#127054] dark:text-[#dac17d]/80 hover:text-emerald-medium dark:hover:text-gold-soft hover:underline font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Masuk Sebagai Admin Utama
                  </button>
                </div>
              </motion.div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 select-none">
              <HelpCircle className="w-10 h-10 text-zinc-300 mb-2 animate-bounce" />
              <p className="text-xs font-medium">Belum ada obrolan di lounge. Mulai sapalah teman-temanmu!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user.uid;
              const senderAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msg.senderName)}&backgroundColor=0f5b42&textColor=f3dd96`;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <img
                    src={msg.senderPhoto || senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full border border-gold-classic/20 object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[9px] font-bold text-zinc-400 ${isMe ? 'text-right' : 'text-left'}`}>
                      {msg.senderName}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                        isMe
                          ? 'bg-emerald-deep text-white border-br-none rounded-br-none border border-gold-classic/20 shadow-sm'
                          : 'bg-white dark:bg-emerald-deep/40 text-emerald-deep dark:text-zinc-200 rounded-bl-none border border-white/40 dark:border-white/5'
                      }`}
                    >
                      <p className="break-words white-space-pre-wrap">{msg.message}</p>
                    </div>
                    <span className={`text-[8px] text-zinc-400 font-mono mt-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                      {getTimeString(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar form if signed in */}
        {user && (
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-emerald-deep/90 border-t border-gold-classic/10 flex items-center gap-2 select-none"
          >
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Tulis pesan obrolan di sini..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 text-xs font-sans px-3.5 py-2.5 rounded-full border border-gold-classic/20 bg-zinc-50 dark:bg-emerald-deep/50 text-emerald-deep dark:text-white focus:outline-none focus:ring-1 focus:ring-gold-classic"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="p-2.5 rounded-full btn-primary text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
