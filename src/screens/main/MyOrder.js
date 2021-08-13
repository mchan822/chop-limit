import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {CheckBox} from 'react-native-elements';
import MapView from 'react-native-maps';
import GeoCoder from 'react-native-geocoding';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { showLocation } from 'react-native-map-link';
import { Config } from '~/core/config';

import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
import {
  Screen,
  CartItem,
  Button,
  DeliveryMode,
  AppText,
  StoredAddress,
  Selector,
} from '~/components';
import { Theme, MainNavigationOptions, GlobalStyles } from '~/styles';

import { fetchAPI, formatString } from '~/core/utility';
import {
  showNotification,
  setOrder,
  cancelOrder,
  setUserInfo,
  setTerritory,
  setToken,
  updatedNotes,
  updatePromoCode,
  setOrderProduct,
  setBanner
} from '~/store/actions';
import { DashedLine } from '../../components';
import FingerSVG from '~/assets/images/finger.svg';
import OrderSVG from '~/assets/images/invoice_black.svg';
import DealSVG from '~/assets/images/deal.svg';
import { AppEventsLogger } from "react-native-fbsdk-next";

export const MyOrderScreen = ({ navigation }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('');
  const [geoCode, setGeoCode] = useState(null);
  const [isDeliveryDisabled, setDeliveryDisabled] = useState(false);
  const [isPickupDisabled, setPickupDisabled] = useState(false);
  const [cards, setCards] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order.order);
  const guestToken = useSelector((state) => state.account.guestToken);
  const userInfo = useSelector((state) => state.account.userInfo);
  const territory = useSelector((state) => state.order.territory);
  const [tipValue, setChecked] = useState('');
  const [paymentType, setPaymentType] = useState('1');
  const [checked, setOther] = useState('');
  const updated = useSelector((state) => state.notification.updated);
  const updatedNote = useSelector((state) => state.notification.updatedNote);
  const addedPromoCode = useSelector((state) => state.notification.updatePromoCode);
  const isUpdateCard = useSelector((state) => state.notification.isUpdateCard);
  const order_addressChanged = useSelector((state) => state.notification.addressChanged)
  const [note, setNote] =  useState();
  const [noteLink, setNoteLink] =  useState();
  const [screenMode, setScreenMode] =  useState('myorder');

  useEffect(() => {
    if(territory && territory.pay_type_pay_now_active == true) {
      setPaymentType('1');
    } else {
      setPaymentType('2');
    }
  },[territory]);

  const _pay_cash = useCallback(() => {
    if(orderDetail)
    AppEventsLogger.logEvent('Initiate Checkout',orderDetail.cart_total_amount,{
      NUM_ITEMS : orderDetail.cart_quantity,
      CURRENCY : orderDetail.currency
    })

    if (!userInfo || !userInfo.email && userInfo.user_verified == false) {
        NavigationService.navigate('GetAccessGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tipValue,
        });  
    }else if(!userInfo.email && userInfo.user_verified == true){
      NavigationService.navigate('ProfileGuest', {
        deliveryMode: deliveryMode,
        tip_percentage: tipValue,
        signup_already: true,
        pay_cash: true
      });
    } else {
      setLoading(true);

      const formData = new FormData();
      formData.append('delivery_type', deliveryMode);
      formData.append('tip_percentage', tipValue);

      fetchAPI('/order/cash_on_delivery', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token ? token : guestToken}`,
        },
        body: formData,
      })
        .then((res) => {
          dispatch(setUserInfo({ totalOrders: +userInfo.totalOrders + 1 }));
          dispatch(cancelOrder());
          NavigationService.reset('OrderSuccess', {
            orderId: res.data.order_id,
            paymentType:'cash'
          });
        })
        .catch((err) => {
          if(err.message == "order-expired"){
            dispatch(cancelOrder());
            NavigationService.reset("Home");
          } else {
            dispatch(showNotification({ type: 'error', message: err.message}));        
          }
        })
        .finally(() => setLoading(false));
    }
  }, [userInfo, deliveryMode, tipValue, orderDetail]);
  const _pay = useCallback(() => {
    if(orderDetail)
    AppEventsLogger.logEvent('Initiate Checkout',orderDetail.cart_total_amount,{
      NUM_ITEMS : orderDetail.cart_quantity,
      CURRENCY : orderDetail.currency
    })

    if (!userInfo || !userInfo.email && userInfo.user_verified == false) {      
        
        NavigationService.navigate('GetAccessGuest', {
          deliveryMode: deliveryMode,
          tip_percentage: tipValue,
        });  
    }else if(!userInfo.email && userInfo.user_verified == true){
      NavigationService.navigate('ProfileGuest', {
        deliveryMode: deliveryMode,
        tip_percentage: tipValue,
        signup_already: true,
      });
    } else if (userInfo.creditcard ) {
      setLoading(true);

      const formData = new FormData();
      formData.append('delivery_type', deliveryMode);
      formData.append('tip_percentage', tipValue);

      fetchAPI('/order/pay', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token ? token : guestToken}`,
        },
        body: formData,
      })
        .then((res) => {
          dispatch(setUserInfo({ totalOrders: +userInfo.totalOrders + 1 }));
          dispatch(cancelOrder());
          NavigationService.reset('OrderSuccess', {
            orderId: res.data.order_id,
            paymentType: "credit_card"
          });
        })
        .catch((err) => {
          console.log("aaaaaaaaaaaaaaaerrrrooooorrrrrrrrrraaaaaaaaaaaa",err.message);
          if(err.message == "order-expired"){
            dispatch(cancelOrder());
            NavigationService.reset("Home");
          } else {
           
            NavigationService.navigate('Account/CreditCard', {
              deliveryMode: deliveryMode,
              tip_percentage: tipValue,
              edit: true
            });
            dispatch(showNotification({ type: 'error_card', message: err.message}));
          }
        })
        .finally(() => setLoading(false));
    } else {
      NavigationService.navigate('Account/CreditCard', {
        deliveryMode: deliveryMode,
        tip_percentage: tipValue,
        edit: true
      });
    }
  }, [userInfo, deliveryMode, tipValue, orderDetail]);

  const updateQuantity = useCallback((item, qty) => {
    setLoading(true);

    const formData = new FormData();
    // formData.append('product_id', item.pid);
    // formData.append('option_sku', item.option_sku);
    formData.append('order_product_id', +item.opid);
    formData.append('quantity', qty);

    // if(item.extras){
    //   for (var key in item.extras) {
    //     let addOn = item.extras[key];
    //     let addOnSKU = key;

    //     for (var optionKey in addOn.options){
    //       let addOnValue = optionKey;
    //       formData.append('extra_'+addOnSKU+'[]', addOnValue);
    //     }
    //   }
    // }

    fetchAPI('/order/update_product_quantity', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        getOrderDetails();
      })
      .catch((err) => dispatch(showNotification(err.message)))
      .finally(() => setLoading(false));
  }, []);

  const removeProduct = useCallback((item) => {
    setLoading(true);

    const formData = new FormData();
    // formData.append('product_id', item.pid);
    // formData.append('option_sku', item.option_sku);
    formData.append('order_product_id', item.opid);

    fetchAPI('/order/remove_product', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
      body: formData,
    })
      .then((res) => {
        dispatch(setOrder(res.data));
        getOrderDetails();
      })
      .catch((err) => dispatch(showNotification({ type: 'error', message: err.message })))
      .finally(() => setLoading(false));
  }, []);

  // get Order Details
  const getOrderDetails = useCallback(() => {
    setNoteLink("+ Order Note");
    setNote('');
    dispatch(updatePromoCode(''));
    setLoading(true);
    
    fetchAPI('/order/details', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then((res) => {        
        dispatch(setOrder(res.data));
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", res.data);
        setOrderDetail(res.data);
        if(res.data.cart_quantity == '0'){
          NavigationService.reset('Home');
        }
        dispatch(updatedNotes(res.data.notes));
        setNote(res.data.notes);
        dispatch(setTerritory(res.data.territory));        
        setDeliveryDisabled(
          +res.data.territory_distance >
            +res.data.territory.delivery_area_radius && res.data.territory.offer_delivery == '1',
        );
        setPickupDisabled(+res.data.territory.offer_pickup == 0);
        setDeliveryMode(
          +res.data.territory_distance >
            +res.data.territory.delivery_area_radius
            ? 'pickup'
            : 'deliver',
        );
        MyOrderScreen.navigationOptions = ({ navigation }) =>
        MainNavigationOptions({
          navigation,
          options: {
            headerTitle: res.data.has_subscription_products == true ? 'subscription' : 'My cart',
            headerTintColors: 'black',
          },
          headerTitleStyle: {
            color: 'black',
          },
        });
        GeoCoder.init(Config.googleAPIKey);

        GeoCoder.from(res.data.territory.warehouse_address)
          .then((json) => {
            const location = json.results[0].geometry.location;
            setGeoCode({
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            });
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          );
      })
      .catch((err) =>
        //dispatch(showNotification({ type: 'error', message: err.message })),
        {
          dispatch(showNotification({ type: 'error', message: err.message }))
          NavigationService.reset('Home');
          dispatch(cancelOrder())
        }
        
      )
      .finally(() => setLoading(false));
  }, []);

  const _cancelOrder = useCallback(() => {
    setLoading(true);

    fetchAPI('/order/cancel', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then(async (res) => {
        dispatch(cancelOrder());
        const formDataa = new FormData();
        if(order){
          if(order.address_id == '' || order.address_id == '0'){
            
            formDataa.append('as_guest', 1);
            formDataa.append('address', order.address);
            formDataa.append('from_device', Platform.OS);
            await fetchAPI('/order/address', {
              method: 'POST',
              body: formDataa,
            })
              .then((res) => {
                dispatch(setBanner(res.data.banner_url));
                console.log('cancelaaaaaaaled++++++',order.address);
                dispatch(setOrder(res.data));  
                dispatch(setToken(res.data.token));
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
          } else {
            console.log("address_id++++++++++",order.address_id);
            formDataa.append('address_id', order.address_id);
            formDataa.append('from_device', Platform.OS);
            await fetchAPI('/order/address', {
              method: 'POST',
              headers: {
                authorization: `Bearer ${token}`,
              },
              body: formDataa,
            })
              .then((res) => {
                dispatch(setBanner(res.data.banner_url));
                dispatch(setOrder(res.data));  
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
          }
        }
        NavigationService.reset('Home');
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: res.message })),
      );
  }, [order]);

  useEffect(() => {
    console.log("is updated CARD !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",isUpdateCard);
    if (token) {      
      setLoading(true);
      fetchAPI(`/myaccount/cards`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          setCards(res.data.cards);
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }
  }, [dispatch, isUpdateCard]);

  useEffect(() => {
    if(screenMode != "myorder"){
      navigation.setParams({ action: _pay, actionTitle: 'Pay' });
      navigation.setParams({
        backAction: () => setScreenMode('myorder'),
      });
      MyOrderScreen.navigationOptions = ({ navigation }) =>
        MainNavigationOptions({
          navigation,
          options: {
            headerTitle: 'CHECKOUT',
            headerTintColors: 'black',
          },
          headerTitleStyle: {
            color: 'black',
          },
        });
    } else {
      navigation.setParams({ action: null, actionTitle: null });
      navigation.setParams({
        backAction: () => navigation.goBack(),
      });
      MyOrderScreen.navigationOptions = ({ navigation }) =>
      MainNavigationOptions({
        navigation,
        options: {
          headerTitle: 'My Order',
          headerTintColors: 'black',
        },
        headerTitleStyle: {
          color: 'black',
        },
      });
    }
  }, [_pay,screenMode]);

  useEffect(() => getOrderDetails(), [updated,updatedNote,addedPromoCode,order_addressChanged]);

  useEffect(() => {
    if(updatedNote != ''){
      setNote(updatedNote);
      // setNoteLink('- Remove Note');
    }
  }, [updatedNote]);
  
  // const removeNote = useCallback((note) => {
  //   setLoading(true);
  //   const formData = new FormData();
  //   formData.append('notes', note);  
  //   fetchAPI('/order/notes', {
  //     method: 'POST',
  //     headers: {
  //       authorization: `Bearer ${token ? token : guestToken}`,
  //     },
  //     body: formData,
  //   })
  //     .then((res) => {
  //       dispatch(updatedNotes(''));
  //       getOrderDetails();
  //       //NavigationService.navigate('MyOrder');
  //     })
  //     .catch((err) => dispatch({ type: 'error', message: err.message }))
  //     .finally(() => setLoading(false));
  // }, []);

  const payButtonText = useMemo(
    () =>
      (userInfo && userInfo.creditcard && orderDetail ? 'PLACE ORDER' : 'Checkout') +
      (orderDetail &&
        ' ( ' +
          orderDetail.territory.currency.icon +
          (deliveryMode === 'deliver'
            ? +orderDetail.total_amount_with_delivery*(1+tipValue/100)
            : +orderDetail.total_amount_without_delivery*(1+tipValue/100)
          ).toFixed(2) + (orderDetail.has_subscription_products == true  ? (' ' + orderDetail.products[0].subscription_type_name_every): ''))  + ' )',
    [userInfo, orderDetail, deliveryMode, tipValue],
  );
  const showTaxLine = useMemo(() => {
    if (orderDetail === null) {
      return false;
    } else {
      if (deliveryMode === 'deliver') {
        return (+orderDetail.tax_amount_with_delivery).toFixed(2) > 0
          ? true
          : false;
      } else {
        return (+orderDetail.tax_amount_without_delivery).toFixed(2) > 0
          ? true
          : false;
      }
    }
  }, [orderDetail]);

  useEffect(() => {
    if(orderDetail){
      AppEventsLogger.logEvent('USER VIEWS THE CART',orderDetail.cart_total_amount,{
        NUM_ITEMS : orderDetail.cart_quantity,
        CURRENCY : orderDetail.territory.currency.icon
      })
    }
  },[orderDetail])

  const StickyButton = () => {   
    return (screenMode == 'myorder') ? (
      <View>
        {orderDetail && 
        <View style={styles.summaryRowStikcy}>
          <AppText style={[styles.summaryKey,{color:'gray'}]}>
            Food & Beverage Subtotal
            {/* ({orderDetail.taxes_percentage}%) */}
          </AppText>
          <AppText style={styles.summaryValue}>
            {`${
                  orderDetail.territory.currency.icon
                } ${(+orderDetail.cart_amount).toFixed(
                  2,
                )}`
            }
          </AppText>
        </View>}
      <Button
        type="accent"
        style={styles.myCartButton}      
        onClick={() => setScreenMode('checkout')}>
        CHECKOUT
      </Button>
      </View>
    ) : (
      <View style={{flexDirection: 'row'}}>  
       
        <Button
          style={styles.payButton}      
          type="accent"
          onClick={paymentType == '1' ? _pay : _pay_cash}>
          {payButtonText}
        </Button>
    </View>
    );
  };
 
  return (  screenMode == "myorder" ? (
   <Screen hasList isLoading={isLoading} showHeaderOverLayOnScroll stickyBottom={(<StickyButton/>)}>    
    <View style={styles.container}>
      {orderDetail && (
        <FlatList
          data={orderDetail.products}
          alwaysBounceVertical={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <CartItem
              orderDetail={orderDetail}
              product={item}
              
              updateQuantity={(e) => updateQuantity(item, e)}
              removeProduct={() => removeProduct(item)}
            />
          )} 
          />       
      )}
      <DashedLine/>
      <View style={styles.swipe}>
        <FingerSVG height={25} width={25}/>
        <AppText numberofLines={2} style={styles.swipeText}>Swipe left to remove an item.</AppText>
      </View>         
    </View>
  </Screen>)
  :   ( <Screen hasList isLoading={isLoading} showHeaderOverLayOnScroll stickyBottom={(<StickyButton/>)}> 
      <View style={styles.container}>
        {orderDetail && (
          <FlatList
            data={orderDetail.products}
            alwaysBounceVertical={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
             <></>
            )}            
            ListHeaderComponent={() => (
              <>
                {orderDetail && (
                  <>
                    <View style={styles.orderInfo}>
                      <View style={styles.orderInfoWrapper}>
                        <View style={styles.orderInfoSeller}>
                          <View style={styles.imageWrapper}>
                            {orderDetail.territory && (
                              <Image
                                source={{
                                  uri: orderDetail.territory.app_image,
                                }}
                                style={styles.image}
                              />
                            )}
                          </View>
                          <View style={styles.locationWrapper}>
                            <AppText style={styles.sellerName} numberOfLines={1}>
                              {formatString(orderDetail.territory.name, 20)}
                            </AppText>
                            <AppText>
                              {((token && orderDetail.territory.type_slug != 'services') ? (+orderDetail.territory_distance_km).toFixed(2)+(`km away`) : (orderDetail.territory.warehouse_address))}                              
                            </AppText>
                          </View>
                        </View>
                      </View>
                      <View style={styles.orderInfoTotal}>
                        <AppText style={[styles.summaryTotal]}>
                          {orderDetail.territory.currency.icon}
                          {(deliveryMode === 'deliver'
                            ? +orderDetail.total_amount_with_delivery*(1+tipValue/100)
                            : +orderDetail.total_amount_without_delivery*(1+tipValue/100)
                          ).toFixed(2)}
                        </AppText>
                      </View>
                    </View>
                    {!isPickupDisabled && (
                      <View style={styles.deliveryInfo}>
                        {!isDeliveryDisabled ?
                        <DeliveryMode
                          name="Get it delivered"
                          price={`${orderDetail.territory.currency.icon}${(
                            +orderDetail.delivery_amount || 0
                          ).toFixed(2)}`}
                          checked={deliveryMode === 'deliver'}
                          onPress={() => setDeliveryMode('deliver')}
                          disabled={isDeliveryDisabled}
                        /> : <View style={styles.deliveryWrapper}>
                            <AppText style={styles.deliveryNotText}>Delivery Not Available</AppText>
                            {orderDetail.territory.offer_delivery == '1' ?
                            <AppText style={styles.notAvailableText}>Address outside delivery zone</AppText>
                            :
                            <AppText style={styles.notAvailableText}>Not offer delivery </AppText>
                          }
                          </View>}

                        <View style={styles.verticalSeparator} />
                        <DeliveryMode
                          name="Pick it up"
                          price={'Free'}
                          checked={deliveryMode === 'pickup'}
                          onPress={() => setDeliveryMode('pickup')}
                          disabled={isPickupDisabled}
                        />
                      </View>
                    )}
                  </>
                )}
                {orderDetail && geoCode && (
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      initialRegion={geoCode}
                      pointerEvents="none"
                    />

                    {deliveryMode === 'deliver' ? (
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpatity={0.8}
                        onPress={() => {
                          NavigationService.navigate('Location', {
                            // addressId: orderDetail.address_id,
                            territory_id: orderDetail.territory_id,
                            changeAddress_Order: true
                          });
                        }}>
                        <View style={styles.locationInfo}>
                          <View style={styles.iconWrapper}>
                            <Icon name="map-marker" size={20} />
                          </View>
                          <View style={styles.locationWrapper}>
                            <StoredAddress address={orderDetail} />
                          </View>
                          <View style={styles.iconWrapper}>
                            <Icon name="chevron-right" size={30} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpatity={0.8}
                        onPress={() => {
                          // NavigationService.navigate('SellerLocation', {
                          //   seller: orderDetail.territory,
                          //   distance: orderDetail.territory_distance_km,
                          // });
                          showLocation({
                            latitude:
                              orderDetail.territory.warehouse_address_lat,
                            longitude:
                              orderDetail.territory.warehouse_address_lng,
                            title: orderDetail.territory.name,
                            googleForceLatLon: true,
                          });
                        }}>
                        <View style={styles.locationInfo}>
                          <View style={styles.iconWrapper}>
                            <Icon name="sign-direction" size={30} />
                          </View>
                          <View style={styles.locationWrapper}>
                            <AppText style={styles.sellerName}>
                              Directions to restaurant
                            </AppText>
                          </View>
                          <View style={styles.iconWrapper}>
                            <Icon name="chevron-right" size={30} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
            ListFooterComponent={() => (
              
              <View style={styles.footer}>
                <View style={styles.summary}>
                 <TouchableOpacity activeOpacity={0.7} style={styles.viewOrder} onPress={() => setScreenMode('myorder')}>
                   <OrderSVG height={25} width={25}></OrderSVG>
                   <AppText style={{fontSize:15,fontWeight:'bold', width:'100%', paddingLeft:10}} >View your Order</AppText>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={styles.viewPromoCode} onPress={() => NavigationService.navigate('PromoCodeEdit')}>
                   <DealSVG height={25} width={25}></DealSVG>
                   <AppText style={{fontSize:15,fontWeight:'bold', paddingLeft:10}} >Add A Promo Code</AppText>
                   <AppText style={styles.promoCodeText} numberOfLines={1}>{' '}
                      {orderDetail.promo_code_name}
                    </AppText> 
                </TouchableOpacity>
                <DashedLine/>
                {territory && territory.activate_tip == '1' ? <View style={styles.tipTitle}>
                    <AppText style={styles.summaryKey_tip}>
                      Add a Tip?                      
                    </AppText>
                    
                    {/* <RadioButton.Group style={styles.radio} onValueChange={newValue => {setChecked(newValue);setOther('notOther');}} value={tipValue}> */}
                      <View style={styles.radio}>
                        <CheckBox containerStyle={styles.radioBackground} title="10%" checkedColor={Theme.color.accentColor} checked={tipValue=='10' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setChecked('10');setOther('notOther');}}  uncheckedIcon='circle-o'/>
                        <CheckBox containerStyle={styles.radioBackground} title="15%" checkedColor={Theme.color.accentColor} checked={tipValue=='15' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setChecked('15');setOther('notOther');}}  uncheckedIcon='circle-o'/>
                        <CheckBox containerStyle={styles.radioBackground} title="20%" checkedColor={Theme.color.accentColor} checked={tipValue=='20' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setChecked('20');setOther('notOther');}}  uncheckedIcon='circle-o'/>
                        <CheckBox containerStyle={styles.radioBackground} title="Other"  checkedIcon='dot-circle-o'  uncheckedIcon='circle-o' checkedColor={Theme.color.accentColor} checked={checked == 'other' ? true : false}
                          onPress={() => {
                          NavigationService.navigate('SelectorPercentPage', {
                            title: 'Tip',
                            header: 'How much would you like to tip?',
                            options: [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].map((item) => ({
                              label: item+'%',
                              value: item,
                              selected: tipValue == item ? 'selected' : '',
                            })),
                            action: (value) => {
                              setChecked(value);
                              setOther('other');
                            },
                            noOptionsText: 'No Options Available',
                          });
                        }} />                       
                       </View> 
                  </View> : <></>
                }
                 { territory &&  territory.activate_tip == '1' && <DashedLine styleContainer={{ marginBottom: 15,borderRadius: 1, }}/>}
                 {orderDetail && 
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Food & Beverage Subtotal
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {deliveryMode === 'deliver'
                        ? `${
                            orderDetail.territory.currency.icon
                          } ${((+orderDetail.cart_amount)).toFixed(
                            2,
                          )}`
                        : `${
                            orderDetail.territory.currency.icon
                          } ${((+orderDetail.cart_amount)).toFixed(
                            2,
                          )}`}
                    </AppText>
                  </View>}
                 {orderDetail &&  orderDetail.promo_code_used == true ? <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Discount
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      { `${orderDetail.territory.currency.icon + '-'
                            } ${(+orderDetail.promo_code_amount).toFixed(2)}`}
                    </AppText>
                  </View>: <></> }
                 {orderDetail.territory.type_slug != 'services' && <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      {deliveryMode === 'deliver' ? 'Delivery ' : 'Pick up '}
                      {/* {orderDetail.delivery_time && "("+orderDetail.delivery_time+")"} */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {
                        deliveryMode === 'deliver'
                          ? `${
                              orderDetail.territory.currency.icon
                            } ${(+orderDetail.delivery_amount).toFixed(2)}`
                          : 'Free'
                        // `${orderDetail.currency_icon} ${(+orderDetail.pickup_total_amount).toFixed(2)}`
                      }
                    </AppText>
                  </View> }              
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Tax
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {deliveryMode === 'deliver'
                        ? `${
                            orderDetail.territory.currency.icon
                          } ${(+orderDetail.tax_amount_with_delivery).toFixed(
                            2,
                          )}`
                        : `${
                            orderDetail.territory.currency.icon
                          } ${(+orderDetail.tax_amount_without_delivery).toFixed(
                            2,
                          )}`}
                    </AppText>
                  </View>
                  {territory &&  territory.activate_tip == '1' ? <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>
                      Tip({tipValue}%)
                      {/* ({orderDetail.taxes_percentage}%) */}
                    </AppText>
                    <AppText style={styles.summaryValue}>
                      {deliveryMode === 'deliver'
                        ? `${
                            orderDetail.territory.currency.icon
                          } ${(+orderDetail.total_amount_with_delivery*tipValue/100).toFixed(
                            2,
                          )}`
                        : `${
                            orderDetail.territory.currency.icon
                          } ${(+orderDetail.total_amount_without_delivery*tipValue/100).toFixed(
                            2,
                          )}`}
                    </AppText>
                  </View>: <></> }
                </View>
                <View style={{paddingBottom:10}}>
                  <View style={{flexDirection:'row'}}>
                    <TouchableOpacity
                      activeOpacity={0.2}
                      style={{width:'60%', paddingLeft:20}}
                      // onPress={() => noteLink == '- Remove Note' ? (setNoteLink('+ Order Note'), setNote(''), removeNote('')) : NavigationService.navigate('OrderNoteEdit')}>
                      onPress={() => NavigationService.navigate('OrderNoteEdit',{note:note})}>
                      <AppText style={styles.specialNote} >
                        {noteLink}
                      </AppText> 
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                      activeOpacity={0.2}
                      style={{width:'40%', paddingRight:20}}
                      onPress={() =>  NavigationService.navigate('PromoCodeEdit')}>
                      <AppText style={styles.specialPromoCode} >
                        {'+ Promo Code'}
                      </AppText> 
                    </TouchableOpacity> */}
                  </View>
                  <View style={{flexDirection:'row',width:'100%'}}>
                    <AppText style={styles.specialNoteText} numberOfLines={2}>
                      {note}
                    </AppText> 
                    {/* <AppText style={styles.promoCodeText} numberOfLines={1}>
                      {orderDetail.promo_code_name}
                    </AppText>  */}
                  </View>
                    
                </View>
                <DashedLine/>
                <View style={styles.tipTitle}>
                    <AppText style={styles.summaryKey_tip}>
                      Payment Type 
                    </AppText>
                <View style={styles.radio}>
                  {territory && territory.pay_type_pay_now_active == true &&  
                  <CheckBox containerStyle={styles.radioBackground} title="Pay Now(Credit Card)" checkedColor={Theme.color.accentColor} checked={paymentType=='1' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setPaymentType('1');}}  uncheckedIcon='circle-o'/>
                  }
                  <CheckBox containerStyle={styles.radioBackground} title="Pay In Person" checkedColor={Theme.color.accentColor} checked={paymentType=='2' ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setPaymentType('2');}}  uncheckedIcon='circle-o'/>
                  </View>
                </View> 
                <View style={{flexDirection:'column', backgroundColor:'#e1e1e1', marginLeft:20, marginRight:20,marginBottom:10}}>
                    {((paymentType=='1' && cards && cards.length) != 0) &&
                    <View>
                    <AppText style={{fontSize:13,paddingTop:10,width:'100%', paddingLeft:10}} >                    
                      {(!cards || (cards && cards.length) == 0)?'':'We\'ll charge your credit card ending in '}{(cards && (cards && cards.length) != 0)&&<AppText style={{fontWeight:'bold'}}>{userInfo.creditcard.split(" ").pop()}</AppText>}
                    </AppText>
                    <TouchableOpacity
                      activeOpacity={0.2}
                      style={{width:'50%', paddingLeft:10, alignItems:"flex-start"}}
                      onPress={() =>  NavigationService.navigate('CreditCardList', {fromScreen:'MyOrder'})}>
                      {/* <Icon name="credit-card" style={{color:Theme.color.accentColor,paddingVertical:10,fontWeight:'bold', textAlign:'right'}} size={20} /> */}
                      <AppText style={{color:Theme.color.accentColor,fontSize:13,paddingVertical:5,fontWeight:'bold', textAlign:'right'}} >
                        {(!cards || (cards && cards.length) <= 1)? 'My Credit Card': 'My Credit Cards'}
                      </AppText> 
                    </TouchableOpacity>
                    </View>
                   }
                  </View>                    
                <View style={styles.actions}>                
                  {order.has_subscription_products != true &&
                  <Button
                    style={GlobalStyles.formControl}
                    type="bordered-dark"
                    onClick={() => {
                      dispatch(setOrderProduct(false));
                      NavigationService.navigate('Products');
                    }}>
                    Keep Shopping
                  </Button>}
                  <Button
                    style={GlobalStyles.formControl}
                    type="borderless"
                    onClick={_cancelOrder}>
                    Cancel This Order
                  </Button>
                </View>
              </View>
            )}
          />       
        )}
      </View>
      </Screen>)
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 80 : 80,
    paddingBottom: Theme.layout.screenPaddingBottom,
    flex: 1,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: 'grey',
  },

  radio: {
    flexDirection: 'row',
  },

  radioBackground: {
    backgroundColor: Theme.color.container,
    borderWidth: 0,
    marginLeft: 0,
    paddingHorizontal:0
  },

  summary: {
    paddingVertical: 10,
  },

  summaryRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },

  summaryRowStikcy: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    position:'absolute',
    bottom:70,
    display: 'flex',
    right:0,
    left:0,
  },

  viewOrder: {
    flexDirection:'row',
    backgroundColor:'#e1e1e1',
    marginLeft:20,
    marginRight:20,
    marginBottom:10,
    marginTop:10, 
    paddingHorizontal:15,
    paddingTop:15,
    paddingBottom:10
  },

  viewPromoCode: {
    flexDirection:'row',
    backgroundColor:'#e1e1e1',
    marginLeft:20,
    marginRight:20,
    marginBottom:20,
    marginTop: -5, 
    paddingHorizontal:15,
    paddingTop:15,
    paddingBottom:10
  },

  summaryKey: {
    fontSize: 16,
  },

  summaryKey_tip: {
    fontSize:16,
    marginTop:15
  },

  tipTitle: {
    fontSize: 16,
    flexDirection: 'column',
    marginBottom: 5,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  summaryTotal: {
    fontSize: 24,
    textAlign: 'center',
  },

  actions: {
    paddingHorizontal: 20,
    marginBottom: 50
  },

  deliveryInfo: {
    flexDirection: 'row',

    borderTopWidth: 1,
    borderTopColor: Theme.color.borderColor,
    borderBottomWidth: 1,
    borderBottomColor: Theme.color.borderColor,
  },

  verticalSeparator: {
    borderLeftWidth: 1,
    borderLeftColor: Theme.color.borderColor,
  },

  mapContainer: {
    height: 130,
    position: 'relative',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  locationInfo: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 35,
    left: 20,
    right: 20,
    bottom: 35,
    backgroundColor: 'white',

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationWrapper: {
    flex: 1,
  },

  imageWrapper: {
    width: 60,
    alignItems: 'center',
  },

  swipe: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,    
    marginBottom: 130
  },

  swipeText: {
    fontSize: 14,
    color: 'gray',
    marginLeft: 20,
    textAlign: 'center',
  },

  
  myCartButton: {
    marginHorizontal: 18,    
    marginVertical: 15,  
    position:'absolute',
    bottom:0,
    display: 'flex',
    right:0,
    left:0,
  },

  payButton: {
    marginLeft: 20,    
    marginVertical: 15, 
    marginRight:20,   
    bottom:0,
    flex:1,
    display: 'flex',
  },

  doorButton: {
    flex:1,
    marginLeft: 20,    
    marginVertical: 15,
    bottom:0,
    display: 'flex',
  },

  image: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth:1,
    borderColor:'#EFEFEF'
  },

  iconWrapper: {
    width: 40,
    alignItems: 'center',
  },

  sellerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  distance: {
    color: 'red',
    fontSize: 14,
  },

  orderInfo: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginBottom: 10,
  },

  orderInfoWrapper: {
    flex: 6,
    flexDirection: 'column',
  },

  orderInfoSeller: {
    flex: 2,
    flexDirection: 'row',
  },

  specialNote: {
    color:Theme.color.accentColor,
    fontSize:17,
    paddingVertical:10
  },

  specialPromoCode: {
    color:Theme.color.accentColor,
    fontSize:17,
    paddingVertical:10,
    textAlign:'right',
  },

  specialNoteText: {
    width: '100%',
    color:'black',
    fontSize:14,
    paddingTop:10,
    paddingLeft: 20,
    marginTop:-15
  },

  promoCodeText: {
    color:'black',
    fontSize:16,
    
    marginLeft:0,
    paddingRight:20,
    marginTop:0
  },

  orderInfoTotal: {
    flex: 4,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  deliveryWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
    
  },

  deliveryNotText: {
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft:20,
  },
  notAvailableText: {
    color: Theme.color.accentColor,
    fontWeight: 'bold',
    fontSize:10,
    paddingLeft:20,
  }
});

MyOrderScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'My Order',
      headerTintColors: 'black',
    },
    headerTitleStyle: {
      color: 'black',
    },
  });