import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

interface Conservancy {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
  link: string;
}

interface ConservancyCardProps {
  conservancy: Conservancy;
}

const ConservancyCard: React.FC<ConservancyCardProps> = ({ conservancy }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="relative overflow-hidden">
        <img
          src={conservancy.image}
          alt={conservancy.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 text-amber-600 mr-1" />
          <span className="text-sm text-gray-500">Kunene Region</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-amber-600 transition-colors duration-300">
          {conservancy.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {conservancy.description}
        </p>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {conservancy.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <Link
          to={conservancy.link}
          className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors duration-300 group/link"
        >
          Explore {conservancy.name.split(' ')[0]}
          <ArrowRight className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default ConservancyCard;