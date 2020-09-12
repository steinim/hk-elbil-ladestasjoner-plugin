import React, { useContext, useMemo, useState } from 'react';
import { AsyncStorage } from 'react-native';

const ChargingStationsContext = React.createContext({ });

interface Props {
  children?: any;
}

export const ChargingStationsProvider = (props: Props) => {

  const [chargingStationsState, setChargingStationsState] = useState([]);

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

  const value = useMemo(() => {
    return {
      chargingStations,
      setChargingStations,
    };
  }, [chargingStationsState]);

  return (
    <ChargingStationsContext.Provider value={value}>
      {props.children}
    </ChargingStationsContext.Provider>
  );
};

const useChargingStations: any = () => useContext(ChargingStationsContext);
export { ChargingStationsContext, useChargingStations };
export default ChargingStationsProvider;
