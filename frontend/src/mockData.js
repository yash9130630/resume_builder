// Mock data for resume builder
export const mockUser = {
  id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
  savedResumes: [
    {
      id: "resume_1",
      name: "Software Engineer Resume",
      template: "modern",
      lastModified: "2025-01-15T10:30:00Z"
    },
    {
      id: "resume_2", 
      name: "Marketing Manager Resume",
      template: "creative",
      lastModified: "2025-01-14T15:45:00Z"
    }
  ]
};

export const mockResumeData = {
  personalInfo: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    website: "johndoe.dev"
  },
  summary: "Experienced software engineer with 5+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable applications and mentoring junior developers.",
  experience: [
    {
      id: "exp_1",
      company: "Tech Solutions Inc.",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2022-01",
      endDate: "Present",
      description: [
        "Led development of microservices architecture serving 1M+ daily users",
        "Reduced system latency by 40% through optimization and caching strategies",
        "Mentored 3 junior developers and conducted technical interviews"
      ]
    },
    {
      id: "exp_2",
      company: "StartupCorp",
      position: "Full Stack Developer",
      location: "San Francisco, CA", 
      startDate: "2020-06",
      endDate: "2021-12",
      description: [
        "Built responsive web applications using React, Node.js, and MongoDB",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Collaborated with design team to improve user experience"
      ]
    }
  ],
  education: [
    {
      id: "edu_1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      location: "Berkeley, CA",
      startDate: "2016-08",
      endDate: "2020-05",
      gpa: "3.8/4.0"
    }
  ],
  skills: {
    technical: ["JavaScript", "Python", "React", "Node.js", "MongoDB", "AWS", "Docker", "Kubernetes"],
    soft: ["Leadership", "Problem Solving", "Communication", "Team Management"]
  },
  projects: [
    {
      id: "proj_1",
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform with payment integration",
      technologies: ["React", "Node.js", "Stripe", "MongoDB"],
      link: "github.com/johndoe/ecommerce"
    }
  ],
  certifications: [
    {
      id: "cert_1",
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-08"
    }
  ]
};

export const templates = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, contemporary design perfect for tech and business roles",
    category: "modern",
    preview: "/api/placeholder/300/400"
  },
  {
    id: "classic", 
    name: "Classic Executive",
    description: "Traditional, elegant layout ideal for corporate positions",
    category: "classic",
    preview: "/api/placeholder/300/400"
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    description: "Bold, artistic design for creative professionals",
    category: "creative", 
    preview: "/api/placeholder/300/400"
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Minimalist approach focusing on content clarity",
    category: "modern",
    preview: "/api/placeholder/300/400"
  }
];

export const mockPdfExport = (resumeData, templateId) => {
  // Mock PDF export function
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Exporting resume with ${templateId} template...`);
      const blob = new Blob(["Mock PDF Content"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 2000);
  });
};