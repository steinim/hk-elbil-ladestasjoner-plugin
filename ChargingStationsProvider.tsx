import React, { useContext, useMemo, useState } from 'react';
import { AsyncStorage } from 'react-native';

const ChargingStationsContext = React.createContext({ });

interface Props {
  children?: any;
}

export const ChargingStationsProvider = (props: Props) => {

  const [chargingStationsState, setChargingStationsState] = useState([]);
  const [currentStationState, setCurrentStationState] = useState([]);
  const [currentConnectorsState, setCurrentConnectorsState] = useState([]);

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
    // console.log(getObjValues(station.connectors));
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
    // console.log(getObjValues(connectors));
    _storeData(connectors);
    setCurrentConnectorsState(connectors);
  };

  const value = useMemo(() => {
    return {
      chargingStations,
      setChargingStations,
      currentStation,
      setCurrentStation,
      currentConnectors,
      setCurrentConnectors,
    };
  }, [chargingStationsState, currentStationState, currentConnectorsState]);

  return (
    <ChargingStationsContext.Provider value={value}>
      {props.children}
    </ChargingStationsContext.Provider>
  );
};

const useChargingStations: any = () => useContext(ChargingStationsContext);
export { ChargingStationsContext, useChargingStations };
export default ChargingStationsProvider;
