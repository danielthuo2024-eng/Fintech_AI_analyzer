import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Animated Background Elements */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-15 animate-pulse delay-500"></div>
          
          <div className="relative z-10">
            {/* Logo and Main Heading */}
            <div className="mb-12">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <span className="text-3xl text-white font-bold">MP</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Smart Credit
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                  Powered by AI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Upload your M-Pesa statement and get instant, AI-powered credit assessment. 
                No forms, no waiting—just smart financial insights in seconds.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link 
                to="/upload" 
                className="group relative bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold text-lg px-10 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Analyze Your M-Pesa
                </span>
              </Link>
              
              <Link 
                to="/history" 
                className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-semibold text-lg px-10 py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-indigo-300 hover:bg-white"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View Analysis History
                </span>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center group">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">30s</div>
                <div className="text-gray-600 font-medium">Average Analysis Time</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-teal-600 mb-2 group-hover:scale-110 transition-transform duration-300">95%</div>
                <div className="text-gray-600 font-medium">Accuracy Rate</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
                <div className="text-gray-600 font-medium">Secure & Private</div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-16 animate-bounce">
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center mx-auto">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
              </div>
              <p className="text-gray-500 text-sm mt-2">Scroll to learn more</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get your AI-powered credit assessment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl text-white font-bold">1</span>
                </div>
                <div className="absolute -inset-4 bg-indigo-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Upload Statement</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your M-Pesa statement in PDF or CSV format. We support statements from the M-Pesa app, SMS exports, or bank statements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl text-white font-bold">2</span>
                </div>
                <div className="absolute -inset-4 bg-teal-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI analyzes your transaction patterns, income consistency, spending habits, and financial behavior in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-3xl text-white font-bold">3</span>
                </div>
                <div className="absolute -inset-4 bg-orange-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Get Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive instant credit score, personalized insights, actionable recommendations, and loan eligibility status.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Link 
              to="/upload" 
              className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold text-lg px-12 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Your Analysis Now
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-20 lg:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Why Choose Our AI Analyzer?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionizing credit assessment with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "🚀",
                title: "Lightning Fast",
                description: "Get results in under 30 seconds with our optimized AI algorithms"
              },
              {
                icon: "🎯",
                title: "Highly Accurate",
                description: "95% accuracy rate in predicting creditworthiness based on transaction patterns"
              },
              {
                icon: "🔒",
                title: "Bank-Level Security",
                description: "Your financial data is encrypted and never stored on our servers"
              },
              {
                icon: "💡",
                title: "Smart Insights",
                description: "Get actionable recommendations to improve your financial health"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 text-center shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-teal-500 py-20 lg:py-28">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Your Data is 100% Secure</h2>
            <p className="text-indigo-100 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              We use military-grade encryption and follow strict data privacy protocols. 
              Your financial information is processed securely and deleted immediately after analysis.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-white/90 max-w-2xl mx-auto">
              {[
                { icon: "🔐", text: "End-to-End Encryption" },
                { icon: "🗑️", text: "Automatic Data Deletion" },
                { icon: "🌐", text: "No Personal Data Storage" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center space-x-3 bg-white/10 rounded-xl py-4 px-6 backdrop-blur-sm">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-white/80 text-lg mb-6">Trusted by financial institutions across Kenya</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
                {["SACCOs", "Microfinance", "Digital Lenders", "Financial Advisors"].map((institution, index) => (
                  <div key={index} className="bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm">
                    <span className="text-white font-medium">{institution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Discover Your Credit Potential?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of Kenyans who have transformed their financial journey with AI-powered insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/upload" 
                className="bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold text-lg px-12 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              
              <Link 
                to="/history" 
                className="border-2 border-gray-300 text-gray-700 font-semibold text-lg px-12 py-4 rounded-xl hover:border-indigo-400 hover:bg-gray-50 transition-all duration-300"
              >
                View Demo
              </Link>
            </div>
            
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • Instant results • 100% free analysis
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-teal-400 rounded-lg"></div>
              <span className="text-xl font-bold">M-Pesa AI Analyzer</span>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Empowering financial inclusion through AI-powered credit assessment technology.
            </p>
            
            <div className="flex justify-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            
            <p className="text-gray-500 text-sm mt-8">
              © 2024 M-Pesa AI Analyzer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;