import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Leaf, Camera, Mountain } from 'lucide-react';
import ConservancyCard from '../components/ConservancyCard';

const LandingPage = () => {
  const conservancies = [
    {
      id: 'otjiu-west',
      name: 'Otjiu-West Conservancy',
      description: 'A community-led oasis offering authentic camping experiences and cultural immersion in northwest Namibia.',
      image: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Wildlife Viewing', 'Community Tourism', 'Desert Landscapes', 'Camping'],
      link: '/otjiu-west'
    },
    {
      id: 'purros',
      name: 'Purros Conservancy',
      description: 'Famous for desert-adapted elephants and ancient rock art sites, offering unique wildlife experiences in pristine wilderness.',
      image: 'https://images.pexels.com/photos/631292/pexels-photo-631292.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Desert Elephants', 'Rock Art', 'Cultural Tours', 'Wildlife Photography'],
      link: '/purros'
    },
    {
      id: 'orupembe',
      name: 'Orupembe Conservancy',
      description: 'Remote wilderness conservancy offering exceptional game viewing and traditional Himba cultural experiences.',
      image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Game Viewing', 'Cultural Tours', 'Remote Wilderness', 'Photography'],
      link: '/orupembe'
    },
    {
      id: 'marienfluss',
      name: 'Marienfluss Conservancy',
      description: 'Spectacular mountain and valley landscapes with excellent opportunities for adventure tourism and cultural encounters.',
      image: 'https://images.pexels.com/photos/1666020/pexels-photo-1666020.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Mountain Landscapes', 'Adventure Tourism', 'Cultural Encounters', 'Scenic Drives'],
      link: '/marienfluss'
    },
    {
      id: 'sesfontein',
      name: 'Sesfontein Conservancy',
      description: 'Historic conservancy featuring diverse ecosystems from desert plains to mountain ranges with rich cultural heritage.',
      image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Diverse Ecosystems', 'Historical Sites', 'Mountain Ranges', 'Desert Plains'],
      link: '/sesfontein'
    },
    {
      id: 'anabeb',
      name: 'Anabeb Conservancy',
      description: 'Community-focused conservancy known for traditional crafts, guided nature walks, and authentic cultural workshops.',
      image: 'https://images.pexels.com/photos/2376997/pexels-photo-2376997.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['Traditional Crafts', 'Guided Walks', 'Cultural Workshops', 'Community Tourism'],
      link: '/anabeb'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg?auto=compress&cs=tinysrgb&w=1920)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Explore the Conservancies of
            <span className="text-amber-400 block">Kunene Region</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light max-w-3xl mx-auto leading-relaxed">
            Discover Namibia's pristine beauty through community-run eco-tourism
          </p>
          <Link
            to="#conservancies"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Explore Conservancies
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Kunene Conservancies?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience sustainable tourism that supports local communities while preserving Africa's most spectacular wilderness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors duration-300">
                <Leaf className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Conservation</h3>
              <p className="text-gray-600">Supporting wildlife conservation and habitat protection through community-based initiatives</p>
            </div>

            <div className="text-center group">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors duration-300">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600">Empowering local communities through sustainable tourism and cultural exchange</p>
            </div>

            <div className="text-center group">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors duration-300">
                <Camera className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Adventure</h3>
              <p className="text-gray-600">Unique wildlife encounters and breathtaking landscapes for unforgettable experiences</p>
            </div>

            <div className="text-center group">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors duration-300">
                <MapPin className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Location</h3>
              <p className="text-gray-600">Prime locations in Namibia's most pristine and accessible wilderness areas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Conservancies Section */}
      <section id="conservancies" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Conservancies</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each conservancy offers unique experiences while contributing to conservation and community development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {conservancies.map((conservancy) => (
              <ConservancyCard key={conservancy.id} conservancy={conservancy} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Start Your Adventure</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Begin your journey with community-led eco-tourism in Namibia's most pristine conservancies
          </p>
          <Link
            to="/otjiu-west"
            className="inline-block bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Explore Otjiu-West Campsite
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mountain className="h-6 w-6 text-amber-400" />
                <span className="font-bold text-lg">KuneneConserve</span>
              </div>
              <p className="text-gray-300 text-sm">
                Promoting sustainable tourism and conservation in Namibia's Kunene Region through community partnerships.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
                <li><Link to="/#conservancies" className="hover:text-amber-400 transition-colors">Conservancies</Link></li>
                <li><Link to="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Conservancies</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/otjiu-west" className="hover:text-amber-400 transition-colors">Otjiu-West</Link></li>
                <li><Link to="/purros" className="hover:text-amber-400 transition-colors">Purros</Link></li>
                <li><Link to="/orupembe" className="hover:text-amber-400 transition-colors">Orupembe</Link></li>
                <li><Link to="/marienfluss" className="hover:text-amber-400 transition-colors">Marienfluss</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Details</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Email: info@kuneneconserve.com</p>
                <p>Phone: +264 65 274 500</p>
                <p>Kunene Region, Namibia</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 KuneneConserve. All rights reserved. Supporting community-based conservation in Namibia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;