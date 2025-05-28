export const mockData = {
    // 서빙 주문 가라데이터
    servingOrders: {
        orders: [
            {
                order_id: 10,
                table_id: 1,
                time: "2025-05-28T14:30:00Z",
                items: [
                    { menu_name: "감바스", quantity: 2, option: "기본" },
                    { menu_name: "파스타", quantity: 1, option: "매운맛" },
                    { menu_name: "맥주", quantity: 3, option: "차가운" }
                ]
            },
            {
                order_id: 11,
                table_id: 3,
                time: "2025-05-28T14:32:00Z",
                items: [
                    { menu_name: "스테이크", quantity: 1, option: "미디엄" },
                    { menu_name: "샐러드", quantity: 2, option: "기본" },
                    { menu_name: "와인", quantity: 1, option: "레드" }
                ]
            },
            {
                order_id: 12,
                table_id: 2,
                time: "2025-05-28T14:25:00Z",
                items: [
                    { menu_name: "피자", quantity: 1, option: "페퍼로니" },
                    { menu_name: "콜라", quantity: 2, option: "기본" }
                ]
            },
            {
                order_id: 13,
                table_id: 4,
                time: "2025-05-28T14:35:00Z",
                items: [
                    { menu_name: "치킨", quantity: 2, option: "양념" },
                    { menu_name: "소주", quantity: 1, option: "차가운" }
                ]
            }
        ]
    },

    // 주방 주문 가라데이터 (음식만)
    kitchenOrders: {
        orders: [
            {
                order_id: 14,
                table_id: 5,
                time: "2025-05-28T14:40:00Z",
                items: [
                    { menu_name: "김치찌개", quantity: 2, option: "매운맛" },
                    { menu_name: "계란말이", quantity: 1, option: "기본" }
                ]
            },
            {
                order_id: 15,
                table_id: 6,
                time: "2025-05-28T14:42:00Z",
                items: [
                    { menu_name: "된장찌개", quantity: 1, option: "순한맛" },
                    { menu_name: "불고기", quantity: 2, option: "기본" }
                ]
            }
        ]
    },

    // 메뉴 가라데이터
    menus: [
        { id: 1, name: "감바스", category: "요리", price: 15000, available: true },
        { id: 2, name: "파스타", category: "요리", price: 12000, available: true },
        { id: 3, name: "스테이크", category: "요리", price: 25000, available: true },
        { id: 4, name: "피자", category: "요리", price: 18000, available: true },
        { id: 5, name: "맥주", category: "주류", price: 4000, available: true },
        { id: 6, name: "소주", category: "주류", price: 3000, available: true },
        { id: 7, name: "와인", category: "주류", price: 8000, available: true },
        { id: 8, name: "콜라", category: "음료", price: 2000, available: true }
    ],

    // 테이블 가라데이터
    tables: [
        { id: 1, number: 1, status: "occupied", customers: 4 },
        { id: 2, number: 2, status: "occupied", customers: 2 },
        { id: 3, number: 3, status: "occupied", customers: 3 },
        { id: 4, number: 4, status: "occupied", customers: 2 },
        { id: 5, number: 5, status: "available", customers: 0 },
        { id: 6, number: 6, status: "available", customers: 0 }
    ],

    // 주문 목록 가라데이터
    orders: [
        {
            id: 1,
            table_id: 1,
            items: [
                { menu_name: "감바스", quantity: 2, price: 15000 },
                { menu_name: "맥주", quantity: 3, price: 4000 }
            ],
            total: 42000,
            status: "pending",
            created_at: "2025-05-28T14:30:00Z"
        },
        {
            id: 2,
            table_id: 2,
            items: [
                { menu_name: "파스타", quantity: 1, price: 12000 },
                { menu_name: "콜라", quantity: 2, price: 2000 }
            ],
            total: 16000,
            status: "completed",
            created_at: "2025-05-28T14:25:00Z"
        }
    ],

    // 재고 가라데이터
    inventory: [
        { id: 1, name: "새우", quantity: 50, unit: "개", min_quantity: 10 },
        { id: 2, name: "파스타면", quantity: 20, unit: "포", min_quantity: 5 },
        { id: 3, name: "소고기", quantity: 5, unit: "kg", min_quantity: 2 },
        { id: 4, name: "맥주", quantity: 100, unit: "병", min_quantity: 20 }
    ]
};
