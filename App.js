import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useMemo } from "react";
import { Button, Text, View } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { requestMultiple, PERMISSIONS } from "react-native-permissions";
import styles from "./styles";

const App = () => {
  const manager = new BleManager();
  const [devices, setDevices] = useState([]);
  const [connectedDeviceId, setConnectedDeviceId] = useState("");
  let timer;

  // Request Android Permissions
  // TODO: Add iOS Permissions too
  const requestPermission = async () => {
    try {
      const granted = await requestMultiple([
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ]).then((statuses) => {
        // status after permission check.
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const scanAndConnect = () => {
    manager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.log({ error });
          // Handle error (scanning will be stopped automatically)
          return;
        }
        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        if (device.name !== undefined && device.name !== null) {
          console.log("device name " + device.name);
          setDevices((deviceList) => {
            return deviceList.indexOf((dev) => dev?.id === device?.id) === -1
              ? [...deviceList, device]
              : deviceList;
          });
        }
        if (
          device.name === "TI BLE Sensor Tag" ||
          device.name === "SensorTag"
        ) {
          // Stop scanning as it's not necessary if you are scanning for one device.
          manager.stopDeviceScan();
          // Proceed with connection.
        }
      }
    );
    // TODO: emove the below once we have the intended device details/id.
  };

  const getDetails = (device) => {
    console.log("Get Details function start");
    if (device && device?.id !== null) {
      manager
        .connectToDevice(device?.id)
        .then(() => {
          setConnectedDeviceId(device?.id);
          console.log(device?.name + "  connected !!!");
          manager
            .characteristicsForDevice(device?.id)
            .then((device) => {
              console.log({ device });
            })
            .catch((error) => {
              console.log("get all details error", error);
            });
          manager
            .servicesForDevice(device?.id)
            .then((device) => {
              console.log({ device });
            })
            .catch((error) => {
              console.log("get service error", error);
            });
        })
        .catch((error) => {
          console.log("connection error", error);
        });
    }
  };

  useEffect(() => {
    requestPermission();
    const subscription = manager.onStateChange((state) => {
      if (state === "PoweredOn") {
        scanAndConnect();
        subscription.remove();
        timer = setTimeout(() => manager.stopDeviceScan(), 2000);
      }
    }, true);
    return () => {
      subscription.remove();
      clearTimeout(timer);
    };
  }, []);

  const deviceConnectionText = useMemo(
    (device) => {
      if (connectedDeviceId === device?.id) {
        return null;
      } else {
        return (
          <Button
            style={styles.connectButton}
            color={"#bce4f5"}
            onPress={() => getDetails(dev)}
            title={"connect"}
          />
        );
      }
    },
    [devices, connectedDeviceId]
  );

  const deviceInfo = useMemo(() => {
    if (devices && devices?.length === 0) {
      return null;
    }
    try {
      return (
        <View>
          {devices?.map((dev, index) => {
            return (
              <View key={dev?.id + index} style={styles.deviceInfo}>
                <Text style={styles.deviceInfoText}>{dev.name}</Text>
                {deviceConnectionText}
              </View>
            );
          })}
        </View>
      );
    } catch (error) {
      console.log(error);
      return null;
    }
  }, [devices, getDetails]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.header}>Discoverables Devices :</Text>
      {deviceInfo}
    </View>
  );
};

export default App;
