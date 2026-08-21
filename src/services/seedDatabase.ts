import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TRACKS_DATA } from '../data/coursesData';
import { logFirestoreRead, logFirestoreWrite } from '../lib/firestore-logger';

/**
 * Seed Database Utility.
 * Populates initial documents in all Firestore collections when needed.
 */
export async function seedInitialDatabase(force = false) {
  if (typeof window !== 'undefined') {
    const alreadySeeded = localStorage.getItem('megazap_db_seeded_v1');
    if (alreadySeeded && !force) {
      return;
    }
  }

  try {
    // Quick check: If courses collection already has data in Firestore, mark as seeded and skip mass writes
    const { getDoc } = await import('firebase/firestore');
    const sampleCourseRef = doc(db, 'courses', 'primeiros-passos');
    logFirestoreRead('seedInitialDatabase (check sample course)', 'courses/primeiros-passos', 1);
    const sampleSnap = await getDoc(sampleCourseRef).catch(() => null);

    if (sampleSnap && sampleSnap.exists() && !force) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('megazap_db_seeded_v1', 'true');
      }
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('megazap_db_seeded_v1', 'true');
    }

    // 1. Partners
    await setDoc(doc(db, 'partners', 'partner_ultrafox'), {
      id: 'partner_ultrafox',
      name: 'Ultrafox Telecom & Digital',
      displayName: 'Ultrafox',
      code: 'ULTRAFOX',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'system_bootstrap'
    }, { merge: true });

    await setDoc(doc(db, 'partners', 'partner_megazap_hq'), {
      id: 'partner_megazap_hq',
      name: 'MegaZap Brasil HQ',
      displayName: 'MegaZap Brasil',
      code: 'MEGAZAP_HQ',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'system_bootstrap'
    }, { merge: true });

    // 2. Admins Metadata
    await setDoc(doc(db, 'admins', 'admin_megazap_master'), {
      uid: 'admin_megazap_master',
      name: 'Administrador Master MegaZap',
      email: 'matheus.tmw@gmail.com',
      role: 'super_admin',
      createdAt: serverTimestamp(),
    }, { merge: true });

    // Clean up obsolete seed user doc to prevent duplicates
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', 'user_matheus_barros'));
    } catch {
      // ignore
    }

    // 3. Categories
    const { DEFAULT_CATEGORIES } = await import('./cmsService');
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

    // 4. Courses Catalog (Master Tracks, Modules & Lessons)
    for (let i = 0; i < TRACKS_DATA.length; i++) {
      const track = TRACKS_DATA[i];
      await setDoc(doc(db, 'courses', track.id), {
        title: track.title,
        slug: track.slug || track.id,
        category: track.category,
        categoryId: track.category.toLowerCase().replace(/\s+/g, '-'),
        shortDescription: track.shortDescription,
        description: track.description,
        iconName: track.iconName,
        level: track.level,
        badgeColor: track.badgeColor,
        estimatedHours: track.estimatedHours,
        certificateAvailable: track.certificateAvailable,
        certificateName: track.certificateName,
        thumbnail: track.iconName,
        status: 'published',
        order: i + 1,
        featured: i === 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'system_bootstrap'
      }, { merge: true });

      for (let m = 0; m < track.modules.length; m++) {
        const mod = track.modules[m];
        await setDoc(doc(db, 'courses', track.id, 'modules', mod.id), {
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
          await setDoc(doc(db, 'courses', track.id, 'modules', mod.id, 'lessons', lesson.id), {
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

    // 5. Certificates Sample
    await setDoc(doc(db, 'certificates', 'cert_sample_01'), {
      userId: 'user_matheus_barros',
      partnerId: 'partner_ultrafox',
      courseId: 'primeiros-passos',
      courseTitle: 'Primeiros Passos no MegaZap',
      issuedAt: serverTimestamp(),
      certificateNumber: 'MZ-WL-PRIMEIROS-PASSOS-2026',
      status: 'valid'
    }, { merge: true });

    // 6. Audit Logs Initial Record
    await setDoc(doc(db, 'auditLogs', 'log_system_init'), {
      actorUid: 'system',
      actorRole: 'system',
      partnerId: 'partner_megazap_hq',
      action: 'SYSTEM_INITIALIZED',
      targetType: 'system',
      targetId: 'megazap_academy_db',
      metadata: { message: 'MegaZap Academy collections provisioned' },
      createdAt: serverTimestamp()
    }, { merge: true });

    console.log('Todas as collections do Firestore foram populadas com sucesso!');
  } catch (error: any) {
    // Graceful fallback for unauthenticated initial load
    if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
      console.info('Firestore inicial aguardando autenticação de Super Admin para sincronização completa.');
    } else {
      console.info('Seed status:', error?.message || error);
    }
  }
}
