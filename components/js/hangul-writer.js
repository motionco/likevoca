class HangulWriter {
  constructor(elementId, character, options = {}) {
    console.log(`HangulWriter 생성: ${elementId}, 문자: ${character}`);
    this.isInitialized = false;

    if (!character) {
      console.error("HangulWriter: 문자가 제공되지 않았습니다.");
      return;
    }

    this.character = character;
    this.elementId = elementId;
    this.options = Object.assign(
      {
        width: 300,
        height: 300,
        padding: 20,
        strokeColor: "#333",
        outlineColor: "#ddd",
        strokeAnimationSpeed: 1000,
        delayBetweenStrokes: 500,
        showOutline: true,
        showCharacter: true,
        autoAnimate: true,
        enableUserDrawing: false,
        animationDirection: "vertical",
      },
      options
    );

    // 초기화 시도
    try {
      this.init();
    } catch (error) {
      console.error("HangulWriter 초기화 중 오류:", error);
    }
  }

  init() {
    if (this.isInitialized) {
      console.log("이미 초기화되었습니다.");
      return;
    }

    console.log(`'${this.character}' 초기화 중...`);

    const targetElement = document.getElementById(this.elementId);
    if (!targetElement) {
      console.error(`대상 요소를 찾을 수 없음: ${this.elementId}`);
      return;
    }

    targetElement.innerHTML = ""; // 대상 요소 초기화

    // 획 데이터 가져오기
    this.strokes = HangulWriter.getCharacterStrokes(this.character);

    if (!this.strokes || this.strokes.length === 0) {
      console.warn(`'${this.character}' 문자의 획 데이터가 없습니다.`);
      this._showCharacterOnly();
      return;
    }

    console.log(`'${this.character}' 획 데이터 로드됨:`, this.strokes.length);

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.display = "block";
    this.canvas.style.margin = "0 auto";

    targetElement.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.currentStroke = 0;
    this.isAnimating = false;
    this.isInitialized = true;

    // 외곽선 표시
    if (this.options.showOutline) {
      this._drawOutline();
    }

    // 자동 애니메이션 시작
    if (this.options.autoAnimate) {
      console.log("자동 애니메이션 시작");
      setTimeout(() => this.animateCharacter(), 500);
    }

    console.log(`'${this.character}' 초기화 완료`);
  }

  _showCharacterOnly() {
    const targetElement = document.getElementById(this.elementId);
    if (!targetElement) return;

    targetElement.innerHTML = "";

    const charDiv = document.createElement("div");
    charDiv.style.width = `${this.options.width}px`;
    charDiv.style.height = `${this.options.height}px`;
    charDiv.style.display = "flex";
    charDiv.style.justifyContent = "center";
    charDiv.style.alignItems = "center";
    charDiv.style.fontSize = `${
      Math.min(this.options.width, this.options.height) * 0.7
    }px`;
    charDiv.style.fontWeight = "bolder";
    charDiv.textContent = this.character;

    targetElement.appendChild(charDiv);
  }

  _drawOutline() {
    if (!this.ctx || !this.strokes) return;

    this.ctx.strokeStyle = this.options.outlineColor;
    this.ctx.lineWidth = 2;

    for (const stroke of this.strokes) {
      this.ctx.beginPath();
      let started = false;

      for (const point of stroke) {
        const x = point.x * this.options.width + this.options.padding;
        const y = point.y * this.options.height + this.options.padding;

        if (!started) {
          this.ctx.moveTo(x, y);
          started = true;
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      this.ctx.stroke();
    }
  }

  animateCharacter() {
    if (!this.isInitialized || !this.ctx || !this.strokes) {
      console.error(
        "애니메이션 시작 실패: 초기화되지 않았거나 필요한 요소가 없습니다."
      );
      return;
    }

    if (this.isAnimating) {
      console.log("이미 애니메이션 중입니다.");
      return;
    }

    console.log(`'${this.character}' 애니메이션 시작`);
    this.isAnimating = true;

    // 캔버스 초기화
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.options.showOutline) {
      this._drawOutline();
    }

    this.currentStroke = 0;
    this._animateNextStroke();
  }

  _animateNextStroke() {
    if (!this.isInitialized || this.currentStroke >= this.strokes.length) {
      this.isAnimating = false;
      console.log(`'${this.character}' 애니메이션 완료`);
      return;
    }

    const stroke = this.strokes[this.currentStroke];
    const totalPoints = stroke.length;
    let currentPoint = 0;
    const pointsPerMs = totalPoints / this.options.strokeAnimationSpeed;

    this.ctx.beginPath();

    if (totalPoints === 0) {
      this.currentStroke++;
      setTimeout(
        () => this._animateNextStroke(),
        this.options.delayBetweenStrokes
      );
      return;
    }

    // 첫 번째 점으로 이동
    const firstPoint = stroke[0];
    const firstX = firstPoint.x * this.options.width + this.options.padding;
    const firstY = firstPoint.y * this.options.height + this.options.padding;
    this.ctx.moveTo(firstX, firstY);

    const startTime = Date.now();

    // 애니메이션 프레임 함수
    const animate = () => {
      if (!this.isInitialized || !this.isAnimating) return;

      const elapsed = Date.now() - startTime;
      const targetPoints = Math.min(
        totalPoints,
        Math.floor(elapsed * pointsPerMs) + 1
      );

      if (currentPoint < targetPoints) {
        // 새 점들 그리기
        for (let i = currentPoint; i < targetPoints; i++) {
          const point = stroke[i];
          const x = point.x * this.options.width + this.options.padding;
          const y = point.y * this.options.height + this.options.padding;

          this.ctx.lineTo(x, y);
        }

        // 선 스타일 설정 및 그리기
        this.ctx.strokeStyle = this.options.strokeColor;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.stroke();

        currentPoint = targetPoints;
      }

      if (currentPoint < totalPoints) {
        requestAnimationFrame(animate);
      } else {
        // 다음 획으로 이동
        this.currentStroke++;
        setTimeout(
          () => this._animateNextStroke(),
          this.options.delayBetweenStrokes
        );
      }
    };

    requestAnimationFrame(animate);
  }

  quiz(quizOptions = {}) {
    if (!this.isInitialized) {
      console.error("퀴즈 시작 실패: 초기화되지 않았습니다.");
      return;
    }

    console.log("퀴즈 모드 시작");

    const options = Object.assign(
      {
        drawingWidth: 8,
        onMistake: null,
        onComplete: null,
      },
      quizOptions
    );

    // 퀴즈 상태 초기화
    this.isQuizMode = true;
    this.currentStrokeInQuiz = 0;
    this.mistakesByStroke = Array(this.strokes.length).fill(0);
    this.totalMistakes = 0;

    // 사용자 입력 활성화
    this._enableUserDrawing(options);
  }

  _enableUserDrawing(options) {
    if (!this.isInitialized || !this.canvas) {
      console.error("사용자 그리기 활성화 실패: 초기화되지 않았습니다.");
      return;
    }

    console.log("사용자 그리기 활성화");

    const ctx = this.ctx;
    const canvas = this.canvas;
    const currentStrokePoints = this.strokes[this.currentStrokeInQuiz];

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let userPoints = [];

    // 도움말 메시지
    const targetElement = document.getElementById(this.elementId);
    if (targetElement) {
      const helpMsg = document.createElement("div");
      helpMsg.textContent = `${this.currentStrokeInQuiz + 1}번 획을 그려보세요`;
      helpMsg.style.textAlign = "center";
      helpMsg.style.marginTop = "10px";
      helpMsg.style.fontWeight = "bold";
      helpMsg.style.color = "#333";
      helpMsg.id = "quiz-help-msg";

      const existingHelp = targetElement.querySelector("#quiz-help-msg");
      if (existingHelp) {
        existingHelp.replaceWith(helpMsg);
      } else {
        targetElement.appendChild(helpMsg);
      }
    }

    // 이벤트 핸들러
    const startDrawing = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();

      // 터치 이벤트인지 마우스 이벤트인지 확인
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      lastX = clientX - rect.left;
      lastY = clientY - rect.top;

      // 점 추가
      userPoints.push({
        x: (lastX - this.options.padding) / this.options.width,
        y: (lastY - this.options.padding) / this.options.height,
      });

      // 첫 점 그리기
      ctx.beginPath();
      ctx.arc(lastX, lastY, options.drawingWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = this.options.strokeColor;
      ctx.fill();
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();

      // 터치 이벤트인지 마우스 이벤트인지 확인
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 선 그리기
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = this.options.strokeColor;
      ctx.lineWidth = options.drawingWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // 점 추가
      userPoints.push({
        x: (x - this.options.padding) / this.options.width,
        y: (y - this.options.padding) / this.options.height,
      });

      lastX = x;
      lastY = y;
    };

    const endDrawing = () => {
      if (!isDrawing) return;
      isDrawing = false;

      // 획 평가
      const result = this._evaluateStroke(userPoints, this.currentStrokeInQuiz);

      if (result.isCorrect) {
        // 맞게 그렸을 때
        this.currentStrokeInQuiz++;

        // 다음 획이 있으면 계속, 없으면 완료
        if (this.currentStrokeInQuiz < this.strokes.length) {
          setTimeout(() => {
            this._clearCanvasExceptOutline();
            this._enableUserDrawing(options);
          }, 500);
        } else {
          // 모든 획 완료
          setTimeout(() => {
            this._clearCanvasExceptOutline();
            this.isQuizMode = false;

            if (options.onComplete) {
              options.onComplete({
                totalMistakes: this.totalMistakes,
                mistakesByStroke: this.mistakesByStroke,
              });
            }

            // 도움말 업데이트
            const helpMsg = document.getElementById("quiz-help-msg");
            if (helpMsg) {
              helpMsg.textContent = "퀴즈 완료!";
            }
          }, 500);
        }
      } else {
        // 틀렸을 때
        this.mistakesByStroke[this.currentStrokeInQuiz]++;
        this.totalMistakes++;

        // 콜백 호출
        if (options.onMistake) {
          options.onMistake({
            strokeNum: this.currentStrokeInQuiz,
            mistakesOnStroke: this.mistakesByStroke[this.currentStrokeInQuiz],
            userPoints: userPoints,
          });
        }

        // 캔버스 초기화 & 다시 시도
        setTimeout(() => {
          this._clearCanvasExceptOutline();
          userPoints = [];
        }, 300);
      }
    };

    // 이벤트 리스너 등록
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseleave", endDrawing);

    // 터치 이벤트 지원
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startDrawing(e);
    });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      draw(e);
    });
    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      endDrawing();
    });
  }

  _clearCanvasExceptOutline() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.options.showOutline) {
      this._drawOutline();
    }

    // 도움말 업데이트
    const helpMsg = document.getElementById("quiz-help-msg");
    if (helpMsg) {
      helpMsg.textContent = `${this.currentStrokeInQuiz + 1}번 획을 그려보세요`;
    }
  }

  _evaluateStroke(userPoints, strokeIndex) {
    const correctStroke = this.strokes[strokeIndex];

    // 너무 적은 포인트 수는 오답 처리
    if (userPoints.length < 5) {
      return { isCorrect: false };
    }

    // 방향 확인 (시작점과 끝점)
    const userStart = userPoints[0];
    const userEnd = userPoints[userPoints.length - 1];
    const correctStart = correctStroke[0];
    const correctEnd = correctStroke[correctStroke.length - 1];

    // 시작점과 끝점이 올바른 범위 내에 있는지 확인
    const tolerance = 0.15; // 15% 오차 허용

    const startDist = Math.sqrt(
      Math.pow(userStart.x - correctStart.x, 2) +
        Math.pow(userStart.y - correctStart.y, 2)
    );

    const endDist = Math.sqrt(
      Math.pow(userEnd.x - correctEnd.x, 2) +
        Math.pow(userEnd.y - correctEnd.y, 2)
    );

    // 시작점과 끝점이 모두 허용 범위 내에 있어야 함
    return { isCorrect: startDist <= tolerance && endDist <= tolerance };
  }

  // 정적 메서드: 문자의 획 데이터 가져오기
  static getCharacterStrokes(char) {
    if (!char || char.length === 0) return null;

    // 단일 문자만 지원
    const singleChar = char.charAt(0);
    return hangulData[singleChar] || null;
  }

  // 정적 메서드: 획 개수 가져오기
  static getStrokeCount(char) {
    const strokes = HangulWriter.getCharacterStrokes(char);
    return strokes ? strokes.length : 0;
  }
}
