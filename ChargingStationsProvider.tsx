import React, { useContext, useMemo, useState } from 'react';
import { Platform, AsyncStorage } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const ChargingStationsContext = React.createContext({ });

interface Props {
  children?: any;
}

export const ChargingStationsProvider = (props: Props) => {

  const [chargingStationsState, setChargingStationsState] = useState([]);
  const [currentStationState, setCurrentStationState] = useState([]);
  const [currentConnectorsState, setCurrentConnectorsState] = useState([]);
  const [locationState, setLocationState] = useState([]);

  const chargingStations = () => {
    return chargingStationsState;
  };

  const setChargingStations = (stations) => {
    const _storeData = async (c) => {
      try {
        await AsyncStorage.setItem('chargingStationsState', JSON.stringify(c));
      } catch (error) {
        console.log('save error', error);
      }
    };
    _storeData(stations);
    setChargingStationsState(stations);
  };

  const currentStation = () => {
    return currentStationState;
  };

  const setCurrentStation = (station) => {
    const _storeData = async (c) => {
      try {
        await AsyncStorage.setItem('currentStationState', JSON.stringify(c));
      } catch (error) {
        console.log('save error', error);
      }
    };
    _storeData(station);
    setCurrentStationState(station);
  };

  const currentConnectors = () => {
    return currentConnectorsState;
  };

  const setCurrentConnectors = (connectors) => {
    const _storeData = async (c) => {
      try {
        await AsyncStorage.setItem('currentConnectorsState', JSON.stringify(c));
      } catch (error) {
        console.log('save error', error);
      }
    };
    _storeData(connectors);
    setCurrentConnectorsState(connectors);
  };

  const setLocation = (loc) => {
    const _storeData = async (c) => {
      try {
        await AsyncStorage.setItem('locationState', JSON.stringify(c));
      } catch (error) {
        console.log('save error', error);
      }
    };
    _storeData(loc);
    setLocationState(loc);
  };

  const setInitialLocation = () => {
    try {
      request(
          Platform.select({
            android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          })
        ).then(res => {
          if (res === 'granted') {
            Geolocation.getCurrentPosition(
              position => {
                const {latitude, longitude} = position.coords;
                console.log(position.coords);
                setLocation({
                  latitude,
                  longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              },
              error => {
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 10000}
            );
          }
        });
      } catch (error) {
        console.log('location set error:', error);
      }
  };

  const location = () => {
    if (!locationState) {
      setTimeout(() => { setInitialLocation(); }, 1000);
      console.log('location state:', locationState);
    }
    return locationState;
  };

  const value = useMemo(() => {
    return {
      chargingStations,
      setChargingStations,
      currentStation,
      setCurrentStation,
      currentConnectors,
      setCurrentConnectors,
      location,
      setLocation,
    };
  }, [chargingStationsState, currentStationState, currentConnectorsState, locationState]);

  return (
    <ChargingStationsContext.Provider value={value}>
      {props.children}
    </ChargingStationsContext.Provider>
  );
};

const useChargingStations: any = () => useContext(ChargingStationsContext);
export { ChargingStationsContext, useChargingStations };
export default ChargingStationsProvider;
