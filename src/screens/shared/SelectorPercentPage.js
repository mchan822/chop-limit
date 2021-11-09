import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';

import { NavigationService } from '~/core/services';
import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

export const SelectorPercentPageScreen = ({ navigation }) => {
  const header = useMemo(() => navigation.getParam('header'), []);
  const options = useMemo(() => navigation.getParam('options'), []);
  const action = useMemo(() => navigation.getParam('action'), []);
  const noOptionsText = useMemo(() => navigation.getParam('noOptionsText'));
  const selected = useMemo(() => navigation.getParam('selected'), [navigation]);

  return (
    <Screen hasList>
      <View style={styles.container}>
        {header && <AppText style={styles.header}>{header}</AppText>}
        {options && options.length > 0 ? (
          <FlatList
            style={styles.list}
            alwaysBounceVertical={false}
            data={options}
            numColumns = {4}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              return (
                item && (
                  <Button 
                    type={
                       item.selected === 'selected'
                          ? 'accent'
                          : 'bordered-black'
                        
                    }
                    style={styles.elementButton}
                    onClick={() => {
                      action(item.value);
                      NavigationService.goBack();
                    }}>
                    {item.label}
                  </Button>
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

  elementButton :{
    width : '23%',
    marginVertical : 5,
    marginHorizontal: '1%'
  },

  header: {
    marginTop: 5,
    marginBottom : 20,
    fontSize: 16,
    textAlign: 'center',
  },

  list : {    
    display: 'flex',
  },

  textStyle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

SelectorPercentPageScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: navigation.getParam('title'),
    },
  });
