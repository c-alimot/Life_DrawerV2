import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { CreateEntryScreen } from '@features/entries/screens/CreateEntryScreen';
import { EntryDetailScreen } from '@features/entries/screens/EntryDetailScreen';
import { EditEntryScreen } from '@features/entries/screens/EditEntryScreen';
import { LifePhasesScreen } from '@features/home/screens/LifePhasesScreen';
import { SearchScreen } from '@features/search/screens/SearchScreen';
import { DrawerDetailScreen } from '@features/drawers/screens/DrawerDetailScreen';
import { InsightsScreen } from '@features/insights/screens/InsightsScreen';
import { SplashScreen } from '@features/splash/screens/SplashScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen 
          name="CreateEntry" 
          component={CreateEntryScreen}
        />
        <Stack.Screen 
          name="EntryDetail" 
          component={EntryDetailScreen}
        />
        <Stack.Screen 
          name="EditEntry" 
          component={EditEntryScreen}
        />
        <Stack.Screen 
          name="LifePhases" 
          component={LifePhasesScreen}
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen}
        />
        <Stack.Screen 
          name="DrawerDetail" 
          component={DrawerDetailScreen}
        />
        <Stack.Screen 
          name="Insights" 
          component={InsightsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}