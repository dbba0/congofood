// Écran profil — avatar, paramètres, WhatsApp support, déconnexion
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { StorageService } from '../../lib/storage';
import { apiRequest } from '../../lib/apiClient';
import { API } from '../../constants/api';
import { Avatar, WhatsAppButton } from '@wapi/ui';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiRequest(API.logout, { method: 'POST' });
            } catch {
              // Continuer même si l'API échoue
            }
            await StorageService.clearAuth();
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'location-outline',
      label: 'Mes adresses',
      onPress: () => router.push('/(auth)/select-quarter'),
    },
    {
      icon: 'card-outline',
      label: 'Moyens de paiement',
      onPress: () => {},
    },
    {
      icon: 'receipt-outline',
      label: 'Mes commandes',
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Confidentialité',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card avatar */}
        <View style={styles.avatarCard}>
          <Avatar name={user?.name} size={64} />
          <View style={styles.avatarInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Utilisateur'}</Text>
            <Text style={styles.userPhone}>{user?.phone ?? ''}</Text>
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                <Text style={styles.verifiedText}>Compte vérifié</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => {}}>
            <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Menu Mon compte */}
        <Text style={styles.sectionTitle}>Mon compte</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bouton WhatsApp support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.whatsappWrap}>
          <WhatsAppButton
            phone="+243000000000"
            message="Bonjour, j'ai besoin d'aide avec Wapi"
            label="💬 Contacter le support WhatsApp"
          />
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Wapi v0.1.0 · Kinshasa 🇨🇩</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: Spacing['2xl'] },
  avatarCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarInfo: { flex: 1 },
  userName: {
    fontFamily: 'Syne_700Bold',
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userPhone: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  verifiedText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.success,
  },
  editBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 52,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  whatsappWrap: {
    marginBottom: Spacing.xl,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.error}18`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xl,
    height: 52,
  },
  logoutText: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: Typography.fontSize.base,
    color: Colors.error,
  },
  version: {
    fontFamily: 'DMSans_400Regular',
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
} as const;
