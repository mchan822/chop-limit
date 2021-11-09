import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, AppText } from '~/components';
import { Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

import { RegisterNavigationOptions } from '~/styles';

export const ResetPasswordScreen = () => {
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);

  const setNewPassword = useCallback((password) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('password', password);
    formData.append('password_repeat', password);

    fetchAPI(`/myaccount/reset_password_set_new`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        NavigationService.navigate('CheckPassword');
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
     >
      <View style={[styles.container]}>
        <AppText style={[styles.whiteText, styles.title]}>New Password</AppText>
        <AppText style={[styles.grayText, styles.subTitle]}>
          Please enter a new password below
        </AppText>
        <View style={[styles.inputWrapper]}>
          <Input
            title="Password"
            type="password"
            placeholder="Enter a new password"
            value={password}
            onChange={setPassword}
            actionIcon="chevron-right"
            actionHandler={() => setNewPassword(password)}
          />
        </View>
      </View>
    </Screen>
  );
};

ResetPasswordScreen.navigationOptions = ({ navigation }) =>
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
