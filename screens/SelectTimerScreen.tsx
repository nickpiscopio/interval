import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Button } from 'react-native';

import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';

export default function SelectTimerScreen({ navigation }: RootStackScreenProps<'Root'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No timers created</Text>
      <Button title="+ Create Timer" onPress={() => navigation.navigate('CreateTimer')} />

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 20
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});