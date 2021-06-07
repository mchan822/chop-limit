import React, {useCallback} from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import Share from 'react-native-share';
import { useSelector, useDispatch } from 'react-redux';
import { Config } from '~/core/config';
import { NavigationService } from '~/core/services';
import { Screen, Button, AppText } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';
import { showNotification,signOut } from '~/store/actions';

export const MoreScreen = ({navigation}) => {

  const dispatch = useDispatch();

  const userInfo = useSelector(
    (state) => state.account && state.account.userInfo,
  );

  const openMenu = useCallback(() => {
    if (userInfo) {
      navigation.navigate('Account/MyAccount');
    } else {
      navigation.navigate('GetAccess');
    }
  }, [userInfo]);

  return (
    <Screen>
      <View style={styles.container}>
        <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => NavigationService.navigate('PastOrders')}>
          My Past Orders
        </Button>
        <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => NavigationService.navigate('Account/Profile')}>
          My User Profile
        </Button>
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={() => NavigationService.navigate(/*'Account/CreditCard'*/'CreditCardList')}>
          My Credit Cards
        </Button>
        <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => NavigationService.navigate('ContactUs')}>
          Contact Chow Local®
        </Button>
        <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => NavigationService.navigate('Invite')}>
          Invite A Restaurant
        </Button>
        <Button
          type="bordered-dark"
          style={GlobalStyles.formControl}
          onClick={() => {
            NavigationService.navigate('GetAccess');
            dispatch(signOut());
          }}>
          Sign Out
        </Button>
        {/* <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => openMenu()}>
          My Account
        </Button> */}

        {/* <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => {
            Share.open({
              title: 'Share Chow Local',
              url: Config.shareURL,
            });
          }}>
          Share
        </Button>

        <Button
          type="bordered-dark"
          style={[GlobalStyles.formControl]}
          onClick={() => NavigationService.navigate('StartSelling')}>
          Start Selling
        </Button>

       */}

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
});

MoreScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'MY ACCOUNT',
    },
  });
