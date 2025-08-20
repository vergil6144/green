'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import y from '../social-credit/page'
import { getTotalPoints } from '../score';
import Image from "next/image"
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { statsDB } from "@/lib/db";

interface Item {
  id: string;
  name: string;
  description: string;
  price: number; // in credits
  category: 'eco' | 'lifestyle' | 'tech' | 'food';
  icon: string;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [carbonCredits, setCarbonCredits] = useState(120); // local display; real in stats

  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        await statsDB.initIfNeeded();
        const s = await statsDB.get(user.id);
        setCarbonCredits(s.credits ?? 0);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user]);
  const [items] = useState<Item[]>([
    {
      id: '1',
      name: 'Reusable Water Bottle',
      description: 'Durable stainless steel bottle to reduce plastic waste.',
      price: 50,
      category: 'eco',
      icon: 'https://pngimg.com/uploads/sport_bottle/sport_bottle_PNG6.png'
    },
    {
      id: '2',
      name: 'Organic Cotton Tote Bag',
      description: 'Eco-friendly shopping bag for everyday use.',
      price: 30,
      category: 'lifestyle',
      icon: 'https://png.pngtree.com/png-vector/20230906/ourmid/pngtree-white-tote-bag-mockup-realistic-with-shadow-png-image_10002376.png'
    },
    {
      id: '3',
      name: 'Solar Charger',
      description: 'Portable solar panel charger for phones and small devices.',
      price: 200,
      category: 'tech',
      icon: 'https://png.pngtree.com/png-vector/20240827/ourmid/pngtree-blue-solar-charger-stand-with-panel-png-image_13643357.png'
    },
    {
      id: '4',
      name: 'Local Organic Veggie Box',
      description: 'Weekly delivery of fresh, locally sourced vegetables.',
      price: 100,
      category: 'food',
      icon: 'https://www.freshfruitandvegshop.com/wp-content/uploads/2023/05/fruit_veg_box_product_img.png'
    }
  ]);

  const getCategoryColor = (category: Item['category']) => {
    const colors = {
      eco: 'bg-green-900/30 text-green-400 border-green-600',
      lifestyle: 'bg-blue-900/30 text-blue-400 border-blue-600',
      tech: 'bg-purple-900/30 text-purple-400 border-purple-600',
      food: 'bg-yellow-900/30 text-yellow-400 border-yellow-600'
    };
    return colors[category];
  };

  const handleBuy = async (item: Item) => {
    if (!user) {
      alert('Please sign in to purchase');
      return;
    }
    if (carbonCredits < item.price) return;
    try {
      await statsDB.initIfNeeded();
      await statsDB.addPurchase(user.id, { id: item.id, name: item.name, price: item.price });
      await statsDB.addCredits(user.id, -item.price);
      setCarbonCredits((prev) => prev - item.price);
      alert(`You purchased: ${item.name}`);
    } catch (e) {
      console.error(e);
      alert('Failed to record purchase');
    }
  };
  const points = getTotalPoints()
  return (
    <div>
                  <Navigation/>

  <div className="min-h-screen bg-transparent text-white p-4">

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-green-400 mb-4 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-green-400 mb-2 drop-shadow-lg ml-0 ht">
            Marketplace
          </h1>
          <p className="text-lg text-gray-300">
            Spend your carbon credits on eco-friendly products and services
          </p>
        </div>

        {/* Credit Balance */}
        <div className="glass-card border border-green-500 p-6 mb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-green-400 mb-2 drop-shadow-lg">
              {points}
            </div>
            <div className="text-lg text-gray-300">Carbon Credits Available</div>
          </div>
        </div>

        {/* Items Grid */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-6">Available Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const canAfford = carbonCredits >= item.price;
              return (
                <div
                  key={item.id}
                  className="glass-card border border-gray-700 p-6 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-center">
                    {/* <div className="text-4xl mb-3">{item.icon}</div> */}
                    <Image className='mx-auto mb-5'
                      src = {item.icon}
                      alt = {item.id}
                      width={40}
                      height={40}
                      style={{width:'6.5rem',height:'6.5rem'}}
                      unoptimized
                    />
                    <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                    <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-green-400">
                        {item.price} cr
                      </span>
                    </div>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg ${
                        canAfford
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Buy Now' : 'Not Enough Credits'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
