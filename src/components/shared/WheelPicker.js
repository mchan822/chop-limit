import React from 'react';
import {View, Animated} from 'react-native';

const ITEM_HEIGHT = 40;
const INACTIVE_FONT_SIZE = 16;
const ACTIVE_FONT_SIZE = 22;
const INACTIVE_COLOR = '#777';
const ACTIVE_COLOR = '#333';

export default class WheelPicker extends React.Component {
  scroll = new Animated.Value(0);
  constructor(props) {
    super(props);
    this.scrollRef = null;
  }
  ScrollToInitialPosition = () => {
    const { defaultValue } = this.props;
    if (this.scrollRef) {
      this.scrollRef.scrollTo({y: ITEM_HEIGHT * (defaultValue ? defaultValue : 0), animated: false});
    }
  };

  onChangeScroll = ({nativeEvent}) => {
    const {onValueChange, valueArray} = this.props;
    const index = Math.round(nativeEvent.contentOffset.y / ITEM_HEIGHT);
    onValueChange(valueArray[index], index);
  };

  render() {
    const {valueArray, style = {}} = this.props;
    return (
      <Animated.ScrollView
        nestedScrollEnabled
        bounces={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={0}
        style={[{flex: 1}, style]}
        ref={(ref) => {
          this.scrollRef = ref;
        }}
        onLayout={this.ScrollToInitialPosition}
        snapToInterval={ITEM_HEIGHT}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: this.scroll}}}],
          {useNativeDriver: false},
        )}
        onMomentumScrollEnd={this.onChangeScroll}
        decelerationRate={0.8}>
        {valueArray &&
          valueArray.map((item, index) => {
            var color = this.scroll.interpolate({
              inputRange: [
                (index - 2) * ITEM_HEIGHT,
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
                (index + 2) * ITEM_HEIGHT,
              ],
              outputRange: [
                INACTIVE_COLOR,
                INACTIVE_COLOR,
                ACTIVE_COLOR,
                INACTIVE_COLOR,
                INACTIVE_COLOR,
              ],
              extrapolate: 'clamp',
            });
            var size = this.scroll.interpolate({
              inputRange: [
                (index - 2) * ITEM_HEIGHT,
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
                (index + 2) * ITEM_HEIGHT,
              ],
              outputRange: [
                INACTIVE_FONT_SIZE,
                INACTIVE_FONT_SIZE,
                ACTIVE_FONT_SIZE,
                INACTIVE_FONT_SIZE,
                INACTIVE_FONT_SIZE,
              ],
              extrapolate: 'clamp',
            });

            return (
              <View key={index}>
                <Animated.Text
                  style={[
                    {
                      fontSize: size,
                      color: color,
                      textAlign: 'center',
                      lineHeight: ITEM_HEIGHT,
                      height: ITEM_HEIGHT,
                      marginBottom:
                        index === valueArray.length - 1 ? ITEM_HEIGHT * 2 : 0,
                      marginTop: index === 0 ? ITEM_HEIGHT * 2 : 0,
                    },
                  ]}>
                  {item}
                </Animated.Text>
              </View>
            );
          })}
      </Animated.ScrollView>
    );
  }
}
