export interface ClassSettings {
  visi: string;
  misi: string;
  aboutProdi: string;
  mottoKelas: string;
}

export interface Student {
  id?: string;
  nama: string;
  nim: string;
  motto?: string;
  instagram?: string;
  foto?: string;
  ownerId?: string | null;
}

export interface Memory {
  id?: string;
  nama: string;
  angkatan: string;
  pesan: string;
  createdAt: any;
  userId?: string | null;
}

export interface GuestbookEntry {
  id?: string;
  nama: string;
  pesan: string;
  createdAt: any;
  userId?: string | null;
}

export interface ChatMessage {
  id?: string;
  senderName: string;
  senderId: string;
  senderPhoto?: string;
  message: string;
  createdAt: any;
}

export interface NotificationItem {
  id?: string;
  title: string;
  description: string;
  type: 'memory' | 'guestbook' | 'chat' | 'profile' | 'system';
  createdAt: any;
  userId?: string;
}

export interface GalleryItem {
  id?: string;
  src: string;
  caption: string;
  tall: boolean;
  createdAt?: any;
  addedBy?: string;
}

