import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, View, StyleSheet,Image } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { formatPhoneNumber } from '~/core/utility';
import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, signOut, setPhone, setTerritoryType} from '~/store/actions';

import { AppEventsLogger } from "react-native-fbsdk-next";

export const GetAccessScreen = () => {
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState('');
  const anim = useRef(new Animated.Value(0)).current;
  const [isLoading, setLoading] = useState(false);

  const sendVerification = useCallback((phoneNumber) => {
    AppEventsLogger.logEvent('USER ENTERS PHONE NUMBER');
    setLoading(true);

    const formData = new FormData();
    formData.append('phone_number', phoneNumber);

    fetchAPI(`/verification/send`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.data.existing_user) {
          dispatch(setPhone(phoneNumber));
          NavigationService.navigate('CheckPassword');
          //NavigationService.navigate('CheckEmail');
        } else {
          dispatch(setToken(res.data.token));
          NavigationService.navigate('VerifyPhone');
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  const animStart = useCallback(() => {
    // Will change anim value to 500 in 1 second
    Animated.timing(anim, {
      toValue: 150,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => animStart(), 2000);
  }, []);

  return (
    <Screen
      align="center"
      isLoading={isLoading}      
      >
      <View style={[styles.container]}>
      <AppText style={[styles.whiteText, styles.title]}>Get Started</AppText>
        <AppText style={[styles.grayText, styles.subTitle]}>
          Enter your phone number below to get started
        </AppText>
        {/* <Animated.View style={[styles.inputWrapper, { maxHeight: anim }]}> */}
       
          <Input
            title="Phone #"
            placeholder="XXX XXX XXXX"
            value={phoneNumber}
            style={{marginTop:20}}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e))}
            keyboardType="number-pad"
            actionIcon="chevron-right"
            actionHandler={() => sendVerification(phoneNumber)}
          />
        {/* </Animated.View> */}
       
        <Button
            type="borderless"
            style={styles.button}
            titleStyle={{fontSize: 14}}
            onClick={() => {
              AppEventsLogger.logEvent('SIGN-IN SKIPPED')
              dispatch(signOut());     
              dispatch(setTerritoryType({ territory_type: "address" }));
              //if(!token){
              NavigationService.reset('SelectDelivery1',{addressCnt: 0});
              //} else {
                //NavigationService.reset('Home');
              //}
            }}>
            SKIP
          </Button>
      </View>
    </Screen>
  );
};

GetAccessScreen.navigationOptions = {
  headerShown: false,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 30,
    paddingBottom: Theme.layout.screenPaddingBottom,
    justifyContent: 'flex-start',
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },

  whiteText: {
    color: Theme.color.redColor,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  grayText: {
    color: 'gray',
    textAlign: 'center',
  },

  greenText: {
    color: '#31D457',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 25,
    letterSpacing: 2,
    fontWeight: '800',
  },

  subTitle: {
    fontSize: 13,
    fontWeight: 'bold',

    marginTop: 10,
  },

  inputWrapper: {
    marginTop: 40,
    flexGrow: 1,
    overflow: 'hidden',
    width: '100%',
  },

  button: {
    top:  20,
    justifyContent: 'flex-start',
    textTransform: 'uppercase',
  },
});
