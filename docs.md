1. Application (기본 엔진)
PIXI.Application은 렌더러, 타이머, 최상위 컨테이너를 하나로 묶어주는 메인 클래스입니다.

// 기본 설정 및 생성
const app = new PIXI.Application({
    width: 800,         // 캔버스 너비
    height: 600,        // 캔버스 높이
    backgroundColor: 0x1099bb, // 배경색 (16진수)
    resolution: window.devicePixelRatio || 1, // 해상도 대응
    antialias: true     // 계단 현상 방지
});

// HTML 문서에 캔버스 추가
// jQuery를 사용할 경우: $('#container').append(app.view);
document.body.appendChild(app.view);

2. Container (그룹화)
여러 오브젝트를 하나로 묶어 관리할 때 사용합니다. 폴더 구조와 비슷하며, 부모 컨테이너의 좌표나 투명도를 변경하면 자식들도 함께 영향을 받습니다.

const container = new PIXI.Container();
app.stage.addChild(container); // 최상위 스테이지에 추가

// 자식 요소 추가
// container.addChild(sprite);

3. Sprite (이미지 객체)
이미지를 화면에 그릴 때 가장 많이 사용되는 기본 단위입니다.

// 이미지 로드 후 스프라이트 생성
const texture = PIXI.Texture.from('image.png');
const sprite = new PIXI.Sprite(texture);

// 주요 파라미터
sprite.x = 100;         // X 좌표
sprite.y = 100;         // Y 좌표
sprite.width = 200;     // 가로 크기
sprite.height = 200;    // 세로 크기
sprite.alpha = 0.5;     // 투명도 (0 ~ 1)
sprite.rotation = 0.5;  // 회전 (라디안 단위)
sprite.anchor.set(0.5); // 중심점 설정 (0.5는 정중앙)

container.addChild(sprite);

4. Graphics (도형 그리기)
이미지 없이 코드만으로 사각형, 원, 선 등의 도형을 그릴 때 사용합니다.
const graphics = new PIXI.Graphics();

graphics.beginFill(0xDE3249); // 채우기 색상
graphics.drawRect(50, 50, 100, 100); // (x, y, width, height)
graphics.endFill();

graphics.lineStyle(2, 0xFEEB77, 1); // 선 스타일 (두께, 색상, 알파)
graphics.drawCircle(200, 200, 50); // (중심x, 중심y, 반지름)

app.stage.addChild(graphics);

5. Ticker (애니메이션 루프)
매 프레임마다 함수를 실행하여 애니메이션을 구현합니다. requestAnimationFrame의 Pixi 버전입니다.
app.ticker.add(function(delta) {
    // delta는 프레임 보정값입니다.
    sprite.rotation += 0.01 * delta;
});

6. Interaction (이벤트 처리)
클릭, 터치 등 사용자의 입력을 처리합니다.
sprite.interactive = true; // 상호작용 활성화
sprite.buttonMode = true;  // 마우스 오버 시 커서를 손가락 모양으로 변경

sprite.on('pointerdown', function() {
    console.log('클릭됨!');
});

---

# 대화 기록 (PixiJS 샘플·학습 메모)

아래는 `readme.md`와 동일하게 **사용자 / 어시스턴트** 형식으로 정리한 Cursor 대화 요약입니다. 위 절은 PixiJS API 요약, 아래는 진행 과정·결론 메모입니다.

## 2026-05-12

**사용자:**  
`readme.md`를 읽고 파악해 달라.

**어시스턴트:**  
프로젝트 규칙(jQuery 우선, `const`/`let`, `var`·화살표 함수 금지, CSS는 과도하게 최신 스택 지양), `readme.md`에 대화를 남기는 관행, WeekOne 테트리스·PIOD 계획, 커밋 메시지는 `type: 내용` 스타일 선호 등을 요약해 정리함.

**사용자:**  
`docs.md`를 참고해 PixiJS 기본 기능이 구현된 HTML 샘플을 만들어 달라.

**어시스턴트:**  
루트에 `pixi-basics-sample.html` 추가. `docs.md`의 1~6(Application, Container, Sprite, Graphics, Ticker, Interaction)을 반영하고, jQuery로 `#container`에 `app.view`를 붙이며 Pixi 7.4.2 CDN·화살표 함수 미사용으로 구현함.

**사용자:**  
커밋 메시지를 추천해 달라.

**어시스턴트:**  
예: `feat: docs.md 기준 PixiJS 기본 기능 데모 HTML 샘플 추가` 등 Conventional Commits 형식 후보를 제시함.

**사용자:**  
`pixi-basics-sample.html`에 Pixi 내장 기능이 어떻게 동작하는지, 코드가 어떻게 구현되는지 더 자세한 주석을 달아 달라.

**어시스턴트:**  
스크립트에 블록 주석으로 Application·`app.view`·Container·Graphics·Sprite·Interaction·Ticker 각각의 역할과 `delta`, `anchor`, `Texture.WHITE`+`tint` 등을 설명함.

**사용자:**  
스프라이트가 직사각형을 그리는데, 빨강과 파랑 두 개가 생기고 파랑에만 클릭 이벤트가 적용된 이유를 물음.

**어시스턴트:**  
빨간 사각형은 `PIXI.Graphics`의 `drawRect`로 그린 벡터 도형이고, 파란 사각형은 `PIXI.Sprite`(WHITE 텍스처+`tint`)임. `interactive`와 `pointerdown`은 `sprite`에만 걸려 있어 파란 쪽만 클릭됨. 위치도 달라 겹치지 않음을 설명함.

**사용자:**  
이 샘플만 보면 HTML `<canvas>`와 가장 큰 차이가, canvas 내부 요소에 개별 이벤트를 트리거할 수 있는 것 같다. 맞는지?

**어시스턴트:**  
Pixi도 결국 `<canvas>` 한 장을 씀. 차이는 “순수 Canvas API는 기본적으로 캔버스 요소 단위 이벤트만 오고, 도형별로는 좌표 히트 테스트를 직접 구현해야 함”에 가깝고, Pixi는 표시 객체 트리와 히트 테스트로 객체 단위 `pointerdown` 등을 제공한다고 정리함.

**사용자:**  
지금까지 나눈 대화를 `readme.md`를 참고해 `docs.md` 71번째 줄 아래에, 위 API 요약과 구분되게 마크다운으로 넣어 달라.

**어시스턴트:**  
요청대로 API 요약 아래에 구분선(`---`)과 본 대화 기록 절을 추가함.