import React from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colorWithAlpha } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const ConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmText = 'Delete',
}: any) => {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={[
        modalStyles.overlay,
        { backgroundColor: colorWithAlpha(colors.shadow, 0.6) },
      ]}
    >
      <View
        style={[
          modalStyles.modal,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[modalStyles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[modalStyles.message, { color: colors.mutedText }]}>
          {message}
        </Text>

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel}>
            <Text style={[modalStyles.cancelText, { color: colors.mutedText }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              modalStyles.confirmBtn,
              { backgroundColor: colors.buttonBackground },
            ]}
            onPress={onConfirm}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text
                style={[
                  modalStyles.confirmText,
                  { color: colors.background },
                ]}
              >
                {confirmText}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ConfirmModal;

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    width: '85%',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    fontWeight: '600',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmText: {
    fontWeight: '700',
  },
});
