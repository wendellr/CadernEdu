class Atividade {
  final String id;
  final String? aulaId;
  final String turmaId;
  final String disciplina;
  final String descricao;
  final String prazo;
  final double? peso;

  const Atividade({
    required this.id,
    this.aulaId,
    required this.turmaId,
    required this.disciplina,
    required this.descricao,
    required this.prazo,
    this.peso,
  });

  factory Atividade.fromJson(Map<String, dynamic> j) => Atividade(
        id: j['id'] as String,
        aulaId: j['aula_id'] as String?,
        turmaId: j['turma_id'] as String,
        disciplina: j['disciplina'] as String,
        descricao: j['descricao'] as String,
        prazo: j['prazo'] as String,
        peso: (j['peso'] as num?)?.toDouble(),
      );
}
