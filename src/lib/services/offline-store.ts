import { openDB, type IDBPDatabase } from "idb";
import type { Course, Hole, HoleStrategy, UserNote } from "@/lib/types";

const DB_NAME = "procaddie-offline";
const DB_VERSION = 1;

type OfflineDB = {
  courses: {
    key: string;
    value: Course;
  };
  holes: {
    key: string;
    value: Hole;
    indexes: { "by-course": string };
  };
  strategies: {
    key: string;
    value: HoleStrategy;
    indexes: { "by-hole": string };
  };
  notes: {
    key: string;
    value: UserNote;
    indexes: { "by-hole": string };
  };
};

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available on the server"));
  }
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("courses")) {
          db.createObjectStore("courses", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("holes")) {
          const holesStore = db.createObjectStore("holes", { keyPath: "id" });
          holesStore.createIndex("by-course", "course_id");
        }
        if (!db.objectStoreNames.contains("strategies")) {
          const stratStore = db.createObjectStore("strategies", { keyPath: "id" });
          stratStore.createIndex("by-hole", "hole_id");
        }
        if (!db.objectStoreNames.contains("notes")) {
          const notesStore = db.createObjectStore("notes", { keyPath: "id" });
          notesStore.createIndex("by-hole", "hole_id");
        }
      },
    });
  }
  return dbPromise;
}

// ---- Courses ----

export async function saveCourse(course: Course): Promise<void> {
  const db = await getDB();
  await db.put("courses", course);
}

export async function getCourse(id: string): Promise<Course | undefined> {
  const db = await getDB();
  return db.get("courses", id);
}

export async function getAllCourses(): Promise<Course[]> {
  const db = await getDB();
  return db.getAll("courses");
}

// ---- Holes ----

export async function saveHoles(holes: Hole[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("holes", "readwrite");
  await Promise.all([...holes.map((h) => tx.store.put(h)), tx.done]);
}

export async function getHolesByCourse(courseId: string): Promise<Hole[]> {
  const db = await getDB();
  return db.getAllFromIndex("holes", "by-course", courseId);
}

// ---- Strategies ----

export async function saveStrategy(strategy: HoleStrategy): Promise<void> {
  const db = await getDB();
  await db.put("strategies", strategy);
}

export async function getStrategyByHole(holeId: string): Promise<HoleStrategy | undefined> {
  const db = await getDB();
  const results = await db.getAllFromIndex("strategies", "by-hole", holeId);
  return results[0];
}

// ---- Notes ----

export async function saveNotes(notes: UserNote[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("notes", "readwrite");
  await Promise.all([...notes.map((n) => tx.store.put(n)), tx.done]);
}

export async function getNotesByHole(holeId: string): Promise<UserNote[]> {
  const db = await getDB();
  return db.getAllFromIndex("notes", "by-hole", holeId);
}

// ---- Bulk cache (full course pack) ----

export interface CoursePack {
  course: Course;
  holes: Hole[];
  strategies: HoleStrategy[];
  notes: UserNote[];
}

export async function cacheCoursePack(pack: CoursePack): Promise<void> {
  await saveCourse(pack.course);
  await saveHoles(pack.holes);
  const db = await getDB();
  const stratTx = db.transaction("strategies", "readwrite");
  await Promise.all([...pack.strategies.map((s) => stratTx.store.put(s)), stratTx.done]);
  await saveNotes(pack.notes);
}

export async function getCoursePack(courseId: string): Promise<CoursePack | null> {
  const course = await getCourse(courseId);
  if (!course) return null;
  const holes = await getHolesByCourse(courseId);
  const strategies = await Promise.all(holes.map((h) => getStrategyByHole(h.id)));
  const notes = (await Promise.all(holes.map((h) => getNotesByHole(h.id)))).flat();
  return {
    course,
    holes,
    strategies: strategies.filter(Boolean) as HoleStrategy[],
    notes,
  };
}
