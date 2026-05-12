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