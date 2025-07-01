## 1. 프로젝트 개요

**mnu\_pub\_order\_system**은 목포대학교 축제(대동제)에서 학생 포차 운영을 돕기 위해 개발된 모바일 주문 시스템이다.
사용자는 QR코드를 통해 웹페이지에 접속하여 메뉴를 확인하고 직접 주문을 진행할 수 있으며,
운영자는 웹 기반의 주문 흐름을 통해 실시간으로 주문을 처리할 수 있다.

* 개발 조직: Capybara-Clinic
* 소프트웨어 라이선스: MIT License (오픈소스)

## 2. 리포지토리 구성

본 리포지토리는 현재 프론트엔드(Vue 기반 SPA)만 포함되며, 백엔드 소스코드는 포함되어 있지 않다.

### 최상위 폴더 구조

```
/mnu_pub_order_system
├── LICENSE
├── README.md
└── front-end/
```

> 백엔드 관련 디렉토리는 현재 포함되어 있지 않음.

---

## 3. 주요 기능

* 메뉴 목록 조회 및 수량 선택
* 주문 요약 및 확인
* 실시간 주문 완료 화면 출력
* 반응형 UI 설계

> ※ 실제 화면 UI 예시는 향후 assets/screenshots/ 등에서 제공하도록 업데이트 예정

---

## 4. 기술 스택

**프레임워크 및 핵심 라이브러리**

* Vue 3 (Composition API 기반 SPA)
* Vue Router (페이지 간 라우팅)
* Pinia (상태 관리)
* Axios (RESTful API 호출)
* TailwindCSS (유틸리티 기반 CSS 프레임워크)

**개발 도구 및 설정**

* Vue CLI
* Babel
* ESLint
* PostCSS

**주요 의존성**

* `vue`, `vue-router`, `pinia`, `axios`, `core-js` 등

**개발 의존성**

* `@vue/cli`, `tailwindcss`, `postcss`, `eslint`, `babel` 등

---

## 5. 디렉토리 설명 (front-end 기준)

* `/public/`
  정적 HTML 파일, favicon 등 포함

* `/src/`

  * `main.js`: 앱 진입점
  * `App.vue`: 최상위 루트 컴포넌트
  * `assets/`: 이미지 및 폰트 등 정적 리소스
  * `components/`: 공통 UI 컴포넌트
  * `pages/`: 페이지 단위 뷰 컴포넌트
  * `router/`: 라우팅 설정
  * `services/`: API 통신 모듈
  * `hooks/`: 커스텀 Composition 함수
  * `stores/`: Pinia 상태 저장소
  * `styles/`: Tailwind 및 글로벌 CSS 설정

* `package.json`: 종속성 및 실행 스크립트 정의

---

## 6. 실행 방법

### 6.1 개발 서버 실행

```bash
cd front-end
npm install
npm run serve
```

### 6.2 프로덕션 빌드

```bash
npm run build
```

### 6.3 Tailwind CSS 빌드/감시

```bash
npm run build:css
npm run watch:css
```

### 6.4 린트 검사

```bash
npm run lint
```
---

## 7. API 명세 (백엔드 연동 기준)

프론트엔드는 다음과 같은 백엔드 API와 통신하도록 설계되어 있습니다.
모든 API는 `http://<your-server-ip>:5000`을 Base URL로 사용합니다.

## API 요약표

| 번호 | 목적             | 메서드    | URL                                 | 프론트 사용 여부   |
| -- | -------------- | ------ | ----------------------------------- | ----------- |
| 1  | 전체 메뉴 조회       | GET    | `/menu`                             | ✅ 사용자 메뉴 화면 |
| 2  | 주문 제출          | POST   | `/order/submit`                     | ✅ 사용자 주문 완료 |
| 3  | 전체 테이블 상태 조회   | GET    | `/cashier/tables`                   | ✅ 관리자 메인    |
| 4  | 주문 상태 변경       | PATCH  | `/cashier/orders/<order_id>/status` | ✅ 캐셔 상태 변경  |
| 5  | 주문 취소 및 재고 복구  | DELETE | `/cashier/order/<order_id>`         | ✅ 캐셔 취소 기능  |
| 6  | 결제 확인 처리       | POST   | `/cashier/confirm_order`            | ✅ 캐셔 결제 확인  |
| 7  | 주방 주문 목록 조회    | GET    | `/kitchen`                          | ✅ 주방 화면     |
| 8  | 서빙 대기 주문 목록 조회 | GET    | `/serving`                          | ✅ 서빙 대기 리스트 |
| 9  | 서빙 완료 처리       | POST   | `/serving/complete`                 | ✅ 서빙 완료 버튼  |


### 공통 사항

* **Base URL**: `http://<your-server-ip>:5000`
* **Content-Type**: `application/json`

---

### 7.1 메뉴 관련

#### 1) 전체 메뉴 조회

* **GET** `/menu`
* 사용자가 볼 수 있는 메뉴 목록 조회

**응답 예시**:

```json
[
  {
    "menu_id": 1,
    "menu_name": "김치볶음밥",
    "price": 7000,
    "stock_quantity": 8,
    "is_available": true
  }
]
```

---

### 7.2 주문 관련

#### 2) 주문 제출

* **POST** `/order/submit`
* 사용자가 메뉴를 선택 후 주문을 서버에 제출함

**요청 예시**:

```json
{
  "table_id": 1,
  "depositor": "홍길동",
  "items": [
    { "menu_id": 1, "quantity": 2 },
    { "menu_id": 2, "quantity": 1 }
  ]
}
```

**응답 예시**:

```json
{
  "message": "주문이 완료되었습니다.",
  "order_id": 3
}
```

---

### 7.3 테이블 및 주문 상태 관련

#### 3) 테이블별 주문 상태 확인

* **GET** `/cashier/tables`
* 전체 테이블의 사용 여부, 최신 주문 상태, 주문 합계 등 조회

**응답 예시**:

```json
[
  {
    "table_id": 1,
    "is_occupied": true,
    "latest_order_status": "결제확인",
    "latest_order_time": "2025-05-26 17:22",
    "total_amount_sum": 35000
  }
]
```

---

#### 4) 주문 상태 변경

* **PATCH** `/cashier/orders/<order_id>/status`
* 캐셔가 주문의 상태를 변경 (예: 결제확인, 완료, 취소)

**요청 예시**:

```json
{
  "order_status": "결제확인"
}
```

**응답 예시**:

```json
{
  "success": true,
  "order_id": 5,
  "order_status": "결제확인",
  "message": "주문 상태가 변경되었습니다."
}
```

---

#### 5) 주문 삭제 (취소 및 재고 복구)

* **DELETE** `/cashier/order/<order_id>`
* 주문을 취소하고, 관련 메뉴의 재고를 복구

**응답 예시**:

```json
{
  "message": "주문이 취소되었고, 재고가 복구되었습니다.",
  "order_id": 5
}
```

---

#### 6) 결제 확인 (캐셔)

* **POST** `/cashier/confirm_order`
* 입금 확인 후 주문 상태를 `결제확인`으로 업데이트

**요청 예시**:

```json
{
  "order_id": 3
}
```

**응답 예시**:

```json
{
  "message": "결제가 확인되었습니다.",
  "order_id": 3
}
```

---

### 7.4 주방/서빙 관련

#### 7) 주방 주문 목록 조회

* **GET** `/kitchen`
* `결제확인` 상태인 주문들을 주방 화면에서 확인

**응답 예시**:

```json
[
  {
    "order_id": 1,
    "table_id": 3,
    "depositor_name": "김도은",
    "items": [
      {
        "menu_name": "감바스",
        "quantity": 2
      }
    ]
  }
]
```

---

#### 8) 서빙 대기 주문 목록 조회

* **GET** `/serving`
* 조리 완료 상태지만 아직 서빙되지 않은 주문 목록

**응답 예시**:

```json
[
  {
    "order_id": 5,
    "table_id": 2,
    "items": [
      {
        "menu_name": "파스타",
        "quantity": 1
      }
    ]
  }
]
```

---

#### 9) 서빙 완료 처리

* **POST** `/serving/complete`
* 특정 주문을 서빙 완료 처리함

**요청 예시**:

```json
{
  "order_id": 5
}
```

**응답 예시**:

```json
{
  "message": "서빙 완료 처리되었습니다.",
  "order_id": 5
}
```

---

### 7.5 주문 상태값 정의

| 상태코드 | 의미                |
| ---- | ----------------- |
| 결제대기 | 사용자가 주문 후 입금 전 상태 |
| 결제확인 | 입금 확인 후 조리 대기 상태  |
| 완료   | 조리 완료 상태          |
| 취소   | 주문이 취소됨           |

---

## 8. 기여 가이드

본 프로젝트는 오픈소스로 운영되며 누구나 기여할 수 있다.

### 기여 절차

1. 리포지토리를 fork 한다.
2. 새로운 브랜치를 생성한다.
   예: `feature/menu-filter`
3. 코드를 작성한 후 커밋한다.
4. PR(Pull Request)를 생성하고 설명을 명확히 작성한다.
5. 리뷰 및 병합을 기다린다.

> ESLint 및 코드 스타일을 준수해 주세요.

---

## 9. 라이선스

본 프로젝트는 MIT 라이선스를 따릅니다.
자세한 내용은 `LICENSE` 파일을 참조하시기 바랍니다.
