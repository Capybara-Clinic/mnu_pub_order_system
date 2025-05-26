import { onMounted, onUnmounted } from 'vue';

export function useSSE(url, onMessage) {
  let intervalId = null;

  // 더미 데이터 생성 함수 (원하는 구조에 맞게 조정 가능)
  const generateMockData = () => {
    return {
      timestamp: new Date().toISOString(),
      menu_id: 1,
      stock_quantity: Math.floor(Math.random() * 10),
    };
  };

  onMounted(() => {
    // 3초마다 가짜 데이터 전송
    intervalId = setInterval(() => {
      const mockData = generateMockData();
      onMessage(mockData);
    }, 3000);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
  // let eventSource = null;

  // onMounted(() => {
  //   eventSource = new EventSource(url);
  //   eventSource.onmessage = (e) => {
  //     try {
  //       const data = JSON.parse(e.data);
  //       onMessage(data);
  //     } catch (err) {
  //       console.error('SSE parsing error:', err);
  //     }
  //   };
  // });

  // onUnmounted(() => {
  //   if (eventSource) {
  //     eventSource.close();
  //   }
  // });
}
