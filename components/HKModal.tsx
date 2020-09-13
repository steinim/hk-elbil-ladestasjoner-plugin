import material from '../../../native-base-theme/variables/material';
import React, { useRef, useImperativeHandle } from 'react';
import { TouchableOpacity } from 'react-native';
import { Portal } from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';
import { SvgCss } from 'react-native-svg';
import CloseButton from '../../../assets/CloseButton.svg';

type Props = {
  children: React.ReactNode;
  onClose?: () => void;
};

export const HKModal = React.forwardRef((props: Props, ref: any) => {
  const { children, onClose } = props;
  const modalizeRef = useRef<Modalize>(null);

  useImperativeHandle(ref, () => ({
    open: () => modalizeRef.current?.open(),
  }));

  return (
    <Portal>
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
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
        {children}
      </Modalize>
    </Portal>
  );
});

export default HKModal;
