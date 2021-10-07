import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, OrderItem, SubscriptionItem, Button, AppText, Tabs, LoadingGIF,StickyBottom} from '~/components';
import { MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { NavigationService } from '~/core/services';
import { showNotification,setTerritoryType} from '~/store/actions';


export const PastOrdersScreen = () => {

  const order = useSelector((state) => state.order.order);
  const explorer = useSelector((state) => state.explorer);
  // const [page, setPage] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [pastOrders, setPastOrders] = useState(false);
  const [subscriptions, setSubscriptions] = useState(false);  
  const subscriptionCancelledUpdated = useSelector((state) => state.notification.subscriptionCancelledUpdated);

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);

  const tabData = useMemo(() => {
    let tabData = [];
    
    tabData.push({
      title: 'Orders',
      content: (
        <View>
        {pastOrders && pastOrders.length > 0 ? (
          <>
          {pastOrders.length == 1 ?
            <AppText style={styles.heading}>YOU HAVE {pastOrders.length} PAST ORDER</AppText>
            :
            <AppText style={styles.heading}>YOU HAVE {pastOrders.length} PAST ORDERS</AppText>
          }
          <FlatList
            data={pastOrders}
            style={styles.list}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <OrderItem
                order={item}
                onPress={() => {
                  NavigationService.navigate('OrderDetails', {
                    orderId: item.order_id,
                  });
                }}
              />
            )}
          />
          </>
        
      ) : 
          pastOrders === false? (
              <>
                <LoadingGIF />
              </>
          ) :
          <>
          <AppText style={styles.heading}>YOU HAVE NO PAST ORDER</AppText>
          <AppText style={styles.subheading}>Once you complete an order you'll see it here.</AppText>
          </>
      }
      </View>
      ),
    });
    return tabData;
  }, [pastOrders]);

  useEffect(() => {    
    PastOrdersScreen.navigationOptions = ({ navigation }) =>
      MainNavigationOptions({
        navigation,
        options: {
          headerTitle: pastOrders.length < 2 ? 'Past Order' : 'Past Orders',
          headerTintColors: Theme.color.accentColor,
        },
        headerTitleStyle: {
          color: Theme.color.accentColor,
        },
      });
  },[pastOrders]);

  useEffect(() => {    
    if(token){
      console.log("aaaaaaaasdfsdfaaaaaaaaaaaaa",token);
      fetchAPI('/orders', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
      .then(async (res) => {            
         setPastOrders(res.data.orders);      
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
    )}
  },[token,subscriptionCancelledUpdated]);

  const navigateToSellers = (
    category
  ) => {
    dispatch(setTerritoryType({ territory_type : category }));

    NavigationService.navigate(lastAddress ? 'Home' : 'Location',{
      title : category == 'restaurants' ? 'restaurants' : 'shops' 
    })
  }

  const lastAddress = useMemo(
    () =>
      {
        if(order || explorer){
            if(order && order.address && order.address){
              return order.address
            }else if(explorer.address){
              return explorer.address
            }else{
              return false;
            }
        }else{
          return false;
        }
      },
    [order,explorer],
  );

  return (
    <Screen hasList isLoading={isLoading} stickyBottom={<StickyBottom/>}>
      <View style={styles.container}>
      <Tabs tabs={tabData} />
      
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop,
    // paddingBottom: Theme.layout.screenPaddingBottom,
    paddingHorizontal: 20
  },

  heading : {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 0
  },

  subheading : {
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    width: '70%'
  },

  button: {
    marginBottom: 10
  },

  list: {},
});

PastOrdersScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Past Order',
      headerTintColors: 'black',
    },
  });
