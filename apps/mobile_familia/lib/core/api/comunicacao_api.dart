import 'package:dio/dio.dart';
import '../../models/mensagem.dart';
import 'client.dart';

class ComunicacaoApi {
  final Dio _dio;
  ComunicacaoApi(this._dio);

  Future<List<Mensagem>> listarMensagens(String turmaId) async {
    try {
      final res = await _dio.get('/comunicacao/turmas/$turmaId/mensagens');
      return (res.data as List).map((j) => Mensagem.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ApiException(_mensagem(e), e.response?.statusCode);
    }
  }

  String _mensagem(DioException e) =>
      (e.response?.data as Map?)?['detail']?.toString() ?? 'Erro de conexão';
}
