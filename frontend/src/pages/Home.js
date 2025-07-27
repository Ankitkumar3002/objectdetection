import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  Camera, 
  Users, 
  Shield, 
  Zap, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Globe,
  Sparkles,
  Brain,
  Cpu,
  Target,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const heroSlides = [
    {
      title: "AI-Powered Detection",
      subtitle: "Made Simple",
      description: "Advanced facial recognition and body part detection using cutting-edge AI technology.",
      gradient: "from-blue-600 to-purple-700"
    },
    {
      title: "Real-Time Analysis",
      subtitle: "Instant Results",
      description: "Get immediate insights with our high-speed processing and real-time detection capabilities.",
      gradient: "from-purple-600 to-pink-700"
    },
    {
      title: "Enterprise Security",
      subtitle: "Your Data Protected",
      description: "Bank-level security with encrypted processing and complete privacy protection.",
      gradient: "from-green-600 to-blue-700"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Engine',
      description: 'State-of-the-art neural networks with 99.7% accuracy for facial recognition and emotion detection.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: '99.7% Accuracy'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process images in under 100ms with our optimized AI pipeline and edge computing.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      stats: '<100ms Response'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC2 compliant with end-to-end encryption and zero-knowledge architecture.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: 'SOC2 Certified'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Multi-region deployment with 99.99% uptime and unlimited scalability.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: '99.99% Uptime'
    },
    {
      icon: Target,
      title: 'Precision Detection',
      description: 'Advanced pose estimation and facial landmark detection with sub-pixel accuracy.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      stats: 'Sub-pixel Precision'
    },
    {
      icon: Cpu,
      title: 'Smart Processing',
      description: 'Adaptive algorithms that learn and improve with intelligent batch processing.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      stats: 'Self-Learning AI'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechCorp",
      content: "The accuracy and speed of this AI detection platform exceeded our expectations. Integration was seamless.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Product Manager, StartupXYZ",
      content: "Real-time emotion detection helped us improve user engagement by 300%. Game-changing technology!",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Dr. Emily Watson",
      role: "Research Director, AI Labs",
      content: "The most sophisticated facial analysis platform we've tested. Perfect for research applications.",
      rating: 5,
      avatar: "EW"
    }
  ];

  const stats = [
    { number: "10M+", label: "Images Processed", icon: Camera },
    { number: "99.7%", label: "Accuracy Rate", icon: Target },
    { number: "50ms", label: "Avg Response Time", icon: Clock },
    { number: "500+", label: "Happy Customers", icon: Users }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Dynamic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-10 w-24 h-24 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        {/* Hero Content */}
        <div className={`bg-gradient-to-br ${heroSlides[currentSlide].gradient} absolute inset-0 transition-all duration-1000`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className={`text-white text-center w-full transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="mb-8">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-yellow-300 animate-spin" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {heroSlides[currentSlide].title}
                <span className="block text-4xl md:text-6xl mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text">
                  {heroSlides[currentSlide].subtitle}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                {heroSlides[currentSlide].description}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                {user ? (
                  <Link 
                    to="/dashboard" 
                    className="group bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="group bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      to="/detection" 
                      className="group bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                    >
                      <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Live Demo
                    </Link>
                  </>
                )}
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center space-x-3">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Advanced AI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Revolutionary AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of AI detection with our cutting-edge technology stack
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 ${feature.bgColor} hover:scale-105`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className={`${feature.color} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    
                    <div className="text-sm font-semibold text-blue-600 mb-2">
                      {feature.stats}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Learn More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Play className="h-4 w-4 mr-2" />
                Try It Live
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                See AI Detection
                <span className="block text-yellow-300">In Real-Time</span>
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience the power of our AI technology with live camera detection. 
                Watch as our system identifies faces, emotions, and body poses in real-time.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Real-time facial emotion detection',
                  'Advanced pose estimation',
                  'Instant confidence scoring',
                  'Live analytics dashboard'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
              
              <Link 
                to="/detection" 
                className="group bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center"
              >
                <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Launch Live Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-green-400 font-mono text-sm">
                    $ npm start ai-detection<br/>
                    <span className="text-blue-400">→ Initializing AI models...</span><br/>
                    <span className="text-green-400">✓ Camera detection ready</span><br/>
                    <span className="text-yellow-400">⚡ Processing at 30 FPS</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                    <div className="text-2xl font-bold">99.7%</div>
                    <div className="text-sm text-blue-200">Accuracy</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                    <div className="text-2xl font-bold">50ms</div>
                    <div className="text-sm text-blue-200">Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="h-4 w-4 mr-2" />
              Customer Love
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our customers are saying about their experience with our AI platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-8">
            <Award className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <span className="block text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Detection Experience?
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers and businesses already using our platform to build amazing AI-powered applications.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/register" 
                className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
              >
                Start Free Trial Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/detection" 
                className="group bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Try Demo First
              </Link>
            </div>
          )}
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <div className="text-sm text-gray-400">No Setup Required</div>
            </div>
            <div>
              <Shield className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <div className="text-sm text-gray-400">Enterprise Security</div>
            </div>
            <div>
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-gray-400">24/7 Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
