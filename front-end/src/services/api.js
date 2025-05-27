// import axios from 'axios';

// // ✅ Vue CLI에서는 process.env 사용
// const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000';

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // 📌 1. 메뉴 및 주문 관련
// export const fetchMenuAndOrders = async (tableId) => {
//   const res = await api.get(`/menu/${tableId}`);
//   return res.data;
// };

// export const submitOrder = async ({ tableId, depositorName, items }) => {
//   const res = await api.post('/order/submit', {
//     table_id: tableId,
//     depositor_name: depositorName,
//     items,
//   });
//   return res.data;
// };

// // 📌 2. 주문 내역 조회 (옵션)
// export const fetchOrderHistoryByTable = async (tableId) => {
//   const res = await api.get(`/cashier/orders/table/${tableId}`);
//   return res.data;
// };

// // 📌 3. SSE 전용 URL 반환 함수 (브라우저에서 직접 사용)
// export const getStockSSEUrl = () => `${BASE_URL}/sse/menu/stocks`;

// // 📌 4. 메뉴 재고 정보
// export const fetchMenuStocks = async () => {
//   const res = await api.get('/menu/stocks');
//   return res.data;
// };

// export default api;
// import axios from 'axios'; // ❌ axios 제거

// axios import 제거: 실제 요청이 없으므로 불필요
// import axios from 'axios';

// 더미 응답 지연을 위한 헬퍼
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ 1. 메뉴 및 주문 관련
export const fetchMenuAndOrders = async (tableId) => {
  await wait(200);
  return {tableId, // just dummy.
    "active_orders": [],
    "categories": [
        {
            "category_id": 1,
            "category_name": "세트메뉴",
            "menus": [
                {
                    "description": "세트메뉴: 토마토 파스타와 콘치즈",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 1,
                    "menu_name": "토마토 파스타+콘치즈",
                    "price": 19900,
                    "stock_quantity": 98
                },
                {
                    "description": "세트메뉴: 에그인헬과 콘치즈",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 2,
                    "menu_name": "에그인헬+콘치즈",
                    "price": 19900,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 2,
            "category_name": "메인메뉴",
            "menus": [
                {
                    "description": "신선한 토마토로 만든 파스타",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 3,
                    "menu_name": "토마토 파스타",
                    "price": 15900,
                    "stock_quantity": 99
                },
                {
                    "description": "토마토 소스와 계란 요리",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 4,
                    "menu_name": "에그인헬",
                    "price": 15900,
                    "stock_quantity": 100
                },
                {
                    "description": "올리브오일과 마늘 그리고 새우로 맛을 낸 파스타",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 5,
                    "menu_name": "알리오 올리오",
                    "price": 16900,
                    "stock_quantity": 100
                },
                {
                    "description": "올리브오일에 새우를 넣은 스페인 요리",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 6,
                    "menu_name": "감바스",
                    "price": 16900,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 3,
            "category_name": "사이드",
            "menus": [
                {
                    "description": "사이드 메뉴: 고소한 콘치즈",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 7,
                    "menu_name": "콘치즈",
                    "price": 5900,
                    "stock_quantity": 100
                },
                {
                    "description": "사이드 메뉴: 맛있는 소시지 구이",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 8,
                    "menu_name": "소시지 구이",
                    "price": 5900,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 4,
            "category_name": "주류",
            "menus": [
                {
                    "description": "소오오주우우",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 9,
                    "menu_name": "소교수",
                    "price": 5000,
                    "stock_quantity": 100
                },
                {
                    "description": "매애애주우우",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 10,
                    "menu_name": "맥교수",
                    "price": 5000,
                    "stock_quantity": 100
                },
                {
                    "description": "하아이이보오르",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 11,
                    "menu_name": "팅키윙키",
                    "price": 5000,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 5,
            "category_name": "음료",
            "menus": [
                {
                    "description": "시원한 펩시",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 12,
                    "menu_name": "펩시",
                    "price": 2000,
                    "stock_quantity": 100
                },
                {
                    "description": "상쾌한 스프라이트",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 13,
                    "menu_name": "스프라이트",
                    "price": 2000,
                    "stock_quantity": 100
                }
            ]
        },
        {
            "category_id": 6,
            "category_name": "기타",
            "menus": [
                {
                    "description": "물",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 14,
                    "menu_name": "물추가",
                    "price": 500,
                    "stock_quantity": 100
                },
                {
                    "description": "앞접시 추가",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 15,
                    "menu_name": "앞접시",
                    "price": 0,
                    "stock_quantity": 100
                },
                {
                    "description": "숟가락 추가",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 16,
                    "menu_name": "숟가락",
                    "price": 0,
                    "stock_quantity": 100
                },
                {
                    "description": "젓가락 추가",
                    "image_url": null,
                    "is_available": true,
                    "menu_id": 17,
                    "menu_name": "젓가락",
                    "price": 0,
                    "stock_quantity": 100
                }
            ]
        }
    ],
    "table_id": 1
  }
};

export const submitOrder = async ({ tableId, depositorName, phoneNumber, items }) => {
  await wait(200);
  
  // 실제 메뉴 가격 기반 계산을 위한 메뉴 데이터 (실제로는 DB에서 조회)
  const menuPrices = {
    1: 18000, // 감바스
    2: 15000, // 해물파전
    3: 12000, // 치킨윙
    4: 8000,  // 감자튀김
    5: 9000,  // 치즈볼
    6: 3000,  // 콜라
    7: 5000,  // 맥주
    8: 6000   // 아이스크림
  };
  
  const total_amount = items.reduce((acc, item) => {
    const price = menuPrices[item.menu_id] || 0;
    return acc + (item.quantity * price);
  }, 0);
  
  return {
    tableId,
    depositorName,
    phoneNumber,
    order_id: Math.floor(Math.random() * 1000) + 100, // 랜덤 주문 ID
    total_amount,
    message: "주문이 접수되었습니다.",
  };
};

// ✅ 2. 주문 내역 조회 (옵션)
export const fetchOrderHistoryByTable = async (tableId) => {
  await wait(200);
  return {
    tableId,
    orders: [
      {
        order_id: 10,
        order_status: "결제확인",
        created_at: "2024-01-15 14:30:00",
        items: [
          {
            menu_name: "감바스",
            quantity: 2,
            option: "기본",
            price: 18000
          },
          {
            menu_name: "콜라",
            quantity: 1,
            option: "기본",
            price: 3000
          }
        ],
        total_amount: 39000
      },
    ],
  };
};

// ✅ 3. SSE URL 반환 함수 (개발환경에서는 실제 동작하지 않음)
export const getStockSSEUrl = () => `http://localhost:8000/sse/menu/stocks`;

// ✅ 4. 메뉴 재고 정보 업데이트
export const fetchMenuStocks = async () => {
  await wait(200);
  return [
    {
      menu_id: 1,
      menu_name: "감바스",
      stock_quantity: 5,
      is_available: true,
    },
    {
      menu_id: 2,
      menu_name: "해물파전",
      stock_quantity: 3,
      is_available: true,
    },
    {
      menu_id: 3,
      menu_name: "치킨윙",
      stock_quantity: 0,
      is_available: false,
    }
  ];
};

// ✅ 5. SSE 시뮬레이션을 위한 추가 함수 (실제 환경에서는 불필요)
export const simulateStockUpdate = () => {
  // 실제 환경에서는 서버에서 SSE로 실시간 업데이트
  // 개발/테스트 환경에서만 사용
  return {
    menu_id: 1,
    stock_quantity: Math.floor(Math.random() * 10),
    is_available: Math.random() > 0.2 // 80% 확률로 available
  };
};
