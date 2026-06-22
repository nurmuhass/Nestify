import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToast } from '@/components/Toast';
import { useTheme } from '@/context/ThemeContext';

const PRIMARY = '#0F172A';
const GOLD = '#C9A84C';
const BG = '#F8FAFC';

export default function BecomeASeller() {

  const router = useRouter();
  const { show } = useToast();
  const { colors } = useTheme();

  const [sellerType, setSellerType] = useState<
    'company' | 'agent' | 'owner' | null
  >(null);

  const [companyName, setCompanyName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [nin, setNin] = useState('');
  const [loading, setLoading] = useState(false);

  /* =========================
     VALIDATION
  ========================= */

  const validateNIN = (nin: string) => {
    return /^\d{11}$/.test(nin);
  };

  const validateRCNumber = (rc: string) => {
    return rc.trim().length >= 5;
  };

  /* =========================
     SUBMIT  
  ========================= */

  const handleSubmit = async () => {

    if (!sellerType) {

      show({
        type: 'error',
        title: 'Required',
        message: 'Please select seller type',
      });

      return;
    }

    if (sellerType === 'company') {

      if (!companyName.trim()) {

        show({
          type: 'error',
          title: 'Required',
          message: 'Company name is required',
        });

        return;
      }

      if (!rcNumber.trim()) {

        show({
          type: 'error',
          title: 'Required',
          message: 'RC Number is required',
        });

        return;
      }

      if (!validateRCNumber(rcNumber)) {

        show({
          type: 'error',
          title: 'Invalid RC Number',
          message: 'Please enter valid RC Number',
        });

        return;
      }
    }

    if (
      sellerType === 'agent' ||
      sellerType === 'owner'
    ) {

      if (!nin.trim()) {

        show({
          type: 'error',
          title: 'Required',
          message: 'NIN is required',
        });

        return;
      }

      if (!validateNIN(nin)) {

        show({
          type: 'error',
          title: 'Invalid NIN',
          message: 'NIN must contain exactly 11 digits',
        });

        return;
      }
    }

    try {

      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch(
        'https://insighthub.com.ng/NestifyAPI/become_seller.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + (token ?? ''),
          },
          body: JSON.stringify({
            seller_type: sellerType,
            company_name: companyName,
            rc_number: rcNumber,
            nin: nin,
          }),
        }
      );

      const result = await response.json();

      if (result.status === 'success') {

        show({
          type: 'success',
          title: 'Application Submitted',
          message:
            'Your seller application has been submitted successfully',
        });

        router.back();

      } else {

        show({
          type: 'error',
          title: 'Failed',
          message: result.msg,
        });
      }

    } catch (err: any) {

      show({
        type: 'error',
        title: 'Error',
        message: err.message,
      });

    } finally {

      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >

      <StatusBar
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
        >

          {/* HERO */}

          <LinearGradient
            colors={[
              '#0F172A',
              '#111827',
            ]}
            style={{
              paddingHorizontal: 24,
              paddingTop: 60,
              paddingBottom: 50,
              borderBottomLeftRadius: 35,
              borderBottomRightRadius: 35,
            }}
          >

            {/* BACK */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 30,
              }}
            >

              <Ionicons
                name="arrow-back"
                size={20}
                color="#fff"
              />

            </TouchableOpacity>

            {/* ICON */}

            <View
              style={{
                width: 95,
                height: 95,
                borderRadius: 50,
                backgroundColor: 'rgba(201,168,76,0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >

              <MaterialCommunityIcons
                name="office-building"
                size={50}
                color={GOLD}
              />

            </View>

            {/* TITLE */}

            <Text
              style={{
                color: '#fff',
                fontSize: 34,
                fontWeight: '800',
              }}
            >
              Become a Seller
            </Text>

            <Text
              style={{
                color: '#CBD5E1',
                marginTop: 12,
                fontSize: 15,
                lineHeight: 24,
              }}
            >
              Join Nestify verified real estate professionals and start listing premium properties to thousands of buyers.
            </Text>

          </LinearGradient>

          {/* BENEFITS */}

          <View
            style={{
              marginTop: 25,
              paddingHorizontal: 20,
            }}
          >

            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 18,
              }}
            >
              Why Become a Seller?
            </Text>

            {[
              'Publish unlimited properties',
              'Get verified seller badge',
              'Receive direct buyer leads',
              'Company branding & exposure',
              'Boost premium listings',
            ].map((item, index) => (

              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 18,
                  backgroundColor: colors.cardBackground,
                  padding: 18,
                  borderRadius: 18,
                  shadowColor: colors.shadow,
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  elevation: 3,
                }}
              >

                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 20,
                    backgroundColor: colors.inputBackground,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 14,
                  }}
                >

                  <Ionicons
                    name="checkmark"
                    size={18}
                    color="#22C55E"
                  />

                </View>

                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: colors.text,
                    fontWeight: '600',
                  }}
                >
                  {item}
                </Text>

              </View>
            ))}

          </View>

          {/* SELLER TYPE */}

          <View
            style={{
              marginTop: 28,
              paddingHorizontal: 20,
            }}
          >

            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 18,
              }}
            >
              Select Seller Type
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >

              {[
                {
                  key: 'company',
                  label: 'Company',
                  icon: 'business',
                },
                {
                  key: 'agent',
                  label: 'Agent',
                  icon: 'person',
                },
                {
                  key: 'owner',
                  label: 'Owner',
                  icon: 'home',
                },
              ].map((item: any) => {

                const active =
                  sellerType === item.key;

                return (

                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.85}
                    onPress={() =>
                      setSellerType(item.key)
                    }
                    style={{
                      width: '31%',
                      backgroundColor: active
                        ? colors.buttonBackground
                        : colors.cardBackground,
                      borderRadius: 22,
                      paddingVertical: 22,
                      alignItems: 'center',
                      borderWidth: active ? 0 : 1,
                      borderColor: colors.border,
                    }}
                  >

                    <Ionicons
                      name={item.icon}
                      size={28}
                      color={
                        active
                          ? colors.background
                          : colors.icon
                      }
                    />

                    <Text
                      style={{
                        marginTop: 10,
                        color: active
                          ? colors.background
                          : colors.text,
                        fontWeight: '700',
                      }}
                    >
                      {item.label}
                    </Text>

                  </TouchableOpacity>
                );
              })}

            </View>

          </View>

          {/* FORM */}

          <View
            style={{
              marginTop: 32,
              paddingHorizontal: 20,
            }}
          >

            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 20,
              }}
            >
              Verification Details
            </Text>

            {sellerType === 'company' && (
              <>
                {/* COMPANY NAME */}

                <View
                  style={{
                    marginBottom: 18,
                  }}
                >

                  <Text
                    style={{
                      marginBottom: 10,
                      color: colors.text,
                      fontWeight: '700',
                    }}
                  >
                    Company Name
                  </Text>

                  <TextInput
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Enter company name"
                    placeholderTextColor={colors.mutedText}
                    style={{
                      backgroundColor: colors.inputBackground,
                      height: 58,
                      borderRadius: 18,
                      paddingHorizontal: 18,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />

                </View>

                {/* RC NUMBER */}

                <View>

                  <Text
                    style={{
                      marginBottom: 10,
                      color: colors.text,
                      fontWeight: '700',
                    }}
                  >
                    RC Number
                  </Text>

                  <TextInput
                    value={rcNumber}
                    onChangeText={setRcNumber}
                    placeholder="Enter CAC RC Number"
                    placeholderTextColor={colors.mutedText}
                    style={{
                      backgroundColor: colors.inputBackground,
                      height: 58,
                      borderRadius: 18,
                      paddingHorizontal: 18,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />

                </View>
              </>
            )}

            {(sellerType === 'agent' ||
              sellerType === 'owner') && (

                <View>

                  <Text
                    style={{
                      marginBottom: 10,
                      color: colors.text,
                      fontWeight: '700',
                    }}
                  >
                    National Identification Number (NIN)
                  </Text>

                  <TextInput
                    value={nin}
                    onChangeText={setNin}
                    keyboardType="number-pad"
                    maxLength={11}
                    placeholder="Enter your 11 digit NIN"
                    placeholderTextColor={colors.mutedText}
                    style={{
                      backgroundColor: colors.inputBackground,
                      height: 58,
                      borderRadius: 18,
                      paddingHorizontal: 18,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />

                </View>
              )}

          </View>

          {/* TERMS */}

          <View
            style={{
              marginTop: 28,
              marginHorizontal: 20,
              backgroundColor: colors.cardBackground,
              borderRadius: 18,
              padding: 18,
            }}
          >

            <Text
              style={{
                color: colors.mutedText,
                lineHeight: 24,
                fontSize: 14,
              }}
            >
              By submitting your application, you agree to Nestify seller policies and verification process. Applications are reviewed before approval.
            </Text>

          </View>

          {/* SUBMIT */}

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={loading}
            onPress={handleSubmit}
            style={{
              marginTop: 32,
              marginHorizontal: 20,
              height: 62,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >

            <LinearGradient
              colors={[
                GOLD,
                '#E6C15A',
              ]}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >

              {loading ? (

                <ActivityIndicator
                  color={colors.background}
                />

              ) : (
                <>
                  <Text
                    style={{
                      color: colors.background,
                      fontSize: 17,
                      fontWeight: '800',
                    }}
                  >
                    Submit Application
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={colors.background}
                    style={{
                      marginLeft: 8,
                    }}
                  />
                </>
              )}

            </LinearGradient>

          </TouchableOpacity>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
