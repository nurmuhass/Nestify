import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PropertyGrid from './PropertyGrid';

type Property = {
  id: number | string;
  propertyName: string;
  images?: string[];
  listingType: string;
  rentPrice?: string;
  sellPrice?: string;
  rating?: string;
  city?: string;
  state?: string;
  propertyCategory?: string | number;
};

type Category = {
  id: number | string;
  name: string;
};

type Props = {
  properties?: Property[];
  categories?: Category[];
};

const LISTING_TABS = ['All', 'For Rent', 'For Sell'];

export default function NearbyProperties({
  properties = [],
  categories = [],
}: Props) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');

  /*
  ─────────────────────────────────────────
  FILTERED PROPERTIES
  ─────────────────────────────────────────
  */

  const filteredProperties = useMemo(() => {
    let filtered = [...properties];

    // FILTER LISTING TYPE
    if (activeTab !== 'All') {
      filtered = filtered.filter((item) => {
        if (activeTab === 'For Rent') {
          return (
            item.listingType === 'Rent' ||
            item.listingType === 'For Rent'
          );
        }

        if (activeTab === 'For Sell') {
          return (
            item.listingType === 'Sell' ||
            item.listingType === 'For Sell'
          );
        }

        return true;
      });
    }

    // FILTER CATEGORY
    if (activeCategory !== 'All') {
      filtered = filtered.filter(
        (item) =>
          String(item.propertyCategory) ===
          String(activeCategory)
      );
    }

    return filtered;
  }, [properties, activeTab, activeCategory]);

  return (
    <View style={styles.container}>
      {/* SECTION HEADER */}

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>
          Nearby Properties
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname:
                '/Home/Properties/AllPropertiesScreen',
            })
          }
        >
          <Text style={styles.sectionLink}>
            View all →
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTING TYPE TABS */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {LISTING_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab &&
              styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab &&
                styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* CATEGORY TABS */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {[{ id: 'All', name: 'All' }, ...categories].map(
          (cat) => {
            const isActive =
              activeCategory === String(cat.id);

            return (
              <TouchableOpacity
                key={String(cat.id)}
                style={[
                  styles.catBtn,
                  isActive &&
                  styles.catBtnActive,
                ]}
                onPress={() =>
                  setActiveCategory(
                    String(cat.id)
                  )
                }
              >
                <Text
                  style={[
                    styles.catText,
                    isActive &&
                    styles.catTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          }
        )}
      </ScrollView>

      {/* EMPTY */}

      {filteredProperties.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="home-outline"
            size={38}
            color="#b8b8c8"
          />

          <Text style={styles.emptyTitle}>
            No properties found
          </Text>

          <Text style={styles.emptySub}>
            No properties under this category yet
          </Text>

          {(activeCategory !== 'All' ||
            activeTab !== 'All') && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setActiveTab('All');
                  setActiveCategory('All');
                }}
              >
                <Text style={styles.clearText}>
                  Clear filters
                </Text>
              </TouchableOpacity>
            )}
        </View>
      ) : (
        <PropertyGrid
          properties={filteredProperties}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    paddingBottom: 0,
  },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
    marginBottom: 14,
  },

  sectionLink: {
    fontSize: 12,
    color: '#c9a84c',
    fontWeight: '500',
  },

  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0f2044',
    borderWidth: 1,
    borderColor: '#e8e4dd',
  },

  tabActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },

  tabText: {
    fontSize: 13,
    color: '#8a8a9a',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#0f2044',
  },

  catScroll: {
    marginTop: 2,
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e4dd',
  },

  catContent: {
    paddingHorizontal: 16,
    gap: 2,
  },

  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -0.5,
  },

  catBtnActive: {
    borderBottomColor: '#fff',
  },

  catText: {
    fontSize: 13,
    color: '#8a8a9a',
    fontWeight: '500',
  },

  catTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    gap: 8,
    marginBottom: 80,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: 6,
  },

  emptySub: {
    fontSize: 13,
    color: '#8a8a9a',
    textAlign: 'center',
  },

  clearBtn: {
    marginTop: 10,
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: '#c9a84c',
    borderRadius: 20,
  },

  clearText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});