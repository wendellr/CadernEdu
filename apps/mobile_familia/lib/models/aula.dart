class Aula {
  final String id;
  final String turmaId;
  final String data;
  final String disciplina;
  final String conteudo;
  final String? observacoes;

  const Aula({
    required this.id,
    required this.turmaId,
    required this.data,
    required this.disciplina,
    required this.conteudo,
    this.observacoes,
  });

  factory Aula.fromJson(Map<String, dynamic> j) => Aula(
        id: j['id'] as String,
        turmaId: j['turma_id'] as String,
        data: j['data'] as String,
        disciplina: j['disciplina'] as String,
        conteudo: j['conteudo'] as String,
        observacoes: j['observacoes'] as String?,
      );
}
