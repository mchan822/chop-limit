import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppText } from '~/components';
import { Theme, Controls } from '~/styles';
import CheckedSVG from '~/assets/images/checked-solid.svg';
// Available Types:
// accent
// bordered-light
// bordered-dark
// borderless
export const Button = ({
  type,
  children,
  onClick,
  icon = null,
  iconColor = null,
  rightText = null,
  style = {},
  titleStyle = {},
  fullWidth = false,
  disabled,
  ...props
}) => {
  const wrapperStyle = useMemo(() => {
    switch (type) {
      case 'accentGreen':
        return styles.accentGreen;
      case 'accent':
        return styles.accent;
      case 'bordered-light':
      case 'bordered-dark':
        return styles.bordered;
      case 'borderless':
        return styles.borderless;
      case 'borderlessred':
        return styles.borderless;
      case 'white':
        return styles.white;
      case 'black':
        return styles.black;
      case 'bordered-black':
        return styles.borderedBlack;
      case 'bordered-grey':
        return styles.borderedGrey;
      case 'selected-green':
        return styles.selectedGreen;
      default:
        return null;
    }
  }, [type]);

  const textStyle = useMemo(() => {
    switch (type) {
      case 'accent':
      case 'bordered-light':
        return styles.whiteText;
      case 'bordered-dark':
      case 'bordered-black':
        return styles.blackText;
      case 'borderless':
        return styles.greyText;
      case 'borderlessred':
          return styles.redText;
      case 'white':
        return styles.blackText;
      case 'black':
        return styles.whiteText;
      case 'bordered-grey':
        return styles.greyText;
      case 'selected-green':
        return styles.blackText;
     case 'accentGreen':
        return styles.whiteText;
      default:
        return null;
    }
  }, [type]);

  const disabledStyle = useMemo(() => {
    switch (type) {
      case 'black':
        return styles.disabledGrey;
      default:
        return null;
    }
  }, [type]);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        wrapperStyle,
        style,
        fullWidth ? styles.fullWidth : null,
        disabled ? disabledStyle : null,
      ]}
      disabled={disabled}
      onPress={onClick}>
      {icon && (
        <View style={styles.icon}>
          <Icon
            size={Controls.button.iconSize}
            name={icon}
            color={iconColor ? iconColor : 'white'}
          />
        </View>
      )}
      {type == 'selected-green' && (<View style={styles.icon}>
          <CheckedSVG  height={25} width={25}></CheckedSVG>
        </View>)}
      <AppText style={[styles.text, textStyle, titleStyle]}>{children}</AppText>
      {rightText ? (
        <View style={styles.right}>
          <AppText style={[styles.text, textStyle, titleStyle]}>
            {rightText}
          </AppText>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderStyle: 'solid',
    height: Controls.button.height,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  alignCenter: {
    justifyContent: 'center',
  },

  alignLeft: {
    justifyContent: 'flex-start',
  },

  alignSpaceBetween: {
    justifyContent: 'space-between',
  },

  icon: {
    position: 'absolute',
    left: 10,
    top: 12,
  },

  accent: {
    borderColor: Theme.color.accentColor,
    backgroundColor: Theme.color.accentColor,
  },

  accentGreen: {
    borderColor: Theme.color.accentGreenColor,
    backgroundColor: Theme.color.accentGreenColor,
  },

  bordered: {
    borderColor: Theme.color.borderColor,
    backgroundColor: 'transparent',
  },

  borderless: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    opacity: 0.8,
  },

  white: {
    backgroundColor: 'white',
  },

  black: {
    backgroundColor: 'black',
  },

  text: {
    fontWeight: 'bold',
    fontSize: Controls.button.fontSize,
  },

  whiteText: {
    color: 'white',
  },

  redText: {
    color: '#ec1a25'
  },

  greyText: {
    color: '#ccc',
  },

  blackText: {
    color: 'black',
  },

  borderedBlack: {
    borderColor: 'black',
  },

  borderedGrey: {
    borderColor: '#ccc',
  },

  selectedGreen: {
    borderColor: 'black',
    backgroundColor: "#00dd0044",
  },

  fullWidth: {
    width: '100%',
  },

  disabledGrey: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },

  right: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
});
