import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { Picker, DatePicker } from 'react-native-wheel-pick';

import { NavigationService } from '~/core/services';
import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { select } from 'redux-saga/effects';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SelectorPageAddonScreen = ({ navigation }) => {
  const header = useMemo(() => navigation.getParam('header'), []);
  const options = useMemo(() => navigation.getParam('options'), []);
  const action = useMemo(() => navigation.getParam('action'), []);
  const maxnum = useMemo(() => navigation.getParam('maxnum'), []);
  const noOptionsText = useMemo(() => navigation.getParam('noOptionsText'));
  const selectedOptions = useMemo(() => navigation.getParam('selectedOptions'),[]);
  const [selectedItem, selectItem] = useState(selectedOptions);
  const [workingItem, setWorkingItem] = useState('');
  const [workingItemName, setWorkingItemName] = useState('');
  const [selectedCount, setSelectedCount] = useState('1');
  const [pickerData4OptionsCnt, setPickerData4OptionsCnt] = useState(["1"]);
  const [whichSticky, setWhichSticky] = useState(1);

  const addselectedItem = useCallback((value)=> {
    if(selectedItem) {
      action(selectedItem);
      NavigationService.goBack();
    }
    //NavigationService.goBack();
  },[selectedItem]);


  const addItemsAsCount = useCallback((workingItem)=> {
    setWhichSticky(1);
    if(selectedItem) {
      selectItem(selectedItem.filter((original) => original != workingItem));      
    }  
    for  (let i = 0; i < selectedCount; i++) {
      selectItem((existing)=> [...existing,workingItem]);
    }  
  },[selectedCount, selectedItem]);

  useEffect(()=>{
    console.log("seeeeeeeeeeeeeeeeeee", selectedItem);    
  },[selectedItem])
  
  const ChooseCountButton = () => {
    return ( <View>
      <View style={{marginHorizontal: 20, marginBottom: 15, flexDirection:'row'}}>
        <TouchableOpacity onPress={() => setWhichSticky(1)}><Icon size={20} color="#484848" name='close'></Icon></TouchableOpacity>
        <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
          <AppText style={{fontSize:18, fontWeight: 'bold'}}>{workingItemName}</AppText>
        </View>
      </View>
      <Picker
        style={{ backgroundColor: 'white', width: '100%', height: 150, marginBottom:70 }}
        itemStyle={{backgroundColor:'#EEE'}}
        selectedValue={selectedCount}
        pickerData={pickerData4OptionsCnt}
        onValueChange={value => {setSelectedCount(value)}}
        itemSpace={30} // this only support in android
      />
      <Button
          type="accent"
          style={styles.myCartButton}
          onClick={() => addItemsAsCount(workingItem)}>
          Select
        </Button>
      </View>)
  };

  const AddItemButton = () => {
    return (selectedItem && selectedItem.length > 0 ? (
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
    <Screen hasList stickyBottom={whichSticky == 0 ? <ChooseCountButton/> : <AddItemButton/>}>
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
                  <View style={styles.viewOrder}>
                    <AppText style={{flex: 1, fontSize:15, width:'100%', paddingLeft:10, marginBottom: 2}} >{item.label}</AppText>
                    <View style={{width: 50, flexDirection:'row', marginRight: 20}}>                    
                      <View style={{width: 40, alignItems:'center'}}><AppText style={{ fontSize:15,fontWeight:'bold',}}>{selectedItem ? selectedItem.filter((original) => original === item.value).length : 0}</AppText></View>
                      <TouchableOpacity style={styles.countAdd} onPress={() => {
                        setWhichSticky(0);
                        setWorkingItem(item.value);
                        setWorkingItemName(item.label);
                        if(selectedItem){
                          var items = [];
                          for (let i = 0; i <= maxnum - selectedItem.filter((original) => original != item.value).length; i++) {
                            items.push(i.toString());
                          }
                          console.log(items);
                          setPickerData4OptionsCnt(items);
                          setSelectedCount(selectedItem.filter((original) => original == item.value).length);
                        } else {
                          var items = [];
                          for (let i = 0; i <= maxnum; i++) {
                            items.push(i.toString());
                          }
                          console.log(items);
                          setPickerData4OptionsCnt(items);                          
                        }
                      }}>
                        <Icon size={22} color="#484848" name='chevron-down'></Icon>
                      </TouchableOpacity>
                    </View>                   
                  </View>
                  : 
                  <View style={{marginBottom:70}}>
                  <View style={styles.viewOrder}>
                    <AppText style={{flex: 1, fontSize:15, width:'100%', paddingLeft:10, marginBottom: 2}} >{item.label}</AppText>
                    <View style={{width: 50, flexDirection:'row', marginRight: 20}}>                 
                      <View style={{width: 40, alignItems:'center'}}><AppText style={{ fontSize:15,fontWeight:'bold',}}>{selectedItem ? selectedItem.filter((original) => original === item.value).length : 0}</AppText></View>
                      <TouchableOpacity style={styles.countAdd}  onPress={() => {
                         setWhichSticky(0);
                         setWorkingItem(item.value);
                         setWorkingItemName(item.label);
                         if(selectedItem){
                           var items = [];
                           for (let i = 0; i <= maxnum - selectedItem.filter((original) => original != item.value).length; i++) {
                             items.push(i.toString());
                           }
                           console.log(items);
                           setPickerData4OptionsCnt(items);
                           setSelectedCount(selectedItem.filter((original) => original == item.value).length);
                         } else {
                           var items = [];
                           for (let i = 0; i <= maxnum; i++) {
                             items.push(i.toString());
                           }
                           console.log(items);
                           setPickerData4OptionsCnt(items);                          
                         }                      
                      }}>
                        <Icon size={20} color="#484848" name='chevron-down'></Icon>
                      </TouchableOpacity>
                    </View>                    
                  </View>                 
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

  textStyle: {
    fontSize: 16,
    textAlign: 'center',
  },

  myCartButton: {
    marginHorizontal: 20,    
    marginVertical: 10,  
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

SelectorPageAddonScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title'),
    },
  });
