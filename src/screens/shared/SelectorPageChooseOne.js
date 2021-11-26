import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {CheckBox} from 'react-native-elements';
import { NavigationService } from '~/core/services';
import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

export const SelectorPageChooseOneScreen = ({ navigation }) => {
  const header = useMemo(() => navigation.getParam('header'), []);
  const options = useMemo(() => navigation.getParam('options'), []);
  const action = useMemo(() => navigation.getParam('action'), []);
  const noOptionsText = useMemo(() => navigation.getParam('noOptionsText'));
  const selected = useMemo(() => navigation.getParam('selected'), [navigation]);
  const [value, setValue] = useState('');
  const [selectedLabel, setSelectedName] = useState('');
  const AddItemButton = () => {
    return (selectedLabel != '' ? (
      <Button
        type="accentGreen"
        style={styles.myCartButton}
        onClick={() => NavigationService.goBack()}>
        Choose {`${selectedLabel}`}
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
                  <TouchableOpacity style={styles.viewOrder} onPress={() => {setValue(item.value),action(item.value);setSelectedName(item.label);}}>
                    <AppText style={{flex: 3, fontSize:15, width:'100%', paddingLeft:10}} >{item.label}</AppText>                                        
                      <View style={{width: 40, alignItems:'center'}}>
                        <CheckBox containerStyle={styles.radioBackground} title="" checkedColor={Theme.color.accentColor} checked={value==item.value ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setValue(item.value),action(item.value);setSelectedName(item.label);}}  uncheckedIcon='circle-o'/>
                      </View>                      
                  </TouchableOpacity>
                  : 
                  <View style={{marginBottom:70}}>
                  <TouchableOpacity style={styles.viewOrder} onPress={() => {setValue(item.value),action(item.value);setSelectedName(item.label);}}>
                    <AppText style={{flex: 3, fontSize:15, width:'100%', paddingLeft:10}} >{item.label}</AppText>                 
                      <View style={{width: 40, alignItems:'center'}}>
                        <CheckBox containerStyle={styles.radioBackground} title="" checkedColor={Theme.color.accentColor} checked={value==item.value ? true : false} checkedIcon='dot-circle-o'  onPress = {() => {setValue(item.value),action(item.value);setSelectedName(item.label);}}  uncheckedIcon='circle-o'/>
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

  radioBackground: {
    backgroundColor: Theme.color.container,
    borderWidth: 0,
    marginLeft: 0,
    paddingHorizontal:0
  },

  header: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  list:{
    marginBottom:20
  },  

  viewOrder: {
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#efefef',
    marginTop:10, 
    paddingHorizontal:15,
    height: 60
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

  textStyle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

SelectorPageChooseOneScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title'),
    },
  });
