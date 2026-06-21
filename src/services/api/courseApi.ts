import { apiClient } from './apiClient';
import { withRetry } from './retry';
import { Course } from '../../types';

interface RemotePost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const JAM_SLOTS = ['07.30–09.10', '09.10–10.50', '10.50–12.30', '13.00–14.40', '14.40–16.20'];
const DOSEN_POOL = [
  'Dr. Hendra Saputra S.Kom., M.Kom',
  'Prof. Dr. Siti Rahmah, M.IT',
  'Yoga Pratama S.T., M.Cs',
  'Dr. Maya Kusuma S.Kom., M.Kom',
  'Ahmad Fauzan ST., M.Kom',
  'Dr. Rina Wulandari, M.T',
  'Budi Santoso S.Kom., M.Cs., Ph.D',
  'Dr. Lia Permata S.T., M.Kom',
  'Eko Wahyudi S.Kom., MMSI',
  'Dr. Nur Aini, M.IT',
];

function titleCase(text: string): string {
  return text
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// JSONPlaceholder posts only have {userId, id, title, body}. We deterministically
// derive the remaining Course fields from `id`/`userId` so the same post always
// maps to the same synthetic schedule/lecturer/SKS — this keeps merges idempotent
// (re-fetching the same post won't produce different-looking data each time).
function mapPostToCourse(post: RemotePost): Course {
  return {
    id: `srv-${post.id}`,
    serverId: post.id,
    nama: titleCase(post.title.split(' ').slice(0, 5).join(' ')),
    kode: `STI${2546000 + post.id}`,
    sks: (post.id % 3) + 2, // 2–4 SKS
    dosen: DOSEN_POOL[post.userId % DOSEN_POOL.length],
    hari: HARI_LIST[post.id % HARI_LIST.length],
    jam: JAM_SLOTS[post.id % JAM_SLOTS.length],
    ruangan: `Ruang ${100 + (post.id % 8)}`,
    catatan: post.body.length > 120 ? `${post.body.slice(0, 120)}…` : post.body,
    createdAt: new Date().toISOString(),
    syncedAt: new Date().toISOString(),
  };
}

function mapCourseToPostPayload(course: Omit<Course, 'id' | 'createdAt'>) {
  return {
    title: course.nama,
    body: course.catatan || `${course.kode} — ${course.dosen}, ${course.sks} SKS`,
    userId: 1,
  };
}

export async function fetchRemoteCourses(limit = 8): Promise<Course[]> {
  return withRetry(async () => {
    const { data } = await apiClient.get<RemotePost[]>('/posts', {
      params: { _limit: limit },
    });
    return data.map(mapPostToCourse);
  });
}

export async function postNewCourseToServer(
  course: Omit<Course, 'id' | 'createdAt'>,
): Promise<{ serverId: number; raw: unknown }> {
  return withRetry(async () => {
    const { data } = await apiClient.post('/posts', mapCourseToPostPayload(course));
    return { serverId: (data as RemotePost).id, raw: data };
  });
}
