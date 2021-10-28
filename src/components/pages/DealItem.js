import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { AppText } from '~/components';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DealItem = ({ 
    item,
    onPress
 }) => (
     item.type == "promo_code" ?
    <View style={{backgroundColor: "#EFEFEF", flexDirection: "row", padding: 10, justifyContent:"space-between",marginTop: 10}}>
        <View style={{flexDirection: "row", flex: 0.6}}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ 
                            uri: 
                                item.territory.app_image ||
                                'https://via.placeholder.com/450?text=Image%20is%20not%20available',
                            }}
                    style={styles.image}
                />
            </View>

            <View style={{marginLeft: 15}}>
                <View style={{flexDirection: "row"}}>
                    <AppText style={{fontWeight: 'bold'}}>{item.territory.name}</AppText>
                </View>
                {/* {item.territory.free_delivery == true ? 
                <View style={{marginTop: 3}}>
                    <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}> {item.free_delivery_cutoff}</AppText>
                </View>
                : */}
                <View style={{marginTop: 3}}>
                    <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}>{item.promo_code.discount_formatted} OFF {item.promo_code.only_for_first_order == '1' ? "your first order": !item.promo_code.has_products_only && !item.promo_code.has_categories_only ?'everything' : 'selected items...'}</AppText>
                </View>
                {/* } */}
            </View>
        </View>
               
        <View style={{flex: 0.4}}>
            
            <View style={{flex: 1}}><AppText style={{fontSize: 11, fontWeight: String(400), textAlign: 'right'}}> <Icon size={15} color={'#000'} name="content-copy" /> COPY CODE</AppText></View> 
            {/* {item.promo_code.has_expiry_date == false ? "COPY CODE" : item.promo_code.expires_in}  */}
            <View style={{marginTop: 3, flex: 1}}><AppText numberOfLines={1} style={{fontSize: 13, color: '#31D457', fontWeight: String(400), textAlign: 'right'}}> {item.promo_code.name} </AppText></View>
        </View>             
    </View> :
    item.type == "free_delivery" ?
    <View style={{backgroundColor: "#EFEFEF", flexDirection: "row", padding: 10, justifyContent:"space-between",marginTop: 10}}>
        <View style={{flexDirection: "row", flex: 0.6}}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ 
                            uri: 
                                item.territory.app_image ||
                                'https://via.placeholder.com/450?text=Image%20is%20not%20available',
                            }}
                    style={styles.image}
                />
            </View>
            <View style={{marginLeft: 15}}>
                <View style={{flexDirection: "row"}}>
                    <AppText style={{fontWeight: 'bold'}}>{item.territory.name}</AppText>
                </View>
                {/* {item.territory.free_delivery == true ? 
                <View style={{marginTop: 3}}>
                    <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}> {item.free_delivery_cutoff}</AppText>
                </View>
                : */}
                <View style={{marginTop: 3}}>
                    <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}>Free Delivery On All Orders</AppText>
                </View>
                {/* } */}
            </View>
        </View>
               
        <View style={{flex: 0.4}}>
            
            <View style={{flex: 1}}><AppText style={{fontSize: 11, fontWeight: String(400), textAlign: 'right'}}><Icon size={15} color={'#000'} name="content-copy" />COPY CODE</AppText></View>
            <View style={{marginTop: 3, flex: 1}}><AppText numberOfLines={1} style={{fontSize: 13, color: '#31D457', fontWeight: String(400), textAlign: 'right'}}></AppText></View>
        </View>             
    </View> :
    <View style={{backgroundColor: "#EFEFEF", flexDirection: "row", padding: 10, justifyContent:"space-between",marginTop: 10}}>
    <View>
        <View style={styles.imageContainer}>
            <Image
                source={{ 
                        uri: 
                            item.territory.app_image ||
                            'https://via.placeholder.com/450?text=Image%20is%20not%20available',
                        }}
                style={styles.image}
            />
        </View>
    </View>
    <View style={{flexDirection: "column", flex:1}}>
        <View style={{flexDirection: "row", flex:1}}>
            <View style={{flexDirection: "row", flex: 0.6}}>
                    
                <View style={{marginLeft: 15}}>
                    <View style={{flexDirection: "row"}}>
                        <AppText style={{fontWeight: 'bold'}}>{item.territory.name}</AppText>
                    </View>
                    {/* {item.territory.free_delivery == true ? 
                    <View style={{marginTop: 3}}>
                        <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}> {item.free_delivery_cutoff}</AppText>
                    </View>
                    : */}
                
                    {/* } */}
                </View>
            </View>
                
            <View style={{flex: 0.4}}>                
                <View style={{flex: 1}}><AppText style={{fontSize: 11, fontWeight: String(400), textAlign: 'right'}}><Icon size={15} color={'#000'} name="content-copy" /> COPY CODE</AppText></View>
                
            </View>    
        </View>    
        <View style={{flexDirection: "row", flex:1}}>
            <View style={{marginTop: 3,marginLeft:15 }}>
                <AppText style={{fontSize: 12, color: '#777', height: 16}} numberOfLine={1}>Spend {item.free_delivery_cutoff} get free delivery</AppText>
            </View>
        </View>
    </View>
    
</View>
  );

  const styles = StyleSheet.create({
    created: {
        fontSize: 8,
        marginBottom: 10,
        opacity: 0.8,
        paddingHorizontal: 60
    },
    content_left: { 
        flexDirection: 'row'
    },
    messageContainer: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: '#EFEFEF',
        maxWidth: '80%',
        marginLeft: 10,
        marginRight: 10,
    },
    message: {
        textAlign: 'right',
        color: '#808080'
    },
    imageContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 40,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 40,
    }
  });