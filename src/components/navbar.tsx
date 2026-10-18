'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  GraduationCap,
  Home,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Painel Admin', href: '/admin', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">NestJS Admin</span>
              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-medium">
                :3001
              </Badge>
            </div>
          </div>
        </Link>

        {/* Links de Navegação Interna */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 border border-white/5 p-1 rounded-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}

          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 hover:text-white hover:bg-cyan-500/10 transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Portal Aluno (:3002)</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </nav>

        {/* Links Externos (Scalar, Swagger, Health) */}
        <div className="flex items-center gap-2.5">
          <a
            href="http://localhost:3000/reference"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
          >
            <span>📖 Scalar Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="http://localhost:3000/health"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Health</span>
          </a>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backend :3000
          </div>
        </div>
      </div>
    </header>
  );
}
