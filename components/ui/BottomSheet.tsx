import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RNBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Colors } from '@/constants/colors';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: string[];
  children: React.ReactNode;
  scrollable?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  snapPoints: snapPointsProp,
  children,
  scrollable = false,
}: BottomSheetProps) {
  const bottomSheetRef = useRef<RNBottomSheet>(null);
  const snapPoints = useMemo(() => snapPointsProp ?? ['50%', '90%'], [snapPointsProp]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: Parameters<typeof BottomSheetBackdrop>[0]) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        onPress={handleClose}
      />
    ),
    [handleClose],
  );

  if (!isOpen) return null;

  const Content = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <RNBottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.surface }}
      handleIndicatorStyle={{ backgroundColor: Colors.border }}
    >
      <Content style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 32 }}>
        {title && (
          <Text
            style={{
              color: Colors.textPrimary,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 20,
              marginTop: 4,
            }}
          >
            {title}
          </Text>
        )}
        {children}
      </Content>
    </RNBottomSheet>
  );
}
