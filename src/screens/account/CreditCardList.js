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
import Dialog from 'react-native-dialog';
import GetLocation from 'react-native-get-location';
import GeoCoder from 'react-native-geocoding';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { NavigationService } from '~/core/services';
import { Config } from '~/core/config';
import { fetchAPI } from '~/core/utility';
import { Screen, LocationSelector, CardItem,Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import {
  showNotification,
  setOrder,
  setToken,
  cancelOrder,
  subscriptionAddressUpdated,
  enterMessageRoom,
  setUserInfo,
  updateCard,
} from '~/store/actions';

process.nextTick = setImmediate;

export const CreditCardListScreen = ({navigation}) => {
  // const [card, setCard] = useState([]);
  const [defaultCard, setDefaultCard] = useState([]);
  const mapRef = useRef();
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);

  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);
  const guestToken = useSelector((state) => state.account.guestToken);
  const order = useSelector((state) => state.order.order);
  const isUpdateCard = useSelector((state) => state.notification.isUpdateCard);
  const fromScreen = useMemo(() => navigation.getParam('fromScreen'), []);
  
  fromScreen&&console.log(`+++++++++++++++++FromScreen:${fromScreen}`)
  const windowWidth = Dimensions.get("window").width;
  useEffect(() => {
    if(windowWidth < 400 ){
      navigation.setParams({
        fontSize: 18
      });
    } 
  
  }, [windowWidth]);

  const setDefaultCreditCard = useCallback(
    (card) => {
      
          if (token && userInfo && userInfo.user_verified && userInfo.user_verified == true) {
            setLoading(true);
            const formData = new FormData();
            formData.append('card_id', card.id);
            fetchAPI('/myaccount/set_default_card', {
              method: 'POST',
              headers: {
                authorization: `Bearer ${token}`,
              },
              body: formData,
            })
              .then((res) => {
                dispatch(updateCard(!isUpdateCard));
                fromScreen&&fromScreen=="MyOrder"&&NavigationService.goBack();
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
    [dispatch, token, guestToken, defaultCard],
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
  const deleteCard = useCallback(
    (cardId) => {
      setLoading(true);
      const formData = new FormData();
      formData.append('card_id', cardId);

      fetchAPI('/myaccount/remove_card', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((res) => {
          dispatch(updateCard(!isUpdateCard));
          dispatch(showNotification({ type: 'success', message: res.message }));
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    },
    [dispatch, token, cards],
  );

  useEffect(() => {
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
    if (token) {      
      setLoading(true);
      fetchAPI(`/myaccount/default_card`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("++++");
          console.log(res.data);
          setDefaultCard(res.data);
          dispatch(
                setUserInfo({
                  ...userInfo,
                  creditcard: res.data.full,
                }),
              );
          
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }
  }, [dispatch, isUpdateCard]);

  return (
    <Screen isLoading={isLoading} hasList stickyBottom={<MyCart />} >
      
      <View style={styles.container}>
        {cards && cards.length > 0 && (
          <>
            <FlatList
              style={styles.list}
              scrollEnabled={false}
              data={cards}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                //item.default?setDefaultCard(item):'',
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => {
                    // dispatch(setUserInfo({creditcard: item.full}));
                    fromScreen&&fromScreen=="MyOrder"?setDefaultCreditCard(item):NavigationService.navigate('Account/CreditCard',{card_id: item.id,edit:true})
                  }}>
                  <View style={styles.cardWrapper}>
                    <CardItem card={item} />
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setDefaultCreditCard(item);
                    }}>
                  <View style={styles.iconWrapper}>
                    <Icon size={24} color={item.id==defaultCard.id?Theme.color.accentColor:'#333'} name="star" />
                  </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={(ev) => {
                      ev.stopPropagation();
                      Alert.alert(
                        '',
                        'Are you sure you want to delete this card?',
                        [
                          {
                            text: 'Yes',
                            onPress: () => {
                              deleteCard(item.id);
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
        <Button
              type="white"
              style={{marginTop: 10}}
              fullWidth
              onClick={() => {
                NavigationService.navigate('Account/CreditCard',{edit:true});
              }}>
              <AppText style={{fontWeight: 'bold',textTransform: 'uppercase'}}>Add a credit card</AppText>
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

  description: {
    color: 'grey',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center'
  },

  list: {},

  card: {
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

  cardWrapper: {
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

CreditCardListScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title')
        ? navigation.getParam('title')
        : 'My Cards',
    },
  });
