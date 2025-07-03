// 🎲 기존 컬렉션 문서들에 randomField 추가하는 일회성 스크립트
// Firebase 비용 최적화를 위한 무작위 필드 추가

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

// Firebase 설정 (실제 환경에서는 환경변수 사용)
const firebaseConfig = {
  // 여기에 Firebase 설정 입력
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addRandomFieldToCollection(collectionName) {
  console.log(`🎲 ${collectionName} 컬렉션에 randomField 추가 시작...`);

  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);

    console.log(`📊 ${collectionName} 컬렉션에 ${snapshot.size}개 문서 발견`);

    let updated = 0;
    const batchPromises = [];

    snapshot.forEach((document) => {
      const docData = document.data();

      // randomField가 없는 문서만 업데이트
      if (!docData.randomField) {
        const randomValue = Math.random();
        const updatePromise = updateDoc(doc(db, collectionName, document.id), {
          randomField: randomValue,
        });
        batchPromises.push(updatePromise);
        updated++;

        console.log(
          `🔄 문서 ${document.id}: randomField = ${randomValue.toFixed(6)}`
        );
      }
    });

    if (batchPromises.length > 0) {
      await Promise.all(batchPromises);
      console.log(
        `✅ ${collectionName} 컬렉션 업데이트 완료: ${updated}개 문서`
      );
    } else {
      console.log(
        `ℹ️ ${collectionName} 컬렉션의 모든 문서에 이미 randomField가 있습니다.`
      );
    }
  } catch (error) {
    console.error(`❌ ${collectionName} 컬렉션 업데이트 실패:`, error);
  }
}

async function updateAllCollections() {
  console.log("🚀 모든 컬렉션에 randomField 추가 시작...");

  const collections = ["concepts", "grammar", "examples"];

  for (const collectionName of collections) {
    await addRandomFieldToCollection(collectionName);
  }

  console.log("🎉 모든 컬렉션 업데이트 완료!");
}

// 스크립트 실행
updateAllCollections()
  .then(() => {
    console.log("✅ 스크립트 실행 완료");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 스크립트 실행 실패:", error);
    process.exit(1);
  });
