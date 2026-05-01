import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/pedagogico_api.dart';
import '../models/aula.dart';
import '../models/atividade.dart';
import 'auth_provider.dart';

final pedagogicoApiProvider = Provider(
  (ref) => PedagogicoApi(ref.watch(dioProvider)),
);

// Semana atual selecionada (data de referência = qualquer dia da semana)
final semanaProvider = StateProvider<DateTime>((_) => DateTime.now());

class AgendaSemana {
  final List<Aula> aulas;
  final List<Atividade> atividades;
  const AgendaSemana({required this.aulas, required this.atividades});
}

final agendaProvider = FutureProvider.autoDispose<AgendaSemana>((ref) async {
  final turma = ref.watch(authProvider).turmaSelecionada;
  if (turma == null) return const AgendaSemana(aulas: [], atividades: []);

  final semana = ref.watch(semanaProvider);
  final inicio = _inicioSemana(semana);
  final fim = inicio.add(const Duration(days: 6));
  const fmt = _fmtDate;

  final api = ref.watch(pedagogicoApiProvider);
  final results = await Future.wait([
    api.listarAulas(turma.id, dataInicio: fmt(inicio), dataFim: fmt(fim)),
    api.listarAtividades(turma.id, dataInicio: fmt(inicio), dataFim: fmt(fim)),
  ]);

  return AgendaSemana(
    aulas: results[0] as List<Aula>,
    atividades: results[1] as List<Atividade>,
  );
});

DateTime _inicioSemana(DateTime ref) {
  // Segunda-feira = weekday 1
  final diff = ref.weekday - 1;
  return DateTime(ref.year, ref.month, ref.day - diff);
}

String _fmtDate(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
