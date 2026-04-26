import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/theme.dart';
import 'features/auth/login_screen.dart';
import 'features/selecao/selecionar_filho_screen.dart';
import 'features/selecao/selecionar_turma_screen.dart';
import 'features/agenda/agenda_screen.dart';
import 'features/comunicados/comunicados_screen.dart';
import 'providers/auth_provider.dart';

final _routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final loggedIn = auth.isLoggedIn;
      final onLogin = state.matchedLocation == '/login';

      if (!loggedIn && !onLogin) return '/login';
      if (loggedIn && onLogin) {
        if (auth.turmaSelecionada != null) return '/home';
        if (auth.isResponsavel) return '/filhos';
        return '/turmas';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/filhos', builder: (_, __) => const SelecionarFilhoScreen()),
      GoRoute(path: '/turmas', builder: (_, __) => const SelecionarTurmaScreen()),
      ShellRoute(
        builder: (context, state, child) => _HomeShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const AgendaScreen()),
          GoRoute(
            path: '/comunicados',
            builder: (_, __) => const ComunicadosScreen(),
          ),
        ],
      ),
    ],
  );
});

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(_routerProvider);
    return MaterialApp.router(
      title: 'CadernEdu',
      theme: buildTheme(),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
      locale: const Locale('pt', 'BR'),
      supportedLocales: const [Locale('pt', 'BR'), Locale('en')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}

// ── Shell com bottom nav ───────────────────────────────────────────────────────

class _HomeShell extends ConsumerWidget {
  final Widget child;
  const _HomeShell({required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = location == '/comunicados' ? 1 : 0;
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (i) {
          if (i == 0) context.go('/home');
          if (i == 1) context.go('/comunicados');
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today),
            label: 'Agenda',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.inbox_outlined),
            activeIcon: Icon(Icons.inbox),
            label: 'Comunicados',
          ),
        ],
      ),
      floatingActionButton: auth.isResponsavel
          ? FloatingActionButton.small(
              backgroundColor: AppColors.bgAlt,
              foregroundColor: AppColors.fgDim,
              elevation: 1,
              tooltip: 'Trocar filho',
              onPressed: () => context.go('/filhos'),
              child: const Icon(Icons.swap_horiz, size: 18),
            )
          : null,
    );
  }
}
