'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Shield,
  Activity,
  Database,
  ExternalLink,
  Search,
  UserPlus,
  RefreshCw,
  LogOut,
  Trash2,
  CheckCircle2,
  Server,
  KeyRound,
  Copy,
  Check,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Navbar } from '@/components/navbar';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: {
    admin: number;
    instructor: number;
    user: number;
  };
  uptimeSeconds: number;
  memoryUsage: {
    heapUsedMb: number;
    rssMb: number;
  };
  databaseStatus: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminPage() {
  // Estado de Autenticação
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('admin@aula.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dados do Painel
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal de Novo Utilizador
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'instructor' | 'user'>('user');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Carregar token salvo
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  // Buscar Estatísticas
  const fetchStats = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setStats(json.data || json);
      }
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  }, []);

  // Buscar Utilizadores
  const fetchUsers = useCallback(async (authToken: string, query = '', role = '') => {
    setIsLoading(true);
    try {
      const url = new URL(`${API_BASE}/admin/users`);
      if (query) url.searchParams.set('search', query);
      if (role) url.searchParams.set('role', role);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || json);
      }
    } catch (err) {
      console.error('Erro ao buscar utilizadores:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchStats(token);
      fetchUsers(token, searchQuery, selectedRole);
    }
  }, [token, searchQuery, selectedRole, fetchStats, fetchUsers]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Credenciais inválidas');
      }

      const receivedUser = json.data?.user || json.user;
      const accessToken = json.data?.accessToken || json.accessToken;

      if (receivedUser.role !== 'admin') {
        throw new Error(
          `Acesso Recusado: Este painel requer privilégios de Administrador. O seu papel atual é "${receivedUser.role}".`,
        );
      }

      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('admin_user', JSON.stringify(receivedUser));
      setToken(accessToken);
      setCurrentUser(receivedUser);
      showToast(`Bem-vindo, Administrador ${receivedUser.name}!`);
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao realizar login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setCurrentUser(null);
    setStats(null);
    setUsers([]);
  };

  // Alterar Papel
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'instructor' | 'user') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        showToast('Papel de utilizador atualizado com sucesso!');
        fetchStats(token);
        fetchUsers(token, searchQuery, selectedRole);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Alternar Estado
  const handleToggleStatus = async (userId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Erro ao alterar estado');
        return;
      }

      showToast('Estado do utilizador atualizado!');
      fetchStats(token);
      fetchUsers(token, searchQuery, selectedRole);
    } catch (err) {
      console.error(err);
    }
  };

  // Eliminar
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!token) return;
    if (!confirm(`Tem a certeza que deseja eliminar o utilizador "${userName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Erro ao eliminar utilizador');
        return;
      }

      showToast(`Utilizador ${userName} eliminado.`);
      fetchStats(token);
      fetchUsers(token, searchQuery, selectedRole);
    } catch (err) {
      console.error(err);
    }
  };

  // Criar Utilizador
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsCreatingUser(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(json.message) ? json.message.join(', ') : json.message || 'Erro ao criar',
        );
      }

      setIsModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      showToast(`Utilizador "${json.data?.name || newName}" criado com sucesso!`);

      if (token) {
        fetchStats(token);
        fetchUsers(token, searchQuery, selectedRole);
      }
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const copyDockerCommand = () => {
    navigator.clipboard.writeText('docker compose up -d');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const roleCounts = stats?.byRole || { admin: 0, instructor: 0, user: 0 };
  const total = stats?.totalUsers || users.length || 0;
  const activeCount = stats?.activeUsers || 0;
  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Não autenticado como admin */}
      {!token || !currentUser ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-500/30">
                <Shield className="w-7 h-7" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                Acesso de Administrador
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm mt-1">
                Faça login para gerir utilizadores, Prisma ORM e PostgreSQL
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {loginError && (
                <div className="p-3 mb-4 text-sm rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email do Admin</label>
                  <Input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@aula.com"
                    className="bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Palavra-passe</label>
                  <Input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="admin123"
                    className="bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  {isLoggingIn ? 'A autenticar...' : 'Entrar no Painel Admin'}
                </Button>
              </form>

              <div className="mt-6 space-y-2 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/30 border-dashed border-indigo-500/30"
                  onClick={() => {
                    setLoginEmail('admin@aula.com');
                    setLoginPassword('admin123');
                  }}
                >
                  ⚡ Preencher Credenciais de Admin (admin@aula.com / admin123)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-dashed border-rose-500/30"
                  onClick={() => {
                    setLoginEmail('aluno@aula.com');
                    setLoginPassword('aluno123');
                  }}
                >
                  🛡️ Testar Acesso Aluno (Demonstra o bloqueio 403 Forbidden)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Autenticado como Admin */
        <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 flex-1">
          {/* Banner de Status */}
          <Card className="border-emerald-500/30 bg-emerald-950/20 backdrop-blur-xl">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Sessão Ativa: {currentUser.name} ({currentUser.email})
                  </h4>
                  <p className="text-xs text-slate-400">
                    API: <code className="text-indigo-400">{API_BASE}</code> • Uptime: {stats?.uptimeSeconds || 0}s • {stats?.databaseStatus || 'PostgreSQL'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (token) {
                      fetchStats(token);
                      fetchUsers(token, searchQuery, selectedRole);
                    }
                  }}
                  className="text-xs border-white/10 hover:bg-white/5 text-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grade de Indicadores (KPI Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total de Utilizadores */}
            <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-400">Total de Utilizadores</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white tracking-tight">{total}</div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeCount} utilizadores ativos ({activePercent}%)
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge variant="outline" className="text-[11px] bg-red-500/10 text-red-300 border-red-500/30">
                    {roleCounts.admin} Admins
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-300 border-amber-500/30">
                    {roleCounts.instructor} Profs
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                    {roleCounts.user} Alunos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Prisma & PostgreSQL */}
            <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-400">Banco de Dados & ORM</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white tracking-tight">Prisma + Postgres</div>
                <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Schema: <code className="text-slate-300">nest_aula</code>
                </p>
                <div className="mt-3 bg-slate-950/80 rounded-lg p-2 border border-white/5 flex items-center justify-between">
                  <code className="text-xs text-cyan-300 font-mono">docker compose up -d</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 text-slate-400 hover:text-white"
                    onClick={copyDockerCommand}
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Memória do Backend */}
            <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-400">Memória do Backend</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {stats?.memoryUsage?.heapUsedMb || 0}{' '}
                  <span className="text-sm font-normal text-slate-400">MB Heap</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  RSS: {stats?.memoryUsage?.rssMb || 0} MB
                </p>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((stats?.memoryUsage?.heapUsedMb || 40) / 250) * 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Observabilidade */}
            <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-400">Observabilidade</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-white tracking-tight">@nestjs/terminus</div>
                <p className="text-xs text-slate-400 mt-1">
                  Verificações de Heap, RSS e probes
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    Liveness Probe OK
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-slate-800 text-slate-300 border-white/10">
                    Heap: 250MB
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Utilizadores */}
          <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
              <div>
                <CardTitle className="text-lg font-bold text-white">Gestão de Utilizadores</CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Gerencie contas, filtre por papéis RBAC e atualize permissões em tempo real.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Pesquisa */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por nome ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-56 bg-slate-950/70 border-white/10 text-xs text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Filtro de Papel */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-slate-950/70 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Todos os Papéis</option>
                  <option value="admin">Apenas Admins</option>
                  <option value="instructor">Apenas Professores</option>
                  <option value="user">Apenas Alunos</option>
                </select>

                {/* Modal de Criar Utilizador */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20">
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      Novo Utilizador
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold">Criar Novo Utilizador</DialogTitle>
                      <DialogDescription className="text-slate-400 text-xs">
                        O utilizador será registado no sistema com senha criptografada via bcrypt.
                      </DialogDescription>
                    </DialogHeader>

                    {modalError && (
                      <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                        {modalError}
                      </div>
                    )}

                    <form onSubmit={handleCreateUser} className="space-y-3.5 py-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">Nome Completo</label>
                        <Input
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Ex: João Ferreira"
                          className="bg-slate-950/70 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">Email Único</label>
                        <Input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Ex: joao@aula.com"
                          className="bg-slate-950/70 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">Palavra-passe (Mínimo 6)</label>
                        <Input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-slate-950/70 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">Papel no Sistema (Role)</label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as any)}
                          className="w-full bg-slate-950/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                          <option value="user">Aluno (Role: user)</option>
                          <option value="instructor">Professor (Role: instructor)</option>
                          <option value="admin">Administrador (Role: admin)</option>
                        </select>
                      </div>

                      <DialogFooter className="pt-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsModalOpen(false)}
                          className="text-xs text-slate-400"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isCreatingUser}
                          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                        >
                          {isCreatingUser ? 'A criar...' : 'Confirmar Registo'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-xs text-slate-400 uppercase font-semibold">Utilizador</TableHead>
                      <TableHead className="text-xs text-slate-400 uppercase font-semibold">ID</TableHead>
                      <TableHead className="text-xs text-slate-400 uppercase font-semibold">Papel (Role)</TableHead>
                      <TableHead className="text-xs text-slate-400 uppercase font-semibold">Estado</TableHead>
                      <TableHead className="text-xs text-slate-400 uppercase font-semibold">Registo</TableHead>
                      <TableHead className="text-xs text-slate-400 uppercase font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                          Nenhum utilizador encontrado com os filtros aplicados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => {
                        const initials = u.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.02]">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm text-white">{u.name}</div>
                                  <div className="text-xs text-slate-400">{u.email}</div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="font-mono text-xs text-slate-500">{u.id}</TableCell>

                            <TableCell>
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleRoleChange(
                                    u.id,
                                    e.target.value as 'admin' | 'instructor' | 'user',
                                  )
                                }
                                className="bg-slate-950 border border-white/10 rounded-md px-2 py-1 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="user">🎓 Aluno (user)</option>
                                <option value="instructor">👨‍🏫 Professor (instructor)</option>
                                <option value="admin">👑 Administrador (admin)</option>
                              </select>
                            </TableCell>

                            <TableCell>
                              <button
                                onClick={() => handleToggleStatus(u.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                                  u.isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-slate-800/60 text-slate-500 border-white/10 hover:bg-slate-800'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    u.isActive ? 'bg-emerald-400' : 'bg-slate-500'
                                  }`}
                                />
                                {u.isActive ? 'Ativo' : 'Inativo'}
                              </button>
                            </TableCell>

                            <TableCell className="text-xs text-slate-400">
                              {new Date(u.createdAt).toLocaleDateString('pt-PT', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                disabled={u.id === currentUser.id}
                                className="w-8 h-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                title="Eliminar utilizador"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      )}
    </div>
  );
}
