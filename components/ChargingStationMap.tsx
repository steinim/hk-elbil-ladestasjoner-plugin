import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { View, Text } from 'native-base';
import MapView from 'react-native-map-clustering';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ChargingStationsContext, useChargingStations } from '../ChargingStationsProvider';
import ChargingStationModal from '../components/ChargingStationModal';
import axios from 'axios';

export const ChargingStationMap = (): JSX.Element => {

  const NORDEN = 3600000;
  const { chargingStations, setChargingStations, setCurrentStation, setCurrentConnectors, location, setLocation } = useChargingStations();
  const chargingStationModalRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [fetching, setShouldFetch] = useState(false);

  const initialLocation = {
    latitude: 59.396173,
    longitude: 5.2929257,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  const mb = 1000000;

  let mapRef = useRef<MapView>(null);

  const fetchChargingStations = async (region, distance) => {
    setShouldFetch(true);
    let fetchUrl = 'https://nobil-proxy.hkraft.dev';

    let stationArray = [];
    let prefetchedStations = [];
    if (chargingStations() && chargingStations().data) {
      prefetchedStations = chargingStations().data;
      prefetchedStations.forEach(station => {
        stationArray.push(station.id);
      });
    }
    console.log('number of stations:', stationArray.length);
    let existingIds = stationArray.join(',');
    console.log(existingIds.substring(0, (mb / 2)));

    await axios
      .get(fetchUrl, {
        headers: {
          accept: `application/json`,
        },
        params: {
          limit: 4000,
          distance: distance,
          lat: region.latitude,
          long: region.longitude,
          existingids: existingIds.substring(0, (mb / 2)), // cap buffer at 0.5 MB
        },
      })
      .then((e) => {
        let fetchedStations = e.data.map((item) => {
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
        let stations = {
          timestamp: new Date(),
          data: fetchedStations.concat(prefetchedStations),
        };
        setChargingStations(stations);
        setShouldFetch(false);
      })
      .catch((err) => {
        console.log('error fetching charging stations', err);
      });
  };

  const getDistance = (region) => {
    let largestDelta = Math.max(region.latitudeDelta, region.longitudeDelta);
    // 1 degree is equal to approx 112000 meters
    let distance = largestDelta * 112000;
    if (distance > NORDEN) {
      return NORDEN;
    } else {
      return Math.round(distance);
    }
  };

  const currentLocation = () => {
    if (location().latitude) {
      return location();
    } else {
      return initialLocation;
    }
  };

  const updateCurrentLocation = (loc) => {
    // check if region is smaller
    // in that case du not fetch
    setLocation(loc);
    let distance = getDistance(loc);
    fetchChargingStations(loc, distance);
  };

  const onMapReady = () => {
    if (!mapReady) {
      setMapReady(true);
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
      let distance = getDistance(location);
      fetchChargingStations(location, distance);
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
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      position: 'absolute',
      zIndex: 20,
    },
  });

  return (
    <ChargingStationsContext.Consumer>
      {() => (
        <View style={StyleSheet.absoluteFillObject}>
        <ChargingStationModal ref={chargingStationModalRef}></ChargingStationModal>
          <MapView ref={mapRef}
                   provider={PROVIDER_GOOGLE}
                   style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
                   onMapReady={onMapReady}
                   initialRegion={currentLocation()}
                   onRegionChangeComplete={region => updateCurrentLocation(region)}
                   showsUserLocation={true}
                   minZoomLevel={0}
                   maxZoomLevel={20}
                   rotateEnabled={false}
          >
           { mapReady &&
              chargingStations().data &&
              chargingStations().data.length > 0 &&
              chargingStations().data.map((item) => (
                <Marker key={item.id}
                        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                        // title={item.name}
                        // description={item.description_of_location}
                        tracksViewChanges={!mapReady}
                        onPress={ () => openModal(item)}
                        >
                  <Image source={require('../assets/ev-charger-pin.png')}
                         style={{width: 36, height: 36}}
                         resizeMode="contain"/>
              </Marker>
              ))
              }
          </MapView>
{/*           {fetching &&
          <View style={styles.loading}>
            <Text>{'\n'}</Text>
            <ActivityIndicator size="large" color = {variable.kraftCyan}/>
          </View>
          } */}
        </View>
      )}
    </ChargingStationsContext.Consumer>
  );
};

export default ChargingStationMap;
