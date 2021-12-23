import React from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppText } from '~/components';
import PriceSVG from '~/assets/images/price-tag.svg';
import ChatSVG from '~/assets/images/chat.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationService } from '~/core/services/NavigationService';


var nextWorkingDay = [ 1, 2, 3, 4, 5, 6, 0 ];
var now = new Date();
export const Seller = ({ seller }) => (
  <View style={styles.wrapper}>
     <View style={styles.imageWrapper_cover}>
      <Image
        source={{
          uri:
            seller.cover_image ||
            'https://via.placeholder.com/450?text=Image%20is%20not%20available',
        }}
        style={styles.image_cover}
        resizeMode="cover"
        PlaceholderContent={<ActivityIndicator />}
      />
    </View>
    <View style={styles.imageWrapper}>
      <Image
        source={{
          uri:
            seller.app_image ||
            'https://via.placeholder.com/450?text=Image%20is%20not%20available',
        }}
        style={styles.image}
        resizeMode="cover"
        PlaceholderContent={<ActivityIndicator />}
      />
    </View>
    <View style={styles.details}>
      <AppText style={styles.name} numberOfLines={1}>
        {seller.name}
      </AppText>
      {seller.type_slug !='services' ? <View>
          {+seller.address_distance <= +seller.delivery_area_radius 
                  ?
                    <AppText style={styles.products} numberOfLines={1}>
                      {/* {seller.warehouse_address_line == '' ? seller.warehouse_address_city : seller.warehouse_address_line} */}
                      {/* {(parseFloat(seller.address_distance_km).toFixed(0))+(`km away`)} • Closes at {seller.operation_times[nextWorkingDay[now.getDay()]].till} */}
                      {(parseFloat(seller.address_distance_km).toFixed(0))+(`km away`)} • {seller.operation_time_full}
                    </AppText> 
                  : 
                    <AppText style={styles.products} numberOfLines={1}>
                      {/* {seller.warehouse_address_line == '' ? seller.warehouse_address_city : seller.warehouse_address_line} */}
                      {(parseFloat(seller.address_distance_km).toFixed(0))+(`km away`)} • {seller.operation_time_full}
                  </AppText>
                 }        
      </View> :
      <View>
        <AppText style={styles.products} numberOfLines={1}>
          {seller.warehouse_address_line == '' ? seller.warehouse_address_city : seller.warehouse_address_line}
        </AppText> 
      </View>}    
        {seller.deals_count != undefined && seller.deals_count > 0 &&  
      <View style={styles.details_delivery}>
      <PriceSVG style={styles.dealItem} height={15} width={15}/>
            <AppText style={styles.products_freeDelivery} numberOfLines={1}>{seller.deals_count == 1 ? '1 Deal Available' : seller.deals_count + ' Deals Available'} 
            </AppText></View> }
      {/* {seller.promo_codes_count != undefined && (seller.promo_codes_count == 0 ?
        seller.free_delivery_cutoff != '0.00'  && <View style={styles.details_delivery}>
        <PriceSVG style={styles.dealItem} height={15} width={15}/>
        <AppText style={styles.products_freeDelivery} numberOfLines={1}>1 Deal Available
        </AppText></View>:
        seller.promo_codes_count == 1 ? 
            seller.free_delivery_cutoff != '0.00' ? <View style={styles.details_delivery}>
            <PriceSVG style={styles.dealItem} height={15} width={15}/>
            <AppText style={styles.products_freeDelivery} numberOfLines={1}>2 Deals Available
            </AppText></View> : <View style={styles.details_delivery}>
            <PriceSVG style={styles.dealItem} height={15} width={15}/>
            <AppText style={styles.products_freeDelivery} numberOfLines={1}>1 Deal Available
            </AppText></View>
         : 
         seller.free_delivery_cutoff != '0.00' ? <View style={styles.details_delivery}>
         <PriceSVG style={styles.dealItem} height={15} width={15}/>
         <AppText style={styles.products_freeDelivery} numberOfLines={1}>{seller.promo_codes_count+1} Deals Available
         </AppText></View> : <View style={styles.details_delivery}>
        <PriceSVG style={styles.dealItem} height={15} width={15}/>
        <AppText style={styles.products_freeDelivery} numberOfLines={1}>{seller.promo_codes_count} Deals Available
        </AppText></View>
      )} */}
    </View>
    {/* <AppText style={styles.distance} numberOfLines={1}>
      {(+seller.address_distance_km || 0).toFixed(2)} KM
    </AppText> */}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',    
  },

  imageWrapper_cover: {
    justifyContent: 'center',
    height:100,
    width: '100%',    
  },

  image_cover: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    height: 100,    
    borderColor: '#CCC',
  },

  imageWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: -60,
    marginLeft: 20
  },

  image: {
    backgroundColor: '#FFF',
    aspectRatio: 1,
    borderRadius: 5,
    width: '25%',
    borderWidth: 1,
    borderColor: '#CCC',    
  },

  details: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 20,
    marginRight: 20,
  },

  details_delivery: {
    flexDirection: 'row',
    alignItems: 'flex-start',    
    backgroundColor: '#eef8ef',
    width: '100%',
    marginBottom : 15
  },

  dealItem: {
    marginLeft:10,
    marginTop:7
  },

  name: {
    textAlign: 'center',    
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
  },

  products: {
    textAlign: 'center',
    fontSize: 12,
    color: 'black',
    marginTop: 5,
    marginBottom: 10,
  },

  products_freeDelivery: {
    fontWeight:'bold',
    textAlign: 'center',
    fontSize: 12,
    color: 'black',
    paddingVertical: 5,
    paddingLeft:5,
  },

  distance: {
    textAlign: 'center',
    fontSize: 10,
    color: 'red',
    marginTop: 10,
  },
});
