import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';

import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { seedDatabaseIfNeeded } from './utils/seedData';
import { ClassSettings, Student, Memory, GuestbookEntry, ChatMessage, NotificationItem, GalleryItem } from './types';

// Importing Custom Components
import Header from './components/Header';
import ProfileSection from './components/ProfileSection';
import StudentsSection from './components/StudentsSection';
import GallerySection from './components/GallerySection';
import MemoriesSection from './components/MemoriesSection';
import GuestbookSection from './components/GuestbookSection';
import ChatSection from './components/ChatSection';
import Dashboard from './components/Dashboard';
import NotificationCenter, { ToastNotification } from './components/NotificationCenter';

// Icons for page decoration
import { Heart, Landmark, Send, MessageSquare, Shield, Circle, User, HelpCircle, Lock, Sparkles, BookOpen, Clock, ChevronDown, X, Phone, Instagram, MapPin } from 'lucide-react';

export default function App() {
  // Theme dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pai-theme');
    return saved !== null ? saved === 'dark' : true; // Default to DARK mode
  });

  // Authentication states
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('student-session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // UI components toggles / selection states
  const [activeSection, setActiveSection] = useState('beranda');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firestore real-time data states
  const [settings, setSettings] = useState<ClassSettings>({
    visi: "Memuat Visi...",
    misi: "Memuat Misi...",
    aboutProdi: "Memuat...",
    mottoKelas: "Memuat..."
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [guestbooks, setGuestbooks] = useState<GuestbookEntry[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pai-theme', 'light');
    }
  }, [darkMode]);

  // Seeding the database and setting up onAuthStateChanged
  useEffect(() => {
    // Self healing database seeding
    seedDatabaseIfNeeded(db);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Default bootstrapped admin or manually promoted in dev panel
        const email = firebaseUser.email || '';
        const savedAdminState = localStorage.getItem(`admin-flag-${firebaseUser.uid}`) === 'true';
        const isSecureAdmin = email === 'alrazakiswar11@gmail.com' || (firebaseUser.uid === 'admin-rasyak-izwar-secure' && savedAdminState);
        setIsAdmin(isSecureAdmin);
      } else {
        // Fallback to local student session
        const saved = localStorage.getItem('student-session');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
            setIsAdmin(false);
          } catch {
            setUser(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Set up real-time listener subscriptions
  useEffect(() => {
    // 1. Class settings profile
    const unsubSettings = onSnapshot(doc(db, 'settings', 'class_profile'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as ClassSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/class_profile');
    });

    // 2. Students
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const list: Student[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Student);
      });
      // Sort alphabetically by name
      list.sort((a, b) => a.nama.localeCompare(b.nama));
      setStudents(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    // 3. Gallery Images
    const unsubGallery = onSnapshot(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')), (snap) => {
      const list: GalleryItem[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as GalleryItem);
      });
      setGalleryItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });

    // 4. Memory Wall Wallposts
    const unsubMemories = onSnapshot(query(collection(db, 'memories'), orderBy('createdAt', 'desc'), limit(15)), (snap) => {
      const list: Memory[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Memory);
      });
      setMemories(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'memories');
    });

    // 5. Guestbook Messages
    const unsubGb = onSnapshot(query(collection(db, 'guestbook'), orderBy('createdAt', 'desc')), (snap) => {
      const list: GuestbookEntry[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as GuestbookEntry);
      });
      setGuestbooks(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'guestbook');
    });

    // 6. Notifications Log Activities Tracker
    const unsubNotif = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(15)), (snap) => {
      const list: NotificationItem[] = [];
      let lastIncomingDate = localStorage.getItem('last-opened-notif-timestamp') || '0';
      let unseen = 0;

      snap.forEach((d) => {
        const item = { id: d.id, ...d.data() } as NotificationItem;
        list.push(item);

        // Check if item is newer than last opened notifications panel view
        const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        if (itemTime > Number(lastIncomingDate)) {
          unseen++;
        }
      });

      setNotifications(list);
      setUnreadCount(unseen);

      // Trigger standard on-screen toast popup on receiving any new notification
      if (list.length > 0) {
        const latest = list[0];
        const latestTimestamp = latest.createdAt ? new Date(latest.createdAt).getTime() : 0;
        const previousStored = localStorage.getItem('processed-latest-notif') || '0';

        if (latestTimestamp > Number(previousStored)) {
          localStorage.setItem('processed-latest-notif', String(latestTimestamp));
          setToastMessage(`${latest.title}: ${latest.description}`);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    // 7. Chat Lounge Real-time Obrolan - authenticated only
    let unsubChat = () => {};
    if (user) {
      unsubChat = onSnapshot(query(collection(db, 'chat'), orderBy('createdAt', 'asc'), limit(80)), (snap) => {
        const list: ChatMessage[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as ChatMessage);
        });
        setChats(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'chat');
      });
    } else {
      setChats([]);
    }

    return () => {
      unsubSettings();
      unsubStudents();
      unsubGallery();
      unsubMemories();
      unsubGb();
      unsubNotif();
      unsubChat();
    };
  }, [user]);

  // --- GENERAL CORE DATABASE ACTIONS ---

  // Trigger Notifications
  const triggerUserActivityNotification = async (title: string, description: string, type: NotificationItem['type']) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        title,
        description,
        type,
        createdAt: new Date().toISOString(),
        userId: user ? user.uid : 'anonymous'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'notifications');
    }
  };

  // Student verification flow for lounge chat
  const handleStudentLogin = (namaInput: string, nimInput: string): boolean => {
    // Exact or loose match comparing name and NIM (ignoring casing and spaces)
    const match = students.find((s) => {
      const dbNama = (s.nama || '').trim().toLowerCase();
      const userNama = namaInput.trim().toLowerCase();
      
      const dbNim = (s.nim || '').trim().replace(/[^a-zA-Z0-9]/g, '');
      const userNim = nimInput.trim().replace(/[^a-zA-Z0-9]/g, '');

      return dbNama === userNama && dbNim === userNim;
    });

    if (match) {
      const studentUser = {
        uid: 'student-' + match.nim.trim(),
        displayName: match.nama,
        email: match.nim.trim() + '@student.pai.com',
        photoURL: match.foto || null,
        isStudent: true,
        nim: match.nim
      };
      
      setUser(studentUser);
      setIsAdmin(false);
      localStorage.setItem('student-session', JSON.stringify(studentUser));
      triggerUserActivityNotification('Mahasiswa Masuk Chat', `${match.nama} berhasil memverifikasi NIM dan masuk Lounge Chat`, 'system');
      alert(`Verifikasi Berhasil! Selamat datang di Lounge Chat, ${match.nama}.`);
      return true;
    }
    return false;
  };

  // Secure Admin Username / Password login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim() === 'Al Rasyak Izwar' && adminPassword === 'Syakalif090110') {
      const adminUser = {
        uid: 'admin-rasyak-izwar-secure',
        displayName: 'Al Rasyak Izwar',
        email: 'alrazakiswar11@gmail.com',
        photoURL: null
      };
      setUser(adminUser);
      setIsAdmin(true);
      localStorage.setItem('admin-flag-admin-rasyak-izwar-secure', 'true');
      // Clean up local student sessions if administrator prints in
      localStorage.removeItem('student-session');
      setShowLoginModal(false);
      setAdminUsername('');
      setAdminPassword('');
      triggerUserActivityNotification('Admin Masuk', 'Al Rasyak Izwar masuk ke portal sebagai Administrator Utama', 'system');
      alert('Selamat datang kembali, Admin Al Rasyak Izwar! Sesi administrator Anda telah diaktifkan secara aman.');
    } else {
      alert('Username atau Password Admin Salah!');
    }
  };

  // Logout Flow
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('student-session');
      setUser(null);
      setIsAdmin(false);
      setShowDashboard(false);
      alert('Berhasil keluar portal.');
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings Profil
  const saveClassSettings = async (newSettings: ClassSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'class_profile'), newSettings);
      triggerUserActivityNotification('Profil Diupdate', 'Admin mengubah visi-misi profil angkatan', 'profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/class_profile');
    }
  };

  // Add Student
  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
      await addDoc(collection(db, 'students'), student);
      triggerUserActivityNotification('Mahasiswa Terdaftar', `Menambahkan profil mahasiswa baru: ${student.nama}`, 'profile');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'students');
    }
  };

  // Update Student
  const updateStudent = async (id: string, updated: Partial<Student>) => {
    try {
      await updateDoc(doc(db, 'students', id), updated);
      triggerUserActivityNotification('Profil Mahasiswa Diupdate', `Menyunting data profil mahasiswa "${updated.nama || 'Anggota Class'}"`, 'profile');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `students/${id}`);
    }
  };

  // Delete Student
  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      triggerUserActivityNotification('Mahasiswa Dihapus', 'Admin menghapus profil mahasiswa dari direktori', 'profile');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `students/${id}`);
    }
  };

  // Add Memory
  const addMemory = async (memory: Omit<Memory, 'id'>) => {
    try {
      await addDoc(collection(db, 'memories'), memory);
      triggerUserActivityNotification('Memori Ditambahkan', `${memory.nama} menceritakan kenangan manis baru di Wall`, 'memory');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'memories');
    }
  };

  // Update Memory
  const updateMemory = async (id: string, updated: Partial<Memory>) => {
    try {
      await updateDoc(doc(db, 'memories', id), updated);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `memories/${id}`);
    }
  };

  // Delete Memory
  const deleteMemory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memories', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `memories/${id}`);
    }
  };

  // Add Guestbook signature
  const addGuestbookEntry = async (entry: Omit<GuestbookEntry, 'id'>) => {
    try {
      await addDoc(collection(db, 'guestbook'), entry);
      triggerUserActivityNotification('Tamu Mengisi Buku', `${entry.nama} meninggalkan pesan di buku tamu`, 'guestbook');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'guestbook');
    }
  };

  // Update Guestbook signature
  const updateGuestbookEntry = async (id: string, updated: Partial<GuestbookEntry>) => {
    try {
      await updateDoc(doc(db, 'guestbook', id), updated);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `guestbook/${id}`);
    }
  };

  // Delete Guestbook signature
  const deleteGuestbookEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'guestbook', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `guestbook/${id}`);
    }
  };

  // Chat Obrolan
  const sendMessageInChat = async (message: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'chat'), {
        senderName: user.displayName || 'Akun Demo',
        senderId: user.uid,
        senderPhoto: user.photoURL || null,
        message,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'chat');
    }
  };

  // Clear Lounge Chats
  const clearChatRoom = async () => {
    try {
      const snap = await getDocs(collection(db, 'chat'));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      triggerUserActivityNotification('Chat Lounge Dikosongkan', 'Admin membersihkan riwayat pesan Lounge Chat', 'chat');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'chat');
    }
  };

  // Direct Gallery Photo Addition
  const addPhotoItem = async (photo: Omit<GalleryItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'gallery'), photo);
      triggerUserActivityNotification('Galeri Baru', `Menambahkan kenangan foto ke galeri: ${photo.caption}`, 'profile');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'gallery');
    }
  };

  // Delete Gallery Photo
  const deletePhotoItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      triggerUserActivityNotification('Foto Galeri Dihapus', 'Admin mengeluarkan foto dari tontonan galeri', 'profile');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `gallery/${id}`);
    }
  };

  // Clean Notifications history
  const clearNotificationsHistory = async () => {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  // Become Admin helper toggle in dashboard dev pane
  const togglePromotedAdmin = (usernameInput?: string, passwordInput?: string) => {
    if (user) {
      if (usernameInput === 'Al Rasyak Izwar' && passwordInput === 'Syakalif090110') {
        localStorage.setItem(`admin-flag-${user.uid}`, 'true');
        setIsAdmin(true);
        triggerUserActivityNotification('Promosi Admin', `${user.displayName} berhasil memverifikasi wewenang Admin`, 'system');
        alert('Selamat! Hak Akses Administrator berhasil diaktifkan.');
      } else {
        alert('Username atau Password Admin Salah!');
      }
    }
  };

  const deactivatePromotedAdmin = () => {
    if (user) {
      localStorage.removeItem(`admin-flag-${user.uid}`);
      setIsAdmin(false);
      alert('Akses Admin dicabut.');
    }
  };

  // Filter individual user claims
  const claimedProfile = students.find((s) => s.ownerId === user?.uid) || null;
  const userMemories = memories.filter((m) => m.userId === user?.uid);
  const userGuestbooks = guestbooks.filter((g) => g.userId === user?.uid);

  return (
    <div className="min-h-screen flex flex-col relative select-none selection:bg-gold-classic/30 selection:text-emerald-deep">
      {/* Real-time Toast Activity Popup */}
      <AnimatePresence>
        {toastMessage && (
          <ToastNotification message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </AnimatePresence>

      {/* Main Bar header navigation */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        user={user}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={handleLogout}
        onDashboardClick={() => setShowDashboard(true)}
        unreadNotifsCount={unreadCount}
        onNotifToggle={() => {
          setShowNotifCenter(!showNotifCenter);
          setUnreadCount(0);
          localStorage.setItem('last-opened-notif-timestamp', String(Date.now()));
        }}
        activeSection={activeSection}
        onSectionSelect={(id) => setActiveSection(id)}
      />

      {/* Real-time Notifications Drawer Panel */}
      <NotificationCenter
        notifications={notifications}
        showPanel={showNotifCenter}
        onClose={() => setShowNotifCenter(false)}
        onClear={clearNotificationsHistory}
        isAdmin={isAdmin}
      />

      {/* 5. HERO PANEL SECTION (Beranda) */}
      <section
        className="relative pt-32 pb-24 sm:py-36 min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden"
        id="beranda"
      >
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-[#e3efe4]/90 via-[#cfded2]/95 to-[#d5e4dc] dark:from-[#031d14]/95 dark:via-[#01140f] dark:to-[#01130e] transition-all duration-500">
          {/* Islamic Background Vector Lattice Grid overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#15795a_1px,transparent_1px)] [background-size:20px_20px]" />
          {/* Soft ambient blur widgets */}
          <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-[#15795a]/15 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full bg-[#dac17d]/10 blur-3xl animate-pulse-soft delay-1500" />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 z-10">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#bfa14c] dark:text-gold-classic font-bold tracking-widest text-xs sm:text-sm uppercase font-display flex items-center gap-2"
          >
            <span>✦</span> UIN ALAUDDIN MAKASSAR • 2023 <span>✦</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-5xl sm:text-7xl md:text-8xl text-[#0a3d2e] dark:text-white leading-none tracking-tight select-text"
          >
            PAI D <span className="text-[#dac17d] h-full bg-clip-text font-black">IMMORTAL</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display font-extrabold text-base sm:text-xl text-[#127054] dark:text-[#19cca1] leading-relaxed tracking-wider select-text"
          >
            الأخوة الخالدة — Ukhuwah yang Abadi
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm sm:text-base text-[#1c473c] dark:text-zinc-300 font-medium max-w-xl leading-relaxed select-text"
          >
            Portal kenangan digital mahasiswa Pendidikan Agama Islam Kelas D Angkatan 2023. Setiap memori adalah warisan, setiap nama adalah sejarah.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center mt-4"
          >
            <button
              onClick={() => {
                setActiveSection('memories');
                document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-[#127054] hover:bg-[#157e5e] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-full cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex items-center gap-2 border border-emerald-light/20 transition-all"
            >
              <Heart className="w-4 h-4 fill-current text-[#dac17d]" />
              <span>Wall of Memories</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('mahasiswa');
                document.getElementById('mahasiswa')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 bg-transparent text-[#dac17d] hover:bg-[#dac17d] hover:text-[#01130e] text-xs sm:text-sm font-black uppercase tracking-wider rounded-full transition-all border border-[#dac17d] cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Lihat Mahasiswa</span>
            </button>
          </motion.div>

          {/* Quick Metrics stats dashboard layout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-4 gap-4 sm:gap-16 mt-12 bg-transparent select-none"
          >
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-2xl sm:text-4xl text-[#dac17d]">{students.length || 27}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#1c473c] dark:text-zinc-400 font-bold mt-1">Mahasiswa</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-2xl sm:text-4xl text-[#dac17d]">2023</span>
              <span className="text-[10px] uppercase tracking-wider text-[#1c473c] dark:text-zinc-400 font-bold mt-1">Angkatan</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-2xl sm:text-4xl text-[#dac17d]">{memories.length || 0}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#1c473c] dark:text-zinc-400 font-bold mt-1">Memories</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display font-black text-2xl sm:text-4xl text-[#dac17d]">∞</span>
              <span className="text-[10px] uppercase tracking-wider text-[#1c473c] dark:text-zinc-400 font-bold mt-1">Ukhuwah</span>
            </div>
          </motion.div>

          <ChevronDown className="w-6 h-6 text-[#dac17d] mt-10 animate-bounce" />
        </div>
      </section>

      {/* Main Panels & Dynamic Sections */}
      <ProfileSection settings={settings} isAdmin={isAdmin} onSaveSettings={saveClassSettings} />
      <StudentsSection
        students={students}
        user={user}
        isAdmin={isAdmin}
        onAddStudent={addStudent}
        onUpdateStudent={updateStudent}
        onDeleteStudent={deleteStudent}
      />
      <GallerySection
        galleryItems={galleryItems}
        isAdmin={isAdmin}
        user={user}
        onAddPhoto={addPhotoItem}
        onDeletePhoto={deletePhotoItem}
      />
      <MemoriesSection
        memories={memories}
        user={user}
        isAdmin={isAdmin}
        onAddMemory={addMemory}
        onDeleteMemory={deleteMemory}
      />
      <GuestbookSection
        entries={guestbooks}
        user={user}
        isAdmin={isAdmin}
        onAddEntry={addGuestbookEntry}
        onDeleteEntry={deleteGuestbookEntry}
      />
      <ChatSection
        messages={chats}
        user={user}
        isAdmin={isAdmin}
        onSendMessage={sendMessageInChat}
        onClearChat={clearChatRoom}
        onLoginClick={() => setShowLoginModal(true)}
        onVerifyStudent={handleStudentLogin}
      />

      {/* Futuristic Dear Future Quote Card Block */}
      <section className="py-12 px-4 select-none bg-cream-dark/10 dark:bg-zinc-950/10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0c2e23]/90 to-[#041511]/95 p-8 rounded-3xl border border-gold-classic/20 text-center relative shadow-xl overflow-hidden group">
          {/* Subtle glowing lights */}
          <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-gold-classic/10 blur-xl group-hover:bg-gold-classic/20 transition-all duration-700" />
          
          <div className="text-gold-classic text-[10px] font-black tracking-widest uppercase mb-4 font-display">
            + DEAR FUTURE +
          </div>
          
          <p className="font-display font-medium text-base sm:text-lg text-[#ecdca6] leading-relaxed max-w-2xl mx-auto italic drop-shadow-sm select-text">
            "Untuk Diri Kami di Masa Depan. Jika suatu hari kita kembali membuka halaman ini, semoga kita telah menjadi pribadi yang lebih baik, tetap menjaga persaudaraan, dan tidak melupakan kisah yang pernah kita ukir bersama di PAI D IMMORTAL. Jarak mungkin memisahkan langkah, tetapi kenangan akan selalu menyatukan hati."
          </p>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400 text-xs font-semibold">
            <span className="w-4 h-px bg-gold-classic/30" />
            <span className="text-[10px] uppercase tracking-wider text-gold-classic/80">PAI D IMMORTAL — 2023</span>
            <span className="w-4 h-px bg-gold-classic/30" />
          </div>
        </div>
      </section>

      {/* Section Kontak / Hubungi Kami */}
      <section className="section bg-[#021c14]/40 py-16 select-none" id="kontak">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-head text-center flex flex-col items-center gap-2 mb-10">
            <p className="font-display font-black text-xs uppercase tracking-widest text-[#dac17d]">
              + HUBUNGI KAMI +
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#dac17d] uppercase tracking-tight">
              Kontak Kami
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl font-medium">
              Hubungi pengurus kelas kami atau kunjungi Fakultas Tarbiyah & Keguruan UIN Alauddin Makassar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* WhatsApp Card */}
            <motion.a
              href="https://wa.me/6289530165502"
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 flex flex-col items-center text-center gap-4 bg-[#041d15] rounded-3xl border border-[#113e31] hover:border-[#dac17d]/60 hover:scale-[1.03] transition-all cursor-pointer group shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="p-4 bg-emerald-deep/40 rounded-full flex items-center justify-center border border-emerald-medium/10 text-emerald-light group-hover:scale-110 transition-all">
                <svg className="w-7 h-7 text-[#19cca1]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.637-1.03-5.114-2.905-6.99C16.546 1.874 14.068.847 11.44.846c-5.438 0-9.864 4.421-9.867 9.864-.001 1.735.452 3.431 1.309 4.928l-.991 3.615 3.756-.984zm12.302-7.39c-.195-.097-1.15-.567-1.329-.631-.177-.065-.307-.097-.437.097-.13.195-.505.631-.618.759-.113.129-.227.145-.422.048a6.377 6.377 0 0 1-1.564-.967 7.02 7.02 0 0 1-1.084-1.34c-.113-.195-.012-.301.085-.398.088-.087.195-.227.293-.341.097-.113.13-.195.195-.325.065-.13.033-.244-.017-.341-.05-.097-.437-1.053-.598-1.443-.157-.378-.313-.327-.428-.333-.11-.006-.237-.006-.364-.006-.129 0-.337.048-.515.244-.177.195-.678.662-.678 1.613s.693 1.867.791 2.001c.097.13 1.36 2.078 3.296 2.911.46.197.82.316 1.1.405.463.147.884.126 1.217.077.37-.056 1.15-.47 1.312-.924.162-.454.162-.843.113-.924-.05-.08-.177-.129-.373-.227z" />
                </svg>
              </div>
              <div>
                <span className="font-display font-black text-[#dac17d] text-base block mb-1">
                  WhatsApp
                </span>
                <span className="text-sm font-display font-extrabold text-[#eae6da] tracking-wide select-text block">
                  +62 895-3016-5502
                </span>
              </div>
            </motion.a>

            {/* Instagram Card */}
            <motion.a
              href="https://www.instagram.com/pai.d.immortal_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="p-8 flex flex-col items-center text-center gap-4 bg-[#041d15] rounded-3xl border border-[#113e31] hover:border-[#dac17d]/60 hover:scale-[1.03] transition-all cursor-pointer group shadow-lg"
              whileHover={{ y: -5 }}
            >
              <div className="p-4 bg-emerald-deep/40 rounded-full flex items-center justify-center border border-emerald-medium/10 text-emerald-light group-hover:scale-110 transition-all">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <span className="font-display font-black text-[#dac17d] text-base block mb-1">
                  Instagram
                </span>
                <span className="text-sm font-display font-extrabold text-[#eae6da] tracking-wide select-text block">
                  @paid_immortal
                </span>
              </div>
            </motion.a>

            {/* Kampus Location Card */}
            <div
              className="p-8 flex flex-col items-center text-center gap-4 bg-[#041d15] rounded-3xl border border-[#113e31] shadow-lg"
            >
              <div className="p-4 bg-emerald-deep/40 rounded-full flex items-center justify-center border border-emerald-medium/10 text-emerald-light">
                <span className="text-2xl">🏫</span>
              </div>
              <div>
                <span className="font-display font-black text-[#dac17d] text-base block mb-1">
                  Kampus
                </span>
                <div className="text-xs font-display font-bold text-[#bcb6a1] flex flex-col gap-0.5 leading-relaxed select-text mt-1.5">
                  <span className="text-[#ececec] font-extrabold">Fakultas Tarbiyah & Keguruan</span>
                  <span className="text-zinc-300">UIN Alauddin Makassar</span>
                  <span className="text-[10.5px] text-zinc-400 max-w-[240px] mx-auto mt-1 leading-normal font-sans">
                    Jl. Sultan Alauddin No.63, Mangasa, Kec. Tamalate, Kota Makassar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* personal visual Dashboard Modal Workspace overlay */}
      <AnimatePresence>
        {showDashboard && (
          <Dashboard
            user={user}
            studentProfile={claimedProfile}
            userMemories={userMemories}
            userGuestbooks={userGuestbooks}
            isAdmin={isAdmin}
            onUpdateProfile={(updated) => claimedProfile?.id ? updateStudent(claimedProfile.id, updated) : Promise.reject('No Claimed Account matches')}
            onUpdateMemory={updateMemory}
            onDeleteMemory={deleteMemory}
            onUpdateGuestbook={updateGuestbookEntry}
            onDeleteGuestbook={deleteGuestbookEntry}
            onClose={() => setShowDashboard(false)}
            onBecomAdmin={togglePromotedAdmin}
            onDeactivateAdmin={deactivatePromotedAdmin}
          />
        )}
      </AnimatePresence>

      {/* Auth Setup Login Dialog Panel Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-strong w-full max-w-sm p-6 relative flex flex-col gap-4"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-emerald-deep dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pt-2">
                <span className="brand-mark w-12 h-12 rounded-full inline-flex items-center justify-center text-gold-soft font-display font-extrabold text-2xl mb-2">
                  ☾
                </span>
                <h3 className="font-display font-black text-lg text-emerald-deep dark:text-gold-soft uppercase tracking-tight">
                  Akses Admin Utama
                </h3>
                <p className="text-xs text-zinc-400">Verifikasi kredensial pengurus kelas PAI D IMMORTAL</p>
              </div>

              {/* Admin Specific Secure Username / Password credentials */}
              <form onSubmit={handleAdminLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Username Admin Utama</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Al Rasyak Izwar"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Password Admin Utama</label>
                  <input
                    type="password"
                    required
                    placeholder="Kata Sandi Anda"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs font-sans p-2 rounded-lg border border-gold-classic/20 bg-emerald-medium/5 dark:bg-emerald-deep/40 text-emerald-deep dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 bg-gradient-to-r from-gold-classic to-[#dac17d] text-emerald-deep hover:brightness-105 text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-gold-classic/20 cursor-pointer shadow-sm select-none"
                >
                  Masuk Sebagai Admin Utama 🔒
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. SEKSI FOOTER */}
      <footer className="bg-[#02140e] dark:bg-[#010906] text-cream-soft py-12 border-t border-[#113e31] select-none">
        <div className="max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 font-display font-black text-xl">
            <span className="text-gold-classic text-2xl">☾</span>
            PAI D <em className="not-italic text-[#dac17d] font-extrabold tracking-wider">IMMORTAL</em>
          </div>
          <p className="font-display text-sm text-[#dac17d]/90 tracking-wider font-semibold">Jejak Ukhuwah, Kenangan Abadi</p>
          <p className="font-display text-lg text-[#dac17d]/70 leading-none font-medium">الأخوة الخالدة</p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
            <a
              href="https://www.instagram.com/pai.d.immortal_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] text-[#eae6da] hover:text-[#dac17d] bg-[#07241a] hover:bg-[#0b3325] px-5 py-2.5 rounded-full border border-[#113e31] transition-all font-bold cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-[#dac17d]" />
              <span>@paid_immortal</span>
            </a>
            <a
              href="https://www.instagram.com/_syak__?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] text-[#eae6da] hover:text-[#dac17d] bg-[#07241a] hover:bg-[#0b3325] px-5 py-2.5 rounded-full border border-[#113e31] transition-all font-bold cursor-pointer"
            >
              <Instagram className="w-4 h-4 text-[#dac17d]" />
              <span>@_syak__</span>
            </a>
          </div>

          <p className="text-[10px] text-zinc-500 dark:text-[#5a7a6e] max-w-lg mt-3 leading-relaxed font-semibold">
            © 2023-2027 PAI D IMMORTAL · UIN Alauddin Makassar · Dibuat dengan ❤️ dan Ukhuwah · Designed by Syak with AI Assistant
          </p>
        </div>
      </footer>
    </div>
  );
}
