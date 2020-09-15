import React, { useImperativeHandle, useRef } from 'react';
import { Modalize } from 'react-native-modalize';
import { View, Text, List, ListItem } from 'native-base';
import { typography } from 'styles';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ChargingStationsContext, useChargingStations } from '../ChargingStationsProvider';
import { SvgCss } from 'react-native-svg';
import CloseButton from '../../../assets/CloseButton.svg';
import { Linking } from 'react-native';
import material from '../../../native-base-theme/variables/material';

type Props = {
  onClose?: () => void;
};

const ChargingStationModal = React.forwardRef((props: Props, ref: any) => {
  const { onClose } = props;
  const modalizeRef = useRef<Modalize>(null);
  const { currentStation, currentConnectors } = useChargingStations();

  useImperativeHandle(ref, () => ({
    open: () => modalizeRef.current?.open(),
  }));

  const styles = StyleSheet.create({
    header: {
      marginTop: 30,
      marginLeft: 30,
      marginRight: 30,
      marginBottom: 10,
      fontSize: 18,
      textAlign: 'center',
    },
    subheader: {
      marginTop: 10,
    },
    listheader: {
      marginTop: 20,
    },
    listitems: {
      margin: -10,
    },
    footer: {
      marginTop: 30,
    },
    link: {
      color: 'blue',
    },
  });

  return (
    <ChargingStationsContext.Consumer>
      {() => (
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        disableScrollIfPossible={false}
        childrenStyle={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          overflow: 'hidden',
          marginBottom: material.Inset.portrait.bottomInset,
        }}
        HeaderComponent={
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              position: 'absolute',
              right: 30,
              top: 30,
              transform: [{ rotate: '45deg' }],
            }}
            onPress={() => modalizeRef.current.close()}
          >
          <SvgCss xml={CloseButton} />
        </TouchableOpacity>
      }
      onClose={() => onClose?.()}
      >
            <Text key="name"
              style={[typography.textBold, styles.header]}>
              {currentStation().name}
            </Text>
            <Text key="address" style={[typography.textCenter, typography.textSmall]}>
             {currentStation().street} {currentStation().house_number}, {currentStation().zipcode} {currentStation().city}
            </Text>
            <Text key="map" style={[typography.textSmall, typography.textCenter, styles.link]}
                        // tslint:disable-next-line: max-line-length
                        onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + currentStation().latitude + ',' + currentStation().longitude)} >
                        &nbsp;Vis i kart
            </Text>
            <Text key="number_charging_points" style={[typography.textBold, typography.textCenter, styles.subheader]}>
              Antall ladepunkter: {currentStation().number_charging_points}{'\n'}
            </Text>
            <View style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}/>
            {currentConnectors() &&
              currentConnectors().length > 0 &&
              currentConnectors()
                .map((item, key) => (
                    <List>
                      <Text key={key + '-lader'} style={[typography.textBold, styles.listheader]}>Lader nr. {key + 1}</Text>
                    {item.map((item2, key2) => (
                      <ListItem key={key2 + 'attributt-liste' + key} style={styles.listitems}>
                          <Text key={key2 + 'lader-attributt' + key}>{item2.attrname}: {item2.trans}</Text>
                      </ListItem>
                    ))}
                    <View style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}/>
                    </List>
            ))}
            {currentStation().description_of_location
              ? <Text key="footer" style={[typography.textCenter, styles.footer]}>
                  <Text key="desc-text" style={typography.textBold}>Beskrivelse av stedet:{'\n'}</Text>
                  <Text key="desc">{currentStation().description_of_location}</Text>
                </Text>
              : <Text key="empty"></Text>
            }
            {currentStation().user_comment
              ? <Text key="footer2" style={[typography.textCenter, styles.footer]}>
                  <Text key="comment-text" style={typography.textBold}>Brukerkommentarer:{'\n'}</Text>
                  <Text key="comment">{currentStation().user_comment}</Text>
                </Text>
              : <Text key="empty2"></Text>
            }
            {currentStation().owned_by &&
              <Text key="ownership" style={[typography.textCenter, styles.footer]}>Ladestasjonen eies av {currentStation().owned_by}</Text>
            }
        </Modalize>
      )}
      </ChargingStationsContext.Consumer>
  );
});

export default ChargingStationModal;
