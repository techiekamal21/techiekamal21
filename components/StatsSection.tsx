import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { GitHubRepo } from '../types';

interface StatsSectionProps {
  repos: GitHubRepo[];
}

const COLORS = ['#58a6ff', '#238636', '#8957e5', '#f1e05a', '#f55385'];

export const StatsSection: React.FC<StatsSectionProps> = ({ repos }) => {
  const languageData = useMemo(() => {
    const langs: Record<string, number> = {};
    repos.forEach(repo => {
      if (repo.language) {
        langs[repo.language] = (langs[repo.language] || 0) + 1;
      }
    });
    return Object.entries(langs)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [repos]);

  const starsData = useMemo(() => {
    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map(repo => ({
        name: repo.name.length > 10 ? repo.name.substring(0, 10) + '...' : repo.name,
        stars: repo.stargazers_count
      }));
  }, [repos]);

  if (repos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <div className="bg-github-card border border-github-border rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-github-text mb-4 border-b border-github-border pb-2">Top Languages</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9' }}
                itemStyle={{ color: '#c9d1d9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {languageData.map((entry, index) => (
            <div key={entry.name} className="flex items-center text-sm text-github-secondary">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              {entry.name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-github-card border border-github-border rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-github-text mb-4 border-b border-github-border pb-2">Most Starred Repos</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={starsData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{ fill: '#8b949e', fontSize: 12 }} 
                interval={0}
              />
              <Tooltip 
                cursor={{fill: '#30363d', opacity: 0.4}}
                contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9' }}
              />
              <Bar dataKey="stars" fill="#58a6ff" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};