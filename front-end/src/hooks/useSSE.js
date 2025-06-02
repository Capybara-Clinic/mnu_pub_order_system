import { onMounted, onUnmounted } from 'vue';

export function useSSE(url, onMessage) {
  let eventSource = null;

  onMounted(() => {
    eventSource = new EventSource(url);
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) {
        console.error('SSE parsing error:', err);
      }
    };
  });

  onUnmounted(() => {
    if (eventSource) {
      eventSource.close();
    }
  });
}
