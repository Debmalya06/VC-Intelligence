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
  Building2,
  Play,
  MonitorPlay
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
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      label: 'Saved Companies',
      value: savedCount.toString(),
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Target,
      label: 'Custom Lists',
      value: listsCount.toString(),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Zap,
      label: 'AI Enrichment',
      value: 'Ready',
      color: 'from-lime-500 to-lime-600'
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-emerald-950/20 dark:from-background dark:via-background dark:to-emerald-950/10 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-16 pb-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/30 border border-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800">
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

            {/* Demo Video Section */}
            <div className="max-w-4xl mx-auto">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                
                {/* Video container */}
                <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                      <MonitorPlay className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-medium text-white">Platform Demo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                  
                  {/* Video wrapper with 16:9 aspect ratio */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    {/* Decorative grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
                    
                    {/* Demo content preview */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                      {/* Animated play button */}
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 cursor-pointer hover:bg-emerald-400 hover:scale-105 transition-all">
                          <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">Watch Platform Demo</h3>
                      <p className="text-gray-400 text-center max-w-md">
                        See how to discover companies, run AI enrichment, and organize your deal pipeline
                      </p>
                      
                      {/* Feature highlights */}
                      <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                          AI Enrichment
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                          Smart Filters
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400">
                          Export Data
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Caption */}
                  <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-gray-500">2:45</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Quick walkthrough of key features
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                    className={`group relative p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-500 ${
                      animateStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-full h-full text-white" />
                      </div>
                      <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-4xl font-bold text-white">{stat.value}</p>
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
                    className="group p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 p-3 mb-4 group-hover:bg-emerald-500 transition-colors">
                      <Icon className="w-full h-full text-emerald-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="px-4 md:px-6 lg:px-8 py-20 bg-gradient-to-r from-emerald-950/10 to-teal-950/10 border-y border-border">
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
                  <div className="absolute -left-4 -top-4 text-6xl font-bold text-emerald-500/20">{step.num}</div>
                  <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all">
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-4 md:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to discover your next investment?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Start exploring our comprehensive company database and enriched insights today
            </p>
            <Link href="/dashboard/companies">
              <button className="px-10 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 inline-flex items-center gap-2 group">
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
