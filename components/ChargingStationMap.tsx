import React, { useEffect, useRef, useState } from 'react';
import { Platform, Dimensions, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { View, Text } from 'native-base';
import MapView from 'react-native-map-clustering';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChargingStationsContext, useChargingStations } from '../ChargingStationsProvider';
import ChargingStationModal from '../components/ChargingStationModal';
import axios from 'axios';
import { PERMISSIONS, request } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import variable from '../../../native-base-theme/variables/material';
import { typography } from 'styles';

export const ChargingStationMap = (): JSX.Element => {
  const latitudeDelta = 0.05;
  const longitudeDelta = 0.05;
  const { chargingStations, setChargingStations, currentStation, setCurrentStation, setCurrentConnectors } = useChargingStations();
  const chargingStationModalRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [fetching, setShouldFetch] = useState(false);

  let mapRef = useRef(null);

  const fetchChargingStations = async () => {
    setShouldFetch(true);
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
            station: item.attr.st,
            connectors: item.attr.conn,
          };
        });
        let chargers = {
          timestamp: new Date(),
          data: locations,
        };
        setChargingStations(chargers);
        setShouldFetch(false);
      })
      .catch((err) => {
        console.log('error fetching charging stations', err);
      });
  };

  const getInitialRegion = () => {
    let initialRegion = {
      latitude: 59.396173,
      longitude: 5.2929257,
      latitudeDelta: latitudeDelta,
      longitudeDelta: longitudeDelta,
    };
    try {
      request(
          Platform.select({
            android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          })
        ).then(res => {
          if (res === 'granted') {
            Geolocation.getCurrentPosition(info => {
              initialRegion = {
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
              };
            });
          } else {
            console.log('Location is not enabled');
          }
        });
      } catch (error) {
        console.log('location set error:', error);
        return initialRegion;
      }
    return initialRegion;
  };

  const onMapReady = () => {
    if (!isMapReady) {
        setIsMapReady(true);
    }
  };

  const getObjValues = (e) => {
    let firstResult = Object.keys(e).map(k => e[k]);
    let result = [];
    for (let i = 0; i < firstResult.length; i++) {
      result.push(Object.keys(firstResult[0]).map(k => firstResult[0][k]));
  }
    return result;
  };

  const openModal = (station) => {
    setCurrentStation(station);
    setCurrentConnectors(getObjValues(station.connectors));
    chargingStationModalRef.current.open();
  };

  useEffect(() => {
    const lastTenMinutes = new Date();
    if (!chargingStations().timestamp || chargingStations().timestamp < lastTenMinutes) {
      lastTenMinutes.setHours(lastTenMinutes.getMinutes() - 10);
      fetchChargingStations();
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      width: 300,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    loading: {
      justifyContent: 'center',
      alignSelf: 'center',
    },
  });

  return (
    <ChargingStationsContext.Consumer>
      {() => (
        <View style={StyleSheet.absoluteFillObject}>
        <ChargingStationModal ref={chargingStationModalRef}></ChargingStationModal>
        {fetching &&
          <View style={styles.loading}>
            <Text>{'\n'}</Text>
            <ActivityIndicator size = "large" color = {variable.kraftCyan}/>
            <Text style={[typography.textLight]}>{'\n'}Leter etter ladestasjoner...</Text>
          </View>
          }
          <MapView ref={mapRef}
                   provider={PROVIDER_GOOGLE}
                   style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                   onMapReady={onMapReady}
                   initialRegion={getInitialRegion()}
                   showsUserLocation={true}
          >
           { isMapReady &&
              chargingStations().data &&
              chargingStations().data.length > 0 &&
              chargingStations().data.map((item) => (
                <Marker key={item.id}
                        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                        // title={item.name}
                        // description={item.description_of_location}
                        onPress={ () => openModal(item)}
                        >
                  <Image source={require('../assets/ev-charger-pin.png')}
                         style={{width: 36, height: 36}}
                         resizeMode="contain"/>
              </Marker>
              ))
              }
          </MapView>
        </View>
      )}
    </ChargingStationsContext.Consumer>
  );
};

export default ChargingStationMap;
