import 'package:dio/dio.dart';
import '../../models/aluno.dart';
import '../../models/turma.dart';
import 'client.dart';

class IdentityApi {
  final Dio _dio;
  IdentityApi(this._dio);

  Future<List<Aluno>> listarFilhos(String responsavelId) async {
    try {
      final res = await _dio.get('/identity/responsaveis/$responsavelId/filhos');
      return (res.data as List).map((j) => Aluno.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ApiException(_mensagem(e), e.response?.statusCode);
    }
  }

  Future<List<Turma>> listarTurmasDoAluno(String alunoId) async {
    try {
      final res = await _dio.get('/identity/alunos/$alunoId/turmas');
      return (res.data as List).map((j) => Turma.fromJson(j)).toList();
    } on DioException catch (e) {
      throw ApiException(_mensagem(e), e.response?.statusCode);
    }
  }

  String _mensagem(DioException e) =>
      (e.response?.data as Map?)?['detail']?.toString() ?? 'Erro de conexão';
}
