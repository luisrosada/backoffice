'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  KeyRound,
  UserPlus,
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  ShieldAlert,
  Code2,
  ExternalLink,
  LogOut,
  Sparkles,
  ArrowRight,
  Cookie,
  Layers,
  Terminal,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'instructor';
  isActive: boolean;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AlunoPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentUser | null>(null);

  // Form de Login
  const [loginEmail, setLoginEmail] = useState('aluno@aula.com');
  const [loginPassword, setLoginPassword] = useState('aluno123');
  const [authMethod, setAuthMethod] = useState<'token' | 'cookie'>('token');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form de Registo
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Laboratório de Testes de API
  const [apiTestResponse, setApiTestResponse] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Módulos do Curso
  const [completedModules, setCompletedModules] = useState<number[]>([1]);

  // Carregar sessão salva do aluno
  useEffect(() => {
    const savedToken = localStorage.getItem('aluno_token');
    const savedUser = localStorage.getItem('aluno_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setStudent(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('aluno_token');
        localStorage.removeItem('aluno_user');
      }
    }
  }, []);

  // Login do Aluno
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const endpoint = authMethod === 'token' ? '/auth/login-token' : '/auth/login-cookie';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Para receber e guardar o cookie
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Credenciais inválidas');
      }

      const receivedUser = json.data?.user || json.user;
      const accessToken = json.data?.accessToken || json.accessToken || 'cookie_session_active';

      localStorage.setItem('aluno_token', accessToken);
      localStorage.setItem('aluno_user', JSON.stringify(receivedUser));
      setToken(accessToken);
      setStudent(receivedUser);
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao entrar na conta');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Registo de Novo Aluno (Público)
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsRegistering(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: 'user', // Registo público sempre cria com papel de aluno
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          Array.isArray(json.message) ? json.message.join(', ') : json.message || 'Erro ao criar conta',
        );
      }

      // Após registar, faz login automático com o token
      setLoginEmail(regEmail);
      setLoginPassword(regPassword);
      setActiveTab('login');
      alert('Conta de aluno criada com sucesso! Faça login para aceder.');
    } catch (err: any) {
      setRegError(err.message || 'Erro no registo');
    } finally {
      setIsRegistering(false);
    }
  };

  // Logout do Aluno
  const handleStudentLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}

    localStorage.removeItem('aluno_token');
    localStorage.removeItem('aluno_user');
    setToken(null);
    setStudent(null);
    setApiTestResponse(null);
  };

  // Testar Endpoint de Perfil Protegido
  const testStudentProfile = async () => {
    setIsTestingApi(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: token && token !== 'cookie_session_active' ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const json = await res.json();
      setApiTestResponse({
        endpoint: 'GET /auth/me (Guard Híbrido)',
        status: res.status,
        ok: res.ok,
        data: json,
      });
    } catch (err: any) {
      setApiTestResponse({ error: err.message });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Testar Tentativa de Acesso a Rota Admin (Demonstração de 403 Forbidden)
  const testForbiddenAdminRoute = async () => {
    setIsTestingApi(true);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: token && token !== 'cookie_session_active' ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const json = await res.json();
      setApiTestResponse({
        endpoint: 'GET /users (Exige Role: ADMIN)',
        status: res.status,
        ok: res.ok,
        isForbiddenDemo: res.status === 403,
        data: json,
      });
    } catch (err: any) {
      setApiTestResponse({ error: err.message });
    } finally {
      setIsTestingApi(false);
    }
  };

  const toggleModule = (id: number) => {
    setCompletedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const courseModules = [
    {
      id: 1,
      title: '1. Fundamentos & Injeção de Dependências',
      desc: 'Estrutura modular do NestJS, Controllers, Providers e Inversão de Controlo (IoC).',
    },
    {
      id: 2,
      title: '2. Autenticação Dupla (JWT Bearer vs Cookies)',
      desc: 'Estratégias Stateless vs Stateful, segurança HttpOnly contra XSS e SameSite contra CSRF.',
    },
    {
      id: 3,
      title: '3. Ciclo de Vida da Requisição',
      desc: 'Ordem de execução: Middlewares → Guards → Interceptors (Pre) → Pipes → Interceptors (Post) → Filters.',
    },
    {
      id: 4,
      title: '4. Banco de Dados com Prisma ORM & PostgreSQL',
      desc: 'Modelagem relacional com schema.prisma, geração de tipos e migrations no Docker.',
    },
    {
      id: 5,
      title: '5. Observabilidade & Health Checks',
      desc: 'Monitorização de memória Heap/RSS e probes de liveness com o pacote @nestjs/terminus.',
    },
    {
      id: 6,
      title: '6. Documentação Interativa com Scalar',
      desc: 'Visualização de rotas OpenAPI e testes integrados no navegador com @scalar/nestjs-api-reference.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 flex-1">
        {/* Banner Hero Público */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 px-3 py-1 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              Área do Aluno (Pública)
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Aprenda NestJS na Prática
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Ambiente interativo para alunos testarem autenticação por Token JWT, Cookies de Sessão,
              permissões RBAC e inspecionarem o ciclo de vida das requisições na API.
            </p>
          </div>
        </div>

        {/* Conteúdo: Se não autenticado -> Abas de Login & Registo */}
        {!student ? (
          <div className="max-w-md mx-auto w-full">
            <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
              {/* Abas Alternadoras */}
              <div className="grid grid-cols-2 p-1.5 m-4 mb-0 bg-slate-950/60 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'login'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5 inline" />
                  Iniciar Sessão
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'register'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5 inline" />
                  Criar Conta
                </button>
              </div>

              {/* Formulário de Login */}
              {activeTab === 'login' && (
                <CardContent className="pt-6 space-y-4">
                  {loginError && (
                    <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Email do Aluno</label>
                      <Input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="aluno@aula.com"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Palavra-passe</label>
                      <Input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="aluno123"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    {/* Escolha do Método de Autenticação para a Aula */}
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-semibold text-slate-400">Método de Autenticação para a Aula:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAuthMethod('token')}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            authMethod === 'token'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white'
                              : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">Token JWT</div>
                          <div className="text-[10px] text-slate-400">Bearer Token (Stateless)</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAuthMethod('cookie')}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            authMethod === 'cookie'
                              ? 'border-indigo-500 bg-indigo-500/10 text-white'
                              : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold">Cookie HttpOnly</div>
                          <div className="text-[10px] text-slate-400">Sessão no Navegador</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20"
                    >
                      {isLoggingIn ? 'A verificar...' : 'Entrar no Portal do Aluno'}
                    </Button>
                  </form>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 border-dashed border-indigo-500/30"
                      onClick={() => {
                        setLoginEmail('aluno@aula.com');
                        setLoginPassword('aluno123');
                        setAuthMethod('token');
                      }}
                    >
                      ⚡ Preencher com Aluno Exemplo (aluno@aula.com / aluno123)
                    </Button>
                  </div>
                </CardContent>
              )}

              {/* Formulário de Registo */}
              {activeTab === 'register' && (
                <CardContent className="pt-6 space-y-4">
                  {regError && (
                    <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                      {regError}
                    </div>
                  )}

                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Seu Nome Completo</label>
                      <Input
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ex: Beatriz Lima"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Seu Email</label>
                      <Input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="beatriz@exemplo.com"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Palavra-passe (Mínimo 6)</label>
                      <Input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-slate-950/70 border-white/10 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                    >
                      {isRegistering ? 'A registar...' : 'Criar Minha Conta de Aluno'}
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>
          </div>
        ) : (
          /* Aluno Autenticado: Área do Aluno */
          <div className="space-y-8">
            {/* Card de Boas-vindas e Perfil */}
            <Card className="border-indigo-500/30 bg-slate-900/60 backdrop-blur-xl">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/30">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{student.name}</h2>
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold">
                        🎓 Papel: Aluno ({student.role})
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {student.email} • ID: <code className="text-slate-300">{student.id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="http://localhost:3000/reference"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
                  >
                    <span>Testar no Scalar Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Button
                    variant="outline"
                    onClick={handleStudentLogout}
                    className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Terminar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid: Módulos do Curso + Laboratório Prático de Requisições */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna 1 & 2: Módulos e Progresso da Aula */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    Conteúdo Programático do Curso
                  </h3>
                  <span className="text-xs text-slate-400">
                    {completedModules.length} de {courseModules.length} concluídos
                  </span>
                </div>

                <div className="space-y-3">
                  {courseModules.map((mod) => {
                    const isDone = completedModules.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModule(mod.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isDone
                            ? 'bg-slate-900/80 border-indigo-500/30 shadow-md shadow-indigo-500/5'
                            : 'bg-slate-950/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isDone
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${isDone ? 'text-white' : 'text-slate-300'}`}>
                            {mod.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coluna 3: Laboratório Prático de RBAC e Tokens */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  Laboratório de Segurança
                </h3>

                {/* Card de Teste de Permissões */}
                <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Testes de Acesso e RBAC
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Veja na prática como os Guards do NestJS protegem os endpoints conforme a sua Role.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={testStudentProfile}
                      disabled={isTestingApi}
                      className="w-full text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 justify-start"
                    >
                      <Unlock className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                      Aceder ao meu perfil (/auth/me) [200 OK]
                    </Button>

                    <Button
                      onClick={testForbiddenAdminRoute}
                      disabled={isTestingApi}
                      className="w-full text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 justify-start"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 mr-2 text-rose-400" />
                      Tentar listar utilizadores (/users) [403 Proibido]
                    </Button>

                    {/* Resultado da Chamada */}
                    {apiTestResponse && (
                      <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-white/10 text-xs font-mono">
                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                          <span className="text-slate-400 font-bold">{apiTestResponse.endpoint}</span>
                          <Badge
                            variant="outline"
                            className={
                              apiTestResponse.status === 200
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }
                          >
                            Status: {apiTestResponse.status}
                          </Badge>
                        </div>
                        <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-48">
                          {JSON.stringify(apiTestResponse.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Card do Token JWT / Cookie */}
                <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      Sua Credencial de Sessão
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-white/10 font-mono text-[11px] text-slate-400 break-all">
                      {token}
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {token?.startsWith('eyJ')
                        ? '🔑 Este é um token JWT assinado digitalmente pelo algoritmo HMAC SHA-256 no NestJS.'
                        : '🍪 Sessão mantida via Cookie HttpOnly seguro no cabeçalho Set-Cookie.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
