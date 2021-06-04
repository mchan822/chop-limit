import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions,ImageBackground, Platform } from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import { NavigationService } from '~/core/services';
import { Screen, AppText,Button, Seller } from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';
import { truncateAddress } from '~/core/utility';
import { fetchAPI } from '~/core/utility';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {setTerritoryType} from '~/store/actions';
import OrderSVG from '~/assets/images/invoice.svg';
import ShopSVG from '~/assets/images/shop.svg';
import FoodSVG from '~/assets/images/burger.svg';
import ServiceSVG from '~/assets/images/services.svg';
import GiveawaysSVG from '~/assets/images/gift-outline.svg';
import InviteSVG from '~/assets/images/invite.svg';
import DealSVG from '~/assets/images/deal.svg';
import UserSVG from '~/assets/images/user.svg';
import ChatSVG from '~/assets/images/chat.svg';
import PushNotification,{Importance} from "react-native-push-notification";
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import BackgroundTimer from 'react-native-background-timer';
import {
  showNotification,
  setAddress as setAddressAction,
} from '~/store/actions';


import { AppEventsLogger } from "react-native-fbsdk-next";
import { FlatList } from 'react-native-gesture-handler';

export const HomeScreen = ({ navigation }) => {
  const userInfo = useSelector(
    (state) => state.account && state.account.userInfo,
  );

  // const [orderDetail, setOrderDetail] = useState(null);
  
  const [isLoading, setLoading] = useState(false);
  const token = useSelector((state) => state.account.token);
  const banner_url = useSelector((state) => state.account.banner_url);
  const guestToken = useSelector((state) => state.account.guestToken);
  const order = useSelector((state) => state.order.order);
  const explorer = useSelector((state) => state.explorer);
  const [address, setAddress] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const [indexButton,setIndexButton] = useState('');
  const [unread, setUnread] = useState('');
  const [featuredSellers, setSellersDelivery] = useState(false);
  const enterMessageRoomValue =  useSelector((state) => state.notification.enterMessageRoom);
  const renderFeatured = ({item,index}) => {
    return (<View style={{marginHorizontal:5,marginTop:10}}><Seller seller={item}></Seller></View>);
  }
  const renderHome = ({item, index}) => {    
    if(index == 0)
    {
      return (
    <TouchableOpacity style={{...styles.menuButton, width:(windowWidth-70)/3}}
      onPress={() => chooseSellerCategory('shops')}>
      <View style={styles.menuButtonTextWrap}>
        <ShopSVG height={50} width={50} />
        <AppText style={styles.menuButtonTitle}>Shops</AppText>
      </View>
    </TouchableOpacity>);
    } else if(index == 1)
    {
      return (
      <TouchableOpacity style={{...styles.menuButton, width:(windowWidth-70)/3}}
        onPress={() => chooseSellerCategory('restaurants')}>
        <View style={styles.menuButtonTextWrap}>
          <FoodSVG width={50} height={50} />
          <AppText style={styles.menuButtonTitle}>Food</AppText>
        </View>
      </TouchableOpacity>  
      );
    } else if(index == 2)
    {
      return (
        <TouchableOpacity style={{...styles.menuButton, width:(windowWidth-70)/3}}
        onPress={() => chooseSellerCategory('services')}>
        <View style={styles.menuButtonTextWrap}>
          <ServiceSVG width={50} height={50} />        
          {/* <Icon size={57} color={'#ffffff'} name="clipboard-list-outline" style={styles.menuButtonIcon} /> */}
          <AppText style={styles.menuButtonTitle}>
            Services
          </AppText>
        </View>
      </TouchableOpacity> 
         
      ); 
    } else if(index == 3)
    {
      return(
        <TouchableOpacity style={{...styles.menuButton, width:(windowWidth-70)/3}}
        onPress={() => chooseDealsList()}>
        <View style={styles.menuButtonTextWrap}>
          <DealSVG height={50} width={60} />
          {/* <Icon size={50} color={'#ffffff'} name="gift-outline" style={styles.menuButtonIcon} /> */}
          <AppText style={styles.menuButtonTitle}>
            Deals
          </AppText>
        </View>
      </TouchableOpacity>     
      );
    } else if(index == 4)
    {
       return(
        <TouchableOpacity style={{...styles.menuButton, width:(windowWidth-70)/3}}
        onPress={() => chooseOrderList()}>
        <View style={styles.menuButtonTextWrap}>
          <OrderSVG height={50} width={50} />
          <AppText style={styles.menuButtonTitle}>My Orders</AppText>
        </View>
      </TouchableOpacity>     
     
      );
    } else if(index == 5)
    {
      return(
        <TouchableOpacity style={{...styles.menuButton, width:(windowWidth-70)/3}}
        onPress={() => NavigationService.navigate('More')}>
        <View style={styles.menuButtonTextWrap}>
          {/* <InviteSVG height={50} width={60}/> */}
          <Icon size={50} color={'#000'} name="dots-horizontal" style={styles.menuButtonIcon} />
          <AppText style={styles.menuButtonTitle}>
          More
          </AppText>
        </View>
      </TouchableOpacity> 
      );
    }
    // } else if(index == 6)
    // {
    //    return(
    //     <TouchableOpacity style={styles.menuButton}
    //     onPress={() => chooseMyAccount()}>
    //     <View style={styles.menuButtonTextWrap}>
    //       <UserSVG height={50} width={60} />
    //       {/* <Icon size={50} color={'#ffffff'} name="gift-outline" style={styles.menuButtonIcon} /> */}
    //       <AppText style={styles.menuButtonTitle}>
    //         My Account
    //       </AppText>
    //     </View>
    //   </TouchableOpacity> 
    //   );
    // }
  };

  const homeData = [
    {
      data: 1
    },
    {
      data: 2
    },
    {
      data: 3
    },
    {
      data: 4
    },
    {
      data: 5
    },
    {
      data: 6
    },
    ];
    
  const territory_type_initial = useSelector(
    (state) =>
      (state.order.territory_type &&
        state.order.territory_type.territory_type) ||
      'shops',
  );
  const MyCart = () => {
    const price = useSelector(
      (state) => state.order.order && state.order.order.cart_amount,
    );
    return (+price || 0) > 0 ? (
      <Button
        type="accent"
        style={styles.myCartButton}
        icon="cart-outline"
        rightText={`${order.currency_icon}${(+price || 0).toFixed(2)}`}
        onClick={() => NavigationService.navigate('MyOrder')}>
        My Cart
      </Button>
    ) : (
      <></>
    );
  };

  const dispatch = useDispatch();

  const chooseSellerCategory = (category) => {  
    AppEventsLogger.logEvent('USER TAPS ON '+category.toUpperCase())
    dispatch(setTerritoryType({ territory_type: category }));
    if (openOrder) {
      NavigationService.navigate('OpenOrder', { orderId: openOrder });
    } else {
      if (token) {
        setLoading(true);
        fetchAPI(`/myaccount/addresses`, {
          method: 'GET',
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
          .then((res) => { 
            if(res.data.addresses.length == 0)
            {              
              NavigationService.navigate("SelectDelivery1",{addressCnt: 0});
            } else {
              NavigationService.navigate(lastAddress ? 'Sellers' : 'Location', {
                title: category === 'restaurants' ? 'restaurants' : 'shops',
              });
            }
          })
          .catch((err) =>
            dispatch(showNotification({ type: 'error', message: err.message })),
          )
          .finally(() => setLoading(false));
      } else {
        if(lastAddress){
          NavigationService.navigate("Sellers");
        } else {
          NavigationService.navigate("SelectDelivery1");
        }
      }     
    }
  };

  const chooseDealsList = () => {
    console.log(lastAddress);
    if(userInfo && userInfo.user_verified == true)
    {      
      if(!lastAddress){
        dispatch(showNotification({type : "error", message : "Please add a delivery address"}));      
      } else {
        NavigationService.navigate("DealList")
      }
    } else {
      dispatch(showNotification({type : "error_signin", message : "Please Sign In to see deals"}));      
    }
  };

  
  const chooseMyAccount = () => {
    console.log(lastAddress);
    if(userInfo && userInfo.user_verified == true)
    {      
        NavigationService.navigate('Account/MyAccount')
    } else {
      dispatch(showNotification({type : "error_signin", message : "Please Sign In to see account information"}));      
    }
  };
  const chooseOrderList = () => {
    console.log(lastAddress);
    if(userInfo && userInfo.user_verified == true)
    {     
       NavigationService.navigate('PastOrders')
    } else {
      dispatch(showNotification({type : "error_signin", message : "Please Sign In to see orders"}));      
    }
  };

  const openMenu = useCallback(() => {
    navigation.navigate('More');
  }, []);


  useEffect(() => {
    dispatch(setTerritoryType({ territory_type: territory_type_initial }));
    // navigation.setParams({
    //   action: openMenu,
    //   actionTitle: (
    //     <Icon size={40} color={Theme.color.accentColor} name="menu" />
    //   ),
    // });
  }, [openMenu, territory_type_initial]);

  const openOrder = useSelector((state) => {
    if (state.order.order && (+state.order.order.cart_amount).toFixed(2) > 0) {
      return state.order.order.order_id;
    } else {
      return false;
    }
  });

  const lastAddress = useMemo(() => {   
    if (order && order.address && order.cancelled == 0) {      
      return order.address;
    } else if (explorer && explorer.address) {
      return explorer.address;
    } else if (address) {
      return address;
    } else {
      return false;
    }
  }, [order, explorer, address]);

  useEffect(() =>{
    fetchAPI(
      `/territories/by_address?&deliverable=1&address=${lastAddress}&featured=1`,
      {
        method: 'POST',        
      },
    ).then((res) => {
        console.log("test sssssssssssssssssssss ", res.data.territories);      
        setSellersDelivery(
          res.data.territories.filter((territory) =>
            Boolean(territory.app_image),
          ),
        );  
          
    })  
    .catch((err) => {
      dispatch(showNotification({ type: 'error', message: err.message }));
    })
    .finally(() => setLoading(false));
  },[lastAddress])

  useEffect(() => {
     if(Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('register', (token) => {});
      PushNotificationIOS.requestPermissions().then((perms) => console.log(perms));
    }   
    if (token) {
      console.log(order);
      setLoading(true)
      setAddress(false);
      fetchAPI('/myaccount/default_address', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          setAddress(res.data.address);
          //
          dispatch(setAddressAction(res.data.full_address));
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        );       

      fetchAPI('/messages/unopened', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("console log data ++++++++++++++",res);
        setUnread(res.data.total);          
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
    }
  }, [dispatch,enterMessageRoomValue]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchAPI(`/myaccount/addresses`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => { 
          if(res.data.addresses.length == 0)
          { 
            dispatch(setTerritoryType({ territory_type: "address" }));        
            NavigationService.reset("SelectDelivery1",{addressCnt: 0});
          } 
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
      }
    BackgroundTimer.stopBackgroundTimer();
    var lastMessageChecked_var = '';
    BackgroundTimer.runBackgroundTimer(()=>{
    
      if(token && lastMessageChecked_var != ''){
        console.log("calling lty",lastMessageChecked_var);
       fetchAPI(`/messages/list_last_activity?last_time_checked=${lastMessageChecked_var}`, {
         method: 'GET',
         headers: {
           authorization: `Bearer ${token}`,
         },
       })
       .then((res) => {
         console.log("calling list last_activity",res.data);
           // res.data.chats.map((item, index)=> {
           //   // var var_item = {...item,"is_new" : true}
           //   dispatch(setMessageTerritories([item,...territoryList]));
           // });        
           // setLastMessageChecked(res.data.last_time_checked);
           var byTetCnt = 0;
           res.data.chats.map((item, index)=> {
               if(item.last_message_by_user == '0')
               {
                byTetCnt = byTetCnt + 1;
               }
             }); 
         if(byTetCnt > 0) {      
      
           console.log("sssssss",res.data.chats);
           if(Platform.OS === 'ios') {
             PushNotificationIOS.addNotificationRequest({
               id: "default",
               title: "New Message",
               subtitle: res.data.last_time_checked + 'New message received!',
               body : 'new message received.',              
               sound : "default",
               isSilent : false,
             });
             
           } else {
               PushNotification.localNotification({
               channelId: "default",
               autoCancel: true,
               bigText:
                 'New message received!',
               subText: 'new message received.',
               title: 'New messages',
               message: 'Expand me to see more',
               vibrate: true,
               vibration: 300,
               playSound: true,
               soundName: 'default',
             });
           }
         } 
         
       })
       .catch((err) =>
       {}///dispatch(showNotification({ type: 'error', message: err.message })),
       )}
       if(token){
        fetchAPI('/messages/unopened', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log("+++++++++++++++++++++++++++ Load upopende msg +++++++++++++++++++++++++++",res.data);
          if(res.data.last_time_checked)
          {
            lastMessageChecked_var = res.data.last_time_checked
          }
          setUnread(res.data.total);          
        })
         .catch((err) =>
          {}//dispatch(showNotification({ type: 'error', message: err.message })),
         )
      }
    },10000);
   },[]);

  useEffect(()=>{
    var total_badge = 0;
    if(Platform.OS === 'ios') {
      if(unread != ''){
        total_badge = parseInt(unread);
        PushNotificationIOS.setApplicationIconBadgeNumber(total_badge);
      } else {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
      }
    }
  },[unread]);

  return (
    <Screen
      align="bottom"
      backgroundColor='#e6e6e6'
      >
      <View style={styles.container}>
      
            <View style={[styles.menuRow, styles.menuRowLastItem]}>
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  {
                    height: 50,
                    alignItems: 'flex-start',
                    paddingLeft: 20,
                    flex: 5,
                  },
                ]}
                onPress={() => {
                  dispatch(setTerritoryType({ territory_type: 'address' }));
                  NavigationService.navigate('Location');
                }}>
                <View style={styles.menuButtonTextWrap}>
                  {/* <Icon size={58} color={'#ffffff'} name="account-circle-outline" style={styles.menuButtonIcon} /> */}
                  <AppText style={{ color: '#000' }}>
                    Deliver to:{' '}
                    {lastAddress ? (
                    <AppText style={[{ fontWeight: 'bold' }]}>
                      {truncateAddress(lastAddress)}
                    </AppText>) : (
                    <AppText style={[{ fontWeight: 'bold' }]}>
                      Add Delivery Address
                    </AppText>)}
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuButton,
                  {
                    backgroundColor: 'white',
                    height: 50,
                    width: 50,
                    alignItems: 'center',
                  },
                ]}
                onPress={() => {
                  NavigationService.navigate('MessageTerritoryList');
                }}>
                
                <ChatSVG height={25} width={25}/>
                { unread > 0 &&<AppText style={styles.unreadDot}>{unread}</AppText> }
              </TouchableOpacity>
            </View>
          
        {/* <View style={styles.logoWrapper}>
          <Image
            source={require('~/assets/images/logo-light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppText style={styles.subheading}>SHOP LOCAL ONLINE™</AppText>
        </View> */}
         {featuredSellers == false ? <ImageBackground
            source={banner_url ? {uri:banner_url}: require('~/assets/images/banner.png')}
            style={styles.banner}>
          </ImageBackground> :
          <View>
               <Carousel    
                 data={featuredSellers}
                 layout='default'    
                 inactiveSlideScale={0.8}             
                 activeSlideAlignment={'start'}
                 contentContainerCustomStyle={{overflow: 'hidden', width: (windowWidth-40)*featuredSellers.length}}
                 inactiveSlideOpacity={0.8}     
                 renderItem= {renderFeatured}
                 sliderWidth={windowWidth-40}
                 itemWidth={(windowWidth-40)}
                 autoplay={true}
                 autoplayInterval={4000}
                 autoplayDelay={1000}
                > 
                </Carousel>
            </View>
            }
  
        <View style={styles.menuWrapper}>
          <View style = {{maxWidth: windowWidth, flexDirection: 'row'}}>
          <FlatList
            style={{maxWidth: windowWidth,height: 260, flexDirection: 'row',  marginVertical: 0,}}
            alwaysBounceVertical={false}
            data={homeData}
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderHome}
          />
            {/* <FlatList>
          <TouchableOpacity style={styles.menuButton}
            onPress={() => chooseSellerCategory('shops')}>
            <View style={styles.menuButtonTextWrap}>
              <ShopSVG height={50} width={50} />
              <AppText style={styles.menuButtonTitle}>Shops</AppText>
            </View>
          </TouchableOpacity>
          </FlatList> */}
            {/* <Carousel    
             data={homeData}
             layout='default'    
             inactiveSlideScale={1}             
             activeSlideAlignment={'start'}
             contentContainerCustomStyle={{overflow: 'hidden', width: (windowWidth-40)/3*7}}
             inactiveSlideOpacity={1}     
             renderItem= {renderHome}
             sliderWidth={windowWidth-40}
             itemWidth={(windowWidth-40)/3}
            > 
            </Carousel> */}
            </View>
        
        </View>
        {openOrder > 0 && (<MyCart />)}        
      </View>      
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 30,
    paddingBottom: 10,

    display: 'flex',
    minHeight: '100%',
  },

  logoWrapper: {
    paddingTop: 50,
    paddingHorizontal: 40,
    marginBottom: 50,
    flex: 1,
    justifyContent: 'flex-end',
  },

  marginBottom: {
    marginBottom: 15,
  },

  logo: {
    width: '100%',
    height: 60,
  },

  menuWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    marginTop:10
  },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

  },

  menuRowLastItem: {
    marginBottom: 0,
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

  menuButtonTextWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuButtonIcon: {
    marginBottom: 5,
    width: 50,
    height: 50,    
  },

  menuButtonTitle: {
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#000000',
    marginTop: 10,
    fontWeight:"bold"
  },
  subheading: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  myCartButton: {
    marginHorizontal: 5,
    marginVertical: 5,
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
  
   banner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:-20,
    marginTop: 10,
    paddingBottom: 10,
    width: Dimensions.get("window").width ,
    resizeMode: 'contain',
    height:Dimensions.get("window").width * 3 / 8 ,
    
  },
 
});

// HomeScreen.navigationOptions = {
//   headerShown: false,
//   options: {
//     headerRight: () => <Price />, //hidden as filter Sellers option takes over Right side of Header
//   }
// };

HomeScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });
