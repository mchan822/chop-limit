import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions, Animated, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';

import { Screen, Input, Button, MessageItem } from '~/components';
import { GlobalStyles, MessageRoomNavigationOptions, Theme } from '~/styles';

import { fetchAPI } from '~/core/utility';
import { showNotification, clearNotification, setUserInfo, setPhone, setToken, enterMessageRoom } from '~/store/actions';
import { NavigationService } from '~/core/services';
import { DashedLine, AppText} from '../../components';
import { Constants } from '~/core/constant';

import { Easing } from 'react-native-reanimated';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
export const MessageRoomScreen = ({ navigation }) => {
  // const territory = useSelector((state) => state.explorer.territory);
  const territory = useMemo(() => navigation.getParam('territory'), []);
  const userinfo =  useSelector((state) => state.account.userInfo);
  const [userImage, setUserImage] = useState(Constants.userDefaultAvatar);
  const [territoryImage, setTerritoryImage] = useState('');
  const [lastMessageID, setLastMessageID] = useState('');
  const [messagePage, setMessagePage] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [isPrev, setIsPrev] = useState(false);
  const [is_started, setIsStart] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const [disableSendBtn, setDisableSendBtn] = useState(false);
  const scrollRef = useRef();
  const [isLoading, setLoading] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const messageItem = useMemo(() => navigation.getParam('item'), []);
  const [img, setImg] = useState(null);
  const token = useSelector((state) => state.account.token);
  const guestToken = useSelector((state) => state.account.guestToken);
  const bottomMargin = Platform.OS === 'ios' ? 30 : 0;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 200,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const profile = useCallback(() => {
    NavigationService.navigate('Products');
  }, []);


  const uploadProfilePic = async (image_src) => {
    if (image_src != null) {
      //If file selected then create FormData
      const fileToUpload = image_src;
      let data = new FormData();
      const file =  {
        uri : fileToUpload.path,    
        name: 'avatar.jpg',
        type :   fileToUpload.mime
      }
      data.append('avatar', file);
      setLoading(true);
      fetchAPI('/myaccount/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; ',
          authorization: `Bearer ${token ? token : guestToken}`,
        },
        body : data     
      }) 
      .then(async (res) => {
        setLoading(false);
        if (res.success == 1) {
          setUserImage(res.data.avatar_url);
          dispatch(showNotification({type: 'success', message: 'Profile photo successfully uploaded'}))
        }
      })
      .catch((err) =>{
        console.log(err);
        setLoading(false);
        dispatch(showNotification({ type: 'error', message: err.message }))
      }
      )
      .finally(() => setLoading(false));     
    } else {
      //if no file selected the show alert
      dispatch(showNotification({ type: 'error', message: 'Please Select File first' }));
    }
    console.log("loadProfilePic");
  }

  const launchImageLibrary = () => {
    setModalVisible(false);
    ImagePicker.openPicker({}).then(image => {
      console.log(image);
      uploadProfilePic(image);
    });
  }

  const launchCamera = () => {
    setModalVisible(false);
    ImagePicker.openCamera({
      cropping: true
    }).then(image => {
      console.log(image);
      uploadProfilePic(image);
    });

  }

  const getMoreMessages = () => {
    setLoadingMessage(true);
    setLoading(true);
    console.log("+++getMoreMessage+++");
    setMessagePage(messagePage + 1);
    fetchAPI(`/messages?${messageItem.is_delivery_chat == true ? 'delivery_id='+messageItem.delivery_id : 'territory='+territory.tid}&size=10&page=${messagePage + 1}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then((res) => {
        console.log("+++messages+++",res.data);
        setLoading(false);
        setLoadingMessage(false);
        setMessageList(res.data.messages.reverse().concat(messageList));
        setIsPrev(res.data.has_next_page);
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    dispatch(enterMessageRoom(true));
    setLoading(true);
    fetchAPI(`/messages?${messageItem.is_delivery_chat == true ? 'delivery_id='+messageItem.delivery_id : 'territory='+territory.tid}&size=10&page=0`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token ? token : guestToken}`,
      },
    })
      .then((res) => {
        console.log("+++messa!!!!!!!@@@@@@@@@@@@@@@@@@@@@@@@@@@@",res.data);
        setLastMessageID(res.data.last_message_id);
        setMessageList(res.data.messages.reverse());
        if(res.data.user_image){
          setUserImage(res.data.user_image);
          console.log("+++userimage+aaaaaaaaaaa++",userImage);
        }
          setTerritoryImage(res.data.territory_image);
          setIsPrev(res.data.has_next_page);        
          setIsStart(res.data.is_started);
          if( scrollRef.current != undefined){
            setTimeout(()=>{setLoading(false); scrollRef.current.scrollToEnd({animated: true})}, 100);
          }
      })
      .catch((err) =>
        dispatch(showNotification({ type: 'error', message: err.message })),
      )
      .finally(() => setLoading(false));
  },[]);
  const updateNewMessage = useCallback(() => {
    console.log("lastMessagse ID ",lastMessageID);
    if(lastMessageID > 0){
      fetchAPI(`/messages/last_activity?${messageItem.is_delivery_chat == true ? 'delivery_id='+messageItem.delivery_id : 'territory='+territory.tid}&user=${userinfo.uuid}&last_message_id=${lastMessageID}`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          console.log("messages update",res.data);       
          if(res.data.messages.length > 0){
            setMessageList((existing) => [...existing, ...res.data.messages.reverse()]);        
            setLastMessageID(res.data.last_message_id);
            if(scrollRef.current != undefined){
              setTimeout(()=>{setLoading(false); scrollRef.current.scrollToEnd({animated: true})}, 100);
            }
          }
         
          
        })
        .catch((err) =>
          dispatch(showNotification({ type: 'error', message: err.message })),
        )
        .finally(() => setLoading(false));
    }
  },[lastMessageID]);
  useEffect(() => {
    const interval = setInterval(() => {
      updateNewMessage();
    }, 5000 );
    return () => clearInterval(interval);
  });
  useEffect(() => {
    if(modalVisible == true)
    {
      dispatch(
        showNotification({
          type: 'fullScreen',
          autoHide: false,
          options: { align: 'right' },
          message: (
            <>                    
            <Button
              type="bordered-light"
              style={{ marginBottom: 10, marginTop: 20 }}
              fullWidth
              onClick={() => {
                dispatch(clearNotification());
                launchImageLibrary();
              }}>
              Select A Photo
            </Button>
            <Button
              type="bordered-light"
              fullWidth
              style={{ marginBottom: 10,}}
              onClick={() => {
                launchCamera();
                dispatch(clearNotification());
              }}>
             Take A Photo
            </Button> 
            <Button
              type="bordered-light"
              fullWidth
              onClick={() => {
                setModalVisible(false)
                dispatch(clearNotification());
              }}>
              Cancel
            </Button> 
            </>
          ),
        }),
      )
    } else {
      dispatch(clearNotification());
    }
  },[modalVisible])
  useEffect(() => {
    navigation.setParams({
      /*
      action: profile,
      actionTitle: 'Profile',
      actionColor: 'white',
      actionBackground: '#31D457',
      */

      territoryTitle: messageItem.is_delivery_chat == true ? messageItem.driver_name : territory.name,
      territoryImage: messageItem.is_delivery_chat == true ? messageItem.driver_image : territory.app_image,
      territoryAddress: territory.warehouse_address_city + " " + territory.warehouse_address_province
    });

  }, [profile]);

  return (
   
    <Screen isLoading={isLoading}  keyboardAware={true} messageInputKeyboardAware={true}
    stickyBottom = { 
        modalVisible == false && 
       (
        <View style={{flexDirection: "row", backgroundColor: "#EFEFEF"}}>
          <Input
            type="textarea"
            placeholder="Type message here"
            value={newMessage}
            onChange={setNewMessage}
            style={styles.footer}
          />
          <TouchableOpacity
            disabled={disableSendBtn}
            style={Platform.OS === 'ios' ? { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop:-10} : { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 0} }
            onPress={() => {
              if(!newMessage) {
                return;
              }
              setDisableSendBtn(true);
              console.log("+++newMessage+++",newMessage);

              setLoading(true);
              const formData = new FormData();
              if(messageItem.is_delivery_chat == true)
              {
                formData.append('delivery_id',messageItem.delivery_id);
              } else {
                formData.append('territory',territory.tid);
              }                
              formData.append('user', userinfo.uuid);
              formData.append('message', newMessage);
              if(userinfo)
              formData.append('first_name', userinfo.firstName);
              if(userinfo)
              formData.append('last_name', userinfo.lastName);
              if(userinfo)
              formData.append('email', userinfo.email);

              // fetchAPI(`/territory/contact`, {
              
              fetchAPI(`/message/create`, {
                  method: 'POST',
                  headers: {
                    authorization: `Bearer ${token ? token : guestToken}`,
                  },
                  body: formData,
                })     
                .then((res) => {
                  setNewMessage('');
                  const msg = [{"by": "user", "date_created": res.data.message_date, "date_opened": "","is_new": false, "message": res.data.message, "mid" : res.data.message_id, "opened": false, "tid": territory.tid}];
                  setMessageList(messageList.concat(msg));
                  if( scrollRef.current != undefined){
                    setTimeout(()=>{ scrollRef.current.scrollToEnd({animated: true})}, 500);
                    setDisableSendBtn(false);
                  }
                  console.log("created response+++",res.data);
                  dispatch(enterMessageRoom(newMessage));                  
                })
                .catch((err) =>
                  dispatch(showNotification({ type: 'error', message: err.message }))
                )
                .finally(() => setLoading(false));
            }}>
            <Icon size={25} color={'#000'} name="send" style={{ transform: [{ rotate: '-30deg'}]}} />
          </TouchableOpacity>
        </View>
      )}
    >
      <View>
        {messageList && messageList.length > 0 && (
            <ScrollView
              ref={scrollRef}
              style={{maxHeight: (userinfo.user_active == false || userImage == Constants.userDefaultAvatar || userImage == '' ) ? (windowHeight - Theme.header.height - 200 + bottomMargin) : (windowHeight - Theme.header.height - 100 + bottomMargin)}}
              onScroll={(event)=>{
                console.log("++onscroll++",event.nativeEvent.contentOffset.y);
                if(event.nativeEvent.contentOffset.y == 0 && !loadingMessage && isPrev) {
                  getMoreMessages();
                }
              }}
            >
            {
              messageList.map((item, index)=> (
                <MessageItem
                  key= {index}
                  by={item.by}
                  message={item.message}
                  created={item.date_created}
                  is_new={item.is_new}
                  opened={item.opened}
                  user_image={userImage}
                  territory_image={messageItem.is_delivery_chat == true ? messageItem.driver_image : territoryImage}
                  onAvatar = {()=>{ setModalVisible(true); fadeIn(); }}
                />
              ))
            }
            </ScrollView>
        )}
       {
          //messageList.find( ({ is_new }) => is_new == false ) && (
          messageList.length > 0 && (userinfo.user_active == false || userImage == Constants.userDefaultAvatar || userImage == '' ) && (
        <View style={styles.container}>
            <DashedLine/>
            <AppText style={{padding: 10, fontWeight: String(400)}}>While you are waiting for a reply</AppText>
            <View style={{flexDirection: 'row', paddingBottom: 10}}>
            {console.log("her!!!!!!!!!!!!!!!!!!!!",userImage),(userImage == Constants.userDefaultAvatar || userImage == '') && (
            <TouchableOpacity
              style={{ flex: 1, marginLeft: 10 ,alignItems: 'flex-start', justifyContent: 'center' }}
              onPress={() => {
                setModalVisible(true);
                fadeIn();
              }}>
            <View style={{backgroundColor: "#bbb", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10}}><AppText style={{color: "#fff",fontSize:12}}>ADD PROFILE PIC</AppText></View>
            </TouchableOpacity>)
            }
            {userinfo.user_active == false &&
            <TouchableOpacity
            style={{ flex: 1, marginLeft:10 , alignItems: 'flex-start', justifyContent: 'center' }}
            onPress={() => {
              NavigationService.navigate('Account/Profile',{message: true});
            }}>
            <View style={{backgroundColor: "#bbb", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10}}><AppText style={{color: "#fff",fontSize:12}}>SET UP A PASSWORD</AppText></View>
          </TouchableOpacity>}
            </View>
            <DashedLine/>
            
        </View>
        )
        }
      </View>
      {/* { modalVisible && <View style={styles.overlay} /> } */}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.layout.screenPaddingHorizontal
  },

  button : {
    marginTop : 10
  },

  footer : {
    width: '85%',
    backgroundColor: '#fff',
    height: 60,
    marginTop: 10,
    marginHorizontal: 5,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },

  buttonText: {
    color: "#06f",
    fontWeight: "bold"
  },

  fadingContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: 0.2,
  },
});

MessageRoomScreen.navigationOptions = ({ navigation }) =>
  MessageRoomNavigationOptions({
    navigation,
    options: {
      headerTitle: '',
    },
  });