'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Target, 
  ArrowRight, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  Flame,
  Building2
} from 'lucide-react';
import { mockCompanies } from '@/lib/mockData';
import { storage } from '@/lib/storage';

export default function WelcomePage() {
  const [animateStats, setAnimateStats] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [listsCount, setListsCount] = useState(0);

  useEffect(() => {
    setAnimateStats(true);
    setSavedCount(storage.getSavedCompanies().length);
    setListsCount(storage.getLists().length);
  }, []);

  const stats = [
    {
      icon: Building2,
      label: 'Companies Available',
      value: mockCompanies.length.toString(),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TrendingUp,
      label: 'Saved Companies',
      value: savedCount.toString(),
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Target,
      label: 'Custom Lists',
      value: listsCount.toString(),
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Zap,
      label: 'AI Enrichment',
      value: 'Ready',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Enrichment',
      description: 'Automatically gather and enrich company data with intelligent analysis'
    },
    {
      icon: BarChart3,
      title: 'Advanced Insights',
      description: 'Deep dive into company metrics, trends, and growth signals'
    },
    {
      icon: Users,
      title: 'Smart Filters',
      description: 'Filter companies by industry, funding, location, and custom criteria'
    },
    {
      icon: CheckCircle2,
      title: 'Saved Collections',
      description: 'Organize and manage your company lists with custom tags'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 dark:from-background dark:via-background dark:to-blue-950/10 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-16 pb-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-foreground">Welcome back to VC Intelligence</span>
              </div>
            </div>

            {/* Main heading */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-primary/80 mb-6 leading-tight">
                Discover & Enrich Companies
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Advanced intelligence platform for identifying investment opportunities with AI-powered company enrichment and deep insights
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link href="/dashboard/companies">
                <button className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative">Explore Companies</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/dashboard/lists">
                <button className="px-8 py-4 border border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors duration-300 flex items-center gap-2">
                  <span>Create Lists</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-4 md:px-6 lg:px-8 py-16 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`group relative p-6 rounded-2xl bg-white dark:bg-card border border-border dark:border-border hover:shadow-lg transition-all duration-500 ${
                      animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-4 md:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to identify and analyze the most promising companies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-8 rounded-2xl bg-white dark:bg-card border border-border dark:border-border hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 p-3 mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-full h-full text-primary dark:text-blue-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="px-4 md:px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              Get Started in Minutes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  num: '01',
                  title: 'Search Companies',
                  desc: 'Start by searching for companies by name, industry, or location'
                },
                {
                  num: '02',
                  title: 'View Intelligence',
                  desc: 'Access comprehensive company data and AI-enriched insights'
                },
                {
                  num: '03',
                  title: 'Save & Organize',
                  desc: 'Save companies to lists and create custom saved searches'
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-4 -top-4 text-6xl font-bold text-primary/10">{step.num}</div>
                  <div className="relative p-6 rounded-xl bg-white dark:bg-card/50 border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-4 md:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to discover your next investment?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start exploring our comprehensive company database and enriched insights today
            </p>
            <Link href="/dashboard/companies">
              <button className="px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 inline-flex items-center gap-2 group">
                <span>Start Exploring</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
