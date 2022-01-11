import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions,ImageBackground, Platform } from 'react-native';

import { useSelector, useDispatch } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import { NavigationService } from '~/core/services';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, AppText,Button, Seller,LoadingGIF,Tab,StickyBottom } from '~/components';
import { Theme, MainNavigationOptions,GlobalStyles } from '~/styles';
import { truncateAddress } from '~/core/utility';
import { fetchAPI,capitalize } from '~/core/utility';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {setTerritoryType} from '~/store/actions';
// import ShopSVG from '~/assets/images/shop.svg';
// import FoodSVG from '~/assets/images/burger.svg';
// import ServiceSVG from '~/assets/images/services.svg';
// import DealSVG from '~/assets/images/deal.svg';
import messaging from '@react-native-firebase/messaging';
import PushNotification,{Importance} from "react-native-push-notification";
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import BackgroundTimer from 'react-native-background-timer';
import {
  showNotification,
  setAddress as setAddressAction,
  setTerritory,
  setUnreadMessages
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
  const guestToken = useSelector((state) => state.account.guestToken);
  const unread = useSelector((state) => state.notification.unreadMessages);
  const order = useSelector((state) => state.order.order);
  const explorer = useSelector((state) => state.explorer);
  const explorerAddress = useSelector((state) => state.explorer.address);
  const [address, setAddress] = useState('');
  const [changedTime, setTimeChanged] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const [indexButton,setIndexButton] = useState('');
  //const [unread, setUnread] = useState('');
  //const [featuredSellers, setfeaturedSellersDelivery] = useState(false);
  const enterMessageRoomValue =  useSelector((state) => state.notification.enterMessageRoom);

  const dispatch = useDispatch();

  

  // const chooseDealsList = () => {
  //   console.log(lastAddress);
  //   if(userInfo && userInfo.user_verified == true)
  //   {      
  //     if(!lastAddress){
  //       dispatch(showNotification({type : "error", message : "Please add a delivery address"}));      
  //     } else {
  //       NavigationService.navigate("DealList")
  //     }
  //   } else {
  //     dispatch(showNotification({type : "error_signin", message : "Please Sign In to see deals"}));      
  //   }
  // };

  
  // const chooseMyAccount = () => {
  //   console.log(lastAddress);
  //   if(userInfo && userInfo.user_verified == true)
  //   {      
  //       NavigationService.navigate('Account/MyAccount')
  //   } else {
  //     dispatch(showNotification({type : "error_signin", message : "Please Sign In to see account information"}));      
  //   }
  // };
  // const chooseOrderList = () => {
  //   console.log(lastAddress);
  //   if(userInfo && userInfo.user_verified == true)
  //   {     
  //      NavigationService.navigate('PastOrders')
  //   } else {
  //     dispatch(showNotification({type : "error_signin", message : "Please Sign In to see orders"}));      
  //   }
  // };

  // const openMenu = useCallback(() => {
  //   navigation.navigate('More');
  // }, []);


  // useEffect(() => {
  //   dispatch(setTerritoryType({ territory_type: territory_type_initial }));
  //   // navigation.setParams({
  //   //   action: openMenu,
  //   //   actionTitle: (
  //   //     <Icon size={40} color={Theme.color.accentColor} name="menu" />
  //   //   ),
  //   // });
  // }, [openMenu, territory_type_initial]);

  const openOrder = useSelector((state) => {
    if (state.order.order && (+state.order.order.cart_amount).toFixed(2) > 0) {
      return state.order.order.order_id;
    } else {
      return false;
    }
  });

  const lastAddress = useMemo(() => {
    if (order && order.address && order.cancelled == 0) { 
      console.log("1");
      return order.address;
    } else if (explorerAddress && explorerAddress) {
      console.log("2");
      return explorerAddress;
    } else if (address) {
      console.log("3");
      return address.full_address;
    } else {
      return false;
    }
  }, [order, explorerAddress, address]);

  // useEffect(() =>{
  //   fetchAPI(
  //     `/territories/by_address?&deliverable=1&address=${lastAddress}&featured=1`,
  //     {
  //       method: 'POST',        
  //     },
  //   ).then((res) => {
  //       console.log("test sssssssssssssssssssss ", res.data.territories);      
  //       setSellersDelivery(
  //         res.data.territories.filter((territory) =>
  //           Boolean(territory.app_image),
  //         ),
  //       );  
          
  //   })  
  //   .catch((err) => {
  //     dispatch(showNotification({ type: 'error', message: err.message }));
  //   })
  //   .finally(() => setLoading(false));
  // },[lastAddress])
  const [sellersDelivery, setSellersDelivery] = useState(false);
  const [openDeliveryCnt, setOpenDeliveryCnt] = useState(false);
  const [closeDeliveryCnt, setCloseDeliveryCnt] = useState(false);
  const [categoryData, setCategoryData] =  useState(false);
  //const [selectedCategory, selectCategory] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sellersFilter, setSellersFilter] = useState('&1');
  //const territory_type = useState("restaurants");
  useEffect(() => {
     if(Platform.OS === 'ios') {
      PushNotificationIOS.addEventListener('register', (token) => {});
      PushNotificationIOS.requestPermissions().then((perms) => console.log(perms));
    }   
    if (token) {
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
        dispatch(setUnreadMessages(res.data.total));
      
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
    }
  }, [dispatch,enterMessageRoomValue]);

  useEffect(() => {
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
        );
       
          NavigationService.navigate("MessageTerritoryList");
      
      });
  
      // Check whether an initial notification is available
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage,
            );          
            NavigationService.navigate("MessageTerritoryList");         
          }
          
        });
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
            dispatch(setTerritoryType({ territory_type: "restaurants" }));
            NavigationService.reset("SelectDelivery1",{addressCnt: 0});
          } else if(res.data.addresses.length == 1)
          {
            setAddress(res.data.addresses[0])
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
          dispatch(setUnreadMessages(res.data.total)); 
        })
         .catch((err) =>
          {}//dispatch(showNotification({ type: 'error', message: err.message })),
         )
      }
      setTimeChanged(new Date().toLocaleString());
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

  useEffect(() => {
    if (token && order && order.address_id && order.address_id != '0' && order.cancelled == '0') {
      
      const formData = new FormData();
      formData.append('address_id', order.address_id);   
        fetchAPI(
          `/territories/by_address_id?type=restaurants&deliverable=1&filter_by=products_totals${sellersFilter}&size=${(page+1)*4}&page=0&sort_by_extra=is-operational`,
          {
            method: 'POST',
            headers: {
              authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        ).then((res) => {  
          setSellersDelivery(
            res.data.territories.filter((territory) =>
              Boolean(territory.app_image),
            ),
          );
          setOpenDeliveryCnt(res.data.total_operational);
          setCloseDeliveryCnt(res.data.total_not_operational);           
     
        })
        .catch((err) => {
          // dispatch(showNotification({ type: 'error', message: err.message }));
        })
        .finally(() => setLoading(false));    
    } else { 
      if(explorer && explorer.address != null) {
       
        setLoading(true);       
            fetchAPI(
              `/territories/by_address?address=${explorer.address}&type=restaurants&deliverable=1&&filter_by=products_totals${sellersFilter}&size=${(page+1)*4}&page=0&sort_by_extra=is-operational`,
              {
                method: 'POST',
              },
            ).then((res) => {              
                setSellersDelivery(res.data.territories.filter((item) => Boolean(item.app_image)));
                setOpenDeliveryCnt(res.data.total_operational);
                setCloseDeliveryCnt(res.data.total_not_operational);
            })
            .catch((err) => {
              // dispatch(showNotification({ type: 'error', message: err.message }));
            })
            .finally(() => setLoading(false));       
      }        
  }
  },[changedTime]);
 
  useEffect(() => {
      if (token && order && order.address_id && order.address_id != '0' && order.cancelled == '0') {
        setLoading(true);
        const formData = new FormData();
        formData.append('address_id', order.address_id);   
          fetchAPI(
            `/territories/by_address_id?type=restaurants&deliverable=1&filter_by=products_totals${sellersFilter}&size=4&page=${page}&sort_by_extra=is-operational`,
            {
              method: 'POST',
              headers: {
                authorization: `Bearer ${token}`,
              },
              body: formData,
            },
          ).then((res) => {
            setTotalPages(res.data.total_pages);
            if(page == 0){
              setSellersDelivery(
                res.data.territories.filter((territory) =>
                  Boolean(territory.app_image),
                ),
              );
              setOpenDeliveryCnt(res.data.total_operational);
              setCloseDeliveryCnt(res.data.total_not_operational);           
            } else {
              setSellersDelivery((existing)=>[
                ...existing,
                ...res.data.territories.filter((territory) =>
                  Boolean(territory.app_image),
                )]
              );
              // setOpenDeliveryCnt(res.data.total_operational);
              // setCloseDeliveryCnt(res.data.total_not_operational);           
            }    
          })
          .catch((err) => {
            dispatch(showNotification({ type: 'error', message: err.message }));
          })
          .finally(() => setLoading(false));    
      } else { 
        if(explorer && explorer.address != null) {
          setLoading(true);       
              fetchAPI(
                `/territories/by_address?address=${explorer.address}&type=restaurants&deliverable=1&&filter_by=products_totals${sellersFilter}&size=4&page=${page}&sort_by_extra=is-operational`,
                {
                  method: 'POST',
                },
              ).then((res) => {
                setTotalPages(res.data.total_pages);
                if(page == 0){
                  setSellersDelivery(res.data.territories.filter((item) => Boolean(item.app_image)));
                  setOpenDeliveryCnt(res.data.total_operational);
                  setCloseDeliveryCnt(res.data.total_not_operational);      
                } else {
                  setSellersDelivery((existing) => [...existing, ...res.data.territories.filter((item) => Boolean(item.app_image))]);
                  // setOpenDeliveryCnt(res.data.total_operational);
                  // setCloseDeliveryCnt(res.data.total_not_operational);      
                }

              })
              .catch((err) => {
                dispatch(showNotification({ type: 'error', message: err.message }));
              })
              .finally(() => setLoading(false));       
        }        
    }
  }, [page,lastAddress]);
  const selectCategory = useCallback((selectedCategory)=>{
    if(selectedCategory != false){
      var categoryName = "";
      categoryData.map((item) => {
        if(item.ttcid == selectedCategory) {
         categoryName =  item.name;
      }})
      NavigationService.navigate("SellersWithCategory",{selectedCategory: selectedCategory,categoryName:categoryName});
    }
  });

  useEffect(() => { 
    fetchAPI(
      `/territories_categories?type=restaurants`,      
      {
        method: 'POST',
      },
    ).then((res) => {
      setCategoryData(res.data.categories.filter((item) =>item.image != ''));
    })
    .catch((err) => {
      dispatch(showNotification({ type: 'error', message: err.message }));
    })
    .finally(() => setLoading(false));
  }, []);
  const setSeller = useCallback(
    (seller) => {
      if (token) {
        dispatch(setTerritory(seller));
        NavigationService.navigate('Products');
      } else {
        dispatch(setTerritory(seller));
        NavigationService.navigate('Products');
      }
    },
    [dispatch, token],
  );
 const loadMore = useCallback((page,totalPages) => {
  if (page < totalPages-1) {           
     setPage(page + 1);
  }
 });

  const tabData = useMemo(() => {
   
    let tabData = [];
    tabData.push({
      title: 'Delivery',
      content: (
        <View style={[styles.deliverySellers]}>
          {sellersDelivery === false || sellersDelivery.length ? (
            sellersDelivery === false || openDeliveryCnt === false || closeDeliveryCnt === false ? (
              <>
                <LoadingGIF />
              </>
            ) : (
              <View>
                { openDeliveryCnt == 0 ?   
                <View style={styles.view_noSeller}>    
                   <Icon size={120} color={ Theme.color.accentColor} name="emoticon-sad-outline" />          
                  {/* <Image
                      source={require('~/assets/images/sadface.png')}
                      style={styles.image_noSeller}
                      resizeMode="cover"
                    />  */}
                  </View>: 
                <FlatList
                  style={styles.availableSellers}
                  data={sellersDelivery.filter((item) =>item.operation_state == 'open')}
                  keyExtractor={(item, index) => index.toString()}     
                  ListHeaderComponent={
                    <AppText style={styles.subTitle}>
                      {(openDeliveryCnt == 1) ? openDeliveryCnt + ' restaurant is open right now' : openDeliveryCnt+' restaurants are open right now'}
                    </AppText>}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.seller}
                      activeOpacity={0.8}
                      onPress={() => setSeller(item)}>
                      <Seller seller={item} />
                    </TouchableOpacity>
                  )}
                  numColumns={1}
                />}
                {closeDeliveryCnt > 0  &&
                <FlatList
                  style={styles.availableSellers}
                  data={sellersDelivery.filter((item) =>item.operation_state != 'open')}
                  keyExtractor={(item, index) => index.toString()} 
                  // onEndReached={() => {
                  //   console.log("ended scrollsdfsdf", totalPages);     
                  //   if (page < totalPages-1) {           
                  //     setPage(page + 1);                  
                  //   }}}
                  ListHeaderComponent={ <></>
                    // <AppText style={styles.subTitle}>
                    //   {(closeDeliveryCnt == 1) ? closeDeliveryCnt + ' restaurant is closed right now' : (openDeliveryCnt == 0 ? 'All' : closeDeliveryCnt) +' restaurants are closed right now'}
                    // </AppText>
                    }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.closedSeller}
                      activeOpacity={0.5}
                      onPress={() => setSeller(item)}>
                      <Seller seller={item} />
                    </TouchableOpacity>
                  )}
                  numColumns={1}
                />}
              </View>
            )
          ) : (
            <></>
          )}
        </View>
      ),
    });
    return tabData;
  }, [sellersDelivery,openDeliveryCnt, closeDeliveryCnt]);



  return (
    <Screen
      align="bottom"
      backgroundColor='#EFEFEF'
      stickyBottom={<StickyBottom gradientColor='#EFEFEF'/>} 
      >
      <View style={styles.container}>             
         {/* <ImageBackground
            source={require('~/assets/images/banner.png')}
            style={styles.banner}>
          </ImageBackground>  */}
          {sellersDelivery === false ||
          sellersDelivery.length ? (      
         <Tab tabs={tabData} awkward={true} lastAddress={lastAddress} categoryData={categoryData} setPage={()=> loadMore(page, totalPages)} selectCategory={selectCategory}/>
        ) : (
          <Tab tabs={tabData} awkward={false} lastAddress={lastAddress}  categoryData={categoryData}  setPage={()=> loadMore(page, totalPages)} selectCategory={selectCategory}/>
        )}     
      </View>      
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    //paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingTop: 0,
    marginBottom: 0,

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
    width:'30%'
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
  
  availableSellers: {
    flex: 1,
    backgroundColor:'#EFEFEF',
  },

  deliverySellers: {
    flex: 1,
    backgroundColor:'#EFEFEF',
    marginBottom:80
  },

  pickupSellers: {
    flex: 1,
    backgroundColor:'#EFEFEF',
    marginBottom:20
  },

  topSection: {}, 

  seller: {
    width: '100%',
    padding: 10,
  },

  closedSeller : {
    maxWidth: '100%',
    padding: 10,
    opacity: 0.5
  },

  view_noSeller : {
    alignItems: 'center',
    justifyContent: 'center',
  },

  image_noSeller: {
    marginTop: 35,
    marginBottom: 20,
    width: 260,
    height: 180,
  },


  title: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  subTitle: {
    textAlign: 'center',
    // textTransform: 'uppercase',
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },

  searchBar: {
    height: 50,
    backgroundColor: 'white',
    flexDirection: 'row',
  },

  zipcode: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageWrapper: {
    width: 30,
    aspectRatio: 1,
    marginRight: 5,
  },

  mapIcon: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 20,
  },

  list: {
    marginTop: 50,
  },

  productWrapper: {
    flex: 1,
    margin: 10,
  },

  noSellerText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },

  awkward: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
  },

  cowImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  noResultsWrapper: {
    marginTop: 35,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: 260,
    height: 180,
  },

  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
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
