import React, { useState, useCallback,useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RegisterNavigationOptions } from '~/styles';
import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken, setUserInfo, setOrder } from '~/store/actions';

import { AppEventsLogger } from "react-native-fbsdk-next";
import { setBanner } from '../../store/actions';

export const VerifyPhoneScreen = ({navigation}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setLoading] = useState(false);
  const user = useMemo(() => navigation.getParam('user'), []);
  const deliveryMode = useMemo(() => navigation.getParam('deliveryMode'), []);
  const tip_percentage = useMemo(() => navigation.getParam('tip_percentage'), []);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const address = useSelector((state) => state.explorer.address);
  const guestToken = useSelector((state) => state.account.guestToken);
  const tempTokenSignup = useMemo(() => navigation.getParam('token'), []);
  const windowWidth = Dimensions.get('window').width;
  const checkPhone = useCallback((token, verificationCode) => {
    AppEventsLogger.logEvent('USER ENTERS VERIFICATION CODE')
    setLoading(true);

    const formData = new FormData();
    formData.append('code', verificationCode);

    fetchAPI(`/verification/check`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${tempTokenSignup ? tempTokenSignup : (token ? token : guestToken)}`,
      },
      body: formData,
    })
      .then((res) => {       
        console.log("verification code+++++++++++++", res.data);
        if(user && guestToken){
          const formData = new FormData();
          formData.append('first_name', user.firstName);
          formData.append('last_name', user.lastName);
          formData.append('email', user.email);
          formData.append('password', user.password);
          
          fetchAPI(`/signup`, {
            method: 'POST',
            headers: {
              authorization: `Bearer ${res.data.token}`,
            },
            body: formData,
          })
            .then((res) => {

              dispatch(
                setUserInfo({
                  uuid: res.data.uuid,
                  firstName: res.data.first_name,
                  lastName: res.data.last_name,
                  phone: res.data.phone,
                  email: res.data.email,
                  creditcard: res.data.creditcard,
                  totalOrders: res.data.total_orders,
                  user_verified: res.data.user_verified,
                  user_active: res.data.user_active
                }),
              );

              const signupToken = res.data.token;

              const formData = new FormData();
              formData.append('address', address);
              formData.append('from_device', Platform.OS);
              fetchAPI(`/order/address`, {
                method: 'POST',
                headers: {
                  authorization: `Bearer ${signupToken}`,
                },
                body: formData,
              })
                .then((res) => {
                  dispatch(setBanner(res.data.banner_url));
                  dispatch(setOrder(res.data));
                  dispatch(setToken(signupToken));
                  NavigationService.navigate('Account/CreditCard',{
                    deliveryMode : deliveryMode,
                    tip_percentage: tip_percentage
                  });
                })
                .catch((err) =>
                  dispatch(
                    showNotification({
                      type: 'error',
                      message: err.message,
                    }),
                  ),
                )
                .finally(() => setLoading(false));

              
            })
            .catch((err) =>
              dispatch(showNotification({ type: 'error', message: err.message })),
            )
            .finally(() => setLoading(false));
        }else{
          dispatch(setToken(res.data.token));
          dispatch(
            setUserInfo({
              uuid: res.data.uuid,
              firstName: res.data.first_name,
              lastName: res.data.last_name,
              phone: res.data.phone,
              email: res.data.email,
              creditcard: res.data.creditcard,
              totalOrders: res.data.total_orders,
              user_verified: res.data.user_verified,
              user_active: res.data.user_active
            }),
          );
          if (res.data.last_order_data) {
            dispatch(setOrder(res.data.last_order_data));
          }
          NavigationService.reset('Home');
        } 
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    console.log("aaaaaaaaaaaaaaa", windowWidth);
  }, [windowWidth])
  return (
    <Screen
      isLoading={isLoading}
      keyboardAware={true}>
      <View style={[styles.container]}>
        <AppText style={[styles.whiteText, styles.title]}>Verify</AppText>
        <AppText numberOfLines={2} style={[styles.grayText, styles.subTitle]}>
          We just sent a verification code to your phone. Enter it below to verify your phone number
        </AppText>
        <View style={styles.inputWrapper}>
          <Input
            title="Code"
            placeholder="XXXXXX"
            value={verificationCode}
            onChange={setVerificationCode}
            keyboardType="number-pad"
            actionIcon="chevron-right"
            actionHandler={() => checkPhone(token, verificationCode)}
          />
        </View>
        <Button
          type="borderlessred"
          style={styles.button}
          onClick={() => NavigationService.goBack()}>
          I did not receive the code
        </Button>
      </View>
    </Screen>
  );
};

VerifyPhoneScreen.navigationOptions= ({ navigation }) =>
  RegisterNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 30,
    paddingBottom: Theme.layout.screenPaddingBottom,
    flex: 1,
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

  smalltitle: {
    fontSize: 20,
    letterSpacing: 1,
    fontWeight: '800',
  },

  smallsubTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },

  inputWrapper: {
    marginTop: 20,
    overflow: 'hidden',

    width: '100%',
  },

  button: {
    marginTop: 30,
  },
});
