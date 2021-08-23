import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import {
  Screen,
  Seller,
  Price,
  Button,
  AppText,
  Tab,
  LoadingGIF,
} from '~/components';

import { fetchAPI, capitalize } from '~/core/utility';
import { NavigationService } from '~/core/services';
import { MainNavigationOptions, Theme, GlobalStyles } from '~/styles';

import { showNotification, setTerritory } from '~/store/actions';
import OrderSVG from '~/assets/images/invoice.svg';
import RestaurantSVG from '~/assets/images/restaurant.svg';
import UserSVG from '~/assets/images/user.svg';
import ChatSVG from '~/assets/images/chat.svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SellersWithCategoryScreen = ({ navigation }) => {
  const [sellersDelivery, setSellersDelivery] = useState(false);
  const [openDeliveryCnt, setOpenDeliveryCnt] = useState(false);
  const [closeDeliveryCnt, setCloseDeliveryCnt] = useState(false);
  // const [openInAreaCnt, setOpenInAreaCnt] = useState(false);
  // const [closeInAreaCnt, setCloseInAreaCnt] = useState(false);
  // const [sellersInArea, setSellersInArea] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const selectedCategory = useMemo(() => navigation.getParam('selectedCategory'), []);
  const windowWidth = Dimensions.get('window').width;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const unread = useSelector((state) => state.notification.unreadMessages);
  const [sellersFilter, setSellersFilter] = useState('&sort_by=most-orders');
  
  const MyCart = () => {
    const price = useSelector(
      (state) => state.order.order && state.order.order.cart_amount,
    );
    return (
      <View style={{flexDirection:'row',paddingBottom:5,backgroundColor:'transparent',paddingHorizontal:10}}>
          <TouchableOpacity
        style={[
          styles.menuButton,
          {
            backgroundColor: 'white',
            height: 60,
            width: 60,
            alignItems: 'center',
          },
        ]}
        onPress={() => {
          NavigationService.reset('Home');
        }}>      
         
        <RestaurantSVG height={30} width={30}/>
      </TouchableOpacity> 
       <TouchableOpacity
        style={[
          styles.menuButton,
          {
            backgroundColor: 'white',
            height: 60,
            width: 60,
            alignItems: 'center',
          },
        ]}
        onPress={() => {
          NavigationService.navigate('MessageTerritoryList');
        }}>
        
        <ChatSVG height={30} width={30}/>
        { unread > 0 &&<AppText style={styles.unreadDot}>{unread}</AppText> }
      </TouchableOpacity> 
      <TouchableOpacity
        style={[
          styles.menuButton,
          {
            backgroundColor: 'white',
            height: 60,
            width: 60,
            alignItems: 'center',
          },
        ]}
        onPress={() => {
          NavigationService.navigate('More');
        }}>
        
        <UserSVG height={30} width={30}/>
      
      </TouchableOpacity> 
      {price && price > 0 ?
        <TouchableOpacity
        style={[
          styles.menuButton,
          {
            backgroundColor: Theme.color.accentColor,
            height: 60,
            width:  Dimensions.get("window").width - 240,          
            flexDirection:'row'
          },
        ]}
        onPress={() => {
          NavigationService.navigate('MyOrder');
        }}>          
          <OrderSVG height={30} width={30}/>
          <AppText  style={{color:'white',fontWeight:'bold',paddingLeft:5,fontSize:16}}>{`${order.currency_icon}${(+price || 0).toFixed(2)}`}</AppText>
      </TouchableOpacity>:   
       <TouchableOpacity
       style={[
         styles.menuButton,
         {
           backgroundColor: 'black',
           height: 60,
           width:  Dimensions.get("window").width - 240,           
           flexDirection:'row'
         },
       ]}
       >       
       <OrderSVG style={{justifyContent:'flex-start'}}height={30} width={30}/>
       <AppText style={{color:'white',fontWeight:'bold',paddingLeft:5,fontSize:16}}>{"$"+`${(+price || 0).toFixed(2)}`}</AppText>
       </TouchableOpacity>    
     }
      </View>
    );
  };
 
  const openSellersFilters = useCallback(() => {
    const options = [
      {
        label: 'BEST SELLERS',
        value: '&sort_by=most-orders',
      },
      {
        label: 'NEAREST',
        value: '&1',
      },
      {
        label: 'MOST PRODUCTS',
        value: '&sort_by=most-products',
      },
      {
        label: 'NEWEST',
        value: '?&sort_by=newest',
      },
    ];

    NavigationService.navigate('SelectorPage', {
      value: 1,
      title: 'ORDER BY',
      options: options,
      action: setSellersFilter,
      selected: sellersFilter,
    });
  }, [sellersFilter]);

  useEffect(() => {
    navigation.setParams({
      action: openSellersFilters,
      actionTitle: <Icon size={24} color="black" name="sort-ascending" />,
    });
  }, [openSellersFilters]);

  // store
  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order.order);
  const explorer = useSelector((state) => state.explorer);
  const territory_type = useSelector(
    (state) => state.order.territory_type.territory_type,
  );
 
  useEffect(() => {
      if (token && order && order.address_id && order.address_id != '0' && order.cancelled == '0') {
        setLoading(true);
        const formData = new FormData();
        formData.append('address_id', order.address_id);  
          fetchAPI(
            `/territories/by_address_id?type=${territory_type}&deliverable=1&filter_by=products_totals${sellersFilter}&size=4&page=${page}&sort_by_extra=is-operational&territory_category=${selectedCategory}`,
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
            }    
          })
          .catch((err) => {
            dispatch(showNotification({ type: 'error', message: err.message }));
          })
          .finally(() => setLoading(false));
      } else {
      
            fetchAPI(
              `/territories/by_address?address=${explorer.address}&type=${territory_type}&deliverable=1&&filter_by=products_totals${sellersFilter}&size=4&page=${page}&sort_by_extra=is-operational&territory_category=${selectedCategory}`,
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
          // }) 
          // .catch((err) => {
          //   dispatch(showNotification({ type: 'error', message: err.message }));
          // })
          // .finally(() => setLoading(false));
      }
    // }
  }, [dispatch, sellersFilter, territory_type, page]);
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

  useEffect(() => {
    if (sellersDelivery === false || sellersDelivery.length) {
      navigation.setParams({ title: capitalize(territory_type) });
    } else {
      navigation.setParams({ title: 'Awkward' });
    }
    // navigation.setParams({
    //   backIcon: 'home',
    //   backAction: () => NavigationService.navigate('Home'),
    // });
  }, [sellersDelivery]);

  const deliverySellersHeader = (
    <AppText style={styles.subTitle}>
      {territory_type === 'restaurants'
        ? 'These Restaurants offer delivery'
        : territory_type === 'shops' ? 'These shops offer delivery' : 'These businesses offer services'}
    </AppText>
  );

  const tabData = useMemo(() => {
    let tabData = [];
    tabData.push({
      title: 'Delivery',
      content: (
        <View style={[styles.deliverySellers]}>
          {sellersDelivery === false || sellersDelivery.length ? (
            sellersDelivery === false || openDeliveryCnt === false || closeDeliveryCnt === false ? (
              <>
                {deliverySellersHeader}
                <LoadingGIF />
              </>
            ) : territory_type === 'restaurants' ? (
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
                      {(openDeliveryCnt == 1) ? openDeliveryCnt + ' Restaurant is open right now' : openDeliveryCnt+' Restaurants are open right now'}
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
                  ListHeaderComponent={ 
                    <AppText style={styles.subTitle}>
                      {(closeDeliveryCnt == 1) ? closeDeliveryCnt + ' Restaurant is closed right now' : (openDeliveryCnt == 0 ? 'All' : closeDeliveryCnt) +' Restaurants are closed right now'}
                    </AppText>}
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
            ) : (  
              <FlatList
                style={styles.availableSellers}
                data={sellersDelivery}
                keyExtractor={(item, index) => index.toString()}               
                ListHeaderComponent={territory_type == 'services' ? <AppText style={styles.subTitle}>{sellersDelivery.length + (sellersDelivery.length == 1 ? '  Business offers services' :'  Businesses offer services')}</AppText> : deliverySellersHeader}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.seller}
                    activeOpacity={0.8}
                    onPress={() => setSeller(item)}>
                    <Seller seller={item} />
                  </TouchableOpacity>
                )}
                numColumns={1}
              />)
          ) : (
            <AppText style={styles.noSellerText}>No ${territory_type}</AppText>
          )}
        </View>
      ),
    });  
    return tabData;
  }, [sellersDelivery, closeDeliveryCnt]);

  return (
    <Screen
    hasList={sellersDelivery.length}
      // isLoading={isLoading}
      backgroundColor={
        sellersDelivery === false ||
        sellersDelivery.length
          ? '#EFEFEF'
          : '#FFF'
      }      
      stickyBottom={<MyCart />} >
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              sellersDelivery === false ||
              sellersDelivery.length
                ? '#EFEFEF'
                : '#FFF',
          },
        ]}>
        {sellersDelivery === false ||
          sellersDelivery.length ? (             
              <Tab tabs={tabData} awkward={true}   setPage={()=> loadMore(page, totalPages)} categoryScreen={true} categoryData={false}/>
              ) : (
                <Tab tabs={tabData} awkward={false} setPage={()=> loadMore(page, totalPages)} categoryScreen={true} categoryData={false}/>
              )}
      </View>      
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Theme.color.backgroundColor,    
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
  },

  section: {},

  availableSellers: {
    flex: 1,
    backgroundColor:'#EFEFEF',
  },

  deliverySellers: {
    flex: 1,
    backgroundColor:'#EFEFEF',
    marginBottom:20
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
});

SellersWithCategoryScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: capitalize(navigation.getParam('categoryName')),
      // headerRight: () => <Price />, //hidden as filter Sellers option takes over Right side of Header
    },
  });
