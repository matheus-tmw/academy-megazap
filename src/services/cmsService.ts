import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Track, Module, Lesson, CategoryItem, ContentStatus } from '../types';
import { TRACKS_DATA } from '../data/coursesData';
import { logAuditEvent } from './auditService';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'primeiros-passos',
    name: 'Primeiros Passos',
    description: 'Onboarding, configuração inicial e conexões WhatsApp.',
    icon: 'Compass',
    color: 'blue',
    order: 1,
    status: 'published'
  },
  {
    id: 'atendimento',
    name: 'Atendimento',
    description: 'Filas, chat ao vivo, transferências e produtividade dos atendentes.',
    icon: 'MessageSquare',
    color: 'sky',
    order: 2,
    status: 'published'
  },
  {
    id: 'automacao',
    name: 'Automação',
    description: 'Fluxos de conversas, funis automáticos, chatbots e webhooks.',
    icon: 'GitBranch',
    color: 'amber',
    order: 3,
    status: 'published'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Campanhas de disparos em massa, segmentação e tags.',
    icon: 'Megaphone',
    color: 'indigo',
    order: 4,
    status: 'published'
  },
  {
    id: 'cadastros',
    name: 'Cadastros',
    description: 'Gerenciamento de contatos, campos customizados e CRM.',
    icon: 'Database',
    color: 'emerald',
    order: 5,
    status: 'published'
  },
  {
    id: 'jadi',
    name: 'JADI',
    description: 'Inteligência Artificial generativa, prompts e agentes autônomos.',
    icon: 'Sparkles',
    color: 'purple',
    order: 6,
    status: 'published'
  },
  {
    id: 'administracao',
    name: 'Administração',
    description: 'Gestão de usuários, permissões, relatórios e White Label.',
    icon: 'ShieldCheck',
    color: 'slate',
    order: 7,
    status: 'published'
  }
];

// ==========================================
// CATEGORIES CRUD
// ==========================================

export async function fetchCategoriesFromDb(): Promise<CategoryItem[]> {
  try {
    const catQuery = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(catQuery);
    
    if (snapshot.empty) {
      // Seed default categories if none exist
      await seedDefaultCategories();
      return DEFAULT_CATEGORIES;
    }

    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || docSnap.id,
        description: data.description || '',
        icon: data.icon || 'Compass',
        color: data.color || 'blue',
        order: data.order ?? 99,
        status: (data.status as ContentStatus) || 'published',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      } as CategoryItem;
    });
  } catch (error) {
    console.warn('Erro ao carregar categorias do Firestore, utilizando fallback:', error);
    return DEFAULT_CATEGORIES;
  }
}

export async function seedDefaultCategories(): Promise<void> {
  try {
    for (const cat of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
        status: cat.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system_bootstrap'
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Falha ao semear categorias padrão:', err);
  }
}

export async function createCategoryDoc(
  data: Partial<CategoryItem>,
  actorUid: string
): Promise<CategoryItem> {
  const categoryId = data.id?.trim() || slugify(data.name || 'nova-categoria');
  const catRef = doc(db, 'categories', categoryId);

  const newCat: CategoryItem = {
    id: categoryId,
    name: data.name?.trim() || 'Nova Categoria',
    description: data.description?.trim() || '',
    icon: data.icon || 'Compass',
    color: data.color || 'blue',
    order: data.order ?? 99,
    status: data.status || 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorUid,
    updatedBy: actorUid
  };

  try {
    await setDoc(catRef, {
      ...newCat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CATEGORY_CREATED',
      targetType: 'category',
      targetId: categoryId,
      metadata: { name: newCat.name, status: newCat.status }
    });

    return newCat;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `categories/${categoryId}`);
  }
}

export async function updateCategoryDoc(
  categoryId: string,
  updates: Partial<CategoryItem>,
  actorUid: string
): Promise<void> {
  const catRef = doc(db, 'categories', categoryId);
  try {
    await updateDoc(catRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: actorUid
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CATEGORY_UPDATED',
      targetType: 'category',
      targetId: categoryId,
      metadata: updates
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `categories/${categoryId}`);
  }
}

export async function deleteCategoryDoc(categoryId: string, actorUid: string): Promise<void> {
  const catRef = doc(db, 'categories', categoryId);
  try {
    await deleteDoc(catRef);

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CATEGORY_DELETED',
      targetType: 'category',
      targetId: categoryId,
      metadata: { deletedAt: new Date().toISOString() }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
  }
}

export async function reorderCategoriesInDb(
  itemsOrIds: (string | { id: string; order?: number })[],
  actorUid: string = 'admin'
): Promise<void> {
  const batch = writeBatch(db);
  itemsOrIds.forEach((item, index) => {
    const id = typeof item === 'string' ? item : item.id;
    const order = typeof item === 'object' && item.order !== undefined ? item.order : index + 1;
    const ref = doc(db, 'categories', id);
    batch.update(ref, { 
      order, 
      updatedAt: serverTimestamp(),
      updatedBy: actorUid 
    });
  });

  try {
    await batch.commit();
    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CONTENT_REORDERED',
      targetType: 'category',
      targetId: 'all',
      metadata: { count: itemsOrIds.length }
    });
  } catch (error) {
    console.warn('Erro ao reordenar categorias:', error);
  }
}

// ==========================================
// TRACKS (COURSES), MODULES & LESSONS CRUD
// ==========================================

let cachedTracksInMemory: Track[] | null = null;
let lastTracksFetchTimestamp = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function fetchFullTracksFromDb(includeUnpublished = true, forceRefresh = false): Promise<Track[]> {
  const now = Date.now();
  if (!forceRefresh && cachedTracksInMemory && (now - lastTracksFetchTimestamp < CACHE_TTL_MS)) {
    return cachedTracksInMemory;
  }

  try {
    const coursesQuery = query(collection(db, 'courses'), orderBy('order', 'asc'));
    const coursesSnapshot = await getDocs(coursesQuery);

    if (coursesSnapshot.empty) {
      cachedTracksInMemory = TRACKS_DATA;
      lastTracksFetchTimestamp = now;
      return TRACKS_DATA;
    }

    const tracksList: Track[] = [];

    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const courseStatus = (courseData.status as ContentStatus) || 'published';

      if (!includeUnpublished && courseStatus !== 'published') {
        continue;
      }

      // Fetch modules subcollection
      const modulesQuery = query(
        collection(db, 'courses', courseDoc.id, 'modules'),
        orderBy('orderNumber', 'asc')
      );
      const modulesSnapshot = await getDocs(modulesQuery);
      const modulesList: Module[] = [];

      for (const modDoc of modulesSnapshot.docs) {
        const modData = modDoc.data();
        const modStatus = (modData.status as ContentStatus) || 'published';

        if (!includeUnpublished && modStatus !== 'published') {
          continue;
        }

        // Fetch lessons subcollection
        const lessonsQuery = query(
          collection(db, 'courses', courseDoc.id, 'modules', modDoc.id, 'lessons'),
          orderBy('order', 'asc')
        );
        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessonsList: Lesson[] = [];

        for (const lessonDoc of lessonsSnapshot.docs) {
          const lData = lessonDoc.data();
          const lStatus = (lData.status as ContentStatus) || 'published';

          if (!includeUnpublished && lStatus !== 'published') {
            continue;
          }

          lessonsList.push({
            id: lessonDoc.id,
            trackId: courseDoc.id,
            moduleId: modDoc.id,
            moduleTitle: modData.title || '',
            title: lData.title || 'Aula sem título',
            slug: lData.slug || lessonDoc.id,
            description: lData.description || '',
            duration: lData.duration || '05:00',
            durationSeconds: lData.durationSeconds || 300,
            videoUrl: lData.videoUrl || '',
            level: lData.level || 'Iniciante',
            category: lData.category || courseData.category || 'Primeiros Passos',
            thumbnail: lData.thumbnail || courseData.thumbnail || '',
            previewMockupType: lData.previewMockupType || 'general',
            learningObjectives: lData.learningObjectives || [],
            megaZapTip: lData.megaZapTip || '',
            aboutText: lData.aboutText || lData.description || '',
            resources: lData.resources || [],
            tags: lData.tags || [],
            order: lData.order ?? 1,
            status: lStatus,
            isLocked: lData.isLocked || false,
            featured: lData.featured || false,
            createdAt: lData.createdAt?.toDate ? lData.createdAt.toDate().toISOString() : lData.createdAt,
            updatedAt: lData.updatedAt?.toDate ? lData.updatedAt.toDate().toISOString() : lData.updatedAt,
            createdBy: lData.createdBy,
            updatedBy: lData.updatedBy
          });
        }

        modulesList.push({
          id: modDoc.id,
          trackId: courseDoc.id,
          orderNumber: modData.orderNumber ?? modData.order ?? (modulesList.length + 1),
          order: modData.order ?? modData.orderNumber ?? (modulesList.length + 1),
          title: modData.title || 'Módulo sem título',
          description: modData.description || '',
          status: modStatus,
          lessons: lessonsList,
          createdAt: modData.createdAt?.toDate ? modData.createdAt.toDate().toISOString() : modData.createdAt,
          updatedAt: modData.updatedAt?.toDate ? modData.updatedAt.toDate().toISOString() : modData.updatedAt,
          createdBy: modData.createdBy,
          updatedBy: modData.updatedBy
        });
      }

      tracksList.push({
        id: courseDoc.id,
        title: courseData.title || 'Trilha sem título',
        slug: courseData.slug || courseDoc.id,
        categoryId: courseData.categoryId || slugify(courseData.category || 'primeiros-passos'),
        category: courseData.category || 'Primeiros Passos',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || courseData.description?.slice(0, 120) || '',
        iconName: courseData.iconName || courseData.thumbnail || 'Compass',
        level: courseData.level || 'Iniciante',
        badgeColor: courseData.badgeColor || 'blue',
        estimatedHours: courseData.estimatedHours || '2h',
        modules: modulesList,
        certificateAvailable: courseData.certificateAvailable ?? true,
        certificateName: courseData.certificateName || `Certificação em ${courseData.title}`,
        order: courseData.order ?? (tracksList.length + 1),
        status: courseStatus,
        tags: courseData.tags || [],
        featured: courseData.featured || false,
        recommended: courseData.recommended || false,
        publishedAt: courseData.publishedAt,
        createdAt: courseData.createdAt?.toDate ? courseData.createdAt.toDate().toISOString() : courseData.createdAt,
        updatedAt: courseData.updatedAt?.toDate ? courseData.updatedAt.toDate().toISOString() : courseData.updatedAt,
        createdBy: courseData.createdBy,
        updatedBy: courseData.updatedBy
      });
    }

    if (tracksList.length > 0) {
      cachedTracksInMemory = tracksList;
      lastTracksFetchTimestamp = now;
      return tracksList;
    }

    return cachedTracksInMemory || TRACKS_DATA;
  } catch (error) {
    console.warn('Erro ao carregar trilhas do Firestore, fallback para cache/TRACKS_DATA:', error);
    return cachedTracksInMemory || TRACKS_DATA;
  }
}

export async function seedDefaultTracksToFirestore(actorUid = 'system_bootstrap'): Promise<void> {
  try {
    for (let i = 0; i < TRACKS_DATA.length; i++) {
      const track = TRACKS_DATA[i];
      const courseRef = doc(db, 'courses', track.id);

      await setDoc(courseRef, {
        title: track.title,
        slug: track.slug || track.id,
        category: track.category,
        categoryId: slugify(track.category),
        shortDescription: track.shortDescription,
        description: track.description,
        iconName: track.iconName,
        level: track.level,
        badgeColor: track.badgeColor,
        estimatedHours: track.estimatedHours,
        certificateAvailable: track.certificateAvailable,
        certificateName: track.certificateName,
        status: 'published',
        order: i + 1,
        featured: i === 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system_bootstrap'
      }, { merge: true });

      for (let m = 0; m < track.modules.length; m++) {
        const mod = track.modules[m];
        const modRef = doc(db, 'courses', track.id, 'modules', mod.id);

        await setDoc(modRef, {
          title: mod.title,
          description: mod.description,
          orderNumber: mod.orderNumber || (m + 1),
          order: mod.orderNumber || (m + 1),
          status: 'published',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: 'system_bootstrap'
        }, { merge: true });

        for (let l = 0; l < mod.lessons.length; l++) {
          const lesson = mod.lessons[l];
          const lessonRef = doc(db, 'courses', track.id, 'modules', mod.id, 'lessons', lesson.id);

          await setDoc(lessonRef, {
            title: lesson.title,
            slug: lesson.slug || lesson.id,
            description: lesson.description,
            aboutText: lesson.aboutText || lesson.description,
            duration: lesson.duration,
            durationSeconds: lesson.durationSeconds,
            videoUrl: lesson.videoUrl || '',
            level: lesson.level,
            category: lesson.category,
            thumbnail: lesson.thumbnail,
            previewMockupType: lesson.previewMockupType || 'general',
            learningObjectives: lesson.learningObjectives || [],
            megaZapTip: lesson.megaZapTip || '',
            resources: lesson.resources || [],
            order: l + 1,
            status: 'published',
            isLocked: lesson.isLocked || false,
            featured: lesson.featured || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: 'system_bootstrap'
          }, { merge: true });
        }
      }
    }
  } catch (error) {
    console.warn('Erro ao sincronizar trilhas iniciais no Firestore:', error);
  }
}

// ------------------------------------------
// COURSE (TRACK) OPERATIONS
// ------------------------------------------

export async function createTrackDoc(
  data: Partial<Track>,
  actorUid: string
): Promise<Track> {
  const trackId = data.id?.trim() || slugify(data.title || 'nova-trilha');
  const courseRef = doc(db, 'courses', trackId);

  const newTrack: Track = {
    id: trackId,
    title: data.title?.trim() || 'Nova Trilha',
    slug: slugify(data.title || trackId),
    categoryId: data.categoryId || slugify(data.category || 'primeiros-passos'),
    category: data.category || 'Primeiros Passos',
    description: data.description?.trim() || '',
    shortDescription: data.shortDescription?.trim() || data.description?.slice(0, 100) || '',
    iconName: data.iconName || 'Compass',
    level: data.level || 'Iniciante',
    badgeColor: data.badgeColor || 'blue',
    estimatedHours: data.estimatedHours || '1h 30min',
    certificateAvailable: data.certificateAvailable ?? true,
    certificateName: data.certificateName || `Certificação em ${data.title || 'MegaZap'}`,
    modules: [],
    order: data.order ?? 99,
    status: data.status || 'published',
    tags: data.tags || [],
    featured: data.featured || false,
    recommended: data.recommended || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorUid,
    updatedBy: actorUid
  };

  try {
    await setDoc(courseRef, {
      ...newTrack,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'COURSE_CREATED',
      targetType: 'course',
      targetId: trackId,
      metadata: { title: newTrack.title, status: newTrack.status }
    });

    return newTrack;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `courses/${trackId}`);
  }
}

export async function updateTrackDoc(
  trackId: string,
  updates: Partial<Track>,
  actorUid: string
): Promise<void> {
  const courseRef = doc(db, 'courses', trackId);
  try {
    const { modules, ...fieldsToUpdate } = updates;
    await updateDoc(courseRef, {
      ...fieldsToUpdate,
      updatedAt: serverTimestamp(),
      updatedBy: actorUid
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: updates.status === 'archived' ? 'COURSE_ARCHIVED' : 'COURSE_UPDATED',
      targetType: 'course',
      targetId: trackId,
      metadata: fieldsToUpdate
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `courses/${trackId}`);
  }
}

export async function deleteTrackDoc(trackId: string, actorUid: string): Promise<void> {
  try {
    // Delete modules and sub-lessons
    const modSnap = await getDocs(collection(db, 'courses', trackId, 'modules'));
    for (const mDoc of modSnap.docs) {
      const lessonSnap = await getDocs(collection(db, 'courses', trackId, 'modules', mDoc.id, 'lessons'));
      for (const lDoc of lessonSnap.docs) {
        await deleteDoc(doc(db, 'courses', trackId, 'modules', mDoc.id, 'lessons', lDoc.id));
      }
      await deleteDoc(doc(db, 'courses', trackId, 'modules', mDoc.id));
    }
    await deleteDoc(doc(db, 'courses', trackId));

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'COURSE_DELETED',
      targetType: 'course',
      targetId: trackId,
      metadata: { deletedAt: new Date().toISOString() }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${trackId}`);
  }
}

export async function duplicateTrackDoc(
  sourceTrack: Track,
  actorUid: string
): Promise<Track> {
  const newId = `${sourceTrack.id}-copia-${Date.now().toString().slice(-4)}`;
  const newTitle = `[Cópia] ${sourceTrack.title}`;
  
  const duplicatedTrack: Partial<Track> = {
    ...sourceTrack,
    id: newId,
    title: newTitle,
    slug: slugify(newTitle),
    status: 'draft',
    order: (sourceTrack.order || 0) + 1
  };

  const createdTrack = await createTrackDoc(duplicatedTrack, actorUid);

  // Duplicate modules & lessons
  for (const mod of sourceTrack.modules) {
    const newModId = `${mod.id}-copia-${Date.now().toString().slice(-4)}`;
    const createdMod = await createModuleDoc(newId, {
      ...mod,
      id: newModId,
      title: `${mod.title} (Cópia)`,
      status: 'draft'
    }, actorUid);

    for (const l of mod.lessons) {
      const newLessonId = `${l.id}-copia-${Date.now().toString().slice(-4)}`;
      await createLessonDoc(newId, createdMod.id, {
        ...l,
        id: newLessonId,
        title: `${l.title} (Cópia)`,
        status: 'draft'
      }, actorUid);
    }
  }

  return createdTrack;
}

export async function reorderTracksInDb(
  itemsOrIds: (string | { id: string; order?: number })[],
  actorUid: string = 'admin'
): Promise<void> {
  const batch = writeBatch(db);
  itemsOrIds.forEach((item, index) => {
    const id = typeof item === 'string' ? item : item.id;
    const order = typeof item === 'object' && item.order !== undefined ? item.order : index + 1;
    const ref = doc(db, 'courses', id);
    batch.update(ref, { 
      order, 
      updatedAt: serverTimestamp(),
      updatedBy: actorUid 
    });
  });

  try {
    await batch.commit();
    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CONTENT_REORDERED',
      targetType: 'course',
      targetId: 'all',
      metadata: { count: itemsOrIds.length }
    });
  } catch (error) {
    console.warn('Erro ao reordenar trilhas:', error);
  }
}

// ------------------------------------------
// MODULE OPERATIONS
// ------------------------------------------

export async function createModuleDoc(
  trackId: string,
  data: Partial<Module>,
  actorUid: string
): Promise<Module> {
  const moduleId = data.id?.trim() || `mod-${slugify(trackId).slice(0, 4)}-${Date.now().toString().slice(-4)}`;
  const modRef = doc(db, 'courses', trackId, 'modules', moduleId);

  const newModule: Module = {
    id: moduleId,
    trackId,
    orderNumber: data.orderNumber ?? data.order ?? 1,
    order: data.order ?? data.orderNumber ?? 1,
    title: data.title?.trim() || 'Novo Módulo',
    description: data.description?.trim() || '',
    status: data.status || 'published',
    lessons: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorUid,
    updatedBy: actorUid
  };

  try {
    await setDoc(modRef, {
      ...newModule,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'MODULE_CREATED',
      targetType: 'module',
      targetId: moduleId,
      metadata: { trackId, title: newModule.title }
    });

    return newModule;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `courses/${trackId}/modules/${moduleId}`);
  }
}

export async function updateModuleDoc(
  trackId: string,
  moduleId: string,
  updates: Partial<Module>,
  actorUid: string
): Promise<void> {
  const modRef = doc(db, 'courses', trackId, 'modules', moduleId);
  try {
    const { lessons, ...fields } = updates;
    await updateDoc(modRef, {
      ...fields,
      updatedAt: serverTimestamp(),
      updatedBy: actorUid
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'MODULE_UPDATED',
      targetType: 'module',
      targetId: moduleId,
      metadata: { trackId, ...fields }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `courses/${trackId}/modules/${moduleId}`);
  }
}

export async function deleteModuleDoc(
  trackId: string,
  moduleId: string,
  actorUid: string
): Promise<void> {
  try {
    // Delete sub-lessons
    const lessonSnap = await getDocs(collection(db, 'courses', trackId, 'modules', moduleId, 'lessons'));
    for (const lDoc of lessonSnap.docs) {
      await deleteDoc(doc(db, 'courses', trackId, 'modules', moduleId, 'lessons', lDoc.id));
    }
    await deleteDoc(doc(db, 'courses', trackId, 'modules', moduleId));

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'MODULE_DELETED',
      targetType: 'module',
      targetId: moduleId,
      metadata: { trackId, deletedAt: new Date().toISOString() }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${trackId}/modules/${moduleId}`);
  }
}

export async function reorderModulesInDb(
  trackId: string,
  itemsOrIds: (string | { id: string; order?: number; orderNumber?: number })[],
  actorUid: string = 'admin'
): Promise<void> {
  const batch = writeBatch(db);
  itemsOrIds.forEach((item, index) => {
    const id = typeof item === 'string' ? item : item.id;
    const order = typeof item === 'object' && (item.orderNumber !== undefined || item.order !== undefined)
      ? (item.orderNumber ?? item.order ?? index + 1)
      : index + 1;
    const ref = doc(db, 'courses', trackId, 'modules', id);
    batch.update(ref, { 
      orderNumber: order,
      order, 
      updatedAt: serverTimestamp(),
      updatedBy: actorUid 
    });
  });

  try {
    await batch.commit();
    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CONTENT_REORDERED',
      targetType: 'module',
      targetId: trackId,
      metadata: { count: itemsOrIds.length }
    });
  } catch (error) {
    console.warn('Erro ao reordenar módulos:', error);
  }
}

// ------------------------------------------
// LESSON OPERATIONS
// ------------------------------------------

export function parseDurationToSeconds(duration: string): number {
  if (!duration) return 300;
  const parts = duration.split(':').map(p => parseInt(p, 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 300;
}

export async function createLessonDoc(
  trackId: string,
  moduleId: string,
  data: Partial<Lesson>,
  actorUid: string
): Promise<Lesson> {
  const lessonId = data.id?.trim() || `aula-${slugify(data.title || 'nova-aula').slice(0, 15)}-${Date.now().toString().slice(-4)}`;
  const lessonRef = doc(db, 'courses', trackId, 'modules', moduleId, 'lessons', lessonId);

  const durationStr = data.duration || '05:00';
  const durationSec = data.durationSeconds || parseDurationToSeconds(durationStr);

  const newLesson: Lesson = {
    id: lessonId,
    trackId,
    moduleId,
    moduleTitle: data.moduleTitle || '',
    title: data.title?.trim() || 'Nova Aula',
    slug: slugify(data.title || lessonId),
    description: data.description?.trim() || '',
    aboutText: data.aboutText?.trim() || data.description?.trim() || '',
    duration: durationStr,
    durationSeconds: durationSec,
    videoUrl: data.videoUrl?.trim() || '',
    level: data.level || 'Iniciante',
    category: data.category || 'Primeiros Passos',
    thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    previewMockupType: data.previewMockupType || 'general',
    learningObjectives: data.learningObjectives || [],
    megaZapTip: data.megaZapTip || '',
    resources: data.resources || [],
    tags: data.tags || [],
    order: data.order ?? 1,
    status: data.status || 'published',
    isLocked: data.isLocked || false,
    featured: data.featured || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorUid,
    updatedBy: actorUid
  };

  try {
    await setDoc(lessonRef, {
      ...newLesson,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'LESSON_CREATED',
      targetType: 'lesson',
      targetId: lessonId,
      metadata: { trackId, moduleId, title: newLesson.title }
    });

    return newLesson;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `courses/${trackId}/modules/${moduleId}/lessons/${lessonId}`);
  }
}

export async function updateLessonDoc(
  trackId: string,
  moduleId: string,
  lessonId: string,
  updates: Partial<Lesson>,
  actorUid: string
): Promise<void> {
  const lessonRef = doc(db, 'courses', trackId, 'modules', moduleId, 'lessons', lessonId);
  try {
    const formattedUpdates: any = { ...updates };
    if (updates.duration && !updates.durationSeconds) {
      formattedUpdates.durationSeconds = parseDurationToSeconds(updates.duration);
    }

    await updateDoc(lessonRef, {
      ...formattedUpdates,
      updatedAt: serverTimestamp(),
      updatedBy: actorUid
    });

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'LESSON_UPDATED',
      targetType: 'lesson',
      targetId: lessonId,
      metadata: { trackId, moduleId, ...formattedUpdates }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `courses/${trackId}/modules/${moduleId}/lessons/${lessonId}`);
  }
}

export async function deleteLessonDoc(
  trackId: string,
  moduleId: string,
  lessonId: string,
  actorUid: string
): Promise<void> {
  const lessonRef = doc(db, 'courses', trackId, 'modules', moduleId, 'lessons', lessonId);
  try {
    await deleteDoc(lessonRef);

    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'LESSON_DELETED',
      targetType: 'lesson',
      targetId: lessonId,
      metadata: { trackId, moduleId, deletedAt: new Date().toISOString() }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `courses/${trackId}/modules/${moduleId}/lessons/${lessonId}`);
  }
}

export async function duplicateLessonDoc(
  trackId: string,
  moduleId: string,
  lesson: Lesson,
  actorUid: string
): Promise<Lesson> {
  const newLessonId = `${lesson.id}-copia-${Date.now().toString().slice(-4)}`;
  const newTitle = `[Cópia] ${lesson.title}`;

  return await createLessonDoc(trackId, moduleId, {
    ...lesson,
    id: newLessonId,
    title: newTitle,
    slug: slugify(newTitle),
    status: 'draft',
    order: (lesson.order || 1) + 1
  }, actorUid);
}

export async function reorderLessonsInDb(
  trackId: string,
  moduleId: string,
  itemsOrIds: (string | { id: string; order?: number })[],
  actorUid: string = 'admin'
): Promise<void> {
  const batch = writeBatch(db);
  itemsOrIds.forEach((item, index) => {
    const id = typeof item === 'string' ? item : item.id;
    const order = typeof item === 'object' && item.order !== undefined ? item.order : index + 1;
    const ref = doc(db, 'courses', trackId, 'modules', moduleId, 'lessons', id);
    batch.update(ref, { 
      order, 
      updatedAt: serverTimestamp(),
      updatedBy: actorUid 
    });
  });

  try {
    await batch.commit();
    await logAuditEvent({
      actorUid,
      actorRole: 'super_admin',
      action: 'CONTENT_REORDERED',
      targetType: 'lesson',
      targetId: moduleId,
      metadata: { count: itemsOrIds.length }
    });
  } catch (error) {
    console.warn('Erro ao reordenar aulas:', error);
  }
}

// ------------------------------------------
// CMS STATS & HEALTH CHECK
// ------------------------------------------

export interface CMSStats {
  totalCategories: number;
  totalTracks: number;
  totalModules: number;
  totalLessons: number;
  publishedLessonsCount: number;
  draftLessonsCount: number;
  archivedLessonsCount: number;
  lessonsMissingVideoCount: number;
  totalEstimatedHours: string;
}

export function computeCMSStats(categories: CategoryItem[], tracks: Track[]): CMSStats {
  let totalModules = 0;
  let totalLessons = 0;
  let publishedLessonsCount = 0;
  let draftLessonsCount = 0;
  let archivedLessonsCount = 0;
  let lessonsMissingVideoCount = 0;
  let totalSeconds = 0;

  tracks.forEach(track => {
    track.modules?.forEach(mod => {
      totalModules++;
      mod.lessons?.forEach(lesson => {
        totalLessons++;
        if (lesson.status === 'draft') draftLessonsCount++;
        else if (lesson.status === 'archived') archivedLessonsCount++;
        else publishedLessonsCount++;

        if (!lesson.videoUrl || lesson.videoUrl.trim() === '') {
          lessonsMissingVideoCount++;
        }

        totalSeconds += lesson.durationSeconds || 0;
      });
    });
  });

  const totalHours = Math.floor(totalSeconds / 3600);
  const remainingMins = Math.floor((totalSeconds % 3600) / 60);
  const totalEstimatedHours = `${totalHours}h ${remainingMins}m`;

  return {
    totalCategories: categories.length,
    totalTracks: tracks.length,
    totalModules,
    totalLessons,
    publishedLessonsCount,
    draftLessonsCount,
    archivedLessonsCount,
    lessonsMissingVideoCount,
    totalEstimatedHours
  };
}

// ------------------------------------------
// EXPORT ALIASES FOR COMPATIBILITY
// ------------------------------------------
export const createCategory = createCategoryDoc;
export const updateCategory = updateCategoryDoc;
export const deleteCategory = deleteCategoryDoc;
export const reorderCategories = reorderCategoriesInDb;

export const createTrackInDb = createTrackDoc;
export const updateTrackInDb = updateTrackDoc;
export const deleteTrackInDb = deleteTrackDoc;
export const duplicateTrackInDb = duplicateTrackDoc;

export const createModuleInDb = createModuleDoc;
export const updateModuleInDb = updateModuleDoc;
export const deleteModuleInDb = deleteModuleDoc;

export const createLessonInDb = createLessonDoc;
export const updateLessonInDb = updateLessonDoc;
export const deleteLessonInDb = deleteLessonDoc;
export const duplicateLessonInDb = duplicateLessonDoc;

