import 'package:dio/dio.dart';
import 'client.dart';

class AuthApi {
  final Dio _dio;
  AuthApi(this._dio);

  Future<List<Map<String, dynamic>>> loginOptions(
      String email, String senha) async {
    try {
      final res = await _dio.post('/auth/login-options', data: {
        'email': email,
        'senha': senha,
      });
      return (res.data as List).cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      final msg = (e.response?.data as Map?)?['detail'] ?? 'Erro ao conectar';
      throw ApiException(msg.toString(), e.response?.statusCode);
    }
  }

  Future<Map<String, dynamic>> login(String email, String senha,
      {String? usuarioId}) async {
    try {
      final res = await _dio.post('/auth/login', data: {
        'email': email,
        'senha': senha,
        if (usuarioId != null) 'usuario_id': usuarioId,
      });
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      final msg = (e.response?.data as Map?)?['detail'] ?? 'Erro ao conectar';
      throw ApiException(msg.toString(), e.response?.statusCode);
    }
  }
}
