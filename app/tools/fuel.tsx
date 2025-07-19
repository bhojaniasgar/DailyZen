import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';
import { FuelEntry } from '@/types/global';

export default function FuelScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    vehicleName: 'My Vehicle',
    odometer: '',
    fuelAmount: '',
    fuelCost: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadFuelEntries();
    }
  }, [user]);

  const loadFuelEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('fuel_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load fuel entries');
        return;
      }

      setFuelEntries(data || []);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addFuelEntry = async () => {
    const odometer = parseInt(newEntry.odometer);
    const fuelAmount = parseFloat(newEntry.fuelAmount);
    const fuelCost = parseFloat(newEntry.fuelCost);

    if (!odometer || !fuelAmount || !fuelCost) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('fuel_entries')
        .insert([
          {
            user_id: user?.id,
            vehicle_name: newEntry.vehicleName,
            odometer,
            fuel_amount: fuelAmount,
            fuel_cost: fuelCost,
            location: newEntry.location,
            notes: newEntry.notes,
            date: new Date().toISOString().split('T')[0],
          },
        ]);

      if (error) {
        Alert.alert('Error', 'Failed to add fuel entry');
        return;
      }

      setNewEntry({
        vehicleName: 'My Vehicle',
        odometer: '',
        fuelAmount: '',
        fuelCost: '',
        location: '',
        notes: '',
      });
      setShowAddForm(false);
      loadFuelEntries();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const deleteFuelEntry = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this fuel entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('fuel_entries')
                .delete()
                .eq('id', entryId);

              if (error) {
                Alert.alert('Error', 'Failed to delete fuel entry');
                return;
              }

              loadFuelEntries();
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ]
    );
  };

  const calculateMPG = (entry: FuelEntry, previousEntry?: FuelEntry) => {
    if (!previousEntry) return null;
    const milesDriven = entry.odometer - previousEntry.odometer;
    const mpg = milesDriven / entry.fuel_amount;
    return mpg > 0 ? mpg.toFixed(1) : null;
  };

  const getTotalSpent = () => {
    return fuelEntries.reduce((total, entry) => total + entry.fuel_cost, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Fuel & Mileage
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading fuel entries...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Fuel & Mileage
        </Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)}>
          <DynamicIcon name="plus" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Total Fuel Spending
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
            ${getTotalSpent().toFixed(2)}
          </Text>
          <Text style={[styles.summaryPeriod, { color: theme.colors.textSecondary }]}>
            {fuelEntries.length} fill-ups recorded
          </Text>
        </Card>

        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              Add Fuel Entry
            </Text>
            <Input
              label="Vehicle Name"
              placeholder="My Vehicle"
              value={newEntry.vehicleName}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, vehicleName: text }))}
              style={styles.input}
            />
            <Input
              label="Odometer Reading"
              placeholder="Miles"
              value={newEntry.odometer}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, odometer: text }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.inputRow}>
              <Input
                label="Fuel Amount (Gallons)"
                placeholder="0.0"
                value={newEntry.fuelAmount}
                onChangeText={(text) => setNewEntry(prev => ({ ...prev, fuelAmount: text }))}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <Input
                label="Total Cost"
                placeholder="$0.00"
                value={newEntry.fuelCost}
                onChangeText={(text) => setNewEntry(prev => ({ ...prev, fuelCost: text }))}
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
            <Input
              label="Location (Optional)"
              placeholder="Gas station name or location"
              value={newEntry.location}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, location: text }))}
              style={styles.input}
            />
            <Input
              label="Notes (Optional)"
              placeholder="Any additional notes"
              value={newEntry.notes}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, notes: text }))}
              multiline
              style={styles.input}
            />
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                variant="outline"
                style={[styles.formButton, { flex: 1 }]}
              />
              <Button
                title="Add Entry"
                onPress={addFuelEntry}
                style={[styles.formButton, { flex: 1 }]}
              />
            </View>
          </Card>
        )}

        {fuelEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <DynamicIcon name="fuel" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Fuel Entries Yet
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
              Start tracking your fuel consumption and mileage
            </Text>
            <Button
              title="Add Entry"
              onPress={() => setShowAddForm(true)}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.entriesList}>
            {fuelEntries.map((entry, index) => {
              const previousEntry = fuelEntries[index + 1];
              const mpg = calculateMPG(entry, previousEntry);
              
              return (
                <Card key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryInfo}>
                      <View style={[styles.entryIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                        <DynamicIcon name="fuel" size={20} color={theme.colors.primary} />
                      </View>
                      <View style={styles.entryDetails}>
                        <Text style={[styles.entryVehicle, { color: theme.colors.text }]}>
                          {entry.vehicle_name}
                        </Text>
                        <Text style={[styles.entryDate, { color: theme.colors.textSecondary }]}>
                          {new Date(entry.date).toLocaleDateString()}
                        </Text>
                        {entry.location && (
                          <Text style={[styles.entryLocation, { color: theme.colors.textSecondary }]}>
                            {entry.location}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.entryActions}>
                      <Text style={[styles.entryCost, { color: theme.colors.text }]}>
                        ${entry.fuel_cost.toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteFuelEntry(entry.id)}
                      >
                        <DynamicIcon name="trash-2" size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.entryStats}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Odometer
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {entry.odometer.toLocaleString()} mi
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        Fuel
                      </Text>
                      <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {entry.fuel_amount} gal
                      </Text>
                    </View>
                    {mpg && (
                      <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                          MPG
                        </Text>
                        <Text style={[styles.statValue, { color: theme.colors.success }]}>
                          {mpg}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {entry.notes && (
                    <Text style={[styles.entryNotes, { color: theme.colors.textSecondary }]}>
                      {entry.notes}
                    </Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  summaryCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryPeriod: {
    fontSize: 14,
  },
  addForm: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    marginBottom: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  createButton: {
    marginTop: 20,
  },
  entriesList: {
    paddingBottom: 20,
  },
  entryCard: {
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  entryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entryDetails: {
    flex: 1,
  },
  entryVehicle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  entryLocation: {
    fontSize: 12,
  },
  entryActions: {
    alignItems: 'flex-end',
  },
  entryCost: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 4,
  },
  entryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  entryNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
});