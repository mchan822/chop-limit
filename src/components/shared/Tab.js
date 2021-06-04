import React, { useState } from 'react';
import { View, StyleSheet, Dimensions,TouchableOpacity,Image,ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Theme } from '~/styles';
import Carousel from 'react-native-snap-carousel';
import {AppText} from '~/components';

import LinearGradient from 'react-native-linear-gradient';
export const Tab = ({
    tabs,
    setPage,
    categoryData,
    selectCategory
}) => {
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
          {categoryData != false &&
           <View style = {{maxWidth: windowWidth, flexDirection: 'row',  marginBottom: 10,}}>
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
          </View> }
        {tabs.length > 1 && <View style={styles.tab}>           
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
        flex: 1,
        minHeight: '100%'
    }
});
