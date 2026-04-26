import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/mensagem.dart';
import '../../providers/comunicados_provider.dart';

class ComunicadosScreen extends ConsumerWidget {
  const ComunicadosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final comunicadosAsync = ref.watch(comunicadosProvider);

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(title: const Text('Comunicados')),
      body: comunicadosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Text(e.toString(),
              style: const TextStyle(color: AppColors.fgDim)),
        ),
        data: (mensagens) {
          if (mensagens.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.inbox_outlined, size: 48, color: AppColors.fgFaint),
                  SizedBox(height: 12),
                  Text('Nenhum comunicado ainda.',
                      style: TextStyle(color: AppColors.fgDim)),
                ],
              ),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: mensagens.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _MensagemCard(mensagem: mensagens[i]),
          );
        },
      ),
    );
  }
}

class _MensagemCard extends StatelessWidget {
  final Mensagem mensagem;
  const _MensagemCard({required this.mensagem});

  @override
  Widget build(BuildContext context) {
    final data = _formatarData(mensagem.createdAt);
    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: const BorderSide(color: AppColors.border),
      ),
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    mensagem.assunto,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.fg),
                  ),
                ),
                const SizedBox(width: 8),
                Text(data,
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.fgFaint)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              mensagem.corpo,
              style: const TextStyle(fontSize: 13, color: AppColors.fgDim),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  String _formatarData(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return DateFormat('dd/MM', 'pt_BR').format(dt);
    } catch (_) {
      return '';
    }
  }
}
