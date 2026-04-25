import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const BASE_URL = 'https://insighthub.com.ng';
const GOLD = '#C9A84C';
const DARK = '#0F0F1A';
const CARD = '#1A1A2A';

const normalize = (v: string) => v.trim().toLowerCase();

const EditEstate = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const estateId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [image, setImage] = useState<string | null>(null);
const [hasFetched, setHasFetched] = useState(false);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [initialFacilities, setInitialFacilities] = useState<string[]>([]);
  const [deletedFacilities, setDeletedFacilities] = useState<string[]>([]);
  const [newFacilities, setNewFacilities] = useState<string[]>([]);
  const [newFacility, setNewFacility] = useState('');

  const parseFacilities = (value: any): string[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
      try {
        const decoded = JSON.parse(value);
        if (Array.isArray(decoded)) {
          return decoded.map((v) => String(v).trim()).filter(Boolean);
        }
      } catch {
        return value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((v) => v.replace(/"/g, '').trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const fetchEstateById = useCallback(async () => {
    if (!estateId) return;

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');

      const res = await fetch(
        `${BASE_URL}/NestifyAPI/get_estate_by_id.php?id=${estateId}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const text = await res.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        console.log('RAW RESPONSE:', text);
        throw new Error('Server returned invalid JSON');
      }

  

      if (data.status === 'success') {
        const e = data.estate;

        const parsedFacilities = parseFacilities(e?.estate_facilities);

        setName(e?.name ?? '');
        setLocation(e?.location ?? '');
        setAbout(e?.about ?? '');
        setImage(e?.image_path ?? null);

        setInitialFacilities(parsedFacilities);
        setFacilities(parsedFacilities);
        setDeletedFacilities([]);
        setNewFacilities([]);
        setNewFacility('');
        setHasFetched(true);
      } else {
        Alert.alert('Error', data.msg || 'Failed to load estate');
      }
    } catch (err) {
      console.log('FETCH ERROR:', err);
      Alert.alert('Error', 'Failed to load estate');
    } finally {
      setLoading(false);
    }
  }, [estateId, hasFetched]);

  useFocusEffect(
    useCallback(() => {
      fetchEstateById();
    }, [fetchEstateById])
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'You need to allow gallery access.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
    }
  };

const addFacility = () => {
  const value = newFacility.trim();
  if (!value) {
    console.log("ADD FACILITY BLOCKED: empty value");
    return;
  }

  const exists = facilities.some((f) => normalize(f) === normalize(value));
  if (exists) {
    console.log("ADD FACILITY BLOCKED: already exists");
    Alert.alert('Notice', 'That facility already exists.');
    return;
  }

  console.log("ADDING FACILITY:", value); 
  setFacilities((prev) => [...prev, value]);
  setNewFacilities((prev) => {
    const updated = [...prev, value];
    console.log("NEW FACILITIES STATE NOW:", updated);  
    return updated;
  });
  setNewFacility('');
};
  const removeFacility = (facility: string) => {
    setFacilities((prev) => prev.filter((x) => normalize(x) !== normalize(facility)));

    const isInitial = initialFacilities.some(
      (x) => normalize(x) === normalize(facility)
    );

    if (isInitial) {
      setDeletedFacilities((prev) =>
        prev.some((x) => normalize(x) === normalize(facility))
          ? prev
          : [...prev, facility]
      );
      setNewFacilities((prev) =>
        prev.filter((x) => normalize(x) !== normalize(facility))
      );
    } else {
      setNewFacilities((prev) =>
        prev.filter((x) => normalize(x) !== normalize(facility))
      );
    }
  };

  const handleUpdate = async () => {
    if (!estateId) {
      Alert.alert('Error', 'Invalid estate id');
      return;
    }

    if (!name.trim() || !location.trim()) {
      Alert.alert('Error', 'Estate name and location are required');
      return;
    }

    setUpdating(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const formData = new FormData();
      formData.append('estateId', String(estateId));
      formData.append('estate_name', name.trim());
      formData.append('estate_location', location.trim());
      formData.append('about', about.trim());

formData.append('deleted_facilities', JSON.stringify(deletedFacilities));
formData.append('new_facilities', JSON.stringify(newFacilities));

      if (image && image.startsWith('file')) {
        const fileName = image.split('/').pop() || `estate_${Date.now()}.jpg`;
        const ext = fileName.split('.').pop()?.toLowerCase();
        const mimeType =
          ext === 'png'
            ? 'image/png'
            : ext === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

        formData.append('estate_image', {
          uri: image,
          name: fileName,
          type: mimeType,
        } as any);
      }

      const res = await fetch(`${BASE_URL}/NestifyAPI/update_estate.php`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      let result: any;

      try {
        result = JSON.parse(text);
      } catch {
        console.log('RAW UPDATE RESPONSE:', text);
        throw new Error('Invalid server response');
      }

      if (result.status === 'success') {
          setHasFetched(false);
        await fetchEstateById();
        Alert.alert('Success', 'Estate updated successfully');
        router.back();
      } else {
        Alert.alert('Error', result.msg || 'Update failed');
      }
    } catch (err) {
      console.log('UPDATE ERROR:', err);
      Alert.alert('Error', 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}   keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={GOLD} />
      </TouchableOpacity>

      <Text style={styles.title}>Edit Estate</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={34} color="#777" />
            <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Estate Name"
        placeholderTextColor="#777"
        style={styles.input}
      />

      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
        placeholderTextColor="#777"
        style={styles.input}
      />

      <TextInput
        value={about}
        onChangeText={setAbout}
        placeholder="About"
        placeholderTextColor="#777"
        multiline
        style={[styles.input, styles.textArea]}
      />

      <Text style={styles.section}>Facilities</Text>

      <View style={styles.facilityList}>
        {facilities.length > 0 ? (
          facilities.map((f, idx) => (
            <View key={`${f}-${idx}`} style={styles.facility}>
              <Text style={styles.facilityText}>{f}</Text>
              <TouchableOpacity onPress={() => removeFacility(f)}>
                <Ionicons name="close-circle" color="#ff6b6b" size={20} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No facilities added yet.</Text>
        )}
      </View>

      <View style={styles.addRow}>
        <TextInput
          value={newFacility}
          onChangeText={setNewFacility}
          placeholder="Add facility"
          placeholderTextColor="#777"
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          onSubmitEditing={addFacility}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addFacility} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={DARK} /> 
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, updating && { opacity: 0.7 }]}
        onPress={handleUpdate}
        disabled={updating}
      >
        <Text style={styles.buttonText}>
          {updating ? 'Updating...' : 'Update Estate'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditEstate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK,
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
  },
  imageWrap: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff12',
  },
  imagePlaceholder: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD,
  },
  imagePlaceholderText: {
    color: '#888',
    marginTop: 8,
    fontSize: 12,
  },
  input: {
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  section: {
    color: GOLD,
    marginTop: 8,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  facilityList: {
    gap: 8,
    marginBottom: 14,
  },
  facility: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  facilityText: {
    color: '#fff',
    flex: 1,
    paddingRight: 10,
  },
  emptyText: {
    color: '#888',
    fontSize: 13,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: GOLD,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: DARK,
    fontWeight: '800',
    fontSize: 15,
  },
});