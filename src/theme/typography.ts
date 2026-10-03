import { colors } from './colors';

type FontFamily = 'Cairo-Regular' | 'Cairo-Medium' | 'Cairo-Bold';

interface TextStyle {
  fontFamily: FontFamily;
  fontSize: number;
  color: string;
  textAlign: 'right';
  writingDirection: 'rtl';
}

function makeStyle(
  fontFamily: FontFamily,
  fontSize: number,
  color: string = colors.text,
): TextStyle {
  return {
    fontFamily,
    fontSize,
    color,
    textAlign: 'right',
    writingDirection: 'rtl',
  };
}

export const typography = {
  screenTitle: makeStyle('Cairo-Bold', 26),
  sectionLabel: makeStyle('Cairo-Medium', 14, colors.textSecondary),
  cardTitle: makeStyle('Cairo-Bold', 18),
  cardTitleSmall: makeStyle('Cairo-Bold', 16),
  body: makeStyle('Cairo-Regular', 15),
  bodySmall: makeStyle('Cairo-Regular', 13, colors.textSecondary),
  numberLarge: makeStyle('Cairo-Bold', 28),
  numberMedium: makeStyle('Cairo-Bold', 22),
  chip: makeStyle('Cairo-Medium', 13),
  button: makeStyle('Cairo-Bold', 16, '#FFFFFF'),
} as const;

export const ltrTextStyle = {
  writingDirection: 'ltr' as const,
  textAlign: 'center' as const,
};

export const ltrTextLeft = {
  writingDirection: 'ltr' as const,
  textAlign: 'left' as const,
};