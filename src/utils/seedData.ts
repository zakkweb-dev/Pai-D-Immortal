import { collection, getDocs, doc, setDoc, addDoc, writeBatch } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { Student, GalleryItem, ClassSettings } from '../types';
import { handleFirestoreError, OperationType } from '../firebase';

export const DEFAULT_SETTINGS: ClassSettings = {
  visi: "Menjadi generasi Muslim intelektual yang berakhlak mulia, berdedikasi tinggi dalam pendidikan agama Islam, dan mampu menjadi pemimpin umat yang bijaksana di era modern.",
  misi: "Membangun ukhuwah Islamiyah yang kuat antar sesama, meningkatkan kualitas ilmu agama dan akademik, serta berkontribusi nyata bagi masyarakat dan bangsa.",
  aboutProdi: "Pendidikan Agama Islam (PAI) Fakultas Tarbiyah dan Keguruan UIN Alauddin Makassar — melahirkan pendidik agama Islam yang profesional, inovatif, dan berlandaskan nilai-nilai Islam Rahmatan Lil Alamin.",
  mottoKelas: "Bersama kita tumbuh, bersama kita bersinar — PAI D IMMORTAL, kenangan yang tak pernah padam."
};

export const INITIAL_STUDENTS: Omit<Student, 'id'>[] = [];

export const INITIAL_GALLERY: Omit<GalleryItem, 'id'>[] = [
  { src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop', caption: 'Kebersamaan PAI D 2023 di Kampus', tall: false },
  { src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop', caption: 'Orientasi Mahasiswa Baru FTK UIN', tall: true },
  { src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop', caption: 'Studi Lapangan dan Kunjungan Akademik', tall: false },
  { src: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop', caption: 'Momen Hikmah Buka Puasa Bersama', tall: false },
  { src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop', caption: 'Diskusi Kelompok Seru Kelas PAI D', tall: true },
  { src: 'https://images.unsplash.com/photo-1491841573634-28140fc7ccd7?w=800&auto=format&fit=crop', caption: 'Wisuda Kakak Senior - Motivasi Belajar kami', tall: false },
];

export async function seedDatabaseIfNeeded(db: Firestore) {
  try {
    // 1. Check Students and clean any existing legacy dummy records
    const studentsCol = collection(db, 'students');
    let studentsSnap;
    try {
      studentsSnap = await getDocs(studentsCol);
    } catch (error) {
      return handleFirestoreError(error, OperationType.GET, 'students');
    }

    const DUMMY_STUDENT_NAMES = [
      'Ahmad Fauzi', 'Aisyah Ramadhani', 'Alif Nur Rahman', 'Annisa Fitria',
      'Al Rasyak Izwar', 'Dian Permata', 'Dwi Ananda', 'Fadillah Yusuf',
      'Fatimah Az-Zahra', 'Hasan Basri', 'Husain Abdullah', 'Indah Lestari',
      'Irfan Hakim', 'Khalid Munir', 'Laila Sari', 'Kamil Tandialla',
      'Nadia Putri', 'Naufal Ibrahim', 'Nur Aini', 'Qori Amalia',
      'Rahmat Hidayah', 'Reza Maulana', 'Salma Aulia', 'Muh Riang Saputra',
      'Umar Faruq', 'Zulfikri Anwar'
    ];

    const deleteBatch = writeBatch(db);
    let needsDeleteCommit = false;
    studentsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && DUMMY_STUDENT_NAMES.includes(data.nama)) {
        deleteBatch.delete(docSnap.ref);
        needsDeleteCommit = true;
      }
    });

    if (needsDeleteCommit) {
      try {
        await deleteBatch.commit();
        console.log('Successfully purged legacy dummy student records from database.');
        studentsSnap = await getDocs(studentsCol);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'students_cleanup');
      }
    }

    if (studentsSnap.empty && INITIAL_STUDENTS.length > 0) {
      console.log('Seeding students...');
      const batch = writeBatch(db);
      INITIAL_STUDENTS.forEach((student) => {
        const docRef = doc(collection(db, 'students'));
        batch.set(docRef, student);
      });
      try {
        await batch.commit();
      } catch (error) {
        return handleFirestoreError(error, OperationType.WRITE, 'students');
      }
    }

    // 2. Check Gallery
    const galleryCol = collection(db, 'gallery');
    let gallerySnap;
    try {
      gallerySnap = await getDocs(galleryCol);
    } catch (error) {
      return handleFirestoreError(error, OperationType.GET, 'gallery');
    }

    if (gallerySnap.empty) {
      console.log('Seeding gallery...');
      const batch = writeBatch(db);
      INITIAL_GALLERY.forEach((item) => {
        const docRef = doc(collection(db, 'gallery'));
        batch.set(docRef, {
          ...item,
          createdAt: new Date().toISOString()
        });
      });
      try {
        await batch.commit();
      } catch (error) {
        return handleFirestoreError(error, OperationType.WRITE, 'gallery');
      }
    }

    // 3. Check Settings (Write settings last)
    const settingsCol = collection(db, 'settings');
    let settingsSnap;
    try {
      settingsSnap = await getDocs(settingsCol);
    } catch (error) {
      return handleFirestoreError(error, OperationType.GET, 'settings');
    }

    if (settingsSnap.empty) {
      console.log('Seeding settings...');
      try {
        await setDoc(doc(db, 'settings', 'class_profile'), DEFAULT_SETTINGS);
      } catch (error) {
        return handleFirestoreError(error, OperationType.WRITE, 'settings/class_profile');
      }
    }

    console.log('Seeding check completed.');
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
}
