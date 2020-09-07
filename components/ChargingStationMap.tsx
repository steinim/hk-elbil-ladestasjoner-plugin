import React from 'react';
import { View } from 'native-base';
import MapView from 'react-native-map-clustering';
import { Marker } from 'react-native-maps';
import { ChargingStationsContext, useChargingStations } from '../ChargingStationsProvider';
import axios from 'axios';

export const ChargingStationMap = (): JSX.Element => {
  const { chargingStations } = useChargingStations();

  const INITIAL_REGION = {
    latitude: 52.5,
    longitude: 19.2,
    latitudeDelta: 8.5,
    longitudeDelta: 8.5,
  };

  const fetchChargingStations = async () => {
    let fetchUrl = 'https://nobil-proxy.hkraft.dev';

    axios
      .get(fetchUrl, {
        headers: {
          accept: `application/json`,
        },
        params: {
          limit: 30,
          distance: 30000,
        },
      })
      .then((e) => {
        console.log(e.data);
      })
      .catch((err) => {
        console.log('error fetching charging stations', err);
      });
  };

  return (
    <ChargingStationsContext.Consumer>
      {() => (
        <View>
          <MapView initialRegion={INITIAL_REGION} style={{ flex: 1 }}>
            <Marker coordinate={{ latitude: 52.4, longitude: 18.7 }} />
            <Marker coordinate={{ latitude: 52.1, longitude: 18.4 }} />
            <Marker coordinate={{ latitude: 52.6, longitude: 18.3 }} />
            <Marker coordinate={{ latitude: 51.6, longitude: 18.0 }} />
            <Marker coordinate={{ latitude: 53.1, longitude: 18.8 }} />
            <Marker coordinate={{ latitude: 52.9, longitude: 19.4 }} />
            <Marker coordinate={{ latitude: 52.2, longitude: 21 }} />
            <Marker coordinate={{ latitude: 52.4, longitude: 21 }} />
            <Marker coordinate={{ latitude: 51.8, longitude: 20 }} />
          </MapView>
        </View>
      )}
    </ChargingStationsContext.Consumer>
  );
};

export default ChargingStationMap;
