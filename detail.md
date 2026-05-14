/*
 * ========== 1. Application (Pixi 전체 엔진 시작) ==========
 *
 * PIXI.Application 은 Pixi의 "게임 실행기" 같은 존재.
 * 이걸 만들면:
 *
 * - 화면에 그려줄 캔버스(Renderer)
 * - 계속 움직이게 해주는 반복 루프(Ticker)
 * - 모든 객체를 담는 무대(stage)
 *
 * 가 한 번에 준비됨.
 *
 * 쉽게 말하면:
 *
 * "빈 게임 화면 하나 생성"
 */

const app = new PIXI.Application({
    // 캔버스 가로 크기
    width: 800,

    // 캔버스 세로 크기
    height: 600,

    // 배경색
    backgroundColor: 0x1099bb,

    /*
     * 고해상도 모니터(레티나) 대응.
     * 숫자가 높을수록 선명하지만 성능 사용량도 증가.
     */
    resolution: window.devicePixelRatio || 1,

    /*
     * 도형 가장자리를 부드럽게 보이게 함.
     * (계단 현상 감소)
     */
    antialias: true
});

/*
 * app.view 는 실제 HTML canvas 태그.
 *
 * append() 해야 화면에 보임.
 *
 * 결과:
 * <div id="container">
 *    <canvas></canvas>
 * </div>
 */
$("#container").append(app.view);



/*
 * ========== 2. Container (그룹/폴더 개념) ==========
 *
 * Container 는 객체들을 담는 "폴더" 같은 개념.
 *
 * 여러 개를 묶어서:
 * - 같이 이동
 * - 같이 회전
 * - 같이 숨김
 *
 * 등을 할 수 있음.
 */

const mainContainer = new PIXI.Container();

mainContainer.x = 0;
mainContainer.y = 0;

/*
 * stage 는 최상위 무대.
 *
 * addChild() 하면
 * 화면에 그려질 대상 목록에 등록됨.
 */
app.stage.addChild(mainContainer);



/*
 * ========== 3. Graphics (도형 그리기) ==========
 *
 * 이미지 없이 코드로 직접 도형 생성.
 *
 * beginFill()
 *   ↓
 * 도형 그림
 *   ↓
 * endFill()
 *
 * 순서로 사용.
 */

const graphics = new PIXI.Graphics();

/*
 * 내부 색 지정
 */
graphics.beginFill(0xde3249);

/*
 * 사각형 생성
 *
 * x, y, width, height
 */
graphics.drawRect(50, 50, 100, 100);

/*
 * 채우기 종료
 */
graphics.endFill();

/*
 * 선 스타일
 *
 * 두께, 색상, 투명도
 */
graphics.lineStyle(2, 0xfeeb77, 1);

/*
 * 원 생성
 *
 * x, y, 반지름
 */
graphics.drawCircle(200, 200, 50);

/*
 * 컨테이너에 추가
 */
mainContainer.addChild(graphics);



/*
 * ========== 4. Sprite (이미지 객체) ==========
 *
 * Sprite 는 이미지 하나를 화면에 띄우는 객체.
 *
 * 보통 PNG/JPG 를 사용하지만
 * 여기선 WHITE 텍스처 사용.
 */

const spriteTexture = PIXI.Texture.WHITE;

const sprite = new PIXI.Sprite(spriteTexture);

/*
 * 크기 설정
 */
sprite.width = 120;
sprite.height = 120;

/*
 * 색상 변경
 *
 * 흰색 이미지에 색을 덮는 방식.
 */
sprite.tint = 0x3498db;

/*
 * 위치
 */
sprite.x = 400;
sprite.y = 280;

/*
 * 중심점 설정
 *
 * 0,0     = 왼쪽 위 기준
 * 0.5,0.5 = 정중앙 기준
 *
 * 회전할 때 보통 중앙 기준 사용.
 */
sprite.anchor.set(0.5);

/*
 * 투명도
 *
 * 0 = 완전 투명
 * 1 = 완전 불투명
 */
sprite.alpha = 0.95;

/*
 * 컨테이너에 추가
 */
mainContainer.addChild(sprite);



/*
 * ========== 5. Interaction (클릭 이벤트) ==========
 *
 * Pixi 객체는 기본적으로 클릭 안 됨.
 *
 * interactive = true 해야 클릭 가능.
 */

sprite.interactive = true;

/*
 * 마우스 올리면 손가락 커서 표시
 */
sprite.buttonMode = true;

/*
 * 클릭 이벤트 등록
 */
sprite.on("pointerdown", function () {
    setLog("스프라이트 클릭됨!");
});



/*
 * ========== 6. Ticker (반복 실행 루프) ==========
 *
 * 게임의 심장 같은 부분.
 *
 * app.ticker.add() 안의 코드는
 * 매 프레임 계속 실행됨.
 *
 * 보통:
 * - 이동
 * - 회전
 * - 애니메이션
 * - 충돌 체크
 *
 * 등에 사용.
 */

app.ticker.add(function (delta) {

    /*
     * rotation 은 라디안 단위 회전값.
     *
     * delta 는 프레임 보정값.
     * 컴퓨터 성능 차이를 줄여줌.
     */

    sprite.rotation += 0.01 * delta;
});



/*
 * 로그 출력
 */
setLog("초기화 완료!");

Application
 └─ stage
     └─ Container
         ├─ Graphics
         └─ Sprite