// The whole app on one surface, mirroring the design's structure exactly:
//
//   [ scrolling screen area          ]  ← flex:1, one screen at a time
//   [ bottom bar                     ]  ← flex:none, varies by screen
//   [ sheets / toast                 ]  ← absolutely positioned on top
//
// Changing screens is a state change, not a route push, so nothing slides or
// fades between them — same as the prototype.

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useCabana } from './state';
import { WHITE } from './theme';
import { Toast } from './components/Toast';
import { ActionBar, EventTabBar, MainTabBar, SkeletonTabBar } from './components/TabBars';
import { AuthScreen } from './screens/Auth';
import { BootingScreen } from './screens/Booting';
import { CreateScreen } from './screens/Create';
import { EventsScreen } from './screens/Events';
import { GoodStuffScreen } from './screens/GoodStuff';
import { InviteScreen } from './screens/Invite';
import { MeScreen } from './screens/Me';
import { OnboardScreen } from './screens/Onboard';
import { PackScreen } from './screens/Pack';
import { EventCrew } from './screens/event/EventCrew';
import { EventHero } from './screens/event/EventHero';
import { EventHome } from './screens/event/EventHome';
import { EventList } from './screens/event/EventList';
import { EventMine } from './screens/event/EventMine';
import { AddSheet } from './sheets/AddSheet';
import { DateSheet } from './sheets/DateSheet';
import { LeaveSheet } from './sheets/LeaveSheet';
import { PickerSheet } from './sheets/PickerSheet';

export function CabanaApp() {
  const {
    screen,
    eventTab,
    toast,
    addOpen,
    leaveOpen,
    pickerOpen,
    dateSheetOpen,
    createEvent,
    setField,
  } = useCabana();

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {screen === 'onboard' && <OnboardScreen />}
        {screen === 'auth' && <AuthScreen />}
        {screen === 'booting' && <BootingScreen />}
        {screen === 'events' && <EventsScreen />}
        {screen === 'good' && <GoodStuffScreen />}
        {screen === 'me' && <MeScreen />}
        {screen === 'create' && <CreateScreen />}
        {screen === 'invite' && <InviteScreen />}
        {screen === 'pack' && <PackScreen />}

        {screen === 'event' && (
          <>
            <EventHero />
            {eventTab === 'home' && <EventHome />}
            {eventTab === 'list' && <EventList />}
            {eventTab === 'mystuff' && <EventMine />}
            {eventTab === 'crew' && <EventCrew />}
          </>
        )}
      </ScrollView>

      {screen === 'create' && (
        <ActionBar
          label="Make it real"
          onPress={createEvent}
          fontSize={16.5}
          backgroundAlpha={0.96}
          borderAlpha={0.07}
        />
      )}
      {screen === 'pack' && (
        <ActionBar label="Add these to an event" onPress={() => setField('pickerOpen', true)} />
      )}
      {screen === 'event' && <EventTabBar />}
      {screen === 'booting' && <SkeletonTabBar />}
      {(screen === 'events' || screen === 'good' || screen === 'me') && <MainTabBar />}

      {toast && <Toast message={toast} />}

      {/* z-order below matches the design's 70 / 72 / 74 stacking */}
      {addOpen && <AddSheet />}
      {pickerOpen && <PickerSheet />}
      {dateSheetOpen && <DateSheet />}
      {leaveOpen && <LeaveSheet />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
    position: 'relative',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    // lets `height:100%` screens (onboarding, invite) fill the viewport while
    // taller screens still scroll
    flexGrow: 1,
  },
});
