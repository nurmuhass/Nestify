import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TextInput, TouchableOpacity } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

export default function SearchBar() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/Home/Searchscreen',
        })
      }
      style={{
        marginHorizontal: 5,
        marginBottom: 15,
        backgroundColor: colors.inputBackground,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderColor: colors.border,
        borderWidth: 1,
        paddingVertical: 10,
      }}
    >
      <Ionicons name="search" size={20} color={colors.icon} />
      <TextInput
        placeholder="Search House, Apartment, etc"
        placeholderTextColor={colors.mutedText}
        style={{ marginLeft: 10, flex: 1, color: colors.text }}
        editable={false}
      />
    </TouchableOpacity>
  );
}
