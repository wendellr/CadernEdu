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

  @override
  void dispose() {
    _emailCtrl.dispose();
    _senhaCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _erro = null; });

    try {
      await ref.read(authProvider.notifier).login(
            _emailCtrl.text.trim(),
            _senhaCtrl.text,
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
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 32),
                  _Logo(),
                  const SizedBox(height: 40),
                  Text(
                    'Bem-vindo de volta',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.fg,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Entre com o e-mail e senha fornecidos pela escola.',
                    style: TextStyle(color: AppColors.fgDim, fontSize: 14),
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
                          ),
                          validator: (v) {
                            if (v == null || v.isEmpty) return 'Obrigatório';
                            if (!v.contains('@')) return 'E-mail inválido';
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
                            suffixIcon: IconButton(
                              icon: Icon(
                                _senhaVisivel
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                color: AppColors.fgFaint,
                                size: 20,
                              ),
                              onPressed: () =>
                                  setState(() => _senhaVisivel = !_senhaVisivel),
                            ),
                          ),
                          validator: (v) =>
                              (v == null || v.length < 4) ? 'Senha muito curta' : null,
                        ),
                        if (_erro != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.coral.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                  color: AppColors.coral.withOpacity(0.3)),
                            ),
                            child: Text(
                              _erro!,
                              style: const TextStyle(
                                  color: AppColors.coral, fontSize: 13),
                            ),
                          ),
                        ],
                        const SizedBox(height: 24),
                        SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _login,
                            child: _loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2, color: Colors.white),
                                  )
                                : const Text('Entrar'),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'Acesso por convite da secretaria municipal.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.fgFaint, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CustomPaint(size: const Size(32, 32), painter: _LogoPainter()),
        const SizedBox(width: 8),
        RichText(
          text: const TextSpan(
            style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 22,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.5),
            children: [
              TextSpan(
                  text: 'Cadern',
                  style: TextStyle(color: AppColors.green)),
              TextSpan(
                  text: 'Edu',
                  style: TextStyle(color: AppColors.cyan)),
            ],
          ),
        ),
      ],
    );
  }
}

class _LogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final green = Paint()..color = AppColors.green;
    final cyan = Paint()..color = AppColors.cyan;
    final white = Paint()
      ..color = Colors.white
      ..strokeWidth = 1.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final rr = Radius.circular(size.width * 0.08);
    canvas.drawRRect(
        RRect.fromLTRBR(size.width * 0.14, size.width * 0.26,
            size.width * 0.48, size.width * 0.74, rr),
        green);
    canvas.drawRRect(
        RRect.fromLTRBR(size.width * 0.52, size.width * 0.26,
            size.width * 0.86, size.width * 0.74, rr),
        cyan);

    for (final y in [0.38, 0.46, 0.54]) {
      canvas.drawLine(
        Offset(size.width * 0.20, size.height * y),
        Offset(size.width * 0.42, size.height * y),
        white,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
