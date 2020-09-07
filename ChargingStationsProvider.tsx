import React, { useContext, useMemo } from 'react';

const ChargingStationsContext = React.createContext({ });

interface Props {
  children?: any;
}

export const ChargingStationsProvider = (props: Props) => {
  const chargingStations = () => {
    return {};
  };


  const value = useMemo(() => {
    return {
      chargingStations,
    };
  }, [chargingStations]);

  return (
    <ChargingStationsContext.Provider value={value}>
      {props.children}
    </ChargingStationsContext.Provider>
  );
};

const useChargingStations: any = () => useContext(ChargingStationsContext);
export { ChargingStationsContext, useChargingStations };
export default ChargingStationsProvider;
