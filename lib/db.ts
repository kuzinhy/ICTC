import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { DesignFile, AIPrompt, User, SystemConfig, Article } from '../types';
import { VietnameseFont, VIETNAMESE_FONTS_DATA } from '../data/vietnamFontsData';
import { DEFAULT_SYSTEM_CONFIG, INITIAL_DESIGN_FILES, INITIAL_AI_PROMPTS, INITIAL_USERS, INITIAL_ARTICLES } from '../data/mockData';

// Firestore operation types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// Error logger according to the Firebase Integration Skill instructions
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection function as mandated by Firebase Integration Guidelines
export async function testFirestoreConnection() {
  try {
    if (auth.currentUser) {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error) {
    // Gracefully ignore offline or unseeded test connection
  }
}

// ---------------------------------------------
// System Config Sync Helper
// ---------------------------------------------
export async function fetchSystemConfig(): Promise<SystemConfig> {
  const docRef = doc(db, 'systemConfig', 'global');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SystemConfig;
    }
  } catch (error) {
    // Unauthenticated or offline fallback
  }
  
  // Local storage fallback for maximum safety and offline preview
  const local = localStorage.getItem('ictc_system_config');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return DEFAULT_SYSTEM_CONFIG;
}

export async function updateSystemConfigInDb(config: SystemConfig): Promise<void> {
  const docRef = doc(db, 'systemConfig', 'global');
  try {
    await setDoc(docRef, config);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'systemConfig/global');
    throw error;
  }
}

// ---------------------------------------------
// Designs Sync Helper
// ---------------------------------------------
export async function fetchDesignsFromDb(): Promise<DesignFile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'designs'));
    const items: DesignFile[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as DesignFile);
    });
    if (items.length > 0) {
      return items;
    }
  } catch (error) {
    // Fallback gracefully to offline cache if permission denied or offline
  }
  
  const local = localStorage.getItem('ictc_design_files');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_DESIGN_FILES;
}

export async function saveDesignToDb(design: DesignFile): Promise<void> {
  try {
    const docRef = doc(db, 'designs', design.id);
    await setDoc(docRef, design);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `designs/${design.id}`);
    throw error;
  }
}

export function recordDeletedId(id: string): void {
  try {
    const saved = localStorage.getItem('ictc_deleted_ids');
    const list = saved ? JSON.parse(saved) : [];
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem('ictc_deleted_ids', JSON.stringify(list));
    }
  } catch (e) {}
}

export async function deleteDesignFromDb(designId: string): Promise<void> {
  recordDeletedId(designId);
  try {
    const docRef = doc(db, 'designs', designId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `designs/${designId}`);
    throw error;
  }
}

// ---------------------------------------------
// Prompts Sync Helper
// ---------------------------------------------
export async function fetchPromptsFromDb(): Promise<AIPrompt[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'prompts'));
    const items: AIPrompt[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as AIPrompt);
    });
    if (items.length > 0) {
      return items;
    }
  } catch (error) {
    // Fallback gracefully
  }
  
  const local = localStorage.getItem('ictc_ai_prompts');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_AI_PROMPTS;
}

export async function savePromptToDb(prompt: AIPrompt): Promise<void> {
  try {
    const docRef = doc(db, 'prompts', prompt.id);
    await setDoc(docRef, prompt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `prompts/${prompt.id}`);
    throw error;
  }
}

export async function deletePromptFromDb(promptId: string): Promise<void> {
  recordDeletedId(promptId);
  try {
    const docRef = doc(db, 'prompts', promptId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `prompts/${promptId}`);
    throw error;
  }
}

// ---------------------------------------------
// Users Sync Helper
// ---------------------------------------------
export async function fetchUsersFromDb(): Promise<User[]> {
  // Only query Firestore if authenticated to avoid permission errors on private users collection
  if (auth.currentUser) {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const items: User[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as User);
      });
      if (items.length > 0) {
        return items;
      }
    } catch (error) {
      // Fallback gracefully
    }
  }
  
  const local = localStorage.getItem('ictc_registered_users');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_USERS;
}

export async function saveUserToDb(user: User): Promise<void> {
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    throw error;
  }
}

export async function deleteUserFromDb(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    throw error;
  }
}

// ---------------------------------------------
// Articles Sync Helper
// ---------------------------------------------
export async function fetchArticlesFromDb(): Promise<Article[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'articles'));
    const items: Article[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as Article);
    });
    if (items.length > 0) {
      return items;
    }
  } catch (error) {
    // Fallback gracefully
  }
  
  const local = localStorage.getItem('ictc_articles');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_ARTICLES;
}

export async function saveArticleToDb(article: Article): Promise<void> {
  try {
    const docRef = doc(db, 'articles', article.id);
    await setDoc(docRef, article);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `articles/${article.id}`);
    throw error;
  }
}

export async function deleteArticleFromDb(articleId: string): Promise<void> {
  recordDeletedId(articleId);
  try {
    const docRef = doc(db, 'articles', articleId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `articles/${articleId}`);
    throw error;
  }
}

// ---------------------------------------------
// Fonts Sync Helper
// ---------------------------------------------
export async function fetchFontsFromDb(): Promise<VietnameseFont[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'fonts'));
    const items: VietnameseFont[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as VietnameseFont);
    });
    if (items.length > 0) {
      return items;
    }
  } catch (error) {
    // Fallback gracefully
  }
  
  const local = localStorage.getItem('ictc_vietnamese_fonts');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return VIETNAMESE_FONTS_DATA;
}

export async function saveFontToDb(font: VietnameseFont): Promise<void> {
  try {
    const docRef = doc(db, 'fonts', font.id);
    await setDoc(docRef, font);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `fonts/${font.id}`);
    throw error;
  }
}

export async function deleteFontFromDb(fontId: string): Promise<void> {
  try {
    const docRef = doc(db, 'fonts', fontId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `fonts/${fontId}`);
    throw error;
  }
}

// ---------------------------------------------
// Personal Photo Prompts Sync Helper
// ---------------------------------------------
import { PersonalPhotoPromptItem } from '../components/PersonalPhotoPromptHub';

export async function fetchPersonalPhotoPromptsFromDb(): Promise<PersonalPhotoPromptItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'personalPhotoPrompts'));
    const items: PersonalPhotoPromptItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as PersonalPhotoPromptItem);
    });
    if (items.length > 0) {
      return items;
    }
  } catch (error) {
    // Fallback gracefully
  }
  
  const local = localStorage.getItem('ictc_personal_photo_prompts');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return [];
}

export async function savePersonalPhotoPromptToDb(item: PersonalPhotoPromptItem): Promise<void> {
  try {
    const docRef = doc(db, 'personalPhotoPrompts', item.id);
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `personalPhotoPrompts/${item.id}`);
    throw error;
  }
}

export async function deletePersonalPhotoPromptFromDb(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'personalPhotoPrompts', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `personalPhotoPrompts/${id}`);
    throw error;
  }
}

