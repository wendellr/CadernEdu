import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/identity_api.dart';
import '../../core/theme.dart';
import '../../models/aluno.dart';
import '../../providers/auth_provider.dart';

final _filhosProvider = FutureProvider.autoDispose<List<Aluno>>((ref) async {
  final userId = ref.watch(authProvider).userId;
  if (userId == null) return [];
  return IdentityApi(ref.watch(dioProvider)).listarFilhos(userId);
});

class SelecionarFilhoScreen extends ConsumerWidget {
  const SelecionarFilhoScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filhosAsync = ref.watch(_filhosProvider);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: const Text('Selecionar filho'),
        actions: [
          TextButton(
            onPressed: () => ref.read(authProvider.notifier).logout()
                .then((_) => context.go('/login')),
            child: const Text('Sair'),
          ),
        ],
      ),
      body: filhosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _Erro(mensagem: e.toString()),
        data: (filhos) {
          if (filhos.isEmpty) {
            return const _Erro(mensagem: 'Nenhum filho vinculado a esta conta.');
          }
          if (filhos.length == 1) {
            // Auto-seleciona se há só um
            WidgetsBinding.instance.addPostFrameCallback((_) async {
              await ref.read(authProvider.notifier).selecionarAluno(filhos.first);
              if (context.mounted) context.go('/turmas');
            });
            return const Center(child: CircularProgressIndicator());
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: filhos.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) => _FilhoCard(filho: filhos[i]),
          );
        },
      ),
    );
  }
}

class _FilhoCard extends ConsumerWidget {
  final Aluno filho;
  const _FilhoCard({required this.filho});

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
        leading: CircleAvatar(
          backgroundColor: AppColors.cyan.withOpacity(0.15),
          child: Text(
            filho.nome.split(' ').map((w) => w[0]).take(2).join(),
            style: const TextStyle(
                color: AppColors.cyan,
                fontWeight: FontWeight.w600,
                fontSize: 14),
          ),
        ),
        title: Text(filho.nome,
            style: const TextStyle(
                fontWeight: FontWeight.w600, color: AppColors.fg)),
        trailing: const Icon(Icons.chevron_right, color: AppColors.fgFaint),
        onTap: () async {
          await ref.read(authProvider.notifier).selecionarAluno(filho);
          if (context.mounted) context.go('/turmas');
        },
      ),
    );
  }
}

class _Erro extends StatelessWidget {
  final String mensagem;
  const _Erro({required this.mensagem});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(mensagem,
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.fgDim)),
      ),
    );
  }
}
