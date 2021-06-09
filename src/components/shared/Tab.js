import React, { useState } from 'react';
import { View, StyleSheet, Dimensions,TouchableOpacity,ImageBackground,Image,ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Theme,GlobalStyles } from '~/styles';
import Carousel from 'react-native-snap-carousel';
import {AppText,Button} from '~/components';
import { truncateAddress } from '~/core/utility';
import LinearGradient from 'react-native-linear-gradient';
import FoodSVG from '~/assets/images/burger.svg';
import { useSelector, useDispatch } from 'react-redux';

import { NavigationService } from '~/core/services';
export const Tab = ({
    tabs,
    setPage,
    categoryData,
    selectCategory,
    lastAddress,
    awkward,
    categoryScreen,
}) => {
const token = useSelector((state) => state.account.token);
const [contentSizeChanged, setContentSizeChanged] = useState(false);
const [contentsize, setContentsize] = useState(0);
const windowWidth = Dimensions.get('window').width;
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 500;
    console.log("this is content size+++++++", contentSize);    
    if(contentSize.height != contentsize){
        setContentsize(contentSize.height);
        setContentSizeChanged(true);
    }
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
};
const dispatch = useDispatch();
const renderHome = ({item, index}) => {  
    return  <TouchableOpacity style={styles.menuButton}
    onPress={() => selectCategory(item.ttcid)}>
     <Image
       source={{
         uri:
           item.image ||
           'https://via.placeholder.com/450?text=Image%20is%20not%20available',
       }}
       style={styles.image_category}
       resizeMode="cover"
       PlaceholderContent={<ActivityIndicator />}
     />
     {/* <View style={{
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: 5,
            borderTopRightRadius: 0,
            overflow: 'hidden',}}> */}
     <LinearGradient
   colors={['#00000000', '#00000000', '#000000dd']}
   style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '100%',
      borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
   }}
    />
     {/* </View> */}
     
     <View style={styles.categoryNameBack}>
     <AppText style={styles.categoryName} numberOfLines={1}>{item.name}</AppText>
     </View>
  </TouchableOpacity>  
 
     };
const [activeTabIndex, setActiveTabIndex] = useState(0);
  return (
    <ScrollView   onScroll={({nativeEvent}) => {
        
        if (isCloseToBottom(nativeEvent)) {
            if(contentSizeChanged){
                console.log("calling");
                setPage();
                setContentSizeChanged(false);          
            }
        }
      }} scrollEventThrottle={100}>
      {categoryScreen != true &&
           <View style={[styles.menuRow, styles.menuRowLastItem]}>
              <TouchableOpacity
                style={[
                  styles.menuButtonAddress,
                  {
                    height: 50,
                    alignItems: 'flex-start',
                    paddingLeft: 20,
                    flex: 5,
                  },
                ]}
                onPress={() => {
                  //dispatch(setTerritoryType({ territory_type: 'restaurants' }));
                  NavigationService.navigate('Location');
                }}>
                <View style={styles.menuButtonTextWrap}>
                  {/* <Icon size={58} color={'#ffffff'} name="account-circle-outline" style={styles.menuButtonIcon} /> */}
                  <AppText style={{ color: '#000' }}>
                    Deliver to:{' '}
                    {lastAddress ? (
                    <AppText style={[{ fontWeight: 'bold' }]}>
                      {truncateAddress(lastAddress)}
                    </AppText>) : (
                    <AppText style={[{ fontWeight: 'bold' }]}>
                      Add Delivery Address
                    </AppText>)}
                  </AppText>
                </View>
              </TouchableOpacity>
            </View> }
        {categoryScreen != true &&
          <ImageBackground
            source={require('~/assets/images/banner.png')}
            style={styles.banner}>
          </ImageBackground> 
          }
        {awkward == true ? 
        ( categoryData != false &&
            <View style = {{maxWidth: windowWidth, flexDirection: 'row',  marginBottom: 10,paddingHorizontal:10}}>
            <Carousel    
            data={categoryData}
            layout='default'    
            inactiveSlideScale={1}             
            activeSlideAlignment={'start'}
            contentContainerCustomStyle={{overflow: 'hidden', width: (windowWidth-40)/3*categoryData.length}}
            inactiveSlideOpacity={1}     
            renderItem= {renderHome}
            sliderWidth={windowWidth-40}
            itemWidth={(windowWidth-40)/3}
           > 
           </Carousel> 
           </View>  ): 
        <View style={[styles.awkward, styles.topSection]}>
        <View style={styles.noResultsWrapper}>             
            <FoodSVG width={120} height={120} />             
        </View>
        <AppText style={[styles.subTitle, GlobalStyles.formControl]}>
          We don't have any restaurant in your area, right now.
        </AppText>
        <AppText
          style={[
            styles.description,
            GlobalStyles.formControl,
            { marginBottom: 20 },
          ]}>
          Chow Local® recently launched, and more restaurant should get onboard
          soon.
        </AppText>
        <>
          <Button
            type="accent"
            style={[GlobalStyles.formControl, styles.exitButton]}
            onClick={() => {
              NavigationService.navigate('Invite');
            }}>
            INVITE A{' '}
            {'RESTAURANT'}
          </Button>
          {token && (
            <Button
              type="bordered-dark"
              style={[GlobalStyles.formControl, styles.exitButton]}
              onClick={() => {
                NavigationService.navigate('StartSelling');
              }}>
              {'I OPERATE A RESTAURANT'}
            </Button>
          )}
        </>
        {/* } */}
        {/* <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl, styles.exitButton]}
          onClick={() => {
            NavigationService.reset('Home');
          }}>
          Exit
        </Button> */}
      </View>}
          
        <View style={styles.tabContent}>{typeof tabs[activeTabIndex] != null && tabs[activeTabIndex].content}</View>
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
    tab : {
        flexDirection : 'row',
        justifyContent: 'center',
        paddingTop: 20
    },
    tabButton : {
        marginLeft: 10,
        marginRight: 10,
        padding: 10,
        backgroundColor: '#BBB',
        borderRadius: 5
    },
    menuButton: { 
        marginTop: 20,
        marginHorizontal:10,
        alignItems: 'center',
        justifyContent: 'center',   
      },
        
    banner: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal:0,
        marginTop: 10,
        paddingBottom: 10,
        width: Dimensions.get("window").width ,
        resizeMode: 'contain',
        height:Dimensions.get("window").width * 3 / 8 ,    
    },
    menuButtonAddress: {    
        height: 120,
        marginHorizontal:5,
        marginVertical:5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
    },
    noResultsWrapper: {
        marginTop: 35,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      menuWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        marginTop:10
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
    
    
      menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal:10,
      },
    
      menuRowLastItem: {
        marginBottom: 0,
      }, 
      menuButtonTextWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      
  awkward: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal,
  },
    image_category: {
        backgroundColor: '#FFF',
        aspectRatio: 1,
        borderRadius: 5,
        width: '100%',
        borderWidth: 1,
        borderColor: '#CCC',
        // overlayColor: '#0ff',
         
    },

    categoryNameBack: {     
        
        width:"100%",
        marginTop: -23,        
        marginBottom: 10,
        borderRadius:3
    },

    categoryName: {
        color: 'white',
        paddingLeft: 5,
        fontSize: 14,
        width: "100%",
        fontWeight: 'bold',
        textAlign:'left',
      },
    tabButtonText : {
        color: '#E1E1E1',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 20
    },
    tabButtonActive : {
        backgroundColor: Theme.color.accentColor,
    },
    tabButtonTextActive : {
        color: '#FFF'
    },
    tabContent : {
        paddingTop: 10,
        paddingHorizontal:10,
        flex: 1,
        minHeight: '100%'
    }
});
