import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/aula.dart';
import '../../providers/agenda_provider.dart';
import '../../providers/auth_provider.dart';
import 'widgets/aula_card.dart';

class AgendaScreen extends ConsumerStatefulWidget {
  const AgendaScreen({super.key});

  @override
  ConsumerState<AgendaScreen> createState() => _AgendaScreenState();
}

class _AgendaScreenState extends ConsumerState<AgendaScreen> {
  // 0 = segunda … 6 = domingo; inicia no dia atual da semana
  int _diaIndex = DateTime.now().weekday - 1;

  int _indexParaHoje(DateTime inicio) {
    final hoje = DateTime.now();
    final hojeDate = DateTime(hoje.year, hoje.month, hoje.day);
    for (var i = 0; i < 7; i++) {
      final d = inicio.add(Duration(days: i));
      if (d.year == hojeDate.year &&
          d.month == hojeDate.month &&
          d.day == hojeDate.day) {
        return i;
      }
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final semana = ref.watch(semanaProvider);
    final agendaAsync = ref.watch(agendaProvider);
    final inicio = _inicioSemana(semana);

    // Reseta o dia selecionado quando a semana muda
    ref.listen<DateTime>(semanaProvider, (_, novo) {
      setState(() => _diaIndex = _indexParaHoje(_inicioSemana(novo)));
    });

    final nomeUsuario = auth.isResponsavel && auth.alunoSelecionado != null
        ? auth.alunoSelecionado!.nome.split(' ').first
        : auth.nome?.split(' ').first ?? 'Olá';
    final subtitulo = auth.isResponsavel && auth.alunoSelecionado != null
        ? '${auth.alunoSelecionado!.nome.split(' ').first} · ${auth.turmaSelecionada?.nome ?? ''}'
        : auth.turmaSelecionada?.nome ?? '';
    final iniciais = nomeUsuario.isNotEmpty ? nomeUsuario[0].toUpperCase() : '?';

    return Scaffold(
      backgroundColor: AppColors.indigo,
      body: SafeArea(
        child: Column(
          children: [
            // ── Greeting + avatar ──────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 16, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Olá, $nomeUsuario!',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (subtitulo.isNotEmpty)
                          Text(
                            subtitulo,
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 13,
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        iniciais,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ── Tira de dias ───────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left,
                        color: Colors.white70, size: 22),
                    onPressed: () => ref.read(semanaProvider.notifier).state =
                        semana.subtract(const Duration(days: 7)),
                  ),
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: List.generate(7, (i) {
                        final dia = inicio.add(Duration(days: i));
                        final hoje = DateTime.now();
                        final eHoje = dia.year == hoje.year &&
                            dia.month == hoje.month &&
                            dia.day == hoje.day;
                        final selecionado = i == _diaIndex;
                        final letra = DateFormat('E', 'pt_BR')
                            .format(dia)
                            .substring(0, 1)
                            .toUpperCase();

                        return GestureDetector(
                          onTap: () => setState(() => _diaIndex = i),
                          child: Column(
                            children: [
                              Text(
                                letra,
                                style: TextStyle(
                                  color: selecionado
                                      ? Colors.white
                                      : Colors.white54,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: selecionado
                                      ? Colors.white
                                      : eHoje
                                          ? Colors.white.withValues(alpha: 0.25)
                                          : Colors.transparent,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    '${dia.day}',
                                    style: TextStyle(
                                      color: selecionado
                                          ? AppColors.indigo
                                          : Colors.white,
                                      fontWeight: selecionado || eHoje
                                          ? FontWeight.w700
                                          : FontWeight.w400,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right,
                        color: Colors.white70, size: 22),
                    onPressed: () => ref.read(semanaProvider.notifier).state =
                        semana.add(const Duration(days: 7)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // ── Conteúdo do dia selecionado ────────────────────────────────
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: AppColors.bg,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                child: agendaAsync.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(
                    child: Text(e.toString(),
                        style:
                            const TextStyle(color: AppColors.fgDim)),
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

                    final diaSelecionado =
                        inicio.add(Duration(days: _diaIndex));
                    final diaFmt = _fmtDate(diaSelecionado);
                    final aulasHoje = aulasPorDia[diaFmt] ?? [];
                    final eDomingo =
                        diaSelecionado.weekday == DateTime.sunday;

                    if (eDomingo) {
                      return const _EstadoVazio(
                        icone: Icons.weekend_outlined,
                        titulo: 'Domingo',
                        sub: 'Dia de descanso',
                      );
                    }

                    if (aulasHoje.isEmpty) {
                      return _EstadoVazio(
                        icone: Icons.event_available_outlined,
                        titulo: 'Sem aulas',
                        sub: DateFormat("EEEE, d 'de' MMMM", 'pt_BR')
                            .format(diaSelecionado),
                      );
                    }

                    return ListView(
                      padding:
                          const EdgeInsets.fromLTRB(16, 20, 16, 24),
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: Text(
                            DateFormat("EEEE, d 'de' MMMM", 'pt_BR')
                                .format(diaSelecionado),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.fgDim,
                            ),
                          ),
                        ),
                        ...aulasHoje.map(
                          (a) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: AulaCard(
                              aula: a,
                              hasAtividade:
                                  aulaIdsComAtividade.contains(a.id),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EstadoVazio extends StatelessWidget {
  final IconData icone;
  final String titulo;
  final String sub;

  const _EstadoVazio({
    required this.icone,
    required this.titulo,
    required this.sub,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icone, size: 48, color: AppColors.fgFaint),
          const SizedBox(height: 12),
          Text(
            titulo,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.fgDim,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            sub,
            style:
                const TextStyle(fontSize: 13, color: AppColors.fgFaint),
          ),
        ],
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
