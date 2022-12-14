import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Screen, Input, Button,StickyBottom } from '~/components';
import { GlobalStyles, MainNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification } from '~/store/actions';

import { NavigationService } from '~/core/services';
export const ContactUsScreen = ({ navigation }) => {
  const [isLoading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const token = useSelector((state) => state.account.token);
  const userInfo = useSelector((state) => state.account.userInfo);
  
  const [fromFirstName, setFromFirstName] = useState(userInfo && userInfo.firstName || '');
  const [fromLastName, setFromLastName] = useState(userInfo && userInfo.lastName || '');
  const [fromEmail, setFromEmail] = useState(userInfo && userInfo.email || '');

  const dispatch = useDispatch();

  console.log("user Info", userInfo);
  const send = useCallback(() => {
    setLoading(true);

    const formData = new FormData();
    
    if(!subject){
      dispatch(showNotification({ type: 'error', message: 'Please enter subject' }))
      setLoading(false);
      return
    }

    if(!message){
      dispatch(showNotification({ type: 'error', message: 'Please enter Message' }))
      setLoading(false);
      return
    }
    if(token){
      formData.append('subject', subject);
      formData.append('message', message);
      if(fromFirstName)
      formData.append('first_name', fromFirstName);
      if(fromLastName)
      formData.append('last_name', fromLastName);
      if(fromEmail)
      formData.append('email', fromEmail);
      fetchAPI(`/platform/email`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((res) => {
          console.log("here+++++++++++++++++++++");
          dispatch(showNotification({ type: 'success', message: "Successfully Sent" }));
          NavigationService.goBack();
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
      } else {
        dispatch(showNotification({ type: 'error', message: 'Please sign in' }));
        NavigationService.navigate("GetAccess");
      }
  }, [subject, message]);

  useEffect(() => {
    navigation.setParams({
      action: send,
      actionTitle: 'Send',
      actionColor: 'black',
    });
  }, [send]);

  return (
    <Screen isLoading={isLoading} keyboardAware={true} stickyBottom={<StickyBottom/>}>
      <View style={styles.container}>
      <Input
        style={GlobalStyles.formControl}
        title="First Name"
        placeholder="Your First Name"
        value={fromFirstName}
        onChange={setFromFirstName}
        />

      <Input
        style={GlobalStyles.formControl}
        title="Last Name"
        placeholder="Your Last Name"
        value={fromLastName}
        onChange={setFromLastName}
        />

      <Input
        style={GlobalStyles.formControl}
        title="Your E-mail"
        placeholder="Your E-mail Address"
        value={fromEmail}
        onChange={setFromEmail}
        />
        
        <Input
          style={GlobalStyles.formControl}
          title="Subject"
          placeholder="Subject"
          value={subject}
          onChange={setSubject}
        />

        <Input
          style={GlobalStyles.formControl}
          type="textarea"
          title="Message"
          placeholder="Type your message here ..."
          value={message}
          onChange={setMessage}
        />

        <Button 
        type="accent" 
        style={styles.button}
        onClick={send}>
          Send</Button>
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

  description: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },

  button : {
    marginTop : 10
  }
});

ContactUsScreen.navigationOptions = ({ navigation }) =>
  MainNavigationOptions({
    navigation,
    options: {
      headerTitle: 'Contact',
    },
  });
