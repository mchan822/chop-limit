import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Linking,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import parseAddress from 'parse-address-string';
import { Screen, Product, AppText, Button, StickyBottom } from '~/components';
import { NavigationService } from '~/core/services';
import { formatPhoneNumber } from '~/core/utility'
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, clearNotification, setTerritory } from '~/store/actions';
import { LoadingGIF } from '../../components';
import DeliverySVG from '~/assets/images/delivery-truck.svg';
import PickupSVG from '~/assets/images/package.svg';
import PriceSVG from '~/assets/images/price-tag.svg';
import PickupDisableSVG from '~/assets/images/package-disable.svg';
import DeliveryDisableSVG from '~/assets/images/delivery-truck-disable.svg';
import LinearGradient from 'react-native-linear-gradient';

export const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState(false);
  const [categories, setCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [parsedAddress, setParsedAddress] = useState();
  const unread = useSelector((state) => state.notification.unreadMessages);
  // store
  const dispatch = useDispatch();

  const token = useSelector((state) => state.account.token);
  const order = useSelector((state) => state.order && state.order.order);
  const territory = useSelector((state) => state.order.territory);
  const explorer = useSelector((state) => state.explorer);
  
  useEffect(() => {
    territory &&
      territory.warehouse_address &&
      parseAddress(territory.warehouse_address, (err, addressObj) => {
        setParsedAddress(addressObj);
      });
  }, [territory]);

  // get products
  const size = 20;
  const categoriesSize = 5;

  useEffect(() => {
    navigation.setParams({ order });
  }, [order]);

  const openMenu = useCallback(() => {
    navigation.navigate('SellerInfo', {
      title: territory.name,
      territory: territory,
    });
  }, [territory]);

  useEffect(() => {
    navigation.setParams({
      action: openMenu,
      actionTitle: <Icon size={40} color={'white'} name="menu" />,
    });
  }, [openMenu]);

  useEffect(() => {
    const category = navigation.getParam('category');

    let query = '';

    if (token) {
      navigation.setParams({
        territory: territory.name,
        category: category,
      });

      const params = {
        territory: territory ? territory.tid : null,
        category: category ? category.cid : null,
        // out_stock: 0
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    } else {
      navigation.setParams({
        territory: explorer.territory.name,
        category: category,
      });

      const params = {
        territory: explorer ? explorer.territory.tid : null,
        category: category ? category.cid : null,
        out_stock: 0
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    }

    fetchAPI(`/products/count?${query}`, {
      method: 'GET',
    })
      .then((res) => {
        setTotalCount(res.data.total);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => {
        setLoading(false);
        if (territory.type_slug === 'restaurants') {
          getCategory(0);
        } else {
          if(territory.app_overview_display == 'products'){
           getProducts(0);
           getCategory(0);
          } else {getCategory(0);}
        }
      });
    // return ()=> {dispatch(setTerritory(null))};
  }, []);

  const ContactUs_clicked = useCallback((sellerID)=>{    
    dispatch(
      showNotification({
        type: 'fullScreen',
        autoHide: false,
        options: { align: 'right' },
        message: (
          <>
            {/* <View style={{ position: 'absolute', top: 5, right: -20 }}>
              <Price style={{ height: 35, width: 120 }} />
            </View> */}
            {territory && typeof territory.support_phone === 'string' && territory.support_phone.trim().length > 0 && <Button
            type="white"
            style={{ marginBottom: 10, marginTop: 20 }}
            fullWidth
            onClick={() => {
                Linking.canOpenURL(`tel:${territory.support_phone}`).then((supported) => {
                if (supported) {
                    Linking.openURL(`tel:${territory.support_phone}`);
                } else {
                    dispatch(
                    showNotification({
                        type: 'error',
                        message: `Don't know how to open URI: ${territory.support_phone}`,
                    }),
                    );
                }
                });
            }}>
            Call Us {formatPhoneNumber(territory.support_phone)}
            </Button>}
            <Button
              type="white"
              style={{ marginBottom: 10 }}
              fullWidth
              onClick={() => {
                navigation.navigate('ContactSeller',{sellerID : sellerID});
                dispatch(clearNotification());
              }}>
              Send A Message
            </Button>

            <Button
              type="white"
              fullWidth
              onClick={() => {
                dispatch(clearNotification());
              }}>
              Back
            </Button>
          </>
        ),
      }),
    );
  });

  const getProducts = useCallback((page) => {
    setLoading(true);
   
    const category = navigation.getParam('category');

    let query = '';
    if (token) {
      navigation.setParams({
        territory: territory.name,
        category: category,
      });

      const params = {
        territory: order ? territory.tid : null,
        category: category ? category.cid : null,
        page,
        size,
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    } else {
      navigation.setParams({
        territory: explorer.territory.name,
        category: category,
      });

      const params = {
        territory: explorer ? explorer.territory.tid : null,
        category: category ? category.cid : null,
        page,
        size,
      };

      query = Object.keys(params)
        .filter((k) => params[k] !== null)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
    }

    fetchAPI(`/products?${query}`, {
      method: 'GET',
    })
      .then((res) => {
         const productsData = res.data.products;
        //  .filter(
        //    (item) => !item.out_stock,
        // );
        setTotalPages(res.data.total_pages);
        if (page === 0) {
          setProducts(productsData);
        } else {
          setProducts((existingProducts) => [
            ...existingProducts,
            ...productsData,
          ]);
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, []);

  // get categories
  const getCategory = useCallback((page) => {
    fetchAPI(
      `/categories?territory=${
        token ? territory.tid : explorer.territory.tid
      }&with_products=1&size=${categoriesSize}&page=${page}`,
      {
        method: 'GET',
      },
    )
      .then((res) => {
        setTotalPages(res.data.total_pages);
        if (page === 0) {          
          setCategories(res.data.categories);
        } else {
          const filtered = res.data.categories.filter((item) => item.order != 999);
          setCategories((existingCategories) => [
            ...existingCategories,
            ...filtered,
          ]);
        }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => {
        console.log('fnially ');
        setLoading(false);
      });
  }, []);

  const renderControllers = useMemo(() => {
    return (
      <View style={styles.controllerWrapper}>
        {categories.length ? (
          <View style={{ flex: 1, marginRight: 0 }}>
            <TouchableOpacity
              style={styles.controller}
              onPress={() => {
                NavigationService.navigate('SelectorPage', {
                  title: 'CATEGORY',
                  header: 'Select a category',
                  options: categories.filter((item) => item.show_name == true).map((item) => ({
                    label: `${item.name} ${item.total_products}`,
                    value: item.slug,
                  })),
                  action: (value) => {
                    setSelectedCategory(value);
                  },
                  noOptionsText: 'No Options Available',
                });
              }}>
              <AppText style={styles.controllerText}>Categories</AppText>
              <Icon name="menu-down" color="#AAA" size={30} />
            </TouchableOpacity>
          </View>
        ) : null}
        {/* <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.controller}>
            <AppText style={styles.controllerText}>Search</AppText>
            <Icon
              name="magnify"
              color="#AAA"
              size={25}
              style={{ paddingHorizontal: 5 }}
            />
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }, [categories]);
  var dayNames = ["Sunday","Monday","Tuesday","Wednesday",
                "Thursday","Friday","Saturday"];
  var nextWorkingDay = [ 1, 2, 3, 4, 5, 6, 0 ];
  var now = new Date();
  
  const Closed = () => {
    const territoryState = territory.operation_state;
    return territoryState == 'closed' ? (
      <View style={styles.closedStore}>
        <Image
            style={styles.closedImage}
            source={require('~/assets/images/closed.png')
            }
          />
          <View style={styles.closedTextContainer}>
            <AppText style={styles.closedText}>
              Sorry We're Closed
            </AppText>
            <AppText style={styles.closedTime}>
            {territory.operation_time == "" ? "Check Back on " + dayNames[nextWorkingDay[now.getDay()]] :          
              "We open " + territory.operation_time}
            </AppText> 
          </View>
      </View>
    ) : (
      <></>
    );
  };

  useEffect(() => {    
    if(territory.operation_state == 'closed')
    {
      dispatch( showNotification({
        type: 'fullScreen',
        autoHide: false,
        options: { align: 'right' },
        message: (
          <>     
            <View style={styles.avatarContainer}>
            <Image
              style={styles.closedImageNotification}
              source={require('~/assets/images/closed.png')
              }
              />
            </View>                      
              <AppText
              style={{
                fontSize: 17,
                color: 'white',                          
                textAlign: 'center',
                marginTop: 10,
                fontWeight: 'bold'
              }}>SORRY WE'RE CLOSED
              </AppText>
            <AppText
              style={{
                fontSize: 14,
                color: 'white',                          
                textAlign: 'center',
                marginTop: 10,
                marginBottom: 20
              }}>
              {territory.operation_time == "" ? "Check Back on " + dayNames[nextWorkingDay[now.getDay()]] :          
              "We open " + territory.operation_time}
            </AppText>
            <Button
              type="white"
              fullWidth
              style={{marginBottom: 10}}
              onClick={() => {                         
                dispatch(clearNotification());
              }}>
              PRE-ORDER FOR LATER
            </Button> 
            <Button
              type="white"
              fullWidth
              onClick={() => {                         
                dispatch(clearNotification());
                NavigationService.goBack();
              }}>
              GO BACK
            </Button>                    
          </>
        ),
      }))
    }
  },[territory])

  const sellerInfo = useMemo(() => {
    return territory ? (
      <View>
        <View style={styles.sellerInfo}>
          <Image
            style={styles.sellerBackground}
            source={
              territory && territory.cover_image
                ? { uri: territory.cover_image }
                : require('~/assets/images/darkwood.jpg')
            }
          />
          <View style={[styles.sellerBackground, styles.overlay]} />

          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(256,256,256,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.8, 1]}
            useAngle
            angle={180}
            style={{ flex: 1 }}>
            <View style={styles.sellerContent}>
              <Image
                style={styles.sellerImage}
                source={{ uri: territory.app_image }}
              />

              <AppText style={styles.sellerName}>{territory.name}</AppText>
              {parsedAddress && (
                 parsedAddress.street_address1 ? 
                <AppText style={styles.sellerAddress}>
                 {parsedAddress.street_address1}                
                </AppText> : 
                <AppText style={styles.sellerAddress}>
                 { parsedAddress.city}, {parsedAddress.state},{' '}
                  {parsedAddress.country}                
                </AppText>                 
              )}
            </View>
          </LinearGradient>
        </View>
        {territory.type_name != 'Services' ? (
        <View>
          <View style={styles.sellerDetails}>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                <AppText style={styles.detailValue}>
                  {(+territory.address_distance_km || 0).toFixed(0)}
                </AppText>
              </View>
              <AppText style={styles.detailName}>km away</AppText>
            </View>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                { territory.offer_delivery == '1' ? (
                  <DeliverySVG width={35} height={35} />
                ) : (
                  <DeliveryDisableSVG width={35} height={35} />
                )}
              </View>
              { territory.offer_delivery == '1' ?  
              <AppText style={styles.detailName}>                
                  We Deliver
              </AppText> :
              <AppText style={styles.detailNameDisable}>                
                  We Deliver
              </AppText>}
            </View>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                {territory.offer_pickup == '1' ? (
                  <PickupSVG width={35} height={35} />
                ) : (
                  <PickupDisableSVG width={35} height={35} />
                )}
              </View>
              { territory.offer_pickup == '1' ?  
              <AppText style={styles.detailName}>                
                  Pick Up
              </AppText> :
              <AppText style={styles.detailNameDisable}>                
                  Pick Up
              </AppText>}             
            </View>
            <View style={styles.sellerDetail}>
              <View style={styles.detailValueWrapper}>
                <AppText style={styles.detailValue}>
                  {totalCount}
                </AppText>
              </View>
              <AppText style={styles.detailName}>
                {territory.total_products > 1 ? territory.type_slug == 'restaurants' ? 'Menu Items': territory.type_slug == 'services'? 'Services':'Products' : territory.type_slug == 'restaurants' ? 'Menu Item' : territory.type_slug == 'services' ? 'Service' : 'Product'}
              </AppText>
            </View>
          </View>
          <View>
          <TouchableOpacity onPress={()=> {
            NavigationService.navigate("DealList",{territory_id: territory.tid});
          }}>
          {territory.deals_count != undefined && territory.deals_count > 0 && 
          <View style={styles.details_delivery}>
          <View style={styles.details_row}>
            <PriceSVG style={styles.dealItem} height={17} width={17}/>
        <AppText style={styles.products_freeDelivery} numberOfLines={1}>{territory.deals_count == 1 ? '1 Deal Available' : territory.deals_count + ' Deals Available'}
        </AppText></View></View> }       
        </TouchableOpacity>          
           <Button
              type="bordered_light"
              style={[GlobalStyles.formControl,styles.quoteButton]}
              onClick={() => ContactUs_clicked(territory.tid)}>
          Contact Us
          </Button> 
         </View>
        </View>
        ) :
        
        <View>
          <TouchableOpacity onPress={()=> {
            NavigationService.navigate("DealList");
          }}>
          {territory.deals_count != undefined && territory.deals_count > 0 && 
          <View style={styles.details_delivery}>
          <View style={styles.details_row}>
            <PriceSVG style={styles.dealItem} height={17} width={17}/>
        <AppText style={styles.products_freeDelivery} numberOfLines={1}>{territory.deals_count == 1 ? '1 Deal Available' : territory.deals_count + ' Deals Available'}
        </AppText></View></View> }      
        </TouchableOpacity>
          {
         token && territory && typeof territory.support_mail === 'string' && territory.support_mail.trim().length > 0 && <Button
         type="bordered-dark"
         style={[GlobalStyles.formControl,styles.quoteButton]}
         onClick={() => navigation.navigate('ContactSeller',{
             sellerID : territory.tid
         })}>
         Contact Us
         </Button>  } 
         </View> 
         }
        {categories.length == 1 ? <></> : renderControllers}
      </View>
    ) : null;
  }, [territory, parsedAddress, renderControllers]);
 
  if (territory && territory.type_slug === 'restaurants') {
    return (
      <Screen
        hasList
        statusBar="light-content"
        showHeaderOverLayOnScroll
        stickyBottom={<StickyBottom />}>
        <View style={styles.container}>
          {territory && categories ? (
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={styles.wrapper}
              alwaysBounceVertical={false}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => {
                if (page < totalPages-1) {
                  getCategory(page + 1);                
                  setPage(page + 1);                
                }}}
              onEndReachedThreshold={0.1}
              data={categories.filter((item) => item.show_name == true)}
              extraData={categories.filter((item) => item.show_name == true)}
              ListHeaderComponent={() => sellerInfo}
              ListEmptyComponent={() => (
                <AppText style={{ textAlign: 'center' }}>No Products.</AppText>
              )}
              renderItem={({ item, index }) =>
                (!selectedCategory || item.slug === selectedCategory) &&
                item.products.length ? (
                  <View
                    style={territory.app_overview_display != 'products'? {
                      flexDirection: 'column',
                      paddingTop: index === 0 ? 20 : 40,
                      paddingHorizontal: 10
                    }:{
                      flexDirection: 'column',
                      paddingTop: index === 0 ? 20 : 10,
                      paddingHorizontal: 10
                    }}
                    >
                    {territory.app_overview_display != 'products'? <AppText style={styles.categorytitle}>{item.name}</AppText> : <></> }
                    <View>
                      {item.products.map((product, index) => {
                        return !product.out_stock ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() =>
                              NavigationService.navigate('Product', {
                                productId: product.pid,
                              })
                            }>
                            <Product
                              territory={territory}
                              product={product}
                              style="category-item"
                              first={index === 0}
                              last={item.products.length === index + 1}
                              length={item.products.length}
                            />
                          </TouchableOpacity>
                        ) : null;
                      })}
                    </View>
                  </View>
                ) : null
              }
            />
          ) : (
            <>
              {sellerInfo}
              <LoadingGIF />
            </>
          )}
        </View>
      </Screen>
    );
  } else {
    
    return (       
      <Screen
        hasList
        statusBar="light-content"
        showHeaderOverLayOnScroll
        stickyBottom={<StickyBottom />}>
        <View style={styles.container}>
          {territory && (categories || products) ? ( 
            territory.app_overview_display != 'products' ?
            <FlatList
              contentContainerStyle={styles.wrapper}
              alwaysBounceVertical={false}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => {
                if (page < totalPages-1) {                 
                  getCategory(page + 1);                 
                  setPage(page + 1);                
                }
              }}
              onEndReachedThreshold={0.1}
              data={categories.length != 1 ? categories.filter((item) =>item.show_name == true) : categories}
              extraData={categories.length != 1 ? categories.filter((item) =>item.show_name == true) : categories}
              ListHeaderComponent={() =>  sellerInfo}
              ListEmptyComponent={() => (
                <AppText style={{ textAlign: 'center' }}>No Products.</AppText>
              )}
              renderItem={({ item, index }) =>
                (!selectedCategory || item.slug === selectedCategory) &&
                item.products.length ?  (
                <View
                    style={{
                      flexDirection: 'column',
                      paddingTop: index === 0 ? 20 : 40,
                      paddingHorizontal: 20
                    }}>
                      {territory.type_slug == 'services' ?  <AppText style={styles.categorytitle4Services}>All Services</AppText>
                      :
                       <AppText style={styles.categorytitle}>{item.name}</AppText> }
                    
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      { item.products.filter((item)=> item.out_stock == false ).map((product, index) => {
                        return !product.out_stock ? (
                          <TouchableOpacity
                            style={styles.productWrapper}
                            activeOpacity={0.8}
                            onPress={() =>
                              NavigationService.navigate('Product', {
                                productId: product.pid,
                              })
                            }>
                            <Product territory={territory} product={product} />
                          </TouchableOpacity>
                        ) : null;
                      })}
                    </View>
                  </View>                        
                ) : null}
            /> :
            <FlatList
              contentContainerStyle={styles.wrapper}
              alwaysBounceVertical={false}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={() => {
                if (page < totalPages-1) {                
                  getProducts(page+1);                
                  setPage(page + 1);                
                }
              }}
              onEndReachedThreshold={0.1}
              data={products}
              numColumns={2}
              extraData={products}
              ListHeaderComponent={() => sellerInfo}
              ListEmptyComponent={() => (
                <AppText style={{ textAlign: 'center' }}>No Products.</AppText>
              )}
              renderItem={({ item }) =>
                   !item.out_stock ? (
                      <TouchableOpacity
                        style={styles.productWrapper}
                        activeOpacity={0.8}
                        onPress={() =>
                          NavigationService.navigate('Product', {
                            productId: item.pid,
                          })
                        }>
                        <Product territory={territory} product={item} />
                      </TouchableOpacity>
                    ) : <></>               
               }
            />
          ) : (
            <>
              {sellerInfo}
              <LoadingGIF />
            </>
          )}
        </View>
      </Screen>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:80,    
  },

  list: {
    marginHorizontal: -10,
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
    paddingBottom: Theme.layout.screenPaddingBottom,
  },
  
  productWrapper: {
    flexDirection:'row',
    flexDirection: 'row', flexWrap: 'wrap',
    maxWidth: '50%',
    padding: 10,
  },

  sellerInfo: {
    position: 'relative',
  },

  sellerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },

  sellerContent: {
    alignItems: 'center',
    marginTop: 50,
  },

  sellerImage: {
    width: 90,
    height: 90,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  sellerName: {
    fontWeight: 'bold',
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
  },

  sellerAddress: {
    color: 'grey',
    marginTop: 5,
    marginBottom: 10,
  },

  sellerDetails: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
  sellerDetail: {
    justifyContent: 'center',
    flex: 1,
    marginVertical: 10,
  },

  detailValue: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: '400',
  },
  detailValueWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    // backgroundColor : '#000'
  },

  detailName: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },

  detailNameDisable: {
    fontSize: 10,
    marginTop: 5,
    color: "#A0A0A0",
    textAlign: 'center',
    fontWeight: '500',
  },

  overlay: {
    backgroundColor: 'black',
    opacity: 0.5,
  },

  shareButton: {
    marginHorizontal: 10,
    marginBottom: 10,
  },

  categorytitle: {
    fontSize: 20,
    fontWeight: '500',
    paddingHorizontal: 10,
  },

  categorytitle4Services: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  myCartButton: {
    marginHorizontal: 20,    
    marginVertical: 15,  
    position:'absolute',
    bottom:0,
    display: 'flex',
    right:0,
    left:0  
  },

  controllerWrapper: {
    paddingHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  controller: {
    width: '100%',
    height: 50,
    backgroundColor: '#EEE',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },

  controllerText: {
    color: 'black',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },

  closedTextContainer: {
    flexDirection: 'column'
  },

  closedText: {
    color: 'white',
    fontSize: 17,
    marginLeft: 25,
    fontWeight: 'bold',
  },

  closedTime: {
    color: 'grey',
    fontSize: 13,
    marginLeft: 25,
    fontWeight: 'bold',
  },

  closedImage:{
    flex:1,
    marginLeft:20,
    maxWidth: 90,
    display: 'flex',
    height: 50
  },

  closedStore: {    
    height:90,
    paddingTop:20,
    backgroundColor: 'black',
    flexDirection: 'row'
  },

  closedImageNotification:{    
    width: '100%',
    height: 120
  },

  avatarContainer: {
    width:'50%',
    height: 140
  },

  quoteButton: {
    marginHorizontal: 20
  },

  dealItem: {
    marginTop:6
  },

  details_delivery: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#eef8ef',
    
    height: 50,
    marginTop:10,
    marginBottom:5,
    marginHorizontal: 20,
    paddingVertical:10,    
  },

  details_row: {
    flexDirection: 'row'
  },
  
  products_freeDelivery: {
    fontWeight:'bold',
    textAlign: 'center',

    fontSize: 14,
    color: 'black',
    paddingVertical: 5,
    paddingLeft:15,
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

});

ProductsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      // headerRight: () => <Price />,

      headerLeft: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.goBack()}>
          <Icon size={30} color="white" name="chevron-left" />
        </TouchableOpacity>
      ),

      headerTitle: '',

      headerTintColor: 'white',
    },
  });
