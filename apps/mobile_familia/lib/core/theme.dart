import 'package:flutter/material.dart';

const _cyan = Color(0xFF0891B2);
const _cyanDeep = Color(0xFF0E7490);
const _green = Color(0xFF1B7B3F);
const _coral = Color(0xFFE05252);
const _bg = Color(0xFFFAFAF8);
const _card = Color(0xFFFFFFFF);
const _fg = Color(0xFF1A1A18);
const _fgDim = Color(0xFF6B6B6A);
const _fgFaint = Color(0xFFA1A19E);
const _border = Color(0xFFE5E5E0);
const _bgAlt = Color(0xFFF2F1EC);

const _indigo = Color(0xFF1E3A8A);
const _indigoMid = Color(0xFF2563EB);

class AppColors {
  static const cyan = _cyan;
  static const cyanDeep = _cyanDeep;
  static const green = _green;
  static const coral = _coral;
  static const bg = _bg;
  static const card = _card;
  static const fg = _fg;
  static const fgDim = _fgDim;
  static const fgFaint = _fgFaint;
  static const border = _border;
  static const bgAlt = _bgAlt;
  static const indigo = _indigo;
  static const indigoMid = _indigoMid;
}

ThemeData buildTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary: _cyan,
      onPrimary: Colors.white,
      secondary: _green,
      onSecondary: Colors.white,
      error: _coral,
      surface: _card,
      onSurface: _fg,
    ),
    scaffoldBackgroundColor: _bg,
    cardColor: _card,
    dividerColor: _border,
    // fontFamily: 'Inter', // descomentar após adicionar os TTFs ao pubspec
    appBarTheme: const AppBarTheme(
      backgroundColor: _card,
      foregroundColor: _fg,
      elevation: 0,
      scrolledUnderElevation: 1,
      shadowColor: _border,
      titleTextStyle: TextStyle(
        // fontFamily: 'Inter', // descomentar após adicionar os TTFs ao pubspec
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: _fg,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: _card,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _cyan, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _coral),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      hintStyle: const TextStyle(color: _fgFaint, fontSize: 14),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _cyan,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        textStyle: const TextStyle(
          // fontFamily: 'Inter', // descomentar após adicionar os TTFs ao pubspec
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: _cyan),
    ),
    listTileTheme: const ListTileThemeData(
      tileColor: _card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: _card,
      selectedItemColor: _cyan,
      unselectedItemColor: _fgFaint,
      elevation: 8,
      type: BottomNavigationBarType.fixed,
    ),
  );
}
