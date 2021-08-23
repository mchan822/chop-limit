import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';
import { NavigationService } from '~/core/services';

export const StartSellingScreen = ({ navigation }) => {

    const token = useSelector((state) => state.account.token);

    const [isLoading, setLoading] = useState(false);
    
    const [businessName, setBusinessName] = useState('');
    const [promo, setPromo] = useState('');

    const dispatch = useDispatch();

    const send = useCallback(() => {
        setLoading(true);

        const formData = new FormData();

        if(!businessName){
            dispatch(showNotification({ type: 'error', message: 'Please enter Business Name' }))
            setLoading(false);
            return
        }
        
        formData.append('business_name', businessName);
        formData.append('promo_code', promo);
        

        fetchAPI(`/seller/signup`, {
            method: 'POST',
            body: formData,
            headers: {
                authorization: `Bearer ${token}`,
            },
        })
        .then((res) => {
            NavigationService.reset('StartSellingSucess');
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }, [businessName,promo]);

    useEffect(() => {
        navigation.setParams({
        action: send,
        actionTitle: 'Submit',
        actionColor: 'black',
        });
    }, [send]);

    return (
        <Screen isLoading={isLoading} keyboardAware={true}>
            <View style={styles.container}>
                <AppText style={styles.formHeading}>Chow Local® is exclusively for locally owned and operated restaurants. Unlike other delivery apps we don't charge restaurants crazy commissions.</AppText>
                <Input
                style={GlobalStyles.formControl}
                title="Restaurant"
                placeholder="Restaurant Name"
                value={businessName}
                onChange={setBusinessName}
                />

                <Input
                style={GlobalStyles.formControl}
                title="Promo Code"
                placeholder="If you have one, enter it here"
                value={promo}
                onChange={setPromo}
                />

                <Button 
                type="accent" 
                style={styles.button}
                onClick={send}>
                Sign Up</Button>
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

  formHeading : {
      color:'gray',
      textAlign: 'center',
      fontSize: 14,
      // textTransform: 'uppercase',
      width: '90%',
      alignSelf: 'center',
      marginBottom: 10
  },

  description: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },

  button : {
    marginTop : 10
  },

  successLogo : {
      alignItems: 'center'
  },

  successTitle : { 
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },

  successSubtitle : { 
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

StartSellingScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Restaurant',
    },
  });
