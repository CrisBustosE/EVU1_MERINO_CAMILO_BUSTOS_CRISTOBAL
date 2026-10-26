import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTasks } from './src/hooks/useTasks';
import type { RootStackParamList } from './src/types/navigation';
import { STRINGS, COLORS } from './src/constants';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { tasks, isLoaded, deleteTask, saveTask } = useTasks();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.surface,
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen
            name="TaskList"
            options={{ title: STRINGS.appTitle }}
          >
            {(props) => (
              <TaskListScreen {...props} tasks={tasks} onDelete={deleteTask} />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="TaskForm"
            options={({ route }) =>
              ({ title: route.params?.task ? STRINGS.editTask : STRINGS.addTask })
            }
          >
            {(props) => <TaskFormScreen {...props} onSave={saveTask} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
