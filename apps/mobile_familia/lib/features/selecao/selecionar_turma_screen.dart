import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/identity_api.dart';
import '../../core/theme.dart';
import '../../models/turma.dart';
import '../../providers/auth_provider.dart';

final _turmasProvider = FutureProvider.autoDispose<List<Turma>>((ref) async {
  final auth = ref.watch(authProvider);
  // Para responsável: usa o aluno selecionado. Para aluno: usa o próprio userId.
  final alunoId = auth.isResponsavel
      ? auth.alunoSelecionado?.id
      : auth.userId;
  if (alunoId == null) return [];
  return IdentityApi(ref.watch(dioProvider)).listarTurmasDoAluno(alunoId);
});

class SelecionarTurmaScreen extends ConsumerWidget {
  const SelecionarTurmaScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final turmasAsync = ref.watch(_turmasProvider);
    final subtitulo = auth.isResponsavel && auth.alunoSelecionado != null
        ? auth.alunoSelecionado!.nome
        : null;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Selecionar turma'),
            if (subtitulo != null)
              Text(subtitulo,
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                      color: AppColors.fgDim)),
          ],
        ),
        actions: [
          if (auth.isResponsavel)
            TextButton(
              onPressed: () => context.go('/filhos'),
              child: const Text('Trocar filho'),
            ),
        ],
      ),
      body: turmasAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Text(e.toString(),
              style: const TextStyle(color: AppColors.fgDim)),
        ),
        data: (turmas) {
          if (turmas.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('Nenhuma turma encontrada.',
                    style: TextStyle(color: AppColors.fgDim)),
              ),
            );
          }
          if (turmas.length == 1) {
            WidgetsBinding.instance.addPostFrameCallback((_) async {
              await ref.read(authProvider.notifier).selecionarTurma(turmas.first);
              if (context.mounted) context.go('/home');
            });
            return const Center(child: CircularProgressIndicator());
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: turmas.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _TurmaCard(turma: turmas[i]),
          );
        },
      ),
    );
  }
}

class _TurmaCard extends ConsumerWidget {
  final Turma turma;
  const _TurmaCard({required this.turma});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: const BorderSide(color: AppColors.border),
      ),
      elevation: 0,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        title: Text(turma.nome,
            style: const TextStyle(
                fontWeight: FontWeight.w600, color: AppColors.fg)),
        subtitle: Text('${turma.serie} · ${turma.anoLetivo}',
            style: const TextStyle(color: AppColors.fgDim, fontSize: 13)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.fgFaint),
        onTap: () async {
          await ref.read(authProvider.notifier).selecionarTurma(turma);
          if (context.mounted) context.go('/home');
        },
      ),
    );
  }
}
