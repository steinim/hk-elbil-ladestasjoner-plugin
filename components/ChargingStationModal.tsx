import React, { useImperativeHandle, useRef } from 'react';
import HKModal from './HKModal';
import { View, Text, Button } from 'native-base';
import { typography } from 'styles';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ChargingStationsContext, useChargingStations } from '../ChargingStationsProvider';

const ChargingStationModal = React.forwardRef((_, ref: any) => {
  const hkModalRef = useRef(null);
  const { currentStation } = useChargingStations();

  useImperativeHandle(ref, () => ({
    open: () => hkModalRef.current.open(),
  }));

  return (
    <ChargingStationsContext.Consumer>
      {() => (
        <HKModal ref={hkModalRef}>
          <View style={{ marginHorizontal: 50 }} accessibilityLabel="ChargingStationModal">
            <Text
              style={[
                { marginTop: 30,
                  marginLeft: 30,
                  marginRight: 30,
                  marginBottom: 10,
                  fontSize: 18,
                  textAlign: 'center' },
                 typography.textBold,
              ]}
            >
              {currentStation().name}
            </Text>
            <Text style={[typography.textCenter, typography.textSmall]}>
             {currentStation().street} {currentStation().house_number}, {currentStation().zipcode} {currentStation().city}
            </Text>
            <Text style={[typography.textBold,
                          typography.textCenter,
                          {marginTop: 30},
                        ]}>Antall ladepunkter: {currentStation().number_charging_points}
            </Text>
            {currentStation().description_of_location
              ? <Text style={[typography.textCenter, {marginTop: 30}]}>
                  <Text style={typography.textBold}>Beskrivelse av stedet:{'\n'}</Text>
                  <Text>{currentStation().description_of_location}</Text>
                </Text>
              : <Text></Text>
            }
            {currentStation().user_comment
              ? <Text style={[typography.textCenter, {marginTop: 30}]}>
                  <Text style={typography.textBold}>Brukerkommentarer:{'\n'}</Text>
                  <Text>{currentStation().user_comment}</Text>
                </Text>
              : <Text></Text>
            }
            {currentStation().owned_by &&
              <Text style={[typography.textCenter, {marginTop: 30}]}>Ladestasjonen eies av {currentStation().owned_by}</Text>
            }
          </View>
        </HKModal>
      )}
      </ChargingStationsContext.Consumer>
  );
});

export default ChargingStationModal;
