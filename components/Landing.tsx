"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaBrain, FaLightbulb, FaShare, FaDownload, FaSignOutAlt } from "react-icons/fa";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Landing({ onStartClick }: { onStartClick?: () => void }) {
  const { data: session } = useSession();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const features = [
    {
      icon: FaBrain,
      title: "AI-Powered Generation",
      description: "Turn any topic into a structured flowchart using advanced AI in seconds.",
    },
    {
      icon: FaLightbulb,
      title: "Interactive Expansion",
      description: "Drill down into any node to explore details and create hierarchical flows.",
    },
    {
      icon: FaShare,
      title: "Easy Export",
      description: "Download your flowcharts as PNG or PDF for presentations and sharing.",
    },
    {
      icon: FaDownload,
      title: "Export & Share",
      description: "Save your work and share interactive flowcharts with your team instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            MindSphere
          </motion.div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span>{session.user.name}</span>
              </div>
            )}
            {session?.user ? (
              <>
                <button
                  onClick={onStartClick}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all"
                >
                  Launch App
                </button>
                <button
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
                >
                  <FaSignOutAlt size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative pt-32 pb-20 px-4 md:px-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Animated badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ✨ Transform Ideas into Visual Flows
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Turn Complex Topics into{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Visual Flowcharts
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            MindSphere uses AI to instantly generate interactive, expandable flowcharts from any topic. Visualize complexity, explore details, and share insights with your team.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <button
              onClick={() => {
                if (session?.user && onStartClick) {
                  onStartClick();
                } else if (!session?.user) {
                  signIn("google");
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              {session?.user ? "Start Creating" : "Get Started"}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/80 hover:bg-white border-2 border-slate-200 text-slate-900 rounded-full font-semibold text-lg transition-all shadow-lg">
              Watch Demo
            </button>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="aspect-video bg-gradient-to-br from-slate-200 via-blue-100 to-indigo-100 flex items-center justify-center border border-slate-300/50">
              <div className="text-center">
                <FaBrain className="mx-auto mb-4 text-4xl text-blue-600" />
                <p className="text-slate-600 font-medium">Interactive Flowchart Preview</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative py-24 px-4 md:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to create, expand, and share beautiful flowcharts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group p-8 bg-white rounded-2xl border border-slate-200/50 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative py-24 px-4 md:px-6 bg-white/50"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">
              Simple steps to create amazing flowcharts in seconds.
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Enter Your Topic",
                description: "Type any topic, concept, or idea you want to visualize.",
              },
              {
                step: 2,
                title: "AI Generates Flowchart",
                description: "Our AI instantly creates a structured, hierarchical flowchart.",
              },
              {
                step: 3,
                title: "Explore & Expand",
                description: "Click on any node to expand and dive deeper into details.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white font-bold text-lg">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-lg text-slate-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="relative py-24 px-4 md:px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Ready to Visualize Your Ideas?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands of creators using MindSphere to turn complex topics into beautiful flowcharts.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <button
              onClick={() => {
                if (session?.user && onStartClick) {
                  onStartClick();
                } else if (!session?.user) {
                  signIn("google");
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              Start Creating Now
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/50 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center text-slate-600">
          <p>© 2025 MindSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
