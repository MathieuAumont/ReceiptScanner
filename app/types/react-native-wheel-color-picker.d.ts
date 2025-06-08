declare module 'react-native-wheel-color-picker' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface ColorPickerProps {
    color?: string;
    swatchesOnly?: boolean;
    onColorChange?: (color: string) => void;
    onColorChangeComplete?: (color: string) => void;
    thumbSize?: number;
    sliderSize?: number;
    noSnap?: boolean;
    row?: boolean;
    swatchesLast?: boolean;
    swatches?: boolean;
    discrete?: boolean;
    discreteLength?: number;
    sliderHidden?: boolean;
    style?: ViewStyle;
  }

  export default class ColorPicker extends Component<ColorPickerProps> {}
} 