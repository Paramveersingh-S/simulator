import mqtt, { MqttClient } from 'mqtt';

export interface MQTTConfig {
  brokerUrl: string;
  port?: number;
  username?: string;
  password?: string;
  topicPrefix?: string;
  clientId?: string;
}

export interface MQTTMessage {
  value: boolean;
  timestamp: number;
  source: 'web' | 'hardware';
}

export type MessageCallback = (topic: string, message: MQTTMessage) => void;

class MQTTService {
  private client: MqttClient | null = null;
  private config: MQTTConfig | null = null;
  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();
  private connectionStateCallbacks: Set<(connected: boolean) => void> = new Set();
  private connected: boolean = false;

  constructor() {
    // Load saved config from localStorage if available
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem('mqtt-config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Failed to load MQTT config:', error);
    }
  }

  private saveConfig() {
    if (this.config) {
      try {
        localStorage.setItem('mqtt-config', JSON.stringify(this.config));
      } catch (error) {
        console.error('Failed to save MQTT config:', error);
      }
    }
  }

  public getConfig(): MQTTConfig | null {
    return this.config;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public connect(config: MQTTConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      // Disconnect existing connection if any
      if (this.client) {
        this.disconnect();
      }

      this.config = config;
      this.saveConfig();

      const brokerUrl = config.brokerUrl;
      const clientId = config.clientId || `circuitsim_${Math.random().toString(16).slice(2, 10)}`;

      console.log('[MQTT] Connecting to broker:', brokerUrl);

      const options: mqtt.IClientOptions = {
        clientId,
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
      };

      if (config.username) {
        options.username = config.username;
      }

      if (config.password) {
        options.password = config.password;
      }

      try {
        this.client = mqtt.connect(brokerUrl, options);

        this.client.on('connect', () => {
          console.log('[MQTT] Connected successfully');
          this.connected = true;
          this.notifyConnectionState(true);
          resolve();
        });

        this.client.on('error', (error) => {
          console.error('[MQTT] Connection error:', error);
          this.connected = false;
          this.notifyConnectionState(false);
          reject(error);
        });

        this.client.on('close', () => {
          console.log('[MQTT] Connection closed');
          this.connected = false;
          this.notifyConnectionState(false);
        });

        this.client.on('reconnect', () => {
          console.log('[MQTT] Reconnecting...');
        });

        this.client.on('message', (topic, payload) => {
          try {
            const message: MQTTMessage = JSON.parse(payload.toString());
            this.handleMessage(topic, message);
          } catch (error) {
            console.error('[MQTT] Failed to parse message:', error);
          }
        });
      } catch (error) {
        console.error('[MQTT] Failed to create client:', error);
        reject(error);
      }
    });
  }

  public disconnect() {
    if (this.client) {
      console.log('[MQTT] Disconnecting...');
      this.client.end(true);
      this.client = null;
      this.connected = false;
      this.notifyConnectionState(false);
    }
  }

  public publish(topic: string, value: boolean, source: 'web' | 'hardware' = 'web') {
    if (!this.client || !this.connected) {
      console.warn('[MQTT] Cannot publish, not connected');
      return;
    }

    const message: MQTTMessage = {
      value,
      timestamp: Date.now(),
      source,
    };

    const payload = JSON.stringify(message);
    
    this.client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        console.error('[MQTT] Publish error:', error);
      } else {
        console.log(`[MQTT] Published to ${topic}:`, message);
      }
    });
  }

  public subscribe(topic: string, callback: MessageCallback) {
    if (!this.client || !this.connected) {
      console.warn('[MQTT] Cannot subscribe, not connected');
      return;
    }

    // Add callback to the set
    if (!this.messageCallbacks.has(topic)) {
      this.messageCallbacks.set(topic, new Set());
      
      // Subscribe to the topic
      this.client.subscribe(topic, { qos: 1 }, (error) => {
        if (error) {
          console.error('[MQTT] Subscribe error:', error);
        } else {
          console.log('[MQTT] Subscribed to:', topic);
        }
      });
    }

    this.messageCallbacks.get(topic)!.add(callback);
  }

  public unsubscribe(topic: string, callback?: MessageCallback) {
    if (callback) {
      // Remove specific callback
      const callbacks = this.messageCallbacks.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        
        // If no more callbacks, unsubscribe from topic
        if (callbacks.size === 0) {
          this.messageCallbacks.delete(topic);
          if (this.client && this.connected) {
            this.client.unsubscribe(topic);
            console.log('[MQTT] Unsubscribed from:', topic);
          }
        }
      }
    } else {
      // Remove all callbacks for this topic
      this.messageCallbacks.delete(topic);
      if (this.client && this.connected) {
        this.client.unsubscribe(topic);
        console.log('[MQTT] Unsubscribed from:', topic);
      }
    }
  }

  private handleMessage(topic: string, message: MQTTMessage) {
    const callbacks = this.messageCallbacks.get(topic);
    if (callbacks) {
      callbacks.forEach(callback => callback(topic, message));
    }
  }

  public onConnectionStateChange(callback: (connected: boolean) => void) {
    this.connectionStateCallbacks.add(callback);
    // Immediately notify of current state
    callback(this.connected);
  }

  public offConnectionStateChange(callback: (connected: boolean) => void) {
    this.connectionStateCallbacks.delete(callback);
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionStateCallbacks.forEach(callback => callback(connected));
  }

  public buildTopic(experimentId: string, type: 'input' | 'output', id: string): string {
    const prefix = this.config?.topicPrefix || 'circuitsim';
    return `${prefix}/${experimentId}/${type}/${id}`;
  }
}

// Singleton instance
export const mqttService = new MQTTService();
