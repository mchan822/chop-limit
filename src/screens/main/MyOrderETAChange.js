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
import moment from 'moment-timezone';
import { fetchAPI } from '~/core/utility';
import { Screen, LocationSelector, StoredAddress,Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import DatePicker from 'react-native-date-picker'

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

export const MyOrderETAChangeScreen = ({navigation}) => {
  const [address, setAddress] = useState('');
  const [addressFull, setAddressFull] = useState(null);
  const [dlgVisible, setDlgVisible] = useState(false);
  const dispatch = useDispatch();  
  const [isLoading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);
  const guestToken = useSelector((state) => state.account.guestToken);
  const order = useSelector((state) => state.order.order);
  const addressState = useSelector((state) => state.explorer.address);  
  const order_addressChanged = useSelector((state) => state.notification.addressChanged);
  const territory_id = useMemo(() => navigation.getParam('territory_id'), []);
  const [changedAddress_id, setChangedAddress] = useState(navigation.getParam('address_id'));
  const is_pre_order = useMemo(() => navigation.getParam('is_pre_order'), []);
  const preOrderDateString = useMemo(() => navigation.getParam('preOrderDateString'), []);
  const operationTime = useMemo(() => navigation.getParam('operationTime'), []);
  const [operationTimeText, setOperationTimeText] = useState('');
  const [etaType, setETAType] = useState(navigation.getParam('is_pre_order') == false ? 1 : 2);
  const [preOrder, setPreOrder] = useState('');
  const [calendarString, setCalendarString] = useState(navigation.getParam('is_pre_order') == false ? 'Pre-order for later' : navigation.getParam('preOrderDateString'));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const [orderDate, setDate] = useState(new Date());   
  const [time, setTime] = useState(new Date());


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
              setChangedAddress(res.data.address_id);              
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
    },
    [dispatch, token, guestToken],
  );
  
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
          setAddresses(res.data.addresses);         
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }
  }, [dispatch, order, territory_id]);

  useEffect(() =>{ 
      
    const dateRegina = moment(orderDate).tz('America/Regina').format(); 
    const preOrderTime = new Date(dateRegina.substring(0,19)+".000Z");
    var indexDay = preOrderTime.getDay() == 0 ? 6 : preOrderTime.getDay() - 1;
    console.log("@@@@@@@3333",indexDay,operationTime[indexDay]); 
    setOperationTimeText("We’re open from "+operationTime[indexDay].from + " to " + operationTime[indexDay].till);
    setPreOrder(preOrderTime);    
    // console.log("@@@@@@@@@@@@", moment(dateRegina).format('h:mm A'));
    const second =  new Date(orderDate);
    second.setMinutes(second.getMinutes() + 30);    

    console.log("@@@@@@@********",new Date(),new Date(new Date().toISOString().substring(0,10))); 
    // console.log("@@@@@@@@@@@@", moment(preOrderTime).format('MM-DD-YYYY hh:mm a'));
    // setTime(second);
  },[orderDate]);

  const setPreOrderASAP = useCallback(() => {
    setLoading(true);
    const formData = new FormData();
    formData.append('date', "");
    fetchAPI(`/order/set_pre_order_data`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        console.log("11111111111111111");
        dispatch(changedAddress(!order_addressChanged));
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  },[token,dispatch])

  const setPreOrderData = useCallback((preOrder) => {    
    const dateRegina = moment(orderDate).tz('America/Regina').format();
    const second =  new Date(dateRegina);
    second.setMinutes(second.getMinutes() + 30);
    console.log("@@@@@@@@@@@@",orderDate.toDateString().substring(0,10)+" "+moment(dateRegina).format('h:mm A')+" - "+moment(second).format('h:mm A'));
    setCalendarString(orderDate.toDateString().substring(0,10)+" ("+moment(dateRegina).format('h:mm A')+" - "+moment(second).format('h:mm A')+")");
    var preOrderString = orderDate.toDateString().substring(0,10)+" ("+moment(dateRegina).format('h:mm A')+" - "+moment(second).format('h:mm A')+")";
    setLoading(true);
    const formData = new FormData();
    formData.append('date', preOrder.toISOString().substring(0,16).replace("T"," "));
    formData.append('pre_order_date_string', preOrderString);
    fetchAPI(`/order/set_pre_order_data`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        console.log("###############",res);
        if(res.message_type == "warning"){
          dispatch(showNotification({ type: 'error', message: res.message }));
        } else {
          setShowTimePicker(false);
          // dispatch(showNotification({ type: 'success', message: res.message }));
          dispatch(changedAddress(!order_addressChanged));
        }
      })
      .catch((err) => {
        dispatch(showNotification({ type: 'error', message: err.message }));
        NavigationService.reset('Home');}
      )
      .finally(() => setLoading(false));
  },[orderDate,token])

  const MyCart = () => {
    return (
      <View style={{...styles.myCartscreen, top: -windowHeight}} onPress={() => {setShowTimePicker(false)}}>
        <View style={{height:280,bottom:0, right:0, left:0, top: windowHeight - 280, backgroundColor: 'white'}}>
          <AppText style={{paddingHorizontal: 10, textAlign: 'center', fontWeight: 'bold', marginTop:15,fontSize: 16}}>{operationTimeText}</AppText> 
          <View style={{flexDirection: 'row', paddingHorizontal: 20}}>
            <DatePicker style={{height: 150, flex:4, marginTop: 15}} date={orderDate} minimumDate={Platform.OS == 'ios' ? new Date(new Date().toISOString().substring(0,10)) : new Date()} maximumDate={new Date(new Date().setDate(new Date().getDate() + 6))} onDateChange={setDate} minuteInterval={15} androidVariant="iosClone" />
            {/* <AppText style={{justifyContent:"center", marginTop:80}}>~</AppText> */}
            {/* <DatePicker style={{height:150, flex:2,marginTop: 15}} mode="time" date={time} onDateChange={setTime} minuteInterval={15}  /> */}
          </View>
          <Button
            type="accent"
            style={styles.myCartButton}
            onClick={() => {setPreOrderData(preOrder)}}>
            Save
          </Button>
        </View>
      </View>
    );
  };

  return (
    <Screen isLoading={isLoading} hasList stickyBottom={showTimePicker == true && (<MyCart />)}>
      <View style={styles.container}>       
        {addresses && addresses.length > 0 && (
          <>
            <View style={{marginTop: 10}}><AppText style={styles.formHeading}>Order ETA</AppText></View>
              <TouchableOpacity
                  style={styles.address}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCalendarString("Pre-order for later");
                    setPreOrderASAP();
                    setETAType(1);
                  }}>
                  <View style={styles.iconWrapper}>
                    <Icon size={22} color={'#333'} name="clock-time-four-outline" />
                  </View>
                  <View style={styles.addressWrapper}>
                    <AppText style={{fontSize: 16}}>ASAP</AppText>
                  </View>
                  <TouchableOpacity
                    onPress={(ev) => {
                      setETAType(1);
                      setCalendarString("Pre-order for later");
                      setPreOrderASAP();
                    }}>
                    {etaType == 1 ? <Icon size={20} color={Theme.color.accentColor} name="radiobox-marked" /> : 
                    <Icon size={20} color={'#000'} name="radiobox-blank" />}
                  </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.address}
                  activeOpacity={0.8}
                  onPress={() => {     
                    setETAType(2);              
                    setShowTimePicker(true);
                  }}>
                  <View style={styles.iconWrapper}>
                    <Icon size={22} color={'#333'} name="calendar-month" />
                  </View>
                  <View style={styles.addressWrapper}>
                    <AppText style={{fontSize: 16}}>{calendarString}</AppText>
                  </View>
                  <TouchableOpacity
                    onPress={(ev) => {
                      setETAType(2);
                      setShowTimePicker(true);
                    }}>
                    {etaType == 2 ? <Icon size={20} color={Theme.color.accentColor} name="radiobox-marked" /> : 
                    <Icon size={20} color={'#000'} name="radiobox-blank" />
                    }
                  </TouchableOpacity>
              </TouchableOpacity>
            <View style={{marginTop: 10}}><AppText style={styles.formHeading}>Delivery Address</AppText></View>
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
                      setDeliveryAddress(item.id, 'address_id');
                    }}>
                    {item.id == changedAddress_id ?
                      <Icon size={20} color={Theme.color.accentColor} name="radiobox-marked" />
                      : <Icon size={20} color={'#000'} name="radiobox-blank" />
                    }
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
                NavigationService.navigate('SelectDelivery3',{changeAddress:true, territory_id: territory_id});               
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
  
  myCartscreen: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0
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
    position: 'absolute',    
    right: 10,
    bottom: 0,
    left: 10
  },

  formHeading : {
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
    alignSelf: 'center',    
    marginTop: 0,
    fontSize: 16
  },
});

MyOrderETAChangeScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title')
        ? navigation.getParam('title')
        : 'Change',
    },
  });
