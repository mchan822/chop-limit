import React, { useState,useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, Input, Button, AppText, DealItem, DashedLine} from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { fetchAPI } from '~/core/utility';
import parseAddress from 'parse-address-string';
import {
  showNotification,
  updatePromoCode
} from '~/store/actions';

export const PromoCodeDetailScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const promoCode = useMemo(() => navigation.getParam('promoCode'), []);
  const [territoryAddress, setTerritoryAddress] = useState('');
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAPI(`/territory?territory=${promoCode.territory.tid}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        parseAddress(res.data.territory.warehouse_address, (err, addressObj) => {
          err = err;
          setTerritoryAddress(addressObj);
        });
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: "No Territory data" })),
      )
  },[]);

  return (
    <Screen isLoading={isLoading} showHeaderOverLayOnScroll>
      <View style={styles.container}>
        <View style={{backgroundColor: "#EFEFEF", flexDirection: "row", padding: 10, justifyContent:"space-between",marginTop: 10}}>
          <View style={{flexDirection: "row", flex: 0.6}}>
              <View style={styles.imageContainer}>
                  <Image
                      source={{ 
                              uri: 
                              promoCode.territory.app_image ||
                                  'https://via.placeholder.com/450?text=Image%20is%20not%20available',
                              }}
                      style={styles.image}
                  />
              </View>

              <View style={{marginLeft: 15}}>
                  <View style={{flexDirection: "row"}}>
                      <AppText style={{fontWeight: 'bold'}}>{promoCode.territory.name}</AppText>
                  </View>
                  <View style={{marginTop: 3}}>
                      <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}>{territoryAddress.street_address1}</AppText>
                  </View>
              </View>
          </View>                
          <View style={{flex: 0.3}}>              
              <View style={{flex: 1}}>
                <AppText style={{fontSize: 11, fontWeight: String(400), textAlign: 'left'}}>PROMO CODE</AppText>
              </View> 
              <View style={{flex: 1}}>
                <View style={{marginTop: 3}}><AppText numberOfLines={1} style={{fontSize: 13, color: Theme.color.redColor, fontWeight: String(400), textAlign: 'left'}}>{promoCode.promo_code.name} </AppText></View>
              </View>
          </View>             
      </View> 
      <View style={{justifyContent:'center', alignItems: 'center', marginVertical: 20}}>
        <View style={{backgroundColor:'#EFEFEF', width: 250, height: 100, alignItems: 'center',justifyContent: 'center', borderRadius: 20}}>
          <AppText style={{flex: 1,color: '#333', marginTop: 20, fontSize: 12}}>
              USE CODE TO GET
          </AppText>
          <AppText style={{flex: 3,color: '#333', marginTop: 10, fontSize: 25, fontWeight: 'bold'}}>
            {promoCode.promo_code.discount_formatted} OFF
          </AppText>
        </View>
      </View>
        <Button 
          style={{width:"100%", marginTop:0, }}
          onClick={() => navigation.navigate('PromoCodeCopy',{
                      promoCode : promoCode
              })}>
          <AppText style={{textTransform: 'uppercase', fontWeight: 'bold',}}> Copy Code: {promoCode.promo_code.name}</AppText>
        </Button>
        {promoCode.promo_code.min_order_amount != '' && <View style={{marginTop: 20}}>
          <AppText style={{color: '#333', fontWeight: 'bold', fontSize: 15}}>
            Minimum Order Amount Required
          </AppText>
          <AppText  style={{marginTop:0,color: '#333', fontSize: 14}}>
            Spend {promoCode.territory.currency.icon+promoCode.promo_code.min_order_amount} or more
          </AppText>
        </View>}
        {promoCode.promo_code.only_for_first_order == '1' && <View style={{marginTop: 20}}>
          <AppText style={{color: '#333', fontWeight: 'bold', fontSize: 15}}>
            First Order Only
          </AppText>
          <AppText  style={{marginTop:0,color: '#333', fontSize: 14}}>
            You can only use this promo code the first time you order from {promoCode.territory.name}
          </AppText>
        </View>}
        {promoCode.promo_code.has_products_only && <View style={{marginTop: 20}}>
          <AppText style={{color: Theme.color.redColor, fontWeight: 'bold', fontSize: 15}}>
           Valid for the menu item(s) listed below
          </AppText>
        </View>}        
        {
          promoCode.promo_code.has_products_only &&   ",",
          promoCode.promo_code.these_products_only.map((item, index) => {
            return (
              <View style={{marginTop: 10}}>
                {index > 0 && <DashedLine/>}
                <AppText style={{color: '#333', fontWeight: 'bold', fontSize: 15, marginTop: 10}}>
                {item.name}
              </AppText>
              <AppText  style={{marginTop:0,color: '#333', fontSize: 14}}>
              {promoCode.territory.currency.icon+item.original_price}
              </AppText>
              
            </View>          
            );
          })
        }
        {promoCode.promo_code.has_categories_only && <View style={{marginTop: 20}}>
        <AppText style={{color: Theme.color.redColor, fontWeight: 'bold', fontSize: 15}}>
           Valid for the menu categories listed below
        </AppText>
      </View>}
         {
          promoCode.promo_code.has_categories_only &&
          promoCode.promo_code.these_categories_only.map((item, index) => {
            return (
              <View style={{marginTop: 10}}>
                {index > 0 && <DashedLine/>}
              <AppText style={{color: '#333', fontWeight: 'bold', fontSize: 15, marginTop: 10}}>
              {item.name}
            </AppText>
            <AppText  style={{marginTop:0,color: '#333', fontSize: 14}}>
              {item.total_products} {item.total_products > 1 ? 'menu items' : 'menu item'}
            </AppText>
          </View>   
          
            );
          })
        }
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

  imageContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 40,
  },

  image: {
      width: 40,
      height: 40,
      borderRadius: 40,
  }
});

PromoCodeDetailScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Details',
    },
  });