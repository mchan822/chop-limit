import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { Screen, PastOrder, AppText} from '~/components';
import { Theme, MainNavigationOptions } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

export const OrderDetailsScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [orderDetail, setOrderDetail] = useState();

  const dispatch = useDispatch();
  const token = useSelector((state) => state.account.token);

  const orderId = useMemo(() => navigation.getParam('orderId'), []);

  useEffect(() => {
    setLoading(true);

    const formData = new FormData();
    formData.append('order_id', orderId);

    fetchAPI('/order/details', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        console.log("details order__---", res.data);
        setOrderDetail(res.data);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }, [orderId]);

  console.log(orderDetail);

  return (
    <Screen hasList isLoading={isLoading}>
      {orderDetail && (
        <View style={styles.container}>
          <View style={{backgroundColor: "#EFEFEF", flexDirection: "row", marginHorizontal:20, justifyContent:"space-between",marginBottom: 10}}>
            <View style={{flexDirection: "row",flex: 10,padding:10}}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ 
                                uri: 
                                orderDetail.territory.app_image ||
                                    'https://via.placeholder.com/450?text=Image%20is%20not%20available',
                                }}
                        style={styles.image}
                    />
                </View>

                <View style={{marginLeft: 15,flex:1}}>
                    <View >
                        <AppText style={{fontWeight: 'bold',paddingRight:0,marginTop:3}} numberOfLines={1}>{orderDetail.user.name}</AppText>
                    </View>
                    <View style={{marginTop: 3}}>
                        <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}> {orderDetail.time_ago} </AppText>
                    </View>
                </View>
            </View>
            <View style={{flex:4,padding:10}}>
              <View style={{flex: 1}}><AppText style={{fontSize: 13, fontWeight: '400', textAlign: 'left'}}>{orderDetail.status_name}</AppText></View>
              <View style={{flex: 1}}></View><AppText style={{fontSize: 13, color: '#31D457', fontWeight: '400', textAlign: 'left'}}>{orderDetail.total_amount_formatted} </AppText>
          </View>       
            {/* <View style={{flex:5,backgroundColor:'#DDD',width:'100%',padding:10}}>
                <View style={{flex: 1}}></View><AppText style={{fontSize: 22,paddingBottom:5, color: 'black', fontWeight: '400', textAlign: 'left'}}> {orderDetail.total_amount_formatted} </AppText>
            </View>                         */}
         </View>
          <View style={styles.orderInfo}>
            <View style={styles.part}>
              <AppText style={styles.field}>Ordered By:</AppText>
              <AppText style={styles.value}>
                {orderDetail.user.name + '\n' + orderDetail.user.phone}
              </AppText>
            </View>
            <View style={styles.part}>
              <AppText style={styles.field}>Deliver To:</AppText>
              <AppText style={styles.value}>
                {orderDetail.address.address}, {orderDetail.address.city}, {orderDetail.address.province}
              </AppText>
            </View>
          </View>
          <View style={styles.orderInfo}>
            <View style={styles.part}>
              <AppText style={styles.field}>Credit Card</AppText>
              <AppText style={styles.value}>{orderDetail.card}</AppText>
            </View>
            <View style={styles.part}>
              <AppText style={styles.field}>Order Date</AppText>
              <AppText style={styles.value}>{orderDetail.payment_date}</AppText>
            </View>
          </View>
          <FlatList
            style={styles.list}
            alwaysBounceVertical={false}
            data={orderDetail.products}
            scrollEnabled={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) =>  <PastOrder orderDetail={orderDetail} product={item} />}
            ListFooterComponent={() => (
              <View style={styles.footer}>
                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>Delivery</AppText>
                    <AppText style={styles.summaryValue}>
                      {orderDetail.currency_icon} {(+orderDetail.delivery_amount).toFixed(2)}
                    </AppText>
                  </View>
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>Tax</AppText>
                    <AppText style={styles.summaryValue}>
                    {orderDetail.currency_icon} {(+orderDetail.tax_amount).toFixed(2)}
                    </AppText>
                  </View>
                  <View style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>Tip({orderDetail.tip_percentage}%)</AppText>
                    <AppText style={styles.summaryValue}>
                    {orderDetail.currency_icon} {(+orderDetail.tip_amount).toFixed(2)}
                    </AppText>
                  </View>
                </View>

                <View style={styles.separator} />
                <AppText style={styles.summaryTotal}>
                  {orderDetail.currency_icon} {(+orderDetail.total_amount).toFixed(2)}
                </AppText>
              </View>
            )}
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Theme.layout.screenPaddingTop,
    paddingBottom: Theme.layout.screenPaddingBottom,

    flex: 1,
  },

  list: {
    marginTop: 10,
  },

  action: {
    marginBottom: 40,
    marginHorizontal: 40,
  },

  sellerTitle: {
    alignItems: 'center',
  },

  orderTitle: {
    marginTop: 20,
    alignItems: 'center',
  },

  orderNumber: {
    fontSize: 25,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  field: {
    fontSize: 16,
    marginBottom: 10,
    color: Theme.color.accentColor,
  },

  value: {
    fontSize: 14,
  },

  orderInfo: {
    paddingVertical: 10,
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,

    flexDirection: 'row',
  },

  part: {
    flex: 1,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: Theme.color.borderColor,
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

  summaryKey: {
    fontSize: 16,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.color.borderColor,
  },
  summaryTotal: {
    marginVertical: 15,
    fontSize: 24,
    textAlign: 'center',
  },
  imageContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    borderColor: '#DDD',
    borderWidth: 3,
    borderRadius: 40,
  },
  image: {
      width: 40,
      height: 40,
      borderRadius: 40,
  }
});

OrderDetailsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: `Order #${navigation.getParam('orderId')}`,
      headerTintColors: 'black',
    },
    headerTitleStyle: {
      color: 'black',
    },
  });
