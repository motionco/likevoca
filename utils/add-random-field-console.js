// 🎲 브라우저 콘솔에서 실행하는 randomField 추가 스크립트
// Firebase 비용 최적화를 위한 무작위 필드 추가

async function addRandomFieldToCollections() {
  console.log("🚀 randomField 추가 작업 시작...");

  if (!window.firebaseInit) {
    console.error("❌ Firebase가 초기화되지 않았습니다.");
    return;
  }

  const collections = ["concepts", "grammar", "examples"];

  for (const collectionName of collections) {
    console.log(`🎲 ${collectionName} 컬렉션 처리 시작...`);

    try {
      const collectionRef = window.firebaseInit.collection(
        window.firebaseInit.db,
        collectionName
      );

      const snapshot = await window.firebaseInit.getDocs(collectionRef);
      console.log(`📊 ${collectionName}: ${snapshot.size}개 문서 발견`);

      let updated = 0;
      const updatePromises = [];

      snapshot.docs.forEach((document) => {
        const docData = document.data();

        // randomField가 없는 문서만 업데이트
        if (!docData.randomField) {
          const randomValue = Math.random();
          const docRef = window.firebaseInit.doc(
            window.firebaseInit.db,
            collectionName,
            document.id
          );

          const updatePromise = window.firebaseInit
            .updateDoc(docRef, {
              randomField: randomValue,
            })
            .then(() => {
              console.log(
                `✅ ${document.id}: randomField = ${randomValue.toFixed(6)}`
              );
            })
            .catch((error) => {
              console.error(`❌ ${document.id} 업데이트 실패:`, error);
            });

          updatePromises.push(updatePromise);
          updated++;
        }
      });

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log(
          `✅ ${collectionName} 컬렉션 업데이트 완료: ${updated}개 문서`
        );
      } else {
        console.log(
          `ℹ️ ${collectionName} 컬렉션의 모든 문서에 이미 randomField가 있습니다.`
        );
      }
    } catch (error) {
      console.error(`❌ ${collectionName} 컬렉션 처리 실패:`, error);
    }
  }

  console.log("🎉 모든 컬렉션 처리 완료!");
  console.log("💰 이제 효율적인 랜덤 쿼리를 사용할 수 있습니다!");
}

// 스크립트 실행
console.log("🎯 randomField 추가 스크립트가 로드되었습니다.");
console.log("📝 실행하려면 다음 명령어를 입력하세요:");
console.log("addRandomFieldToCollections()");

// 전역으로 함수 노출
window.addRandomFieldToCollections = addRandomFieldToCollections;
