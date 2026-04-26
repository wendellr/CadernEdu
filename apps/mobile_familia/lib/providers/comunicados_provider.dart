import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/comunicacao_api.dart';
import '../models/mensagem.dart';
import 'auth_provider.dart';

final comunicacaoApiProvider = Provider(
  (ref) => ComunicacaoApi(ref.watch(dioProvider)),
);

final comunicadosProvider = FutureProvider.autoDispose<List<Mensagem>>((ref) async {
  final turma = ref.watch(authProvider).turmaSelecionada;
  if (turma == null) return [];
  return ref.watch(comunicacaoApiProvider).listarMensagens(turma.id);
});
