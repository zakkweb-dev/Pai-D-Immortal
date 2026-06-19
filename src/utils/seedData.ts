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

export const INITIAL_STUDENTS: Omit<Student, 'id'>[] = [
  { nama: 'Ahmad Fauzi', nim: '30100123001', foto: '', instagram: '', motto: '"Ilmu adalah cahaya, akhlak adalah mahkotanya."', ownerId: null },
  { nama: 'Aisyah Ramadhani', nim: '30100123002', foto: '', instagram: '', motto: '"Belajar tanpa henti, bersyukur tanpa batas."', ownerId: null },
  { nama: 'Alif Nur Rahman', nim: '30100123003', foto: '', instagram: '', motto: '"Setiap langkah adalah ibadah."', ownerId: null },
  { nama: 'Annisa Fitria', nim: '30100123004', foto: '', instagram: '', motto: '"Sabar dan syukur adalah senjata terkuat."', ownerId: null },
  { nama: 'Al Rasyak Izwar', nim: '20100123101', foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop', motto: 'Hidup Cuman Sekali Jadilah Orang Baik, Leave Discrimination Humanity is Number One.', ownerId: null },
  { nama: 'Dian Permata', nim: '30100123007', foto: '', instagram: '', motto: '"Cinta ilmu, cinta umat."', ownerId: null },
  { nama: 'Dwi Ananda', nim: '30100123008', foto: '', instagram: '', motto: '"Gagal bukan akhir, bangkit adalah keharusan."', ownerId: null },
  { nama: 'Fadillah Yusuf', nim: '30100123009', foto: '', instagram: '', motto: '"Tuntutlah ilmu dari buaian hingga liang lahat."', ownerId: null },
  { nama: 'Fatimah Az-Zahra', nim: '30100123010', foto: '', instagram: '', motto: '"Cantik bukan dari tampilan, tapi dari hati."', ownerId: null },
  { nama: 'Hasan Basri', nim: '30100123011', foto: '', instagram: '', motto: '"Berilmu dan berakhlak mulia."', ownerId: null },
  { nama: 'Husain Abdullah', nim: '30100123012', foto: '', instagram: '', motto: '"Keberhasilan dimulai dari niat yang benar."', ownerId: null },
  { nama: 'Indah Lestari', nim: '30100123013', foto: '', instagram: '', motto: '"Satu tujuan, satu langkah, satu ukhuwah."', ownerId: null },
  { nama: 'Irfan Hakim', nim: '30100123014', foto: '', instagram: '', motto: '"Bukan seberapa cepat, tapi seberapa kuat."', ownerId: null },
  { nama: 'Khalid Munir', nim: '30100123015', foto: '', instagram: '', motto: '"Doa adalah senjata orang mukmin."', ownerId: null },
  { nama: 'Laila Sari', nim: '30100123016', foto: '', instagram: '', motto: '"Wanita terbaik adalah yang paling bermanfaat."', ownerId: null },
  { nama: 'Kamil Tandialla', nim: '20110123111', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop', motto: '"Hidup Bukan Saling Mendahului, Bermimpilah Sendiri-sendiri"', ownerId: null },
  { nama: 'Nadia Putri', nim: '30100123018', foto: '', instagram: '', motto: '"Setiap hari adalah kesempatan baru untuk berbuat baik."', ownerId: null },
  { nama: 'Naufal Ibrahim', nim: '30100123019', foto: '', instagram: '', motto: '"Ilmu tanpa amal seperti pohon tanpa buah."', ownerId: null },
  { nama: 'Nur Aini', nim: '30100123020', foto: '', instagram: '', motto: '"Hati yang bersih adalah rumah Allah."', ownerId: null },
  { nama: 'Qori Amalia', nim: '30100123021', foto: '', instagram: '', motto: '"Al-Quran adalah pedoman hidup."', ownerId: null },
  { nama: 'Rahmat Hidayah', nim: '30100123022', foto: '', instagram: '', motto: '"Kerja keras + doa = sukses dunia akhirat."', ownerId: null },
  { nama: 'Reza Maulana', nim: '30100123023', foto: '', instagram: '', motto: '"Jangan takut bermimpi besar."', ownerId: null },
  { nama: 'Salma Aulia', nim: '30100123024', foto: '', instagram: '', motto: '"Perempuan cerdas, keluarga bahagia, umat sejahtera."', ownerId: null },
  { nama: 'Muh Riang Saputra', nim: '20100123119', foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop', motto: '"Tetap Berusaha Menjadi Pribadi Yang Riang Gembiira, Sebab Hidup terlalu Singkat Untuk Dihabiskan Dengan Keluh Kesah dan Penyesalan"', ownerId: null },
  { nama: 'Umar Faruq', nim: '30100123026', foto: '', instagram: '', motto: '"Tegas dalam kebenaran, lembut dalam pergaulan."', ownerId: null },
  { nama: 'Zulfikri Anwar', nim: '30100123027', foto: '', instagram: '', motto: '"PAI D IMMORTAL — satu jiwa, satu tujuan."', ownerId: null },
];

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
    // 1. Check Students
    const studentsCol = collection(db, 'students');
    let studentsSnap;
    try {
      studentsSnap = await getDocs(studentsCol);
    } catch (error) {
      return handleFirestoreError(error, OperationType.GET, 'students');
    }

    if (studentsSnap.empty) {
      console.log('Seeding students...');
      // Write in batches for high performance
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
