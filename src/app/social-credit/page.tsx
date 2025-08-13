'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  category: 'environmental' | 'social' | 'economic' | 'health';
}

export default function SocialCreditPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Use public transportation',
      description: 'Take bus, train, or bike instead of driving alone',
      points: 50,
      completed: false,
      category: 'environmental'
    },
    {
      id: '2',
      title: 'Volunteer at local community center',
      description: 'Help organize events or assist with programs',
      points: 75,
      completed: false,
      category: 'social'
    },
    {
      id: '3',
      title: 'Support local businesses',
      description: 'Purchase from small, local shops and restaurants',
      points: 30,
      completed: false,
      category: 'economic'
    },
    {
      id: '4',
      title: 'Reduce energy consumption',
      description: 'Turn off lights and unplug devices when not in use',
      points: 40,
      completed: false,
      category: 'environmental'
    },
    {
      id: '5',
      title: 'Participate in health screening',
      description: 'Get regular check-ups and health assessments',
      points: 60,
      completed: false,
      category: 'health'
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    points: 0,
    category: 'environmental' as Task['category']
  });

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.description.trim() && newTask.points > 0) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        completed: false
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', points: 0, category: 'environmental' });
    }
  };

  const totalPoints = tasks.reduce((sum, task) => sum + (task.completed ? task.points : 0), 0);
  const totalPossiblePoints = tasks.reduce((sum, task) => sum + task.points, 0);

  const getCategoryColor = (category: Task['category']) => {
    const colors = {
      environmental: 'bg-green-100 text-green-800 border-green-200',
      social: 'bg-blue-100 text-blue-800 border-blue-200',
      economic: 'bg-purple-100 text-purple-800 border-purple-200',
      health: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Social Credit System</h1>
          <p className="text-lg text-gray-600">Complete tasks to earn social credit points</p>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-600 mb-2">{totalPoints}</div>
            <div className="text-lg text-gray-600">Total Points Earned</div>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(totalPoints / totalPossiblePoints) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {totalPoints} / {totalPossiblePoints} points
            </div>
          </div>
        </div>

        {/* Add New Task */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Points"
              value={newTask.points}
              onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value) || 0})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({...newTask, category: e.target.value as Task['category']})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="environmental">Environmental</option>
              <option value="social">Social</option>
              <option value="economic">Economic</option>
              <option value="health">Health</option>
            </select>
          </div>
          <button
            onClick={addTask}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
          >
            Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl ${
                task.completed ? 'ring-2 ring-green-200 bg-green-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <h3 className={`text-lg font-semibold ${
                      task.completed ? 'text-green-700 line-through' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                  </div>
                  <p className={`text-gray-600 mb-3 ${
                    task.completed ? 'text-green-600' : ''
                  }`}>
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(task.category)}`}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      +{task.points} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600">Add some tasks to get started with earning social credit points!</p>
          </div>
        )}
      </div>
    </div>
  );
}
