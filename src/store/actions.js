// Notification Actions

export const showNotification = ({ type, title, message, options, autoHide, buttonText, buttonAction }) => ({
  type: 'SHOW_NOTIFICATION',
  payload: {
    type: type || null,
    title: title || null,
    message: message || null,
    options: options || {},
    autoHide : typeof autoHide != 'undefined' ? autoHide : (type && (["success","error"].indexOf(type) > -1) ? false : true),
    buttonText : typeof buttonText != 'undefined' ? buttonText : false,
    buttonAction : typeof buttonAction != 'undefined' ? buttonAction : false,
  },
});

export const clearNotification = () => ({
  type: 'CLEAR_NOTIFICATION',
});

export const updatedInstructions = (instructions) => ({
  type: 'UPDATED_INSTRUCTIONS',
  payload: {
    instructions: instructions
  }
});
export const changedAddress = (addressChanged) => ({
  type: 'CHANGED_ADDRESS',
  payload: {
    addressChanged: addressChanged
  }
});

export const updatedNotes = (notes) => ({
  type: 'UPDATED_ORDERNOTE',
  payload: {
    notes: notes
  }
})

export const updatePromoCode = (promocode) => ({
  type: 'UPDATED_PROMOCODE',
  payload: {
    promocode: promocode
  }
})

export const subscriptionAddressUpdated = (subscriptionAddressUpdated) => ({
  type: 'UPDATED_SUBSCRIPTIONADDRESS',
  payload: {
    subscriptionAddressUpdated: subscriptionAddressUpdated
  }
})
export const subscriptionCancelled = (subscriptionCancelledUpdated) => ({
  type: 'UPDATED_SUBSCRIPTIONCANCELLED',
  payload: {
    subscriptionCancelledUpdated: subscriptionCancelledUpdated
  }
})

export const setAddedReview = (review) => ({
  type: 'UPDATED_REVIEW',
  payload: {
    review: review
  }
});

export const setDescriptionUpdatedGuest = (resetMode) => ({
  type: 'UPDATED_DESCRIPTIONGUEST',
  payload: {
    descriptionGuest: resetMode
  }
});

export const enterMessageRoom = (entered) => ({
  type: 'ENTER_MESSAGEROOM',
  payload: {
    enterMessageRoom: entered
  }
});
// Account

export const setPhone = (phone) => ({
  type: 'SET_PHONE',
  payload: {
    phone,
  },
});

export const setToken = (token) => ({
  type: 'SET_TOKEN',
  payload: {
    token,
  },
});
export const setBanner = (banner_url) => ({
  type: 'SET_BANNER',
  payload: {
    banner_url,
  },
});

export const setGuestToken = (token) => ({
  type: 'SET_GUEST_TOKEN',
  payload: {
    token,
  },
});

export const setUserInfo = (userInfo) => ({
  type: 'SET_USERINFO',
  payload: {
    userInfo,
  },
});

export const signOut = () => ({
  type: 'SIGN_OUT',
});

// Order
export const setOrder = (order) => ({
  type: 'SET_ORDER',
  payload: {
    order,
  },
});

export const clearOrder = () => ({
  type: 'CLEAR_ORDER',
});

export const cancelOrder = () => ({
  type: 'CANCEL_ORDER',
});

export const setOrderProduct = (orderProduct) => ({
  type: 'SET_ORDERPRODUCT',
  payload: {
    orderProduct,
  },
});

// Exploring
export const setAddress = (address) => ({
  type: 'SET_ADDRESS',
  payload: {
    address,
  },
});

export const updateCard = (isUpdateCard) => ({
  type: 'UPDATE_CARD',
  payload: {
    isUpdateCard,
  },
});
export const setUnreadMessages = (unread) => ({
  type: 'SET_UNREAD',
  payload: {
    unread,
  },
});




export const setAddressFull = (addressFull) => ({
  type: 'SET_ADDRESS_FULL',
  payload: {
    addressFull,
  },
});

export const setTerritory = (territory) => ({
  type: 'SET_TERRITORY',
  payload: {
    territory,
  },
});

export const setTerritoryType = (territory_type) => ({
  type: 'SET_TERRITORY_TYPE',
  payload: {
    territory_type,
  },
});
