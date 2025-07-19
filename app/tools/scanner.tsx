import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// import { BarCodeScanner } from 'expo-barcode-scanner';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/icons/DynamicIcon';
import { supabase } from '@/lib/supabase';

interface ScanHistoryItem {
  id: string;
  scan_type: string;
  scan_data: string;
  title: string;
  description: string;
  created_at: string;
}

export default function ScannerScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanType, setScanType] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      // const { status } = await BarCodeScanner.requestPermissionsAsync();
      // setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
    if (user) {
      loadScanHistory();
    }
  }, [user]);

  const loadScanHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading scan history:', error);
        return;
      }

      setScanHistory(data || []);
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setScanResult(data);
    setScanType(type);

    // Save scan to history
    if (user) {
      try {
        await supabase
          .from('scan_history')
          .insert([
            {
              user_id: user.id,
              scan_type: type.toLowerCase().includes('qr') ? 'qr' : 'barcode',
              scan_data: data,
              title: getResultTitle(data),
              description: getResultDescription(data, type),
            },
          ]);
        
        loadScanHistory(); // Refresh history
      } catch (error) {
        console.error('Error saving scan:', error);
      }
    }
  };

  const getResultTitle = (data: string) => {
    if (data.startsWith('http')) return 'Website URL';
    if (data.includes('@')) return 'Email Address';
    if (data.startsWith('tel:')) return 'Phone Number';
    if (data.startsWith('wifi:')) return 'WiFi Network';
    if (data.startsWith('geo:')) return 'Location';
    return 'Scanned Data';
  };

  const getResultDescription = (data: string, type: string) => {
    return `${type} - ${data.length} characters`;
  };

  const handleResultAction = () => {
    if (!scanResult) return;

    if (scanResult.startsWith('http')) {
      Linking.openURL(scanResult);
    } else if (scanResult.includes('@')) {
      Linking.openURL(`mailto:${scanResult}`);
    } else if (scanResult.startsWith('tel:')) {
      Linking.openURL(scanResult);
    } else if (scanResult.startsWith('geo:')) {
      Linking.openURL(scanResult);
    } else {
      Alert.alert('Scan Result', scanResult);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
    setScanType(null);
  };

  const deleteScanItem = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('id', scanId);

      if (error) {
        Alert.alert('Error', 'Failed to delete scan item');
        return;
      }

      loadScanHistory();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            QR Scanner
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <DynamicIcon name="chevron-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            QR Scanner
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.permissionDenied}>
          <DynamicIcon name="camera" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionDescription, { color: theme.colors.textSecondary }]}>
            Please allow camera access to scan QR codes and barcodes
          </Text>
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()}
            style={styles.settingsButton}
          />
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
          QR Scanner
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {!scanned ? (
        <View style={styles.scannerContainer}>
          {/* <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
          /> */}
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.primary }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.primary }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.primary }]} />
            </View>
            <Text style={[styles.scanInstruction, { color: 'white' }]}>
              Point your camera at a QR code or barcode
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <DynamicIcon name="check" size={32} color={theme.colors.success} />
              <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
                Scan Complete
              </Text>
            </View>
            
            <View style={styles.resultInfo}>
              <Text style={[styles.resultType, { color: theme.colors.textSecondary }]}>
                {getResultTitle(scanResult!)}
              </Text>
              <Text style={[styles.resultData, { color: theme.colors.text }]}>
                {scanResult}
              </Text>
            </View>

            <View style={styles.resultActions}>
              <Button
                title="Open"
                onPress={handleResultAction}
                style={[styles.actionButton, { flex: 1 }]}
              />
              <Button
                title="Scan Again"
                onPress={resetScanner}
                variant="outline"
                style={[styles.actionButton, { flex: 1 }]}
              />
            </View>
          </Card>
        </ScrollView>
      )}

      {/* Scan History */}
      {!scanned && (
        <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
            Recent Scans
          </Text>
          
          {scanHistory.length === 0 ? (
            <Text style={[styles.emptyHistory, { color: theme.colors.textSecondary }]}>
              No scan history yet
            </Text>
          ) : (
            scanHistory.map((item) => (
              <Card key={item.id} style={styles.historyItem}>
                <View style={styles.historyItemContent}>
                  <View style={styles.historyItemInfo}>
                    <View style={[styles.historyIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                      <DynamicIcon 
                        name={item.scan_type === 'qr' ? 'qr-code' : 'scan'} 
                        size={16} 
                        color={theme.colors.primary} 
                      />
                    </View>
                    <View style={styles.historyDetails}>
                      <Text style={[styles.historyItemTitle, { color: theme.colors.text }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.historyItemData, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {item.scan_data}
                      </Text>
                      <Text style={[styles.historyItemDate, { color: theme.colors.textSecondary }]}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteHistoryButton}
                    onPress={() => deleteScanItem(item.id)}
                  >
                    <DynamicIcon name="trash-2" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  permissionDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  settingsButton: {
    marginTop: 20,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanInstruction: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCard: {
    alignItems: 'center',
    marginTop: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  resultInfo: {
    width: '100%',
    marginBottom: 20,
  },
  resultType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  resultData: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    marginBottom: 0,
  },
  historyContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyHistory: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    marginBottom: 12,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyItemData: {
    fontSize: 12,
    marginBottom: 2,
  },
  historyItemDate: {
    fontSize: 11,
  },
  deleteHistoryButton: {
    padding: 8,
  },
});