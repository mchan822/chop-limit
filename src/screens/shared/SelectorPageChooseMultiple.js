import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';

import { NavigationService } from '~/core/services';
import {CheckBox} from 'react-native-elements';
import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { select } from 'redux-saga/effects';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SelectorPageChooseMultipleScreen = ({ navigation }) => {
  const header = useMemo(() => navigation.getParam('header'), []);
  const options = useMemo(() => navigation.getParam('options'), []);
  const action = useMemo(() => navigation.getParam('action'), []);
  const maxnum = useMemo(() => navigation.getParam('maxnum'), []);
  
  const noOptionsText = useMemo(() => navigation.getParam('noOptionsText'));
  const selected = useMemo(() => navigation.getParam('selected'), [navigation]);
  const [selectedItem, selectItem] = useState('');
  const addselectedItem = useCallback((value)=> {
    if(selectedItem) {
      action(selectedItem);
      NavigationService.goBack();
    }
    //NavigationService.goBack();
  },[selectedItem]);

  useEffect(()=>{
    console.log("seeeeeeeeeeeeeeeeeee", selectedItem);    
  },[selectedItem])
  
  const AddItemButton = () => {
    return (selectedItem.length > 0 ? (
      <Button
        type="accentGreen"
        style={styles.myCartButton}
        onClick={() => addselectedItem(selectedItem)}>
        Add {`${selectedItem.length}`} {selectedItem.length > 1 ? 'Items' : "Item"}
      </Button>
    ) : (
      <></>
    ))
  };
  return (
    <Screen hasList stickyBottom={<AddItemButton/>}>
      <View style={styles.container}>
        {header && <AppText style={styles.header}>{header}</AppText>}
        {options && options.length > 0 ? (
          <FlatList
            style={styles.list}
            alwaysBounceVertical={false}
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              return (
                item && (
                  options.length - 1 != index ? // this is added due to flatlist marginBottom for the addItemButton in the bottom
                  <TouchableOpacity style={styles.viewOrder}  onPress={() => {
                    if(selectedItem && selectedItem.indexOf(item.value) !== -1 ){   
                      const sel_index = selectedItem.findIndex(obj => obj === item.value);                            
                      var tempSelItem = selectedItem;
                      tempSelItem.splice(sel_index,1);                   
                      selectItem([...tempSelItem]);                               
                   } else {
                    if(selectedItem.length < maxnum){
                      selectItem((existing)=> [...existing,item.value]);
                    }
                   }
                  }}>
                    <AppText style={{flex: 3, fontSize:15, width:'100%', paddingLeft:10, marginBottom: 2}} >{item.label}</AppText>                   
                      <View style={{width: 40,alignItems:'center', height:50, paddingVertical:0}}>
                      <CheckBox
                       checked={selectedItem.indexOf(item.value) !== -1 ? true : false}
                       onPress={() => {
                        if(selectedItem && selectedItem.indexOf(item.value) !== -1 ){   
                          const sel_index = selectedItem.findIndex(obj => obj === item.value);                            
                          var tempSelItem = selectedItem;
                          tempSelItem.splice(sel_index,1);                   
                          selectItem([...tempSelItem]);                               
                       } else {
                         if(selectedItem.length < maxnum){
                          selectItem((existing)=> [...existing,item.value]);
                         }
                       }
                      }}
                       checkedColor={Theme.color.accentColor}
                        style={styles.radioBackground}
                      />
                      {/* <CheckBox containerStyle={styles.radioBackground} checkedColor={Theme.color.accentColor} checked={value==item.value ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setValue(item.value),action(item.value);setSelectedName(item.label);}}  uncheckedIcon='circle-o'/> */}
                      </View>                                      
                  </TouchableOpacity>
                  : 
                  <View style={{marginBottom:70}}>
                  <TouchableOpacity style={styles.viewOrder}  onPress={() => {
                        if(selectedItem && selectedItem.indexOf(item.value) !== -1 ){   
                          const sel_index = selectedItem.findIndex(obj => obj === item.value);                            
                          var tempSelItem = selectedItem;
                          tempSelItem.splice(sel_index,1);                   
                          selectItem([...tempSelItem]);                               
                       } else {
                        if(selectedItem.length < maxnum){
                          selectItem((existing)=> [...existing,item.value]);
                        }
                       }
                      }}>
                    <AppText style={{flex: 3, fontSize:15, width:'100%', paddingLeft:10, marginBottom: 2}} >{item.label}</AppText>  
                    <View style={{width: 40,alignItems:'center', height:50, paddingVertical:0}}>
                      <CheckBox
                         checked={selectedItem.indexOf(item.value) !== -1 ? true : false}
                         onPress={() => {
                          if(selectedItem && selectedItem.indexOf(item.value) !== -1 ){   
                            const sel_index = selectedItem.findIndex(obj => obj === item.value);                            
                            var tempSelItem = selectedItem;
                            tempSelItem.splice(sel_index,1);                   
                            selectItem([...tempSelItem]);                               
                         } else {
                          if(selectedItem.length < maxnum){
                            selectItem((existing)=> [...existing,item.value]);
                          }
                         }
                        }}
                         checkedColor={Theme.color.accentColor}
                          style={styles.radioBackground}
                      />   
                    </View>                                
                  </TouchableOpacity>                 
                 </View>
                )
              );
            }}
          />
        ) : (
          <AppText style={styles.textStyle}>{noOptionsText}</AppText>
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

  header: {
    marginTop: 5,
    marginBottom:10,
    fontSize: 16,
    textAlign: 'center',
  },

  list: {
    marginBottom:100,
  },

  radioBackground: {
    backgroundColor: Theme.color.container,
    borderWidth: 0,
    marginRight: 10,
    alignItems:'center',
    height:10
  },

  textStyle: {
    fontSize: 16,
    textAlign: 'center',
  },

  myCartButton: {
    marginHorizontal: 20,    
    marginVertical: 15,  
    position:'absolute',
    bottom:0,
    display: 'flex',
    right:0,
    left:0,
  },

  viewOrder: {
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#efefef',
    marginTop:10, 
    paddingHorizontal:15,
    minHeight: 60,
    paddingVertical:10    
  },

  countAdd: {
    width: 22,
    height: 23,
    alignItems:'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor:'white',
    borderColor: '#282828',
    borderWidth: 0.2
  }
});

SelectorPageChooseMultipleScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title'),
    },
  });
