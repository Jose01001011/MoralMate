import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Star, Wifi, Coffee, Car, Tent, Binary as Binoculars, Camera, Mountain } from 'lucide-react';

const OtjiuWestPage = () => {
  const amenities = [
    { icon: Tent, name: 'Camping Sites', description: 'Spacious camping areas with stunning views' },
    { icon: Coffee, name: 'Braai Areas', description: 'Traditional braai facilities for authentic cooking' },
    { icon: Car, name: 'Parking', description: 'Secure parking for all vehicles' },
    { icon: Wifi, name: 'Solar Lighting', description: 'Eco-friendly solar-powered lighting systems' },
    { icon: Binoculars, name: 'Shower & Toilets', description: 'Clean ablution facilities with hot water' },
    { icon: Camera, name: 'Campsite Layout', description: 'Well-planned sites with privacy and views' },
  ];

  const activities = [
    {
      title: 'Self-Drive Tours',
      description: 'Explore the conservancy at your own pace with detailed route maps and wildlife spotting guides provided by our community guides.',
      image: 'https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '3-4 hours',
      difficulty: 'Easy'
    },
    {
      title: 'Community Visits',
      description: 'Visit local Himba communities and learn about traditional customs, daily life, and their harmonious relationship with the desert environment.',
      image: 'https://images.pexels.com/photos/1612461/pexels-photo-1612461.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '2-3 hours',
      difficulty: 'Easy'
    },
    {
      title: 'Traditional Dances',
      description: 'Experience authentic Himba traditional dances and ceremonies, learning about their cultural significance and history.',
      image: 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '2 hours',
      difficulty: 'Easy'
    },
    {
      title: 'Wildlife Spotting',
      description: 'Discover desert-adapted wildlife including elephants, lions, giraffes, and various antelope species in their natural habitat.',
      image: 'https://images.pexels.com/photos/1061141/pexels-photo-1061141.jpeg?auto=compress&cs=tinysrgb&w=600',
      duration: '3-5 hours',
      difficulty: 'Easy'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Conservancies
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=1920)'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Otjiu-West Conservancy Campsite
            </h1>
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-xl">Kunene Region, Namibia</span>
            </div>
            <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto">
              Community-led authentic camping experiences and cultural immersion
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">About Otjiu-West Conservancy</h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p className="mb-4">
                  Otjiu-West Conservancy represents one of Namibia's most successful community-based conservation initiatives. 
                  Established through partnerships between local communities and conservation organizations, this pristine 
                  wilderness area spans over 2,500 square kilometers of diverse desert landscapes.
                </p>
                <p className="mb-4">
                  Our campsite offers visitors an authentic Namibian experience while supporting local communities through 
                  sustainable tourism. Here, you'll encounter desert-adapted wildlife, experience traditional Himba culture, 
                  and witness some of the most spectacular sunsets and starlit skies on the continent.
                </p>
                <p>
                  The conservancy is home to elephants, lions, giraffes, various antelope species, and over 200 bird species. 
                  Our community guides share generations of knowledge about desert survival, traditional medicine, 
                  and the delicate balance between human communities and wildlife.
                </p>
              </div>
            </section>

            {/* Activities Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Activities & Experiences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{activity.title}</h3>
                      <p className="text-gray-600 mb-4">{activity.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {activity.duration}
                        </div>
                        <div className="flex items-center">
                          <Mountain className="h-4 w-4 mr-1" />
                          {activity.difficulty}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Campsite Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{amenity.name}</h3>
                      <p className="text-gray-600 text-sm">{amenity.description}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Gallery Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <img
                  src="https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Wildlife"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <img
                  src="https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Landscape"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <img
                  src="https://images.pexels.com/photos/1612461/pexels-photo-1612461.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Culture"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <img
                  src="https://images.pexels.com/photos/1061141/pexels-photo-1061141.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Night Sky"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <img
                  src="https://images.pexels.com/photos/1670770/pexels-photo-1670770.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Sunset"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
                <img
                  src="https://images.pexels.com/photos/631292/pexels-photo-631292.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Desert"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            </section>

            {/* Map Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Location & Map</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-gray-600">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Interactive Map</p>
                    <p className="text-sm">Google Maps integration placeholder</p>
                    <p className="text-xs mt-2">GPS: -19.5892° S, 13.2536° E</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Getting There</h4>
                    <p>From Windhoek: 650km via C35 and C43</p>
                    <p>From Opuwo: 120km via C41</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Nearest Services</h4>
                    <p>Fuel: Opuwo (120km)</p>
                    <p>Medical: Opuwo Hospital (120km)</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Booking Card */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Plan Your Visit</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Camping per person/night</span>
                    <span className="text-2xl font-bold text-amber-600">N$150</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vehicle entry</span>
                    <span className="text-lg font-semibold text-gray-800">N$50</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-600">Max 8 people per site</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <Clock className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm text-gray-600">Check-in: 14:00 | Check-out: 10:00</span>
                    </div>
                  </div>
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105">
                    Book Your Stay
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Us</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="font-semibold">+264 65 274 500</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="font-semibold">info@otjiuwest.com</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Location</p>
                    <p className="font-semibold">Kunene Region, Namibia</p>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      GPS Coordinates: -19.5892° S, 13.2536° E
                    </p>
                  </div>
                </div>
                <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors duration-300">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtjiuWestPage;