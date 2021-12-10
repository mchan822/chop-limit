import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Fragment,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { NavigationService } from '~/core/services';
import { useSelector, useDispatch } from 'react-redux';
import { AppText } from '~/components';
import LinearGradient from 'react-native-linear-gradient';
import OrderSVG from '~/assets/images/invoice.svg';
import { Theme } from '~/styles';
import RestaurantSVG from '~/assets/images/restaurant.svg';
import UserSVG from '~/assets/images/user.svg';
import ChatSVG from '~/assets/images/chat.svg';

export const StickyBottom = ({gradientColor='white'}) => {
  const unread = useSelector((state) => state.notification.unreadMessages);
  const order = useSelector((state) => state.order.order);
  const price = useSelector(
    (state) => state.order.order && state.order.order.cart_amount,
  );
    return (
      <View style={{flexDirection:'row',paddingBottom:10,backgroundColor:'transparent',paddingHorizontal:20}}>
         <LinearGradient
     colors={['#FFFFFF00',  gradientColor]}
      style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,      
          height: 70,
      }}/>
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
            width:  Dimensions.get("window").width - 250,          
            flexDirection:'row'
          },
        ]}
        onPress={() => {
          NavigationService.navigate('MyOrder');
        }}>          
          <OrderSVG height={30} width={30}/>
          <AppText  style={{color:'white',fontWeight:'bold',paddingLeft:5,fontSize:16}}>{`${order && order.currency_icon}${(+price || 0).toFixed(2)}`}</AppText>
      </TouchableOpacity>:   
       <TouchableOpacity
       style={[
         styles.menuButton,
         {
           backgroundColor: 'black',
           height: 60,
           width:  Dimensions.get("window").width - 250,           
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

const styles = StyleSheet.create({
  menuButton: {    
    height: 120,
    marginRight:10,
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
