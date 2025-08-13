'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Action {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'environmental' | 'social' | 'economic' | 'health';
  icon: string;
  proofRequired: boolean;
}

interface Submission {
  id: string;
  actionId: string;
  actionTitle: string;
  proofImage: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  points: number;
}

export default function SocialCreditPage() {
  const [actions] = useState<Action[]>([
    {
      id: '1',
      title: 'Pick up trash',
      description: 'Collect and properly dispose of litter in your community',
      points: 25,
      category: 'environmental',
      icon: '🗑️',
      proofRequired: true
    },
    {
      id: '2',
      title: 'Plant a tree',
      description: 'Plant and care for a new tree in your area',
      points: 100,
      category: 'environmental',
      icon: '🌳',
      proofRequired: true
    },
    {
      id: '3',
      title: 'Volunteer at community event',
      description: 'Participate in local community service activities',
      points: 75,
      category: 'social',
      icon: '🤝',
      proofRequired: true
    },
    {
      id: '4',
      title: 'Use public transportation',
      description: 'Take bus, train, or bike instead of driving',
      points: 15,
      category: 'environmental',
      icon: '🚌',
      proofRequired: true
    },
    {
      id: '5',
      title: 'Support local business',
      description: 'Purchase from small, local shops and restaurants',
      points: 20,
      category: 'economic',
      icon: '🏪',
      proofRequired: true
    },
    {
      id: '6',
      title: 'Reduce energy usage',
      description: 'Turn off lights and unplug devices when not in use',
      points: 10,
      category: 'environmental',
      icon: '💡',
      proofRequired: true
    }
  ]);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPoints = submissions.reduce((sum, sub) => 
    sub.status === 'approved' ? sum + sub.points : sum, 0
  );

  const getCategoryColor = (category: Action['category']) => {
    const colors = {
      environmental: 'bg-green-900/30 text-green-400 border-green-600',
      social: 'bg-blue-900/30 text-blue-400 border-blue-600',
      economic: 'bg-purple-900/30 text-purple-400 border-purple-600',
      health: 'bg-red-900/30 text-red-400 border-red-600'
    };
    return colors[category];
  };

  const getStatusColor = (status: Submission['status']) => {
    const colors = {
      pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
      approved: 'bg-green-900/30 text-green-400 border-green-600',
      rejected: 'bg-red-900/30 text-red-400 border-red-600'
    };
    return colors[status];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProofImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitAction = async () => {
    if (!selectedAction || !description) return;
    
    setIsSubmitting(true);
    
    // Simulate backend submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newSubmission: Submission = {
      id: Date.now().toString(),
      actionId: selectedAction.id,
      actionTitle: selectedAction.title,
      proofImage: proofImage || '',
      description,
      status: 'pending',
      submittedAt: new Date(),
      points: selectedAction.points
    };
    
    setSubmissions([newSubmission, ...submissions]);
    setSelectedAction(null);
    setProofImage(null);
    setDescription('');
    setIsSubmitting(false);
  };

  const openSubmissionModal = (action: Action) => {
    setSelectedAction(action);
    setProofImage(null);
    setDescription('');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-gray-300 hover:text-green-400 mb-4 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
          </Link>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">🏆 Social Credit System</h1>
            <p className="text-lg text-gray-300">Complete actions and submit proof to earn social credit points</p>
          </div>

        {/* Score Display */}
        <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-400 mb-2 drop-shadow-lg">{totalPoints}</div>
            <div className="text-lg text-gray-300">Total Points Earned</div>
            <div className="text-sm text-gray-400 mt-2">
              {submissions.filter(s => s.status === 'approved').length} actions verified
            </div>
          </div>
        </div>

        {/* Available Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Available Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action) => (
              <div
                key={action.id}
                className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl hover:border-gray-600 cursor-pointer"
                onClick={() => openSubmissionModal(action)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(action.category)}`}>
                      {action.category.charAt(0).toUpperCase() + action.category.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-green-400">
                      +{action.points} pts
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-yellow-400">
                    📸 Proof required
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Recent Submissions</h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                        {submission.proofImage ? (
                          <img 
                            src={submission.proofImage} 
                            alt="Proof" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">📷</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{submission.actionTitle}</h3>
                        <p className="text-gray-400 text-sm">{submission.description}</p>
                        <p className="text-gray-500 text-xs">
                          {submission.submittedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(submission.status)}`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                      <div className="text-green-400 font-bold mt-1">+{submission.points} pts</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Modal */}
        {selectedAction && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Submit Proof</h2>
                <button
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{selectedAction.icon}</div>
                <h3 className="text-lg font-semibold text-white">{selectedAction.title}</h3>
                <p className="text-gray-300 text-sm">{selectedAction.description}</p>
                <div className="text-green-400 font-bold mt-2">+{selectedAction.points} points</div>
              </div>

              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Upload Proof Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                />
                {proofImage && (
                  <div className="mt-2">
                    <img 
                      src={proofImage} 
                      alt="Proof" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you did..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={submitAction}
                disabled={isSubmitting || !proofImage || !description.trim()}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
