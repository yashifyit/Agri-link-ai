type WebSocketCallback = (event: string, data: any) => void;

function buildWsUrl(): string {
  // Derive WebSocket URL from the configured API base
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
  try {
    const parsed = new URL(apiBase);
    const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${parsed.host}/ws/marketplace`;
  } catch {
    const isHttps = window.location.protocol === 'https:';
    return `${isHttps ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/ws/marketplace`;
  }
}

class RealtimeWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 2000;
  private pingIntervalTimer: any = null;
  private listeners: Set<WebSocketCallback> = new Set();
  private isConnecting = false;

  constructor() {
    this.url = buildWsUrl();
  }

  public connect(userId?: string, role?: string) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      const queryParams = new URLSearchParams();
      if (userId) queryParams.append('user_id', userId);
      if (role) queryParams.append('role', role);
      const wsUrl = `${this.url}?${queryParams.toString()}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to KisanLink Realtime Event Hub');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const payload = JSON.parse(event.data);
          const eventType = payload.event || 'UNKNOWN';
          const data = payload.data || payload;
          this.notifyListeners(eventType, data);
        } catch (err) {
          console.warn('[WebSocket] Non-JSON payload received:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected from KisanLink Realtime Event Hub');
        this.stopHeartbeat();
        this.isConnecting = false;
        this.scheduleReconnect(userId, role);
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.ws?.close();
      };
    } catch (e) {
      console.error('[WebSocket] Connection failed:', e);
      this.isConnecting = false;
      this.scheduleReconnect(userId, role);
    }
  }

  public subscribe(callback: WebSocketCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach((callback) => {
      try {
        callback(event, data);
      } catch (err) {
        console.error('[WebSocket] Error in event listener callback:', err);
      }
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private scheduleReconnect(userId?: string, role?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1), 10000);
      console.log(`[WebSocket] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(userId, role), delay);
    }
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const realtimeWS = new RealtimeWebSocketService();
