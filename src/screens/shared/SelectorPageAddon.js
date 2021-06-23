import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';

import { NavigationService } from '~/core/services';
import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { select } from 'redux-saga/effects';

export const SelectorPageAddonScreen = ({ navigation }) => {
  const header = useMemo(() => navigation.getParam('header'), []);
  const options = useMemo(() => navigation.getParam('options'), []);
  const action = useMemo(() => navigation.getParam('action'), []);
  const noOptionsText = useMemo(() => navigation.getParam('noOptionsText'));
  const selected = useMemo(() => navigation.getParam('selected'), [navigation]);
  const [selectedItem,selectItem] = useState('');
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
                  <Button
                    type={
                      selectedItem
                        ? selectedItem.filter((original) => original === item.value).length > 0
                          ? 'selected-green'
                          : 'bordered-black'
                        : 'bordered-black'
                    }
                    style={GlobalStyles.formControl}
                    onClick={() => {          
                      if(selectedItem){
                        if(selectedItem.filter((original) => original === item.value).length > 0 )
                        {
                          selectItem(selectedItem.filter((original) => original != item.value))
                          
                        } else {
                          selectItem((existing)=> [...existing,item.value]);
                        }
                      } else {
                        selectItem([item.value]);
                      }
                    }}>
                    {item.label}
                  </Button> : 
                  <View style={{marginBottom:70}}>
                   <Button
                   type={
                     selectedItem
                       ? selectedItem.filter((original) => original === item.value).length > 0
                         ? 'selected-green'
                         : 'bordered-black'
                       : 'bordered-black'
                   }
                   style={GlobalStyles.formControl}
                   onClick={() => {          
                     if(selectedItem){
                       if(selectedItem.filter((original) => original === item.value).length > 0 )
                       {
                         selectItem(selectedItem.filter((original) => original != item.value))
                         
                       } else {
                         selectItem((existing)=> [...existing,item.value]);
                       }
                     } else {
                       selectItem([item.value]);
                     }
                   }}>
                   {item.label}
                 </Button></View>
                )
              );
            }}
          />
        ) : (
          <Text style={styles.textStyle}>{noOptionsText}</Text>
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
    marginVertical: 15,  
    position:'absolute',
    bottom:0,
    display: 'flex',
    right:0,
    left:0,
  },

});

SelectorPageAddonScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title'),
    },
  });
