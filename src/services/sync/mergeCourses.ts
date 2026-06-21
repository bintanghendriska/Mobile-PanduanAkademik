import { Course } from '../../types';

export interface MergeResult {
  merged: Course[];
  addedCount: number;
}

// Merge strategy: server courses are identified by `serverId`. A local course
// that already carries that `serverId` means it was synced before — possibly
// edited locally since — so it is left completely untouched (local edits win,
// no overwrite). Only server courses whose `serverId` has never been seen
// locally are appended as new courses. Locally-created courses (no serverId
// at all) are never touched by this function.
export function mergeCourses(local: Course[], remote: Course[]): MergeResult {
  const knownServerIds = new Set(
    local.filter((c) => c.serverId !== undefined).map((c) => c.serverId),
  );

  const newFromServer = remote.filter((c) => !knownServerIds.has(c.serverId));

  return {
    merged: [...local, ...newFromServer],
    addedCount: newFromServer.length,
  };
}
