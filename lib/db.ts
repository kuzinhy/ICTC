import { 
  collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { DesignFile, AIPrompt, User, SystemConfig } from '../types';
import { DEFAULT_SYSTEM_CONFIG, INITIAL_DESIGN_FILES, INITIAL_AI_PROMPTS, INITIAL_USERS } from '../data/mockData';

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test Connection function as mandated by Firebase Integration Guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully!");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore client is offline or loading local cached records.");
    }
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
    } else {
      // Seed default config into Firestore on first load
      const defaultConfig = DEFAULT_SYSTEM_CONFIG;
      await setDoc(docRef, defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'systemConfig/global');
    // Local storage fallback for maximum safety and offline preview
    const local = localStorage.getItem('ictc_system_config');
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return DEFAULT_SYSTEM_CONFIG;
  }
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
    handleFirestoreError(error, OperationType.LIST, 'designs');
  }
  
  // Fallback to local storage if firestore is empty or errored
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

export async function deleteDesignFromDb(designId: string): Promise<void> {
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
    handleFirestoreError(error, OperationType.LIST, 'prompts');
  }
  
  // Fallback
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
    handleFirestoreError(error, OperationType.LIST, 'users');
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
