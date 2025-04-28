/**
 * HangulWriter - 한글 필기 학습을 위한 간단한 라이브러리
 */
class HangulWriter {
  constructor(element, character, options = {}) {
    console.log(
      `HangulWriter 생성: ${character}, autoAnimate: ${options.autoAnimate}`
    );

    this.element =
      typeof element === "string" ? document.getElementById(element) : element;

    if (!this.element) {
      console.error("Element not found:", element);
      throw new Error(`Element not found: ${element}`);
    }

    this.character = character;

    // 기본 옵션
    this.options = {
      width: 300,
      height: 300,
      padding: 20,
      strokeColor: "#333",
      strokeWidth: 12, // 획 두께 증가
      outlineColor: "#ddd",
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1000, // ms
      delayBetweenStrokes: 500, // ms
      autoAnimate: false, // 자동 애니메이션 비활성화
      enableUserDrawing: false, // 사용자 드로잉 비활성화
      fontWeight: "bold", // 글자 두께
      animationDirection: "vertical", // 애니메이션 방향 (vertical 또는 horizontal)
      ...options,
    };

    // 초기화 상태
    this.isDrawing = false;
    this.quizActive = false;
    this.userStroke = [];
    this.isInitialized = false;
    this.isAnimating = false;

    // 한글 데이터 - 주요 한글 자모음에 대한 획 정보
    this.hangulData = {
      ㄱ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.8, 0.5],
          [0.8, 0.8],
        ],
      ],
      ㄴ: [
        [
          [0.2, 0.5],
          [0.2, 0.8],
        ],
        [
          [0.2, 0.8],
          [0.8, 0.8],
        ],
      ],
      ㄷ: [
        [
          [0.2, 0.3],
          [0.8, 0.3],
        ],
        [
          [0.8, 0.3],
          [0.8, 0.6],
        ],
        [
          [0.8, 0.6],
          [0.2, 0.6],
        ],
      ],
      ㄹ: [
        [
          [0.2, 0.3],
          [0.8, 0.3],
        ],
        [
          [0.8, 0.3],
          [0.8, 0.5],
        ],
        [
          [0.8, 0.5],
          [0.2, 0.5],
        ],
        [
          [0.2, 0.5],
          [0.2, 0.7],
        ],
        [
          [0.2, 0.7],
          [0.8, 0.7],
        ],
      ],
      ㅁ: [
        [
          [0.2, 0.3],
          [0.8, 0.3],
        ],
        [
          [0.8, 0.3],
          [0.8, 0.7],
        ],
        [
          [0.8, 0.7],
          [0.2, 0.7],
        ],
        [
          [0.2, 0.7],
          [0.2, 0.3],
        ],
      ],
      ㅂ: [
        [
          [0.2, 0.3],
          [0.8, 0.3],
        ],
        [
          [0.5, 0.3],
          [0.5, 0.5],
        ],
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.2, 0.5],
          [0.2, 0.7],
        ],
        [
          [0.8, 0.5],
          [0.8, 0.7],
        ],
        [
          [0.2, 0.7],
          [0.8, 0.7],
        ],
      ],
      ㅅ: [
        [
          [0.3, 0.3],
          [0.5, 0.6],
        ],
        [
          [0.5, 0.6],
          [0.7, 0.3],
        ],
      ],
      ㅇ: [
        [
          [0.5, 0.3],
          [0.7, 0.4],
          [0.8, 0.5],
          [0.7, 0.6],
          [0.5, 0.7],
          [0.3, 0.6],
          [0.2, 0.5],
          [0.3, 0.4],
          [0.5, 0.3],
        ],
      ],
      ㅈ: [
        [
          [0.3, 0.3],
          [0.5, 0.6],
        ],
        [
          [0.5, 0.6],
          [0.7, 0.3],
        ],
        [
          [0.5, 0.6],
          [0.5, 0.8],
        ],
      ],
      ㅊ: [
        [
          [0.3, 0.3],
          [0.5, 0.6],
        ],
        [
          [0.5, 0.6],
          [0.7, 0.3],
        ],
        [
          [0.5, 0.4],
          [0.5, 0.8],
        ],
      ],
      ㅋ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.5, 0.3],
          [0.5, 0.7],
        ],
      ],
      ㅌ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.2, 0.3],
          [0.8, 0.3],
        ],
        [
          [0.2, 0.7],
          [0.8, 0.7],
        ],
        [
          [0.5, 0.3],
          [0.5, 0.7],
        ],
      ],
      ㅍ: [
        [
          [0.2, 0.3],
          [0.8, 0.3],
        ],
        [
          [0.2, 0.7],
          [0.8, 0.7],
        ],
        [
          [0.5, 0.3],
          [0.5, 0.7],
        ],
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
      ],
      ㅎ: [
        [
          [0.5, 0.2],
          [0.3, 0.3],
          [0.2, 0.5],
          [0.3, 0.6],
          [0.7, 0.6],
          [0.8, 0.5],
          [0.7, 0.3],
          [0.5, 0.2],
        ],
        [
          [0.5, 0.6],
          [0.5, 0.8],
        ],
      ],
      ㅏ: [
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
        [
          [0.5, 0.5],
          [0.8, 0.5],
        ],
      ],
      ㅑ: [
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
        [
          [0.5, 0.4],
          [0.8, 0.4],
        ],
        [
          [0.5, 0.6],
          [0.8, 0.6],
        ],
      ],
      ㅓ: [
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
        [
          [0.5, 0.5],
          [0.2, 0.5],
        ],
      ],
      ㅕ: [
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
        [
          [0.5, 0.4],
          [0.2, 0.4],
        ],
        [
          [0.5, 0.6],
          [0.2, 0.6],
        ],
      ],
      ㅗ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.5, 0.5],
          [0.5, 0.8],
        ],
      ],
      ㅛ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.3, 0.3],
          [0.3, 0.5],
        ],
        [
          [0.7, 0.3],
          [0.7, 0.5],
        ],
      ],
      ㅜ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.5, 0.2],
          [0.5, 0.5],
        ],
      ],
      ㅠ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.3, 0.7],
          [0.3, 0.5],
        ],
        [
          [0.7, 0.7],
          [0.7, 0.5],
        ],
      ],
      ㅡ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
      ],
      ㅣ: [
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
      ],
      ㅢ: [
        [
          [0.2, 0.4],
          [0.8, 0.4],
        ],
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
      ],
      ㅚ: [
        [
          [0.2, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.5, 0.5],
          [0.5, 0.8],
        ],
        [
          [0.7, 0.3],
          [0.7, 0.7],
        ],
      ],
      ㅐ: [
        [
          [0.5, 0.2],
          [0.5, 0.8],
        ],
        [
          [0.5, 0.5],
          [0.8, 0.5],
        ],
        [
          [0.7, 0.3],
          [0.7, 0.7],
        ],
      ],
      나: [
        // ㄴ 자음
        [
          [0.3, 0.3],
          [0.3, 0.5],
          [0.3, 0.7],
        ],
        [
          [0.3, 0.7],
          [0.4, 0.7],
          [0.5, 0.7],
        ],
        // ㅏ 모음
        [
          [0.6, 0.3],
          [0.6, 0.5],
          [0.6, 0.7],
        ],
        [
          [0.6, 0.5],
          [0.7, 0.5],
          [0.8, 0.5],
        ],
      ],
      가: [
        // ㄱ 자음
        [
          [0.3, 0.3],
          [0.4, 0.3],
          [0.5, 0.3],
        ],
        [
          [0.5, 0.3],
          [0.5, 0.5],
          [0.5, 0.7],
        ],
        // ㅏ 모음
        [
          [0.6, 0.3],
          [0.6, 0.5],
          [0.6, 0.7],
        ],
        [
          [0.6, 0.5],
          [0.7, 0.5],
          [0.8, 0.5],
        ],
      ],
    };

    // 초기화 실행
    this.init();

    // 자동 애니메이션 실행 (옵션이 true인 경우)
    if (this.options.autoAnimate) {
      console.log("자동 애니메이션 예약됨");
      setTimeout(() => {
        console.log("자동 애니메이션 실행");
        this.animateCharacter();
      }, 500);
    } else {
      console.log("자동 애니메이션 비활성화됨");
    }
  }

  init() {
    if (this.isInitialized) {
      console.log("이미 초기화된 인스턴스입니다.");
      return;
    }

    console.log("HangulWriter init 시작");

    // 요소 비우기
    if (this.element) {
      this.element.innerHTML = "";
    } else {
      console.error("엘리먼트가 없어 초기화를 중단합니다.");
      return;
    }

    // Canvas 설정
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.element.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    // 문자 outlines 표시
    if (this.options.showOutline) {
      this.drawOutline();
    }

    // 문자 표시
    if (this.options.showCharacter) {
      this.drawCharacter();
    }

    // 유저가 그릴 수 있도록 이벤트 리스너 추가
    this.setupDrawingListeners();

    this.isInitialized = true;
    console.log("HangulWriter init 완료");
  }

  // 문자의 윤곽선 표시
  drawOutline() {
    // 인스턴스의 획 데이터 확인 후 없으면 정적 메서드로 확인
    let strokes = this.getCharacterStrokes(this.character);
    if (!strokes) {
      strokes = HangulWriter.getCharacterStrokes(this.character);
    }

    if (!strokes) return;

    this.ctx.strokeStyle = this.options.outlineColor;
    this.ctx.lineWidth = this.options.strokeWidth / 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    for (const stroke of strokes) {
      this.ctx.beginPath();

      if (Array.isArray(stroke[0])) {
        // 첫 점 설정
        this.ctx.moveTo(
          stroke[0][0] * this.options.width,
          stroke[0][1] * this.options.height
        );

        // 여러 점이 있는 경우 곡선으로 처리
        if (stroke.length > 2) {
          for (let i = 1; i < stroke.length - 1; i++) {
            const xc =
              ((stroke[i][0] + stroke[i + 1][0]) / 2) * this.options.width;
            const yc =
              ((stroke[i][1] + stroke[i + 1][1]) / 2) * this.options.height;

            this.ctx.quadraticCurveTo(
              stroke[i][0] * this.options.width,
              stroke[i][1] * this.options.height,
              xc,
              yc
            );
          }

          // 마지막 점을 연결
          this.ctx.lineTo(
            stroke[stroke.length - 1][0] * this.options.width,
            stroke[stroke.length - 1][1] * this.options.height
          );
        } else {
          // 두 점만 있는 경우 직선으로 연결
          this.ctx.lineTo(
            stroke[1][0] * this.options.width,
            stroke[1][1] * this.options.height
          );
        }
      }

      this.ctx.stroke();
    }
  }

  // 문자 표시
  drawCharacter(isBackground = false) {
    const fontFamily = '"Malgun Gothic", Arial, sans-serif';
    const fontSize = this.options.height * 0.7;
    const fontWeight = this.options.fontWeight;

    this.ctx.fillStyle = isBackground ? "#e0e0e0" : this.options.strokeColor;
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.character,
      this.options.width / 2,
      this.options.height / 2
    );
  }

  // 애니메이션으로 획 그리기
  animateCharacter() {
    console.log("animateCharacter 호출됨");

    // 애니메이션 중이거나 초기화되지 않은 경우 중단
    if (this.isAnimating) {
      console.log("이미 애니메이션이 진행 중입니다.");
      return;
    }

    if (!this.isInitialized) {
      console.error("초기화되지 않아 애니메이션을 시작할 수 없습니다.");
      return;
    }

    // 획 데이터 확인
    const strokes = this.hangulData[this.character];
    if (!strokes || strokes.length === 0) {
      console.log("애니메이션을 위한 획 데이터가 없습니다:", this.character);
      return;
    }

    console.log("애니메이션 시작: 총 획수", strokes.length);
    this.isAnimating = true;

    // 캔버스 초기화
    this.clearCanvas();

    // 배경색과 앞경색 설정
    const originalStrokeColor = this.options.strokeColor;
    const backgroundStrokeColor = "#e0e0e0"; // 배경 획 색상
    const fontFamily = '"Malgun Gothic", Arial, sans-serif';
    const fontSize = this.options.height * 0.7;
    const fontWeight = this.options.fontWeight;
    const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // 전체 문자를 배경색으로 그림
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    this.ctx.fillStyle = backgroundStrokeColor;
    this.ctx.font = fontStyle;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.character,
      this.options.width / 2,
      this.options.height / 2
    );

    // 각 획을 순차적으로 애니메이션
    let currentStrokeIndex = 0;

    const animateNextStroke = () => {
      if (currentStrokeIndex >= strokes.length) {
        this.isAnimating = false;
        console.log("애니메이션 완료");
        return;
      }

      // 현재까지의 획 그리기
      this.ctx.clearRect(0, 0, this.options.width, this.options.height);

      // 배경으로 전체 문자 다시 그리기
      this.ctx.fillStyle = backgroundStrokeColor;
      this.ctx.font = fontStyle;
      this.ctx.fillText(
        this.character,
        this.options.width / 2,
        this.options.height / 2
      );

      // 현재 획까지 원래 색으로 그리기
      this.ctx.strokeStyle = originalStrokeColor;
      this.ctx.lineWidth = this.options.strokeWidth;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      for (let i = 0; i <= currentStrokeIndex; i++) {
        const stroke = strokes[i];
        this.ctx.beginPath();

        if (Array.isArray(stroke[0])) {
          // 첫 점 설정
          this.ctx.moveTo(
            stroke[0][0] * this.options.width,
            stroke[0][1] * this.options.height
          );

          // 여러 점이 있는 경우 곡선으로 처리
          if (stroke.length > 2) {
            for (let j = 1; j < stroke.length - 1; j++) {
              const xc =
                ((stroke[j][0] + stroke[j + 1][0]) / 2) * this.options.width;
              const yc =
                ((stroke[j][1] + stroke[j + 1][1]) / 2) * this.options.height;

              this.ctx.quadraticCurveTo(
                stroke[j][0] * this.options.width,
                stroke[j][1] * this.options.height,
                xc,
                yc
              );
            }

            // 마지막 점을 연결
            this.ctx.lineTo(
              stroke[stroke.length - 1][0] * this.options.width,
              stroke[stroke.length - 1][1] * this.options.height
            );
          } else {
            // 두 점만 있는 경우 직선으로 연결
            this.ctx.lineTo(
              stroke[1][0] * this.options.width,
              stroke[1][1] * this.options.height
            );
          }
        }

        this.ctx.stroke();
      }

      // 다음 획 애니메이션
      currentStrokeIndex++;
      setTimeout(animateNextStroke, this.options.delayBetweenStrokes);
    };

    // 애니메이션 시작
    animateNextStroke();
  }

  // 캔버스 지우기
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);
  }

  // 퀴즈 모드 설정
  quiz(options = {}) {
    console.log("quiz 메서드 호출됨");

    const defaultOptions = {
      drawingWidth: this.options.strokeWidth,
      onComplete: () => {},
      onMistake: () => {},
    };

    const quizOptions = { ...defaultOptions, ...options };

    // 인스턴스의 획 데이터 확인 후 없으면 정적 메서드로 확인
    let strokes = this.getCharacterStrokes(this.character);
    if (!strokes) {
      strokes = HangulWriter.getCharacterStrokes(this.character);
    }

    if (!strokes) {
      console.error("획 데이터가 없어 퀴즈 모드를 시작할 수 없습니다.");

      // 획 데이터가 없으면 그냥 문자 표시
      this.ctx.clearRect(0, 0, this.options.width, this.options.height);
      this.drawCharacter();

      // 오류 알림
      if (typeof quizOptions.onError === "function") {
        quizOptions.onError("획 데이터가 없습니다");
      } else {
        alert(
          `'${this.character}' 문자는 현재 획순 데이터를 지원하지 않습니다.`
        );
      }

      return;
    }

    // 현재 진행 중인 획 인덱스
    let currentStrokeIndex = 0;
    this.quizActive = true;
    this.userStroke = [];

    // 캔버스 초기화
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);

    if (this.options.showOutline) {
      this.drawOutline();
    }

    this.showQuizInstruction(currentStrokeIndex);
    console.log("퀴즈 모드 준비 완료, 이벤트 리스너 설정");

    // 퀴즈 모드에서는 사용자 드로잉 활성화
    const prevUserDrawing = this.options.enableUserDrawing;
    this.options.enableUserDrawing = true;

    // 퀴즈 드로잉 이벤트 리스너 설정
    this.setupQuizListeners(quizOptions, currentStrokeIndex);

    // 퀴즈가 끝나면 원래대로 돌려놓기 위한 설정
    quizOptions.onComplete = (data) => {
      // 기존 콜백 실행
      if (options.onComplete) {
        options.onComplete(data);
      }

      // 퀴즈가 끝나면 원래 설정으로 복원
      this.options.enableUserDrawing = prevUserDrawing;
    };
  }

  // 퀴즈 안내 메시지 표시
  showQuizInstruction(strokeIndex) {
    const strokes = this.getCharacterStrokes(this.character);

    if (!strokes || strokeIndex >= strokes.length) return;

    // 이전 획 표시
    for (let i = 0; i < strokeIndex; i++) {
      this.drawCompleteStroke(strokes[i]);
    }
  }

  // 퀴즈 드로잉 이벤트 리스너 설정
  setupQuizListeners(options, startStrokeIndex) {
    const strokes = this.getCharacterStrokes(this.character);
    if (!strokes) return;

    // 이전 퀴즈 이벤트 핸들러가 있으면 제거
    if (this._quizHandleStart && this._quizHandleMove && this._quizHandleEnd) {
      this.canvas.removeEventListener("mousedown", this._quizHandleStart);
      this.canvas.removeEventListener("mousemove", this._quizHandleMove);
      this.canvas.removeEventListener("mouseup", this._quizHandleEnd);
      this.canvas.removeEventListener("mouseleave", this._quizHandleEnd);
      this.canvas.removeEventListener("touchstart", this._quizHandleStart);
      this.canvas.removeEventListener("touchmove", this._quizHandleMove);
      this.canvas.removeEventListener("touchend", this._quizHandleEnd);
    }

    let currentStrokeIndex = startStrokeIndex;
    let totalMistakes = 0;
    let mistakesOnCurrentStroke = 0;

    // 획 완성 여부 체크 함수를 인스턴스에 저장
    this._checkStrokeCompletion = () => {
      const currentStroke = strokes[currentStrokeIndex];

      // 획 완성 여부 확인 로직 구현
      if (!currentStroke || !this.userStroke || this.userStroke.length < 2) {
        // 유효하지 않은 입력인 경우
        return;
      }

      // 간단한 비교 로직: 시작점과 끝점이 획의 시작점과 끝점에 가까운지 확인
      const startPoint = this.userStroke[0];
      const endPoint = this.userStroke[this.userStroke.length - 1];

      const startX = currentStroke[0][0] * this.options.width;
      const startY = currentStroke[0][1] * this.options.height;
      const endX =
        currentStroke[currentStroke.length - 1][0] * this.options.width;
      const endY =
        currentStroke[currentStroke.length - 1][1] * this.options.height;

      // 거리 계산 함수
      const distance = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      };

      // 시작점과 끝점의 허용 오차 (캔버스 크기의 일정 비율)
      const tolerance =
        Math.min(this.options.width, this.options.height) * 0.15;

      // 시작점과 끝점을 검사
      const startDistance = distance(
        startPoint.x,
        startPoint.y,
        startX,
        startY
      );
      const endDistance = distance(endPoint.x, endPoint.y, endX, endY);

      // 방향이 맞는지 확인 (시작점에서 끝점으로 진행)
      const directionCorrect =
        startDistance < endDistance || // 시작점이 원래 시작점에 더 가까움
        (startDistance < tolerance && endDistance < tolerance); // 둘 다 충분히 가까움

      const completed =
        startDistance < tolerance &&
        endDistance < tolerance &&
        directionCorrect;

      if (completed) {
        // 현재 획 완성
        this.drawCompleteStroke(currentStroke);
        currentStrokeIndex++;
        mistakesOnCurrentStroke = 0;

        if (currentStrokeIndex >= strokes.length) {
          // 모든 획 완성
          this.quizActive = false;

          if (options.onComplete) {
            options.onComplete({
              totalMistakes,
              totalStrokes: strokes.length,
            });
          }
        } else {
          // 다음 획 안내
          this.showQuizInstruction(currentStrokeIndex);
        }
      } else {
        // 실패
        mistakesOnCurrentStroke++;
        totalMistakes++;

        if (options.onMistake) {
          options.onMistake({
            strokeNum: currentStrokeIndex,
            mistakesOnStroke: mistakesOnCurrentStroke,
            totalMistakes,
          });
        }
      }
    };

    // 터치/마우스 이벤트
    this._quizHandleStart = (e) => {
      if (!this.quizActive || !this.options.enableUserDrawing) return;

      this.isDrawing = true;
      this.userStroke = [];

      const pos = this.getPositionFromEvent(e);
      this.userStroke.push(pos);

      // 임시 드로잉 컨텍스트로 그리기
      this.tempCtx = this.ctx;
      this.tempCtx.strokeStyle =
        options.strokeColor || this.options.strokeColor;
      this.tempCtx.lineWidth = options.drawingWidth;
      this.tempCtx.lineCap = "round";
      this.tempCtx.lineJoin = "round";

      this.tempCtx.beginPath();
      this.tempCtx.moveTo(pos.x, pos.y);
    };

    this._quizHandleMove = (e) => {
      if (
        !this.isDrawing ||
        !this.quizActive ||
        !this.options.enableUserDrawing
      )
        return;

      const pos = this.getPositionFromEvent(e);
      this.userStroke.push(pos);

      this.tempCtx.lineTo(pos.x, pos.y);
      this.tempCtx.stroke();
    };

    this._quizHandleEnd = () => {
      if (!this.isDrawing || !this.quizActive) return;

      this.isDrawing = false;

      // 획 완성 여부 확인
      this._checkStrokeCompletion();
    };

    // 퀴즈 이벤트 리스너 등록
    this.canvas.addEventListener("mousedown", this._quizHandleStart);
    this.canvas.addEventListener("mousemove", this._quizHandleMove);
    this.canvas.addEventListener("mouseup", this._quizHandleEnd);
    this.canvas.addEventListener("mouseleave", this._quizHandleEnd);

    this.canvas.addEventListener("touchstart", this._quizHandleStart);
    this.canvas.addEventListener("touchmove", this._quizHandleMove);
    this.canvas.addEventListener("touchend", this._quizHandleEnd);
  }

  // 이벤트에서 위치 정보 추출
  getPositionFromEvent(e) {
    let x, y;

    if (e.touches && e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.offsetX;
      y = e.offsetY;
    }

    return { x, y };
  }

  // 일반 드로잉 이벤트 리스너 설정
  setupDrawingListeners() {
    // 사용자 드로잉이 비활성화되어 있으면 이벤트 리스너를 등록하지 않음
    if (!this.options.enableUserDrawing) {
      console.log("사용자 드로잉 비활성화됨");
      return;
    }

    console.log("사용자 드로잉 활성화됨");

    // 이전 이벤트 핸들러가 있으면 제거
    if (this._handleStart && this._handleMove && this._handleEnd) {
      this.canvas.removeEventListener("mousedown", this._handleStart);
      this.canvas.removeEventListener("mousemove", this._handleMove);
      this.canvas.removeEventListener("mouseup", this._handleEnd);
      this.canvas.removeEventListener("mouseleave", this._handleEnd);
      this.canvas.removeEventListener("touchstart", this._handleStart);
      this.canvas.removeEventListener("touchmove", this._handleMove);
      this.canvas.removeEventListener("touchend", this._handleEnd);
    }

    // 새 이벤트 핸들러 정의
    this._handleStart = (e) => {
      this.isDrawing = true;
      const pos = this.getPositionFromEvent(e);

      this.ctx.strokeStyle = this.options.strokeColor;
      this.ctx.lineWidth = this.options.strokeWidth;
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    };

    this._handleMove = (e) => {
      if (!this.isDrawing) return;

      const pos = this.getPositionFromEvent(e);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    this._handleEnd = () => {
      this.isDrawing = false;
    };

    // 이벤트 리스너 등록
    this.canvas.addEventListener("mousedown", this._handleStart);
    this.canvas.addEventListener("mousemove", this._handleMove);
    this.canvas.addEventListener("mouseup", this._handleEnd);
    this.canvas.addEventListener("mouseleave", this._handleEnd);

    this.canvas.addEventListener("touchstart", this._handleStart);
    this.canvas.addEventListener("touchmove", this._handleMove);
    this.canvas.addEventListener("touchend", this._handleEnd);
  }

  // 문자에 대한 획 데이터 가져오기
  getCharacterStrokes(character) {
    // 직접적으로 획 데이터 확인
    if (this.hangulData[character]) {
      return this.hangulData[character];
    }
    // hangulData에 없는 경우 null 반환
    return null;
  }

  // 획수 가져오기
  getStrokeCount(character) {
    // 직접 획 데이터가 있는지 확인
    const strokes = this.getCharacterStrokes(character);
    if (strokes) {
      return strokes.length;
    }

    // 획수 데이터 확인
    const count = HangulWriter.getStrokeCount(character);
    return count;
  }

  // 문자 변경
  updateCharacter(character) {
    this.character = character;
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);

    if (this.options.showOutline) {
      this.drawOutline();
    }

    if (this.options.showCharacter) {
      this.drawCharacter();
    }
  }

  // 특정 획 완전히 그리기 (퀴즈 모드용)
  drawCompleteStroke(stroke) {
    // ... existing code ...
  }
}

// 정적 메소드: 획수 가져오기
HangulWriter.getStrokeCount = function (character) {
  // 기본 자모음 획수 데이터
  const strokeCounts = {
    ㄱ: 2,
    ㄴ: 2,
    ㄷ: 3,
    ㄹ: 5,
    ㅁ: 4,
    ㅂ: 6,
    ㅅ: 2,
    ㅇ: 1,
    ㅈ: 3,
    ㅊ: 3,
    ㅋ: 2,
    ㅌ: 4,
    ㅍ: 4,
    ㅎ: 2,
    ㅏ: 2,
    ㅑ: 3,
    ㅓ: 2,
    ㅕ: 3,
    ㅗ: 2,
    ㅛ: 3,
    ㅜ: 2,
    ㅠ: 3,
    ㅡ: 1,
    ㅣ: 1,
    ㅢ: 2,
    ㅚ: 3,
    ㅐ: 3,
    // 추가 자모음
    ㄲ: 4,
    ㄸ: 6,
    ㅃ: 8,
    ㅆ: 4,
    ㅉ: 6,
    ㅒ: 4,
    ㅖ: 4,
    ㅘ: 3,
    ㅝ: 3,
    ㅟ: 3,
    ㅔ: 3,
    // 자주 사용되는 한글 음절
    가: 4, // ㄱ(2) + ㅏ(2)
    나: 4, // ㄴ(2) + ㅏ(2)
    다: 5, // ㄷ(3) + ㅏ(2)
    라: 7, // ㄹ(5) + ㅏ(2)
    마: 6, // ㅁ(4) + ㅏ(2)
    바: 8, // ㅂ(6) + ㅏ(2)
    사: 4, // ㅅ(2) + ㅏ(2)
    아: 3, // ㅇ(1) + ㅏ(2)
    자: 5, // ㅈ(3) + ㅏ(2)
    차: 5, // ㅊ(3) + ㅏ(2)
    카: 4, // ㅋ(2) + ㅏ(2)
    타: 6, // ㅌ(4) + ㅏ(2)
    파: 6, // ㅍ(4) + ㅏ(2)
    하: 4, // ㅎ(2) + ㅏ(2)
    // 추가 음절 (모든 음절에 대응하는 것은 비현실적이므로 사용자 피드백을 통해 자주 사용되는 것을 추가)
  };

  return strokeCounts[character] || 0;
};

// 정적 메소드: 문자 획 데이터 가져오기
HangulWriter.getCharacterStrokes = function (character) {
  // 기본 자모음 및 음절 획 데이터
  const strokesData = {
    // 기본 자모음 데이터
    ㄱ: [
      [
        [0.2, 0.5],
        [0.8, 0.5],
      ],
      [
        [0.8, 0.5],
        [0.8, 0.8],
      ],
    ],
    ㄴ: [
      [
        [0.2, 0.5],
        [0.2, 0.8],
      ],
      [
        [0.2, 0.8],
        [0.8, 0.8],
      ],
    ],
    // 자주 사용되는 한글 음절
    나: [
      // ㄴ 자음
      [
        [0.3, 0.3],
        [0.3, 0.5],
        [0.3, 0.7],
      ],
      [
        [0.3, 0.7],
        [0.4, 0.7],
        [0.5, 0.7],
      ],
      // ㅏ 모음
      [
        [0.6, 0.3],
        [0.6, 0.5],
        [0.6, 0.7],
      ],
      [
        [0.6, 0.5],
        [0.7, 0.5],
        [0.8, 0.5],
      ],
    ],
    가: [
      // ㄱ 자음
      [
        [0.3, 0.3],
        [0.4, 0.3],
        [0.5, 0.3],
      ],
      [
        [0.5, 0.3],
        [0.5, 0.5],
        [0.5, 0.7],
      ],
      // ㅏ 모음
      [
        [0.6, 0.3],
        [0.6, 0.5],
        [0.6, 0.7],
      ],
      [
        [0.6, 0.5],
        [0.7, 0.5],
        [0.8, 0.5],
      ],
    ],
  };

  return strokesData[character] || null;
};

// 전역 객체에 노출
window.HangulWriter = HangulWriter;
