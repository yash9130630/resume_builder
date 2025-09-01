import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { FileText, Zap, Download, Users, ArrowRight, Star, CheckCircle } from "lucide-react";
import { templates, mockUser } from "../mockData";

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Preview",
      description: "See your resume update instantly as you type"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "PDF Export",
      description: "Download professional PDFs ready for job applications"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multiple Templates",
      description: "Choose from modern, classic, and creative designs"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "AI Optimization",
      description: "Optimize existing resumes with AI for better ATS compatibility"
    }
  ];

  const handleTemplateSelect = (templateId) => {
    navigate(`/editor/${templateId}`);
  };

  const handleStartBuilding = () => {
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ResumeBuilder</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {mockUser.name}</span>
            <Button variant="outline" size="sm">My Resumes</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            <span>Professional Resume Builder</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Build Your Perfect Resume in
            <span className="text-blue-600 block">Minutes, Not Hours</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create professional, ATS-friendly resumes with our intuitive drag-and-drop editor. 
            Choose from multiple templates and export as PDF instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={handleStartBuilding}
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 text-lg border-2 hover:bg-gray-50 transition-all duration-300"
              onClick={() => navigate('/optimize')}
            >
              <Zap className="mr-2 h-5 w-5" />
              AI Optimize Resume
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Template</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select from our professionally designed templates, each optimized for different industries and career levels.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center gap-2 mb-8">
            {["all", "modern", "classic", "creative"].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize transition-all duration-300"
              >
                {category === "all" ? "All Templates" : category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-200"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader className="p-0">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </CardDescription>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                  >
                    Use Template
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ResumeBuilder?</h2>
              <p className="text-gray-600">Built for modern job seekers who demand excellence</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "ATS-Optimized",
                  description: "All templates are designed to pass Applicant Tracking Systems",
                  icon: <CheckCircle className="h-8 w-8 text-green-600" />
                },
                {
                  title: "Easy Editing",
                  description: "Intuitive interface with real-time preview and drag-and-drop",
                  icon: <Zap className="h-8 w-8 text-yellow-600" />
                },
                {
                  title: "Professional Output",
                  description: "High-quality PDFs ready for any job application",
                  icon: <Download className="h-8 w-8 text-blue-600" />
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">ResumeBuilder</span>
          </div>
          <p className="text-gray-400 mb-6">Build your career with confidence</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleStartBuilding}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-gray-900"
              onClick={() => navigate('/optimize')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Try AI Optimizer
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;