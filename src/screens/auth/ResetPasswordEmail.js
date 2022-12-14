import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, setToken } from '~/store/actions';

import { RegisterNavigationOptions } from '~/styles';

export const ResetPasswordEmailScreen = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [isLoading, setLoading] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const sendVerification = useCallback((email) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('id', email);

    fetchAPI(`/myaccount/reset_password_send_code`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        dispatch(setToken(res.data.token));
        NavigationService.navigate('CheckEmail');
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen
      align="center"
      isLoading={isLoading}
      keyboardAware={true}>
      <View style={[styles.container]}>
      {windowWidth > 250 ? <View>
        <AppText style={[styles.whiteText, styles.title]}>Reset Password</AppText>
        <AppText style={[styles.grayText, styles.subTitle]}>
          Enter your e-mail address below
        </AppText></View>
        :
        <View>
        <AppText style={[styles.whiteText, styles.smalltitle]}>Reset Password</AppText>
        <AppText style={[styles.grayText, styles.smallsubTitle]}>
          Enter your e-mail address below
        </AppText></View>
        }
        <View style={[styles.inputWrapper]}>
          <Input
            title="Email"
            value={email}
            placeholder="Enter your email address"
            onChange={setEmail}
            keyboardType="email-address"
            actionIcon="chevron-right"
            actionHandler={() => sendVerification(email)}
          />
        </View>
      </View>
    </Screen>
  );
};

ResetPasswordEmailScreen.navigationOptions = ({ navigation }) =>
  RegisterNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
      headerTintColor: 'white',
    },
  });

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 30,
    paddingBottom: Theme.layout.screenPaddingBottom,
    justifyContent: 'center',
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
    fontSize: 14,
    marginTop: 10,
  },

  
  smalltitle: {
    fontSize: 22,
    letterSpacing: 2,
    fontWeight: '800',
  },

  smallsubTitle: {
    fontSize: 11,
    fontWeight: 'bold',

    marginTop: 10,
  },


  inputWrapper: {
    marginTop: 20,
    flexGrow: 1,
    overflow: 'hidden',

    width: '100%',
  },

  button: {
    marginTop: 30,
  },
});
