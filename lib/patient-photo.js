import dataset from '../data/heart-failure-patients.json';
import {rankPatients} from './heart-failure-ranking';

/*
 * randomuser.me portraits (indices 0-99 per sex). Most look 20-35, so patients aged
 * OLDER_AGE+ draw from a hand-picked set of the oldest-looking faces (roughly 40-60;
 * none in the set look 70+). Indices that repeat another portrait are skipped.
 * Every patient always gets the same photo.
 */
const OLDER_AGE = 60;
const OLDER_PORTRAITS = {
 men: [13, 21, 24, 23, 31, 83, 34, 82, 72],
 women: [14, 61, 83, 0, 4, 23, 53],
};
const DUPLICATE_PORTRAITS = {
 men: [17, 66, 87, 99],
 women: [58],
};
const LOCAL_FALLBACKS = 12;

const portraitIndex = new Map();
const originalRank = new Map(rankPatients(dataset.patients, 2).map(p => [p.id, p.rank]));
for (const [sex, folder] of [[1, 'men'], [0, 'women']]) {
 const skip = new Set([...OLDER_PORTRAITS[folder], ...DUPLICATE_PORTRAITS[folder]]);
 const younger = Array.from({length: 100}, (_, i) => i).filter(i => !skip.has(i));
 const patients = dataset.patients.filter(p => p.sex === sex);
 // Highest-priority older patients get distinct faces first, keeping repeats out of the top of the queue.
 patients.filter(p => p.age >= OLDER_AGE).sort((a, b) => originalRank.get(a.id) - originalRank.get(b.id))
  .forEach((p, i) => portraitIndex.set(p.id, OLDER_PORTRAITS[folder][i % OLDER_PORTRAITS[folder].length]));
 patients.filter(p => p.age < OLDER_AGE)
  .forEach((p, i) => portraitIndex.set(p.id, younger[i % younger.length]));
}

export function patientPhoto(patient) {
 const folder = patient.sex === 1 ? 'men' : 'women';
 const index = portraitIndex.get(patient.id) ?? (Number(patient.id.split('-')[1]) - 1) % 100;
 return `https://randomuser.me/api/portraits/${folder}/${index}.jpg`;
}

/** 72px version for small avatars such as table rows. */
export function patientThumbnail(patient) {
 return patientPhoto(patient).replace('/portraits/', '/portraits/med/');
}

/** Local image used when randomuser.me can't be reached (e.g. offline demo). */
export function patientPhotoFallback(patient) {
 return `/assets/images/user${(Number(patient.id.split('-')[1]) - 1) % LOCAL_FALLBACKS + 1}.png`;
}
