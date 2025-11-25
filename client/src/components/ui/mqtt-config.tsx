import { useState, useEffect } from 'react';
import { mqttService, type MQTTConfig } from '@/lib/mqtt-service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wifi, WifiOff, Settings } from 'lucide-react';

interface MQTTConfigProps {
    isConnected: boolean;
    onConnect: (config: MQTTConfig) => Promise<boolean>;
    onDisconnect: () => void;
}

export function MQTTConfigDialog({ isConnected, onConnect, onDisconnect }: MQTTConfigProps) {
    const [open, setOpen] = useState(false);
    const [brokerUrl, setBrokerUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [topicPrefix, setTopicPrefix] = useState('circuitsim');
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        // Load saved config
        const savedConfig = mqttService.getConfig();
        if (savedConfig) {
            setBrokerUrl(savedConfig.brokerUrl);
            setUsername(savedConfig.username || '');
            setPassword(savedConfig.password || '');
            setTopicPrefix(savedConfig.topicPrefix || 'circuitsim');
        }
    }, []);

    const handleConnect = async () => {
        if (!brokerUrl.trim()) {
            alert('Please enter a broker URL');
            return;
        }

        setConnecting(true);
        try {
            const config: MQTTConfig = {
                brokerUrl: brokerUrl.trim(),
                username: username.trim() || undefined,
                password: password.trim() || undefined,
                topicPrefix: topicPrefix.trim() || 'circuitsim',
            };

            const success = await onConnect(config);
            if (success) {
                setOpen(false);
            } else {
                alert('Failed to connect to MQTT broker. Check console for details.');
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect to MQTT broker');
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = () => {
        onDisconnect();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    data-testid="button-mqtt-config"
                    aria-label="MQTT Settings"
                >
                    {isConnected ? (
                        <Wifi className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-slate-400" />
                    )}
                    {isConnected && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-100">
                        <Settings className="w-5 h-5" />
                        MQTT Configuration
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Connect to your MQTT broker to sync with physical hardware
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between p-3 rounded-md bg-slate-900/50 border border-slate-700">
                        <span className="text-sm text-slate-400">Status:</span>
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm font-semibold text-emerald-400">Connected</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-400">Disconnected</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Broker URL */}
                    <div className="space-y-2">
                        <Label htmlFor="broker-url" className="text-slate-300">
                            Broker URL
                        </Label>
                        <Input
                            id="broker-url"
                            type="text"
                            placeholder="ws://broker.hivemq.com:8000/mqtt"
                            value={brokerUrl}
                            onChange={(e) => setBrokerUrl(e.target.value)}
                            disabled={isConnected}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                        <p className="text-xs text-slate-500">
                            Use ws:// or wss:// for WebSocket connection
                        </p>
                    </div>

                    {/* Topic Prefix */}
                    <div className="space-y-2">
                        <Label htmlFor="topic-prefix" className="text-slate-300">
                            Topic Prefix
                        </Label>
                        <Input
                            id="topic-prefix"
                            type="text"
                            placeholder="circuitsim"
                            value={topicPrefix}
                            onChange={(e) => setTopicPrefix(e.target.value)}
                            disabled={isConnected}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                        <p className="text-xs text-slate-500">
                            Topics: {topicPrefix}/[experiment]/input|output/[id]
                        </p>
                    </div>

                    {/* Username (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-slate-300">
                            Username (Optional)
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isConnected}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                    </div>

                    {/* Password (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-300">
                            Password (Optional)
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isConnected}
                            className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isConnected ? (
                        <Button
                            onClick={handleDisconnect}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            data-testid="button-mqtt-disconnect"
                        >
                            <WifiOff className="w-4 h-4 mr-2" />
                            Disconnect
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            disabled={connecting || !brokerUrl.trim()}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            data-testid="button-mqtt-connect"
                        >
                            <Wifi className="w-4 h-4 mr-2" />
                            {connecting ? 'Connecting...' : 'Connect'}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
