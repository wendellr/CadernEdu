class Aluno {
  final String id;
  final String nome;
  final String email;

  const Aluno({required this.id, required this.nome, required this.email});

  factory Aluno.fromJson(Map<String, dynamic> j) =>
      Aluno(id: j['id'] as String, nome: j['nome'] as String, email: j['email'] as String);

  Map<String, dynamic> toJson() => {'id': id, 'nome': nome, 'email': email};
}
