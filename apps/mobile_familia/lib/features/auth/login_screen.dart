import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _senhaCtrl = TextEditingController();
  bool _loading = false;
  bool _senhaVisivel = false;
  String? _erro;
  List<Map<String, dynamic>> _opcoes = const [];

  @override
  void dispose() {
    _emailCtrl.dispose();
    _senhaCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _erro = null;
      _opcoes = const [];
    });
    try {
      final email = _emailCtrl.text.trim();
      final senha = _senhaCtrl.text;
      final opcoes =
          await ref.read(authProvider.notifier).loginOptions(email, senha);
      final opcoesApp = opcoes
          .where((o) => o['perfil'] == 'responsavel' || o['perfil'] == 'aluno')
          .toList();
      if (opcoesApp.isEmpty) {
        throw Exception('Este perfil acessa o painel web.');
      }
      if (opcoesApp.length > 1) {
        setState(() => _opcoes = opcoesApp);
        return;
      }
      await ref.read(authProvider.notifier).login(
            email,
            senha,
            usuarioId: opcoesApp.first['usuario_id'] as String,
          );
      if (!mounted) return;
      _navegar();
    } catch (e) {
      setState(() => _erro = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _selecionarPerfil(Map<String, dynamic> opcao) async {
    setState(() {
      _loading = true;
      _erro = null;
    });
    try {
      await ref.read(authProvider.notifier).login(
            _emailCtrl.text.trim(),
            _senhaCtrl.text,
            usuarioId: opcao['usuario_id'] as String,
          );
      if (!mounted) return;
      _navegar();
    } catch (e) {
      setState(() => _erro = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _navegar() {
    final auth = ref.read(authProvider);
    if (auth.isResponsavel) {
      context.go('/filhos');
    } else {
      context.go('/turmas');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.indigo,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header azul ────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(32, 40, 32, 36),
              child: Column(
                children: [
                  _LogoBranca(),
                  const SizedBox(height: 10),
                  const Text(
                    'Conectando famílias à escola',
                    style: TextStyle(
                      color: Colors.white60,
                      fontSize: 13,
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
            ),

            // ── Card de formulário ─────────────────────────────────────────
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: AppColors.bg,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(28, 32, 28, 24),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 400),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Bem-vindo de volta',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.fg,
                              ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Entre com o e-mail e senha fornecidos pela escola.',
                          style:
                              TextStyle(color: AppColors.fgDim, fontSize: 14),
                        ),
                        const SizedBox(height: 32),
                        Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              TextFormField(
                                controller: _emailCtrl,
                                keyboardType: TextInputType.emailAddress,
                                textInputAction: TextInputAction.next,
                                decoration: const InputDecoration(
                                  labelText: 'E-mail',
                                  hintText: 'voce@escola.edu.br',
                                  prefixIcon:
                                      Icon(Icons.mail_outline, size: 18),
                                ),
                                validator: (v) {
                                  if (v == null || v.isEmpty) {
                                    return 'Obrigatório';
                                  }
                                  if (!v.contains('@')) {
                                    return 'E-mail inválido';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),
                              TextFormField(
                                controller: _senhaCtrl,
                                obscureText: !_senhaVisivel,
                                textInputAction: TextInputAction.done,
                                onFieldSubmitted: (_) => _login(),
                                decoration: InputDecoration(
                                  labelText: 'Senha',
                                  prefixIcon:
                                      const Icon(Icons.lock_outline, size: 18),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _senhaVisivel
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      color: AppColors.fgFaint,
                                      size: 20,
                                    ),
                                    onPressed: () => setState(
                                        () => _senhaVisivel = !_senhaVisivel),
                                  ),
                                ),
                                validator: (v) => (v == null || v.length < 4)
                                    ? 'Senha muito curta'
                                    : null,
                              ),
                              if (_erro != null) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color:
                                        AppColors.coral.withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                        color: AppColors.coral
                                            .withValues(alpha: 0.3)),
                                  ),
                                  child: Text(
                                    _erro!,
                                    style: const TextStyle(
                                        color: AppColors.coral, fontSize: 13),
                                  ),
                                ),
                              ],
                              if (_opcoes.length > 1) ...[
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.indigo
                                        .withValues(alpha: 0.06),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: AppColors.indigo
                                          .withValues(alpha: 0.18),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.stretch,
                                    children: [
                                      const Text(
                                        'Escolha o perfil',
                                        style: TextStyle(
                                          color: AppColors.fgDim,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      for (final opcao in _opcoes) ...[
                                        OutlinedButton(
                                          onPressed: _loading
                                              ? null
                                              : () => _selecionarPerfil(opcao),
                                          style: OutlinedButton.styleFrom(
                                            alignment: Alignment.centerLeft,
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 12,
                                              vertical: 10,
                                            ),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                          ),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                _perfilLabel(
                                                    opcao['perfil'] as String?),
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                              Text(
                                                [
                                                  opcao['nome'],
                                                  opcao['escola_nome'],
                                                  opcao['secretaria_nome'],
                                                ]
                                                    .whereType<String>()
                                                    .where((v) => v.isNotEmpty)
                                                    .join(' · '),
                                                style: const TextStyle(
                                                  color: AppColors.fgFaint,
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                      ],
                                    ],
                                  ),
                                ),
                              ],
                              const SizedBox(height: 28),
                              SizedBox(
                                height: 52,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.indigo,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  onPressed: _loading ? null : _login,
                                  child: _loading
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Colors.white),
                                        )
                                      : const Text(
                                          'Entrar',
                                          style: TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w600),
                                        ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 32),
                        const Text(
                          'Acesso por convite da secretaria municipal.',
                          textAlign: TextAlign.center,
                          style:
                              TextStyle(color: AppColors.fgFaint, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

String _perfilLabel(String? perfil) {
  switch (perfil) {
    case 'aluno':
      return 'Aluno';
    case 'responsavel':
      return 'Responsável';
    case 'professor':
      return 'Professor';
    case 'diretor':
      return 'Diretor';
    case 'coordenador':
      return 'Coordenador';
    case 'secretaria':
      return 'Secretaria';
    default:
      return perfil ?? 'Perfil';
  }
}

// ── Logo versão branca (para fundo escuro) ────────────────────────────────────

class _LogoBranca extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CustomPaint(size: const Size(36, 36), painter: _LogoPainterBranca()),
        const SizedBox(width: 10),
        const Text(
          'CadernEdu',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}

class _LogoPainterBranca extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final solid = Paint()..color = Colors.white.withValues(alpha: 0.95);
    final dim = Paint()..color = Colors.white.withValues(alpha: 0.45);
    final line = Paint()
      ..color = AppColors.indigo
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final rr = Radius.circular(size.width * 0.08);
    canvas.drawRRect(
        RRect.fromLTRBR(size.width * 0.04, size.width * 0.20, size.width * 0.47,
            size.width * 0.80, rr),
        solid);
    canvas.drawRRect(
        RRect.fromLTRBR(size.width * 0.53, size.width * 0.20, size.width * 0.96,
            size.width * 0.80, rr),
        dim);

    for (final y in [0.36, 0.50, 0.64]) {
      canvas.drawLine(
        Offset(size.width * 0.11, size.height * y),
        Offset(size.width * 0.40, size.height * y),
        line,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
