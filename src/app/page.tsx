'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Shield,
  Database,
  ExternalLink,
  BookOpen,
  Layers,
  ArrowRight,
  Server,
  Activity,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 md:p-12 space-y-12 flex-1">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 px-3.5 py-1 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Ecossistema de Aula Prática
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Backend Moderno em <span className="bg-gradient-to-r from-rose-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">NestJS</span> + <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Prisma</span> & Next.js
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Plataforma didática com autenticação dupla (Tokens JWT e Cookies de Sessão), 
            autorização baseada em papéis (RBAC), Prisma ORM com PostgreSQL, documentação interativa com Scalar e observabilidade.
          </p>
        </div>

        {/* Portais Principais (Aluno vs Admin) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card: Portal do Aluno */}
          <Card className="border-indigo-500/30 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-white">Portal do Aluno</CardTitle>
                <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Público
                </Badge>
              </div>
              <CardDescription className="text-slate-400 text-sm">
                Área aberta para alunos iniciarem sessão, criarem conta, assistirem às aulas e testarem as permissões da API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Registo público e Login com Token JWT ou Cookie HttpOnly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Módulos de aula com acompanhamento de progresso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Laboratório prático demonstrando o bloqueio 403 Forbidden
                </li>
              </ul>

              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                className="block pt-2"
              >
                <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-600/20">
                  Aceder ao Portal do Aluno (:3002)
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Card: Painel do Administrador */}
          <Card className="border-purple-500/30 bg-slate-900/60 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/50 transition-all shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-rose-600" />
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold text-white">Painel do Administrador</CardTitle>
                <Badge variant="outline" className="text-[11px] bg-red-500/10 text-red-400 border-red-500/30">
                  Restrito (RBAC)
                </Badge>
              </div>
              <CardDescription className="text-slate-400 text-sm">
                Console administrativa completa para o professor monitorizar utilizadores, métricas e o banco de dados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Total de utilizadores, contas ativas e gráficos de distribuição
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Conexão ativa com PostgreSQL via Prisma ORM
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Gestão completa: Pesquisa, troca de papel e ativação de contas
                </li>
              </ul>

              <Link href="/admin" className="block pt-2">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold">
                  Aceder ao Painel Admin
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recursos Técnicos */}
        <div className="max-w-5xl mx-auto pt-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center mb-6">
            Tecnologias Abordadas no Curso
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="http://localhost:3000/reference"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900 hover:border-purple-500/40 transition-all text-center group"
            >
              <div className="text-purple-400 font-bold text-sm mb-1 group-hover:text-purple-300">
                📖 Scalar Reference
              </div>
              <div className="text-xs text-slate-400">Documentação OpenAPI moderna</div>
            </a>

            <div className="p-4 rounded-xl border border-white/10 bg-slate-900/40 text-center">
              <div className="text-cyan-400 font-bold text-sm mb-1">
                🗄️ Prisma + PostgreSQL
              </div>
              <div className="text-xs text-slate-400">ORM tipado e Docker Compose</div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-slate-900/40 text-center">
              <div className="text-emerald-400 font-bold text-sm mb-1">
                🛡️ Dual Auth & RBAC
              </div>
              <div className="text-xs text-slate-400">JWT Bearer & Cookies HttpOnly</div>
            </div>

            <a
              href="http://localhost:3000/health"
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900 hover:border-emerald-500/40 transition-all text-center group"
            >
              <div className="text-emerald-400 font-bold text-sm mb-1 group-hover:text-emerald-300">
                🩺 Terminus Health
              </div>
              <div className="text-xs text-slate-400">Heap, RSS e Probes de Liveness</div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
