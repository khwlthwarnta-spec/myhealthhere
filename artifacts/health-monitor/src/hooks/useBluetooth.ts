import { useState, useCallback, useRef } from "react";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

export type HealthData = {
  heartRate: number | null;
  battery: number | null;
  temperature: number | null;
  sensorLocation: string | null;
  lastUpdated: Date | null;
};

export type HeartRateHistory = { time: string; bpm: number }[];

const SENSOR_LOCATIONS: Record<number, string> = {
  0: "غير محدد",
  1: "الصدر",
  2: "المعصم",
  3: "الإصبع",
  4: "اليد",
  5: "شحمة الأذن",
  6: "القدم",
};

function parseHeartRate(value: DataView): number {
  const flags = value.getUint8(0);
  const isUint16 = flags & 0x1;
  return isUint16 ? value.getUint16(1, true) : value.getUint8(1);
}

function parseTemperature(value: DataView): number {
  const mantissa = ((value.getUint8(3) << 16) | (value.getUint8(2) << 8) | value.getUint8(1));
  const exponent = value.getInt8(0);
  return mantissa * Math.pow(10, exponent);
}

export function useBluetooth() {
  const [state, setState] = useState<ConnectionState>("disconnected");
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [data, setData] = useState<HealthData>({
    heartRate: null,
    battery: null,
    temperature: null,
    sensorLocation: null,
    lastUpdated: null,
  });
  const [history, setHistory] = useState<HeartRateHistory>([]);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const charRefs = useRef<BluetoothRemoteGATTCharacteristic[]>([]);

  const addHistory = (bpm: number) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setHistory((prev) => [...prev.slice(-29), { time, bpm }]);
  };

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError("متصفحك لا يدعم Web Bluetooth. استخدم Chrome أو Edge على جهاز كمبيوتر.");
      setState("error");
      return;
    }

    try {
      setState("connecting");
      setError(null);

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ["heart_rate"] },
          { services: ["health_thermometer"] },
          { services: ["0x180d"] },
        ],
        optionalServices: [
          "heart_rate",
          "battery_service",
          "health_thermometer",
          "device_information",
          "0x180d",
          "0x180f",
          "0x1809",
        ],
      });

      deviceRef.current = device;
      setDeviceName(device.name || "جهاز غير معروف");

      device.addEventListener("gattserverdisconnected", () => {
        setState("disconnected");
        setDeviceName(null);
        charRefs.current = [];
      });

      const server = await device.gatt!.connect();
      setState("connected");

      // --- Heart Rate ---
      try {
        const hrService = await server.getPrimaryService("heart_rate");

        try {
          const locationChar = await hrService.getCharacteristic("body_sensor_location");
          const locValue = await locationChar.readValue();
          const locCode = locValue.getUint8(0);
          setData((d) => ({ ...d, sensorLocation: SENSOR_LOCATIONS[locCode] ?? "غير معروف" }));
        } catch (_) {}

        const hrChar = await hrService.getCharacteristic("heart_rate_measurement");
        charRefs.current.push(hrChar);
        hrChar.addEventListener("characteristicvaluechanged", (e) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value!;
          const bpm = parseHeartRate(val);
          addHistory(bpm);
          setData((d) => ({ ...d, heartRate: bpm, lastUpdated: new Date() }));
        });
        await hrChar.startNotifications();
      } catch (_) {}

      // --- Battery ---
      try {
        const batService = await server.getPrimaryService("battery_service");
        const batChar = await batService.getCharacteristic("battery_level");
        charRefs.current.push(batChar);
        const batValue = await batChar.readValue();
        setData((d) => ({ ...d, battery: batValue.getUint8(0) }));
        batChar.addEventListener("characteristicvaluechanged", (e) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value!;
          setData((d) => ({ ...d, battery: val.getUint8(0) }));
        });
        await batChar.startNotifications().catch(() => {});
      } catch (_) {}

      // --- Temperature ---
      try {
        const tempService = await server.getPrimaryService("health_thermometer");
        const tempChar = await tempService.getCharacteristic("temperature_measurement");
        charRefs.current.push(tempChar);
        tempChar.addEventListener("characteristicvaluechanged", (e) => {
          const val = (e.target as BluetoothRemoteGATTCharacteristic).value!;
          const temp = parseTemperature(val);
          setData((d) => ({ ...d, temperature: +temp.toFixed(1), lastUpdated: new Date() }));
        });
        await tempChar.startNotifications();
      } catch (_) {}
    } catch (err: any) {
      if (err.name === "NotFoundError" || err.message?.includes("cancelled")) {
        setState("disconnected");
      } else {
        setError(err.message || "حدث خطأ أثناء الاتصال");
        setState("error");
      }
    }
  }, []);

  const disconnect = useCallback(async () => {
    charRefs.current.forEach((c) => c.stopNotifications().catch(() => {}));
    charRefs.current = [];
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;
    setState("disconnected");
    setDeviceName(null);
    setData({ heartRate: null, battery: null, temperature: null, sensorLocation: null, lastUpdated: null });
    setHistory([]);
    setError(null);
  }, []);

  return { state, deviceName, data, history, error, connect, disconnect };
}
