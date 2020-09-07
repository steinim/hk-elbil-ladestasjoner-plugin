import React from 'react';
import { Container } from 'native-base';
import ChargingStationsProvider from '../ChargingStationsProvider';
import ChargingStationMap from '../components/ChargingStationMap';

export const ChargingStations = (): JSX.Element => {
  return (
    <ChargingStationsProvider>
      <Container style={{ padding: 20 }}>
        <ChargingStationMap />
      </Container>
    </ChargingStationsProvider>
  );
};

export default ChargingStations;
