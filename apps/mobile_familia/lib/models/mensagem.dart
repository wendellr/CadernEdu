class Mensagem {
  final String id;
  final String assunto;
  final String corpo;
  final String createdAt;

  const Mensagem({
    required this.id,
    required this.assunto,
    required this.corpo,
    required this.createdAt,
  });

  factory Mensagem.fromJson(Map<String, dynamic> j) => Mensagem(
        id: j['id'] as String,
        assunto: j['assunto'] as String,
        corpo: j['corpo'] as String,
        createdAt: j['created_at'] as String,
      );
}
