
import React from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


const ConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: any) => {
  if (!visible) return null;

  return (
    <View style={modalStyles.overlay}>
      <View style={modalStyles.modal}>
        <Text style={modalStyles.title}>{title}</Text>
        <Text style={modalStyles.message}>{message}</Text>

        <View style={modalStyles.actions}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm}>
            {loading ? (
              <ActivityIndicator color="#0f2044" />
            ) : (
              <Text style={modalStyles.confirmText}>Delete</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    width: '85%',
    backgroundColor: '#0f2044',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: '#94a3b8',
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
    color: '#94a3b8',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#c9a84c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmText: {
    color: '#0f2044',
    fontWeight: '700',
  },
});