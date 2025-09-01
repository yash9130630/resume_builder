import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  FileText, 
  Download, 
  Save, 
  Eye, 
  Settings, 
  Plus, 
  Trash2, 
  GripVertical,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { mockResumeData, templates, mockPdfExport } from "../mockData";
import { useToast } from "../hooks/use-toast";
import ResumePreview from "./ResumePreview";

const ResumeEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resumeData, setResumeData] = useState(mockResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState(templateId || "modern");
  const [activeTab, setActiveTab] = useState("personal");
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (templateId) {
      setSelectedTemplate(templateId);
    }
  }, [templateId]);

  const handleInputChange = (section, field, value, index = null) => {
    setResumeData(prev => {
      const newData = { ...prev };
      
      if (index !== null) {
        if (!newData[section]) newData[section] = [];
        if (!newData[section][index]) newData[section][index] = {};
        newData[section][index][field] = value;
      } else if (section === "skills" && typeof field === "object") {
        newData[section] = { ...prev[section], ...field };
      } else if (section === "personalInfo") {
        newData[section] = { ...prev[section], [field]: value };
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const addExperience = () => {
    const newExp = {
      id: `exp_${Date.now()}`,
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      description: [""]
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: `edu_${Date.now()}`,
      institution: "",
      degree: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: ""
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const handleSave = () => {
    // Mock save functionality
    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully.",
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axios.post(`${API}/export/pdf`, {
        resume_data: resumeData,
        template_id: selectedTemplate
      }, {
        responseType: 'blob',
      });

      // Create blob and download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_${selectedTemplate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Downloaded",
        description: "Your resume has been exported as PDF.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed", 
        description: error.response?.data?.detail || "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Editor</span>
            </Button>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{currentTemplate.name}</Badge>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export PDF
              </Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <ResumePreview data={resumeData} template={selectedTemplate} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Resume Editor</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">{currentTemplate.name}</Badge>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Edit Resume</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="experience">Work</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) => handleInputChange("personalInfo", "location", e.target.value)}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Professional Summary</label>
                        <Textarea
                          value={resumeData.summary}
                          onChange={(e) => handleInputChange(null, "summary", e.target.value)}
                          placeholder="Brief professional summary..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Work Experience</h3>
                      <Button size="sm" onClick={addExperience}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <Card key={exp.id} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <GripVertical className="h-4 w-4 text-gray-400 mt-2" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeExperience(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => handleInputChange("experience", "company", e.target.value, index)}
                            />
                            <Input
                              placeholder="Position"
                              value={exp.position}
                              onChange={(e) => handleInputChange("experience", "position", e.target.value, index)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <Input
                              placeholder="Location"
                              value={exp.location}
                              onChange={(e) => handleInputChange("experience", "location", e.target.value, index)}
                            />
                            <Input
                              placeholder="Start Date"
                              value={exp.startDate}
                              onChange={(e) => handleInputChange("experience", "startDate", e.target.value, index)}
                            />
                            <Input
                              placeholder="End Date"
                              value={exp.endDate}
                              onChange={(e) => handleInputChange("experience", "endDate", e.target.value, index)}
                            />
                          </div>
                          
                          <Textarea
                            placeholder="Job responsibilities and achievements..."
                            value={exp.description.join('\n')}
                            onChange={(e) => handleInputChange("experience", "description", e.target.value.split('\n'), index)}
                            rows={3}
                          />
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Education</h3>
                      <Button size="sm" onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {resumeData.education.map((edu, index) => (
                        <Card key={edu.id} className="p-4">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <Input
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => handleInputChange("education", "institution", e.target.value, index)}
                            />
                            <Input
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => handleInputChange("education", "degree", e.target.value, index)}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Technical Skills</label>
                      <Textarea
                        value={resumeData.skills.technical.join(', ')}
                        onChange={(e) => handleInputChange("skills", { technical: e.target.value.split(', ') })}
                        placeholder="JavaScript, Python, React..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Soft Skills</label>
                      <Textarea
                        value={resumeData.skills.soft.join(', ')}
                        onChange={(e) => handleInputChange("skills", { soft: e.target.value.split(', ') })}
                        placeholder="Leadership, Communication..."
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-3">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Live Preview</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <ResumePreview data={resumeData} template={selectedTemplate} scale={0.7} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;