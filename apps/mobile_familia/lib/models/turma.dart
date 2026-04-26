class Turma {
  final String id;
  final String nome;
  final String serie;
  final int anoLetivo;
  final String escolaId;

  const Turma({
    required this.id,
    required this.nome,
    required this.serie,
    required this.anoLetivo,
    required this.escolaId,
  });

  factory Turma.fromJson(Map<String, dynamic> j) => Turma(
        id: j['id'] as String,
        nome: j['nome'] as String,
        serie: j['serie'] as String,
        anoLetivo: j['ano_letivo'] as int,
        escolaId: j['escola_id'] as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'nome': nome,
        'serie': serie,
        'ano_letivo': anoLetivo,
        'escola_id': escolaId,
      };
}
