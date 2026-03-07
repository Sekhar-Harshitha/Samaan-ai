import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Terminal,
  Cpu,
  Activity,
  ShieldAlert,
  FileCode,
  Zap,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const sections = [
    {
      title: 'AI COMMAND',
      items: [
        { name: 'COMMAND', path: '/', icon: <Terminal size={20} /> },
        { name: 'INGESTION', path: '/upload', icon: <Cpu size={20} /> },
        { name: 'MONITOR', path: '/dashboard', icon: <Activity size={20} /> },
        { name: 'COMPARISON', path: '/comparison', icon: <BarChart3 size={20} /> },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'MITIGATION', path: '/remediation', icon: <Zap size={20} /> },
        { name: 'MANIFEST', path: '/report', icon: <FileCode size={20} /> },
      ]
    },
    {
      title: 'EXPLAINABILITY',
      items: [
        { name: 'AI REASONING', path: '/dashboard', icon: <Activity size={20} /> }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div className="ai-pulse-container">
          <div className="ai-pulse-ring"></div>
          <div className="ai-pulse-dot"></div>
        </div>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.15em', margin: 0 }}>SAMAAN_AI</h2>
          <div style={{ height: '2px', width: '40px', background: 'var(--accent-primary)', marginTop: '0.3rem', boxShadow: '0 0 10px var(--accent-glow)' }}></div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section, sIdx) => (
          <div key={section.title} style={{ marginBottom: '1.5rem' }}>
            <div className="sidebar-section-header">{section.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {section.items.map((item, iIdx) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sIdx * 3 + iIdx) * 0.05 }}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontFamily: 'JetBrains Mono' }}>CORE_V.2.0.1</p>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                style={{ height: '4px', flex: 1, background: 'var(--accent-primary)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
