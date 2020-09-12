import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { View } from 'native-base';
import MapView from 'react-native-map-clustering';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChargingStationsContext, useChargingStations } from '../ChargingStationsProvider';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';

export const ChargingStationMap = (): JSX.Element => {
  const { chargingStations, setChargingStations } = useChargingStations();
  const [isMapReady, setIsMapReady] = useState(false);
  const [region, setRegion] = useState({
    latitude: 59.396173,
    longitude: 5.2929257,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
});
  let mapRef = useRef(null);

  const fetchChargingStations = async () => {
    let fetchUrl = 'https://nobil-proxy.hkraft.dev';

    axios
      .get(fetchUrl, {
        headers: {
          accept: `application/json`,
        },
        params: {
          limit: 300,
          distance: 30000,
        },
      })
      .then((e) => {
        let locations = e.data.map((item) => {
          return {
            id: item.csmd.id,
            name: item.csmd.name,
            latitude: parseFloat(item.csmd.Position.split(',')[0].slice(1)),
            longitude: parseFloat(item.csmd.Position.split(',')[1].slice(0, -1)),
            number_charging_points: Number(item.csmd.Number_charging_points),
            available_charging_points: Number(item.csmd.Available_charging_points),
            station_status: item.csmd.Station_status,
            distance: item.csmd.distance,
            owned_by: item.csmd.Owned_by,
            street: item.csmd.Street,
            house_number: item.csmd.House_number,
            zipcode: item.csmd.Zipcode,
            city: item.csmd.City,
            county: item.csmd.County,
            county_id: item.csmd.County_ID,
            municipality: item.csmd.Municipality,
            municipality_id: item.csmd.Municipality_ID,
            country_code: item.csmd.Land_code,
            international_id: item.csmd.International_id,
            description_of_location: item.csmd.Description_of_location,
            contact_info: item.csmd.Contact_info,
            user_comment: item.csmd.User_comment,
            image: item.csmd.Image,
            created: item.csmd.Created,
            updated: item.csmd.Updated,
          };
        });
        let chargers = {
          timestamp: new Date(),
          data: locations,
        };
        // console.log(chargers);
        setChargingStations(chargers);
      })
      .catch((err) => {
        console.log('error fetching charging stations', err);
      });
  };

  const onRegionChangeComplete = (selectedRegion) => {
    setRegion(selectedRegion);
  };

  const onMapReady = () => {
    if (!isMapReady) {
        setIsMapReady(true);
    }
  };

  const animateToRegion = () => {
    const currentLocation = Geolocation.getCurrentPosition(info => {
      return {
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    });
    console.log('Current is:', Geolocation.getCurrentPosition(info => {
      return info;
    }));
    // console.log(currentLocation);
    mapRef.current.animateToRegion(region, 1000);
  };

  useEffect(() => {
    const lastTenMinutes = new Date();
    if (!chargingStations().timestamp || chargingStations().timestamp < lastTenMinutes) {
      lastTenMinutes.setHours(lastTenMinutes.getMinutes() - 10);
    }
    fetchChargingStations();
  }, []);

  useEffect(() => {
    animateToRegion(); // cool effect to use for later
},
[region]);

  return (
    <ChargingStationsContext.Consumer>
      {() => (
        <View style={StyleSheet.absoluteFillObject}>
          <MapView ref={mapRef}
                   provider={PROVIDER_GOOGLE}
                   style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                   onMapReady={onMapReady}
                   initialRegion={region}
                   onRegionChangeComplete={(selectedRegion) => onRegionChangeComplete(selectedRegion)}
          >
           {chargingStations().data &&
              chargingStations().data.length > 0 &&
              chargingStations().data.map((item) => (
                <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} image={require('../assets/pin.png')} />
              ))}
          </MapView>
        </View>
      )}
    </ChargingStationsContext.Consumer>
  );
};

export default ChargingStationMap;
