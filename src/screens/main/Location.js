import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
// import Dialog from 'react-native-dialog';
// import GetLocation from 'react-native-get-location';
// import GeoCoder from 'react-native-geocoding';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import OrderSVG from '~/assets/images/invoice.svg';
// import RestaurantSVG from '~/assets/images/restaurant.svg';
// import UserSVG from '~/assets/images/user.svg';
// import ChatSVG from '~/assets/images/chat.svg';
import { NavigationService } from '~/core/services';
// import { Config } from '~/core/config';
// import LinearGradient from 'react-native-linear-gradient';
import { fetchAPI } from '~/core/utility';
import { Screen, LocationSelector, StoredAddress,Button, AppText,StickyBottom } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import {
  showNotification,
  setOrder,
  setToken,
  setAddress as setAddressAction,
  setAddressFull as setAddressFullAction,
  cancelOrder,
  subscriptionAddressUpdated,
  enterMessageRoom,
  setBanner,
  changedAddress
} from '~/store/actions';

process.nextTick = setImmediate;

export const LocationScreen = ({navigation}) => {
  const [address, setAddress] = useState('');
  const [addressFull, setAddressFull] = useState(null);
  const [dlgVisible, setDlgVisible] = useState(false);
  const mapRef = useRef();
  const dispatch = useDispatch();  
  const [isLoading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);
  const guestToken = useSelector((state) => state.account.guestToken);
  const order = useSelector((state) => state.order.order);
  const addressState = useSelector((state) => state.explorer.address);  
  const order_addressChanged = useSelector((state) => state.notification.addressChanged);
  const editSubscription = useMemo(() => navigation.getParam('editSubscription'), []);
  const subscription_Sid = useMemo(() => navigation.getParam('subscription_id'), []);
  const territory_id = useMemo(() => navigation.getParam('territory_id'), []);
  const changeAddress_Order = useMemo(() => navigation.getParam('changeAddress_Order'), []);
  const subscription_delivery_type = useMemo(() => navigation.getParam('delivery_type'), []);
/*
  useEffect(() => {
    setLoading(true);

    GeoCoder.init(Config.googleAPIKey);

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(() => {})
      // .catch((err) =>
      // dispatch(showNotification({ type: 'error', message: err.message })),
      // )
      .finally(() => setLoading(false));
  }, []);
*/
  const _cancelOrder = useCallback(async () => {
    setLoading(true);    
  }, [dispatch]);
  
  const windowWidth = Dimensions.get("window").width;
  useEffect(() => {
    if(windowWidth < 400 ){
      navigation.setParams({
        fontSize: 18
      });
    } 
  
  }, [windowWidth]);
  const lastAddress = useMemo(() => {
    if (order && order.address_id) {
      return order.address_id;
    } else if (order && order.address) {
      return order.address;
    } else if (addressState) {
      return addressState;
    } else if (address) {
      return address;
    } else {
      return false;
    }
  }, [order, addressState, address]);

  const setDeliveryAddress = useCallback(
    (address, type = 'address', addressFull = null) => {
      //if user change his address then cancel his current order.
      console.log('current address+++++',lastAddress);
      console.log('changed address--------',address);
      if(editSubscription ==  true)
      {
        setLoading(true);
        const formData = new FormData();
        formData.append('subscription_id', subscription_Sid);
        formData.append('address_id', address);
        formData.append('delivery_type',subscription_delivery_type);
        fetchAPI('/subscription/update_address', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: formData,
        })
          .then((res) => {
            dispatch(subscriptionAddressUpdated(true));
            dispatch(showNotification({ type: 'success', message: res.message }));
            NavigationService.goBack();
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
      } else if(changeAddress_Order == true) {
        setLoading(true);
        if (token  && ( userInfo && userInfo.user_verified  && userInfo.user_verified == true)) {   
          const formData = new FormData();
          formData.append(type, address);
          formData.append('from_device', Platform.OS);
          fetchAPI('/order/address', {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          })
            .then((res) => {
              dispatch(setBanner(res.data.banner_url));
              dispatch(setOrder(res.data));
              console.log("address setted+++++++++",res.data);
              dispatch(setAddressAction(res.data.address));
              if (addressFull) {
                dispatch(setAddressFullAction(addressFull));
              }
              dispatch(changedAddress(!order_addressChanged));
              // if (res.data.has_address_info) {
              NavigationService.goBack();
              // } else {
              //   NavigationService.navigate('LocationType');
              // }
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
          setLoading(true);
          const formData = new FormData();
          formData.append(type, address);
          formData.append('as_guest', 1);
          formData.append('from_device', Platform.OS);
          fetchAPI('/order/address', {
            method: 'POST',
            body: formData,
          })
            .then((res) => {       
              dispatch(setBanner(res.data.banner_url));   
              dispatch(setOrder(res.data));
              console.log("address setted+ as guest ++++++++",res.data);
              dispatch(setToken(res.data.token));
              if (addressFull) {
                dispatch(setAddressFullAction(addressFull));
              }
              dispatch(changedAddress(!order_addressChanged));
              NavigationService.goBack();
              // if (res.data.has_address_info) {
              //   NavigationService.navigate('Home');
              // } else {
              //   NavigationService.navigate('LocationType');
              // }
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
          dispatch(setAddressAction(address));
          dispatch(setAddressFullAction(addressFull));
          dispatch(changedAddress(!order_addressChanged));
          NavigationService.goBack();
        }
      } else {
        if(lastAddress != address &&  (order && order.cart_amount> 0 ) && ( token || guestToken)){
          setLoading(true);
        // _cancelOrder();
          fetchAPI('/order/cancel', {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token ? token : guestToken}`,
            },
          })
            .then(async (res) => {
              dispatch(cancelOrder());       
              console.log("order_cancelled!!!!!!!!!!!!!!!!!!!!!!!!");
              if (token  && ( userInfo && userInfo.user_verified  && userInfo.user_verified == true)) {   
                const formData = new FormData();
                formData.append(type, address);
                formData.append('from_device', Platform.OS);
                await fetchAPI('/order/address', {
                  method: 'POST',
                  headers: {
                    authorization: `Bearer ${token}`,
                  },
                  body: formData,
                })
                  .then((res) => {
                    dispatch(setBanner(res.data.banner_url));
                    dispatch(setOrder(res.data));
                    console.log("address setted+++++++++",res.data);
                    dispatch(setAddressAction(res.data.address));
                    if (addressFull) {
                      dispatch(setAddressFullAction(addressFull));
                    }
                  
                    // if (res.data.has_address_info) {
                      NavigationService.reset('Home');
                    // } else {
                    //   NavigationService.navigate('LocationType');
                    // }
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
                setLoading(true);
                const formData = new FormData();
                formData.append(type, address);
                formData.append('as_guest', 1);
                formData.append('from_device', Platform.OS);
                await fetchAPI('/order/address', {
                  method: 'POST',
                  body: formData,
                })
                  .then((res) => {       
                    dispatch(setBanner(res.data.banner_url));   
                    dispatch(setOrder(res.data));
                    console.log("address setted+ as guest ++++++++",res.data);
                    dispatch(setToken(res.data.token));
                    if (addressFull) {
                      dispatch(setAddressFullAction(addressFull));
                    }
                    NavigationService.reset('Home');
                    // if (res.data.has_address_info) {
                    //   NavigationService.navigate('Home');
                    // } else {
                    //   NavigationService.navigate('LocationType');
                    // }
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
                dispatch(setAddressAction(address));
                dispatch(setAddressFullAction(addressFull));
                NavigationService.reset('Home');
              }
            })
            .catch((err) =>
              dispatch(showNotification({ type: 'error', message: err.message })),
            );
          
        } else {
        //////////
          if (token && userInfo && userInfo.user_verified && userInfo.user_verified == true) {
            setLoading(true);

            const formData = new FormData();
            formData.append(type, address);
            formData.append('from_device', Platform.OS);
            fetchAPI('/order/address', {
              method: 'POST',
              headers: {
                authorization: `Bearer ${token}`,
              },
              body: formData,
            })
              .then((res) => {
                dispatch(setBanner(res.data.banner_url));
                dispatch(setOrder(res.data));
                console.log("address setted+++++++++",res.data);
                dispatch(setAddressAction(res.data.address));
                if (addressFull) {
                  dispatch(setAddressFullAction(addressFull));
                }
              
                // if (res.data.has_address_info) {
                  NavigationService.reset('Home');
                // } else {
                //   NavigationService.navigate('LocationType');
                // }
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
            setLoading(true);
            const formData = new FormData();
            formData.append(type, address);
            formData.append('as_guest', 1);
            formData.append('from_device', Platform.OS);
            fetchAPI('/order/address', {
              method: 'POST',
              body: formData,
            })
              .then((res) => {         
                dispatch(setBanner(res.data.banner_url)); 
                dispatch(setOrder(res.data));
                console.log("address setted+ as guest ++++++++",res.data);
                dispatch(setToken(res.data.token));
                if (addressFull) {
                  dispatch(setAddressFullAction(addressFull));
                }
                NavigationService.reset('Home');
                // if (res.data.has_address_info) {
                //   NavigationService.navigate('Home');
                // } else {
                //   NavigationService.navigate('LocationType');
                // }
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
            dispatch(setAddressAction(address));
            dispatch(setAddressFullAction(addressFull));
            NavigationService.reset('Home');
          }
        }
      }
    },
    [dispatch, token, guestToken, editSubscription],
  );
  
  const deleteAddress = useCallback(
    (addressId) => {
      setLoading(true);
      console.log("order++++++++++++++",order);
      if(order && order.address_id == addressId){       
        console.log("sdfsdfsfd1",order.address_id);
        fetchAPI('/order/cancel', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token ? token : guestToken}`,
          },
        })
          .then((res) => {
            dispatch(cancelOrder());
            dispatch(setAddressAction(false));
            dispatch(setAddressFullAction(false));
            // console.log("setOrder called --------%%%%%%%%%%%");
            dispatch(enterMessageRoom(addressId));            
          })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
      }
      const formData = new FormData();
      formData.append('address_id', addressId);

      fetchAPI('/myaccount/remove_address', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((res) => {
          setAddresses(
            addresses.filter(
              (item) => item.id.toString() !== addressId.toString(),
            ),
          );
          dispatch(enterMessageRoom(addressId));          
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    },
    [dispatch, token, addresses],
  );
/*
  const selectCurrentLocation = useCallback(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((location) => {
        GeoCoder.from([location.latitude, location.longitude])
          .then((json) => {
            let addressResult = json.results[0];
            setAddressFull(addressResult);
            setAddress(addressResult.formatted_address);
            setDlgVisible(true);
            setDeliveryAddress(address,'address',addressFull);
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          );
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      );
  }, [dispatch]);
*/
  useEffect(() => {
    if (token) {      
      setLoading(true);
      fetchAPI(`/myaccount/addresses?territory_id=${territory_id}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {         
          console.log("ssssssssssssssssssssssssssssssssssssssss", res.data);
          console.log("ssssssssssssssssssssssssssssssssssssssss", territory_id);          
          setAddresses(res.data.addresses); 
          if (order && order.address_id) {
            const currentAddress = res.data.addresses.find(
              (item) => item.id == order.address_id,
            );
            if (currentAddress && mapRef.current) {              
              mapRef.current.setAddressText(currentAddress.full_address);
              setAddress(currentAddress.full_address);
            }
          }       
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }
  }, [dispatch, order, mapRef,territory_id]);

  return (
    <Screen isLoading={isLoading} hasList stickyBottom={<StickyBottom />} >    
     
      
      <View style={styles.container}>       
        {addresses && addresses.length > 0 && (
          <>
            <View style={{marginTop: 10, marginBottom: 10}}><AppText style={styles.formHeading}>Delivery Address</AppText></View>
            {addresses && addresses.length == 1 ? <AppText style={styles.description}>You have one delivery address saved</AppText> : <AppText style={styles.description}>Select one of your saved addresses</AppText>}
            <FlatList
              style={styles.list}
              scrollEnabled={false}
              data={addresses}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.address}
                  activeOpacity={0.8}
                  onPress={() => {
                    setDeliveryAddress(item.id, 'address_id');
                  }}>
                  <View style={styles.iconWrapper}>
                    <Icon size={24} color={'#333'} name="map-marker" />
                  </View>
                  <View style={styles.addressWrapper}>
                    <StoredAddress address={item} />
                  </View>
                  <TouchableOpacity
                    onPress={(ev) => {
                      ev.stopPropagation();
                      Alert.alert(
                        '',
                        'Are you sure you want to delete this address?',
                        [
                          {
                            text: 'Yes',
                            onPress: () => {
                              deleteAddress(item.id);
                            },
                            style: 'ok',
                          },
                          {
                            text: 'Cancel',
                            onPress: () => {},
                            style: 'cancel',
                          },
                        ],
                      );
                    }}>
                    <Icon size={20} color={'#333'} name="trash-can-outline" />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </>
        )}
        <AppText style={{...styles.description,marginTop:15}}>You can save up to 5 delivery addresses</AppText>
        <Button
              type="white"
              style={{marginTop: 10}}
              fullWidth
              onClick={() => {
                if(changeAddress_Order == true) {
                  NavigationService.navigate('SelectDelivery3',{changeAddress:true, territory_id: territory_id});
                } else {
                  NavigationService.navigate('SelectDelivery3');
                }
              }}>
              ADD AN ADDRESS
            </Button>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 60,
    paddingBottom: Theme.layout.screenPaddingBottom,
  },

  text: {
    textTransform: 'uppercase',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    letterSpacing: 0.5,
  },
  
  menuButton: {    
    height: 120,
    marginHorizontal:5,
    marginVertical:5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
  },

  unreadDot: {
    borderRadius: 3,
    textAlign:"center", 
    fontSize: 10,
    color: "#fff",
    backgroundColor: "#f00",
    height: 15,
    minWidth: 13,
    paddingLeft:2, 
    paddingRight: 2, 
    fontWeight: "bold", 
    borderRadius: 25, 
    position: 'absolute',
    right: 10,
    top: 5    
  },
  
  description: {
    color: 'grey',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center'
  },

  list: {},

  address: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,

    backgroundColor: '#e8e8e8',
  },

  iconWrapper: {
    width: 30,
  },

  addressWrapper: {
    flex: 1,
  },
  myCartButton: {
    marginHorizontal: 10,
    marginVertical: 20,
  },
  formHeading : {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',    
    marginTop: 0,
    fontSize: 16
  },
});

LocationScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title')
        ? navigation.getParam('title')
        : 'Deliver To',
    },
  });
