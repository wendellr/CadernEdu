import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class Storage {
  static const _token = 'ce_token';
  static const _user = 'ce_user';
  static const _alunoSelecionado = 'ce_aluno';
  static const _turmaSelecionada = 'ce_turma';

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_token, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_token);
  }

  static Future<void> setUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_user, jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_user);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<void> setAlunoSelecionado(Map<String, dynamic> aluno) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_alunoSelecionado, jsonEncode(aluno));
  }

  static Future<Map<String, dynamic>?> getAlunoSelecionado() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_alunoSelecionado);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<void> setTurmaSelecionada(Map<String, dynamic> turma) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_turmaSelecionada, jsonEncode(turma));
  }

  static Future<Map<String, dynamic>?> getTurmaSelecionada() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_turmaSelecionada);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static Map<String, dynamic>? decodeJwt(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = parts[1];
      final normalized = base64Url.normalize(payload);
      return jsonDecode(utf8.decode(base64Url.decode(normalized)))
          as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }
}
