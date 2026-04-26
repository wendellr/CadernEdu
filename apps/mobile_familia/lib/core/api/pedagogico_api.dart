import 'package:dio/dio.dart';
import '../../models/aula.dart';
import '../../models/atividade.dart';
import 'client.dart';

class PedagogicoApi {
  final Dio _dio;
  PedagogicoApi(this._dio);

  Future<List<Aula>> listarAulas(
    String turmaId, {
    required String dataInicio,
    required String dataFim,
  }) async {
    try {
      final res = await _dio.get(
        '/pedagogico/turmas/$turmaId/aulas',
        queryParameters: {'data_inicio': dataInicio, 'data_fim': dataFim},
      );
      return (res.data as List).map((j) => Aula.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ApiException(_mensagem(e), e.response?.statusCode);
    }
  }

  Future<List<Atividade>> listarAtividades(
    String turmaId, {
    required String dataInicio,
    required String dataFim,
  }) async {
    try {
      final res = await _dio.get(
        '/pedagogico/turmas/$turmaId/atividades',
        queryParameters: {'data_inicio': dataInicio, 'data_fim': dataFim},
      );
      return (res.data as List).map((j) => Atividade.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ApiException(_mensagem(e), e.response?.statusCode);
    }
  }

  String _mensagem(DioException e) =>
      (e.response?.data as Map?)?['detail']?.toString() ?? 'Erro de conexão';
}
