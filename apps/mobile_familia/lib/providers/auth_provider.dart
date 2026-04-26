import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/auth_api.dart';
import '../core/api/client.dart';
import '../core/storage.dart';
import '../models/aluno.dart';
import '../models/turma.dart';

// ── Estado de autenticação ────────────────────────────────────────────────────

class AuthState {
  final bool isLoggedIn;
  final String? token;
  final String? userId;
  final String? nome;
  final String? perfil; // "aluno", "responsavel", "professor"
  final Aluno? alunoSelecionado;
  final Turma? turmaSelecionada;

  const AuthState({
    this.isLoggedIn = false,
    this.token,
    this.userId,
    this.nome,
    this.perfil,
    this.alunoSelecionado,
    this.turmaSelecionada,
  });

  bool get isResponsavel => perfil == 'responsavel';
  bool get isAluno => perfil == 'aluno';

  AuthState copyWith({
    bool? isLoggedIn,
    String? token,
    String? userId,
    String? nome,
    String? perfil,
    Aluno? alunoSelecionado,
    Turma? turmaSelecionada,
  }) =>
      AuthState(
        isLoggedIn: isLoggedIn ?? this.isLoggedIn,
        token: token ?? this.token,
        userId: userId ?? this.userId,
        nome: nome ?? this.nome,
        perfil: perfil ?? this.perfil,
        alunoSelecionado: alunoSelecionado ?? this.alunoSelecionado,
        turmaSelecionada: turmaSelecionada ?? this.turmaSelecionada,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _restore();
  }

  final _api = AuthApi(buildDio());

  Future<void> _restore() async {
    final token = await Storage.getToken();
    if (token == null) return;

    final payload = Storage.decodeJwt(token);
    if (payload == null) return;

    final alunoJson = await Storage.getAlunoSelecionado();
    final turmaJson = await Storage.getTurmaSelecionada();

    state = AuthState(
      isLoggedIn: true,
      token: token,
      userId: payload['sub'] as String?,
      nome: payload['name'] as String?,
      perfil: payload['perfil'] as String?,
      alunoSelecionado: alunoJson != null ? Aluno.fromJson(alunoJson) : null,
      turmaSelecionada: turmaJson != null ? Turma.fromJson(turmaJson) : null,
    );
  }

  Future<void> login(String email, String senha) async {
    final data = await _api.login(email, senha);
    final token = data['accessToken'] as String;
    final payload = Storage.decodeJwt(token)!;

    await Storage.setToken(token);
    await Storage.setUser({
      'name': payload['name'],
      'email': payload['email'],
    });

    state = AuthState(
      isLoggedIn: true,
      token: token,
      userId: payload['sub'] as String?,
      nome: payload['name'] as String?,
      perfil: payload['perfil'] as String?,
    );
  }

  Future<void> selecionarAluno(Aluno aluno) async {
    await Storage.setAlunoSelecionado(aluno.toJson());
    state = state.copyWith(alunoSelecionado: aluno);
  }

  Future<void> selecionarTurma(Turma turma) async {
    await Storage.setTurmaSelecionada(turma.toJson());
    state = state.copyWith(turmaSelecionada: turma);
  }

  Future<void> logout() async {
    await Storage.clear();
    state = const AuthState();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (_) => AuthNotifier(),
);

final dioProvider = Provider((_) => buildDio());

final authApiProvider = Provider((ref) => AuthApi(ref.watch(dioProvider)));
