import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Screen, Input, Button, DealItem, LoadingGIF } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { NavigationService } from '~/core/services';
import { fetchAPI } from '~/core/utility';
import { showNotification,  setTerritory,enterMessageRoom } from '~/store/actions';

import { AppText} from '../../components';


export const DealListScreen = ({ navigation }) => {
  const userinfo =  useSelector((state) => state.account.userInfo);
  const [isLoading, setLoading] = useState(false);
  const [dealList, setDealList] = useState(false);
  const guestToken = useSelector((state) => state.account.guestToken);
  const token = useSelector((state) => state.account.token);
  const explorer = useSelector((state) => state.explorer);
  const order = useSelector((state) => state.order.order);
  const windowHeight = Dimensions.get('window').height;
  const territory_id = useMemo(() => navigation.getParam('territory_id') ? navigation.getParam('territory_id') : '',[]);
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const lastAddress = useMemo(() => {
    if (order && order.address) {
      return order.address;
    } else if (explorer && explorer.address) {
      return explorer.address;
  
    } else {
      return false;
    }
  }, [order, explorer]);
  const setTerritoryToRedirect = useCallback((tid) => {
    console.log("territ234242342",tid);
    if(token){
      const formData = new FormData();
      formData.append('territory', tid);
      fetchAPI(`/territory?territory=${tid}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("territ",res.data.territory);        
        dispatch(setTerritory(res.data.territory));
        NavigationService.navigate("Products");
        
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: "No Territory data" })),
      )
   }
  },[]);
  useEffect(() => {
    console.log("+promocodes+++",lastAddress);
    fetchAPI(`/deals?size=12&page=${page}&address=${lastAddress}&clear-session=1&territory_id=${territory_id}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
    .then((res) => {      
      if(page == 0){
        setDealList(res.data.deals);
      } else {
        setDealList((existing)=>[
          ...existing,
          ...res.data.deals]
        );
      }
      setTotalPages(res.data.total_pages);
    })
    .catch((err) =>
      dispatch(showNotification({ type: 'error', message: err.message })),
    )
  },[token,page]);
  const [contentSizeChanged, setContentSizeChanged] = useState(false);
  const [contentsize, setContentsize] = useState(0);
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
      const paddingToBottom = 500;  
      if(contentSize.height != contentsize){
          setContentsize(contentSize.height);
          setContentSizeChanged(true);        
      }
      return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom;
  };
  const loadMore = useCallback((page,totalPages) => {     
    if (page < totalPages-1) {           
       setPage(page + 1); 
             
    }
   });
  return (
    <Screen isLoading={isLoading}>
      <View style={styles.container}>
        {dealList === false && (<><LoadingGIF/></>)}
        {dealList && dealList.length == 0 || dealList.length > 1 ? <AppText style={styles.heading}>{dealList.length} deals available</AppText> : <AppText style={styles.heading}>{dealList.length} deal available</AppText>}
        {dealList && dealList.length > 0 && (
            <ScrollView onScroll={({nativeEvent}) => {           
              if (isCloseToBottom(nativeEvent)) {               
                  if(contentSizeChanged){
                      loadMore(page,totalPages);
                      setContentSizeChanged(false);          
                  }
              }
            }} scrollEventThrottle={100}
            >
            {
                dealList.map((item, index)=> (
                <TouchableOpacity
                    onPress={() => item.type == "promo_code" ? navigation.navigate('PromoCodeDetail',{
                        promoCode : item
                }) :  setTerritoryToRedirect(item.territory.tid)
                // dispatch(setTerritory(item.territory)),
                // navigation.navigate('Products')
                }>
                <DealItem
                  item= {item}
                  key= {index}
                />
                </TouchableOpacity>
              ))
            }
            </ScrollView>
        )}
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

  heading : {
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
    fontSize: 16,
    marginBottom: 10
  },
});

DealListScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Deals',
    },
  });