import { useState, useEffect, useCallback, useRef } from 'react';
import { mqttService, type MQTTConfig, type MQTTMessage } from '@/lib/mqtt-service';

export function useMQTT(experimentId: string) {
    const [isConnected, setIsConnected] = useState(mqttService.isConnected());
    const [config, setConfig] = useState<MQTTConfig | null>(mqttService.getConfig());
    const subscriptionsRef = useRef<Map<string, (topic: string, message: MQTTMessage) => void>>(new Map());

    useEffect(() => {
        // Listen for connection state changes
        const handleConnectionChange = (connected: boolean) => {
            setIsConnected(connected);
        };

        mqttService.onConnectionStateChange(handleConnectionChange);

        return () => {
            mqttService.offConnectionStateChange(handleConnectionChange);
        };
    }, []);

    const connect = useCallback(async (newConfig: MQTTConfig) => {
        try {
            await mqttService.connect(newConfig);
            setConfig(newConfig);
            return true;
        } catch (error) {
            console.error('Failed to connect to MQTT broker:', error);
            return false;
        }
    }, []);

    const disconnect = useCallback(() => {
        mqttService.disconnect();
    }, []);

    const publishInput = useCallback((inputId: string, value: boolean) => {
        const topic = mqttService.buildTopic(experimentId, 'input', inputId);
        mqttService.publish(topic, value, 'web');
    }, [experimentId]);

    const publishOutput = useCallback((outputId: string, value: boolean) => {
        const topic = mqttService.buildTopic(experimentId, 'output', outputId);
        mqttService.publish(topic, value, 'web');
    }, [experimentId]);

    const subscribeToInput = useCallback((
        inputId: string,
        callback: (value: boolean, source: 'web' | 'hardware') => void
    ) => {
        const topic = mqttService.buildTopic(experimentId, 'input', inputId);

        const messageHandler = (_topic: string, message: MQTTMessage) => {
            // Only process messages from hardware to avoid loops
            if (message.source === 'hardware') {
                callback(message.value, message.source);
            }
        };

        subscriptionsRef.current.set(topic, messageHandler);
        mqttService.subscribe(topic, messageHandler);

        return () => {
            const handler = subscriptionsRef.current.get(topic);
            if (handler) {
                mqttService.unsubscribe(topic, handler);
                subscriptionsRef.current.delete(topic);
            }
        };
    }, [experimentId]);

    const subscribeToOutput = useCallback((
        outputId: string,
        callback: (value: boolean, source: 'web' | 'hardware') => void
    ) => {
        const topic = mqttService.buildTopic(experimentId, 'output', outputId);

        const messageHandler = (_topic: string, message: MQTTMessage) => {
            callback(message.value, message.source);
        };

        subscriptionsRef.current.set(topic, messageHandler);
        mqttService.subscribe(topic, messageHandler);

        return () => {
            const handler = subscriptionsRef.current.get(topic);
            if (handler) {
                mqttService.unsubscribe(topic, handler);
                subscriptionsRef.current.delete(topic);
            }
        };
    }, [experimentId]);

    // Cleanup all subscriptions on unmount
    useEffect(() => {
        return () => {
            subscriptionsRef.current.forEach((handler, topic) => {
                mqttService.unsubscribe(topic, handler);
            });
            subscriptionsRef.current.clear();
        };
    }, []);

    return {
        isConnected,
        config,
        connect,
        disconnect,
        publishInput,
        publishOutput,
        subscribeToInput,
        subscribeToOutput,
    };
}
