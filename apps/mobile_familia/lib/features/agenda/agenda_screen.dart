import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/aula.dart';
import '../../providers/agenda_provider.dart';
import '../../providers/auth_provider.dart';
import 'widgets/aula_card.dart';

class AgendaScreen extends ConsumerWidget {
  const AgendaScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final semana = ref.watch(semanaProvider);
    final agendaAsync = ref.watch(agendaProvider);

    final inicio = _inicioSemana(semana);
    final fim = inicio.add(const Duration(days: 6));
    final hoje = DateTime.now();
    final hojeFmt = _fmtDate(hoje);

    final titulo = auth.isResponsavel && auth.alunoSelecionado != null
        ? auth.alunoSelecionado!.nome.split(' ').first
        : auth.turmaSelecionada?.nome ?? 'Agenda';

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: Text(titulo),
        actions: const [],
      ),
      body: Column(
        children: [
          // ── Navegação de semana ──────────────────────────────────────────
          Container(
            color: AppColors.card,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: () => ref
                      .read(semanaProvider.notifier)
                      .state = semana.subtract(const Duration(days: 7)),
                ),
                Expanded(
                  child: Text(
                    '${DateFormat("d MMM", "pt_BR").format(inicio)} – '
                    '${DateFormat("d MMM yyyy", "pt_BR").format(fim)}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.fg),
                  ),
                ),
                TextButton(
                  onPressed: () => ref
                      .read(semanaProvider.notifier)
                      .state = DateTime.now(),
                  child: const Text('Hoje',
                      style: TextStyle(fontSize: 12, color: AppColors.cyan)),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () => ref
                      .read(semanaProvider.notifier)
                      .state = semana.add(const Duration(days: 7)),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // ── Conteúdo ────────────────────────────────────────────────────
          Expanded(
            child: agendaAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Text(e.toString(),
                    style: const TextStyle(color: AppColors.fgDim)),
              ),
              data: (agenda) {
                final aulasPorDia = <String, List<Aula>>{};
                for (final aula in agenda.aulas) {
                  aulasPorDia.putIfAbsent(aula.data, () => []).add(aula);
                }
                final aulaIdsComAtividade = {
                  for (final a in agenda.atividades)
                    if (a.aulaId != null) a.aulaId!,
                };

                return ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: 7,
                  itemBuilder: (context, i) {
                    final dia = inicio.add(Duration(days: i));
                    final diaFmt = _fmtDate(dia);
                    final eDomingo = dia.weekday == DateTime.sunday;
                    final eSabado = dia.weekday == DateTime.saturday;
                    final eHoje = diaFmt == hojeFmt;
                    final aulasNoDia = aulasPorDia[diaFmt] ?? [];

                    return _DiaCard(
                      dia: dia,
                      aulas: aulasNoDia,
                      aulaIdsComAtividade: aulaIdsComAtividade,
                      eHoje: eHoje,
                      eDomingo: eDomingo,
                      eSabado: eSabado,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _DiaCard extends StatelessWidget {
  final DateTime dia;
  final List<Aula> aulas;
  final Set<String> aulaIdsComAtividade;
  final bool eHoje, eDomingo, eSabado;

  const _DiaCard({
    required this.dia,
    required this.aulas,
    required this.aulaIdsComAtividade,
    required this.eHoje,
    required this.eDomingo,
    required this.eSabado,
  });

  @override
  Widget build(BuildContext context) {
    final nomeDia = DateFormat('EEE', 'pt_BR').format(dia).toUpperCase();
    final numDia = DateFormat('d', 'pt_BR').format(dia);
    final mesDia = DateFormat('MMM', 'pt_BR').format(dia);

    Color headerBg;
    Color headerText;
    if (eDomingo) {
      headerBg = AppColors.bgAlt;
      headerText = AppColors.fgFaint;
    } else if (eHoje) {
      headerBg = AppColors.cyan;
      headerText = Colors.white;
    } else if (eSabado) {
      headerBg = const Color(0xFFFFFBEB);
      headerText = const Color(0xFF92400E);
    } else {
      headerBg = AppColors.bgAlt;
      headerText = AppColors.fg;
    }

    return Opacity(
      opacity: eDomingo ? 0.45 : 1.0,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header do dia
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: headerBg,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(10)),
              ),
              child: Row(
                children: [
                  Text(nomeDia,
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                          color: eHoje ? Colors.white70 : AppColors.fgFaint)),
                  const SizedBox(width: 8),
                  Text('$numDia $mesDia',
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: headerText)),
                  if (eSabado) ...[
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFDE68A),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text('Letivo eventual',
                          style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF92400E))),
                    ),
                  ],
                ],
              ),
            ),

            // Aulas (ou estado vazio)
            if (!eDomingo)
              Padding(
                padding: const EdgeInsets.all(10),
                child: aulas.isEmpty
                    ? Text(
                        eSabado ? 'Sem atividade letiva' : 'Sem aulas',
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.fgFaint),
                      )
                    : Column(
                        children: aulas
                            .map((a) => AulaCard(
                                  aula: a,
                                  hasAtividade:
                                      aulaIdsComAtividade.contains(a.id),
                                ))
                            .toList(),
                      ),
              ),
          ],
        ),
      ),
    );
  }
}

DateTime _inicioSemana(DateTime ref) {
  final diff = ref.weekday - 1;
  return DateTime(ref.year, ref.month, ref.day - diff);
}

String _fmtDate(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
