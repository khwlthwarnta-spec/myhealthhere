import React, { createContext, useContext, useState } from "react";

export type HealthMetric = {
  key: string;
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
};

type BluetoothContextType = {
  isConnected: boolean;
  connectedDevice: string | null;
  healthData: HealthMetric[];
  connect: (device: string, data: HealthMetric[]) => void;
  disconnect: () => void;
};

export const BluetoothContext = createContext<BluetoothContextType>({
  isConnected: false,
  connectedDevice: null,
  healthData: [],
  connect: () => {},
  disconnect: () => {},
});

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthMetric[]>([]);

  const connect = (device: string, data: HealthMetric[]) => {
    setIsConnected(true);
    setConnectedDevice(device);
    setHealthData(data);
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectedDevice(null);
    setHealthData([]);
  };

  return (
    <BluetoothContext.Provider value={{ isConnected, connectedDevice, healthData, connect, disconnect }}>
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  return useContext(BluetoothContext);
}
