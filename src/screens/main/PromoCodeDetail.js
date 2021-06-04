import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import { Screen, Input, Button, AppText, DealItem,} from '~/components';
import { setTerritory } from '~/store/actions';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { fetchAPI } from '~/core/utility';
import {
  showNotification,
  updatePromoCode
} from '~/store/actions';

export const PromoCodeDetailScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const promoCode = useMemo(() => navigation.getParam('promoCode'), []);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const dispatch = useDispatch();
  
  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        <DealItem
          item= {promoCode}
        />
        <AppText style={{marginTop:20,color: '#888'}}>
        Use promo code <AppText style={{color: '#333',fontWeight:'bold'}}>{promoCode.name}</AppText> at checkout to save {promoCode.discount_formatted} on {!promoCode.has_products_only && !promoCode.has_categories_only?"everything.":"selected items including: "}
        <AppText style={{color: '#333'}}>
        {
          promoCode.promo_code.has_products_only &&   ",",
          promoCode.promo_code.these_products_only.map((item, index) => {
            return (
              (index >= 1 ? "," : "") + item.name
            );
          })

        }
         {
          promoCode.has_categories_only &&
          promoCode.these_categories_only.map((item, index) => {
            return (
              (index >= 1 ? "," : "") + item.name
            );
          })
        }
        </AppText>
        </AppText>
        <Button 
            style={{width:"100%", marginTop:20, }}
            onClick={() => navigation.navigate('PromoCodeCopy',{
                        promoCode : promoCode
                })}>
            <AppText style={{textTransform: 'uppercase', fontWeight: 'bold',}}> Copy This Promo Code</AppText>
          </Button>
          {/* <Button 
            style={{width:"100%", marginTop:20, }}
            onClick={() => {
              dispatch(setTerritory(promoCode.territory));
              NavigationService.navigate('Products');
            }}>
            <AppText style={{textTransform: 'uppercase', fontWeight: 'bold',}}> Go To {promoCode.territory.name} </AppText>
          </Button> */}
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
  description: {
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
});

PromoCodeDetailScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Details',
    },
  });