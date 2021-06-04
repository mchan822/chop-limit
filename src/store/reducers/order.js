const InitialState = {
  order: null,
  territory: null,
  territory_type: null, 
  orderProduct: null,
};

const reducer = (state = InitialState, action) => {
  switch (action.type) {
    case 'SET_ORDER':
      return {
        ...state,
        order: {
          ...state.order,
          ...action.payload.order,
          cancelled: 0,  
        },
        
         
      };

    case 'SET_TERRITORY':
      return {
        ...state,
        territory: action.payload.territory,
      };

    case 'SET_TERRITORY_TYPE':
      return {
        ...state,
        territory_type: action.payload.territory_type,
      };

    case 'CANCEL_ORDER':
      return {
        ...state,
        order: {
          ...state.order,
          cart_amount: '0.00',
          cart_quantity: 0,
          cart_tax_amount: 0,
          cart_tax_amount_with_delivery: '0.00',
          cart_tax_amount_without_delivery: '0.00',
          cart_total_amount: 0,
          cart_total_amount_with_delivery: '0.00',
          cart_total_amount_without_delivery: '0.00',
          delivery_amount: 0,
          delivery_time: 'unknown',
          delivery_time_value: '',
          delivery_type: 'deliver',
          delivery_type_updated_to_pickup: false,
          products: [],
          cancelled: 1,
        },
        
      };

    case 'CLEAR_ORDER':
    case 'SIGN_OUT':
      return {
        ...state,
        order: null,
      };
    case 'SET_ORDERPRODUCT':
      return {
        ...state,
        orderProduct: action.payload.orderProduct,
      };
  }

  return state;
};

export default reducer;
