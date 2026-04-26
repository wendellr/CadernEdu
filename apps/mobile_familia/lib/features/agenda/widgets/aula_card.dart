import 'package:flutter/material.dart';
import '../../../models/aula.dart';
import '../../../models/atividade.dart';

// Mesma paleta do painel web (determinística por disciplina)
const _paleta = [
  _Cor(bg: Color(0xFFE0F2FE), border: Color(0xFF7DD3FC), tag: Color(0xFF0369A1)),
  _Cor(bg: Color(0xFFE6F4EA), border: Color(0xFF86EFAC), tag: Color(0xFF145E2E)),
  _Cor(bg: Color(0xFFFEF9C3), border: Color(0xFFFDE047), tag: Color(0xFF854D0E)),
  _Cor(bg: Color(0xFFEDE9FE), border: Color(0xFFC4B5FD), tag: Color(0xFF5B21B6)),
  _Cor(bg: Color(0xFFCCFBF1), border: Color(0xFF5EEAD4), tag: Color(0xFF0F766E)),
  _Cor(bg: Color(0xFFFFEDD5), border: Color(0xFFFED7AA), tag: Color(0xFF9A3412)),
  _Cor(bg: Color(0xFFDCFCE7), border: Color(0xFF6EE7B7), tag: Color(0xFF065F46)),
];

class _Cor {
  final Color bg, border, tag;
  const _Cor({required this.bg, required this.border, required this.tag});
}

_Cor _corDisciplina(String disciplina) {
  var h = 0;
  for (final c in disciplina.toLowerCase().codeUnits) {
    h = ((h * 31 + c) & 0xffffffff).toSigned(32);
  }
  return _paleta[h.abs() % _paleta.length];
}

class AulaCard extends StatelessWidget {
  final Aula aula;
  final bool hasAtividade;

  const AulaCard({super.key, required this.aula, this.hasAtividade = false});

  @override
  Widget build(BuildContext context) {
    final cor = _corDisciplina(aula.disciplina);
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: cor.bg,
        borderRadius: BorderRadius.circular(8),
        border: Border(
          left: BorderSide(color: cor.border, width: 4),
          top: BorderSide(color: cor.border.withOpacity(0.4)),
          right: BorderSide(color: cor.border.withOpacity(0.4)),
          bottom: BorderSide(color: cor.border.withOpacity(0.4)),
        ),
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: cor.border.withOpacity(0.5),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              aula.disciplina.toUpperCase(),
              style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                  color: cor.tag),
            ),
          ),
          const SizedBox(height: 6),
          Text(aula.conteudo,
              style: const TextStyle(fontSize: 12, color: Color(0xFF1A1A18))),
          if (aula.observacoes != null && aula.observacoes!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(aula.observacoes!,
                style: const TextStyle(fontSize: 11, color: Color(0xFF6B6B6A))),
          ],
          if (hasAtividade) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: const Text(
                '📋 Atividade de casa',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF92400E)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class AtividadeCard extends StatelessWidget {
  final Atividade atividade;
  const AtividadeCard({super.key, required this.atividade});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      padding: const EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Text('📋 ', style: TextStyle(fontSize: 12)),
            Expanded(
              child: Text(
                atividade.disciplina,
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF92400E)),
              ),
            ),
            Text('Prazo: ${_fmt(atividade.prazo)}',
                style: const TextStyle(
                    fontSize: 10, color: Color(0xFF6B6B6A))),
          ]),
          const SizedBox(height: 4),
          Text(atividade.descricao,
              style: const TextStyle(fontSize: 12, color: Color(0xFF1A1A18))),
        ],
      ),
    );
  }

  String _fmt(String date) {
    final parts = date.split('-');
    if (parts.length != 3) return date;
    return '${parts[2]}/${parts[1]}';
  }
}
