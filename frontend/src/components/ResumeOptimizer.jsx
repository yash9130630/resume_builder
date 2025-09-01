import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Upload, 
  FileText, 
  Zap, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Target,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api/optimize`;

const ResumeOptimizer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    progress: 0,
    message: "Ready to upload",
    status: "idle" // idle, uploading, uploaded, processing, completed, failed
  });
  
  // Form data
  const [formData, setFormData] = useState({
    file: null,
    jobDescription: ""
  });
  
  // Results data
  const [results, setResults] = useState({
    analysis: null,
    optimizedContent: null,
    originalText: ""
  });

  const steps = [
    { number: 1, title: "Upload Resume", description: "Upload your current resume and job description" },
    { number: 2, title: "Analysis", description: "AI analyzes your resume and job requirements" },
    { number: 3, title: "Results", description: "Review optimization suggestions and improvements" },
    { number: 4, title: "Download", description: "Download your optimized resume" }
  ];

  // File upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
    }
  };

  // Submit form for processing
  const handleSubmit = async () => {
    if (!formData.file || !formData.jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload a resume and provide a job description.",
        variant: "destructive"
      });
      return;
    }

    if (formData.jobDescription.trim().length < 50) {
      toast({
        title: "Job Description Too Short",
        description: "Please provide a more detailed job description (at least 50 characters).",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploadStatus({
        progress: 10,
        message: "Uploading resume...",
        status: "uploading"
      });

      const uploadFormData = new FormData();
      uploadFormData.append('file', formData.file);
      uploadFormData.append('job_description', formData.jobDescription);

      const response = await axios.post(`${API}/upload`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { session_id } = response.data;
      setSessionId(session_id);
      
      setUploadStatus({
        progress: 20,
        message: "Upload successful. Starting analysis...",
        status: "uploaded"
      });

      // Move to analysis step and start polling
      setCurrentStep(2);
      startPolling(session_id);

      toast({
        title: "Upload Successful",
        description: "Your resume has been uploaded and analysis is starting.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        progress: 0,
        message: "Upload failed",
        status: "failed"
      });
      
      toast({
        title: "Upload Failed",
        description: error.response?.data?.detail || "Failed to upload resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Poll for status updates
  const startPolling = (id) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await axios.get(`${API}/status/${id}`);
        const { status, progress, message } = statusResponse.data;

        setUploadStatus({
          progress,
          message,
          status
        });

        if (status === 'completed') {
          clearInterval(pollInterval);
          // Fetch results
          const resultsResponse = await axios.get(`${API}/results/${id}`);
          setResults({
            analysis: resultsResponse.data.analysis,
            optimizedContent: resultsResponse.data.optimized_content,
            originalText: "Original resume content loaded..."
          });
          setCurrentStep(3);
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          setUploadStatus({
            progress: 0,
            message: "Processing failed",
            status: "failed"
          });
          
          toast({
            title: "Processing Failed",
            description: message || "Failed to process resume. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(pollInterval);
      }
    }, 2000);

    // Clean up interval after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  // Download optimized resume
  const handleDownload = async (format) => {
    if (!sessionId) return;

    try {
      const response = await axios.get(`${API}/download/${sessionId}?format=${format}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `optimized_resume.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Your optimized resume in ${format.toUpperCase()} format is downloading.`,
      });

      setCurrentStep(4);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Start over
  const handleStartOver = () => {
    setCurrentStep(1);
    setSessionId(null);
    setUploadStatus({
      progress: 0,
      message: "Ready to upload",
      status: "idle"
    });
    setFormData({
      file: null,
      jobDescription: ""
    });
    setResults({
      analysis: null,
      optimizedContent: null,
      originalText: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Builder</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Resume Optimizer</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">AI-Powered</Badge>
            {sessionId && (
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-20 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Resume & Job Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Resume File (PDF or DOCX)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <FileText className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {formData.file ? formData.file.name : "Click to upload your resume"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PDF and DOCX files up to 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                  {formData.file && (
                    <div className="mt-2 flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">File uploaded: {formData.file.name}</span>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Description</label>
                  <Textarea
                    placeholder="Paste the job description here. Include requirements, responsibilities, and desired qualifications for best optimization results..."
                    value={formData.jobDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                    rows={8}
                    className="resize-none"
                  />
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>Minimum 50 characters required</span>
                    <span>{formData.jobDescription.length} characters</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.file || formData.jobDescription.trim().length < 50}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Optimization
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Analysis */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Analyzing Your Resume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={uploadStatus.progress} className="w-full" />
                    <p className="text-lg font-medium text-gray-700">{uploadStatus.message}</p>
                    <p className="text-sm text-gray-500">{uploadStatus.progress}% complete</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      Our AI is analyzing your resume against the job requirements, 
                      identifying optimization opportunities, and preparing ATS-friendly improvements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && results.analysis && (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Optimization Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {results.analysis.analysis?.ats_score || 75}
                      </div>
                      <div className="text-sm text-gray-600">ATS Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {results.analysis.analysis?.keyword_matches?.length || 8}
                      </div>
                      <div className="text-sm text-gray-600">Keywords Matched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {results.analysis.suggestions?.length || 5}
                      </div>
                      <div className="text-sm text-gray-600">Suggestions</div>
                    </div>
                  </div>

                  <Tabs defaultValue="analysis" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="analysis" className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {(results.analysis.analysis?.strengths || []).map((strength, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-700 mb-2">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {(results.analysis.analysis?.weaknesses || []).map((weakness, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-blue-700 mb-2">Missing Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {(results.analysis.analysis?.missing_keywords || []).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-blue-600">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="suggestions" className="space-y-4">
                      {(results.analysis.suggestions || []).map((suggestion, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {suggestion.priority} priority
                            </Badge>
                            <Badge variant="outline">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <h5 className="font-semibold mb-1">{suggestion.suggestion}</h5>
                          <p className="text-sm text-gray-600">{suggestion.reason}</p>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="preview" className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Optimized Resume Preview</h4>
                        <div className="bg-white rounded p-4 shadow-sm">
                          {results.optimizedContent && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xl font-bold">
                                  {results.optimizedContent.personal_info?.name || "Name"}
                                </h3>
                                <p className="text-gray-600">
                                  {results.optimizedContent.personal_info?.email || "email@example.com"}
                                </p>
                              </div>
                              
                              {results.optimizedContent.summary && (
                                <div>
                                  <h4 className="font-semibold text-blue-600 mb-2">PROFESSIONAL SUMMARY</h4>
                                  <p className="text-sm">{results.optimizedContent.summary}</p>
                                </div>
                              )}
                              
                              <div className="text-center text-gray-500 text-sm">
                                ...and more optimized content
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex space-x-4 mt-6">
                    <Button 
                      onClick={() => handleDownload('pdf')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      onClick={() => handleDownload('docx')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download DOCX
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Download Complete */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Optimization Complete!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Your Resume Has Been Optimized!</h3>
                  <p className="text-gray-600">
                    Your ATS-friendly resume is ready. Use it to apply for your target position with confidence.
                  </p>
                </div>

                <div className="flex space-x-4 justify-center">
                  <Button onClick={handleStartOver} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Optimize Another Resume
                  </Button>
                  <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Resume Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeOptimizer;