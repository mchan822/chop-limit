import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { fetchAPI } from '~/core/utility';


export const MyOrderLeaveTipOtherScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const action = useMemo(() => navigation.getParam('action'), []);
  const currency = useMemo(() => navigation.getParam('currency'), []);
  const [tipAmount, setTipAmount] = useState('');
  const saveTipAmount = useCallback((tip) => {
    //dispatch(updatedETA(time));
    action(tip);
    NavigationService.goBack();
  },[dispatch]);  

  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <AppText style={{ fontSize: 18, textAlign: 'center'}}>
          Want to leave a tip?
        </AppText>
        <View style={GlobalStyles.formControl}>
          <Input
            type="text"
            titleType="currency"
            title={currency}
            placeholder="Enter an amount"
            value={tipAmount}
            keyboardType="default"            
            onChange={setTipAmount}
          />
        </View>
        <View style={GlobalStyles.formControl}>
          <Button
            type="accent"
            onClick={() => saveTipAmount(tipAmount)}>
            CONTINUE
          </Button>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,
  },
});

MyOrderLeaveTipOtherScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'TIP',
    },
  });
