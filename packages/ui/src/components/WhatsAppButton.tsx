import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

export interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  style?: ViewStyle;
}

export function WhatsAppButton({
  phone,
  message = '',
  label = 'Contacter via WhatsApp',
  style,
}: WhatsAppButtonProps) {
  function handlePress() {
    const encoded = encodeURIComponent(message);
    const clean = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${clean}?text=${encoded}`);
  }

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#075E54',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 48,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    fontWeight: '700',
  },
});
