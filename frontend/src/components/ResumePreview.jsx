import React from "react";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

const ResumePreview = ({ data, template, scale = 1 }) => {
  const scaleStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: `${100 / scale}%`,
    height: `${100 / scale}%`
  };

  const ModernTemplate = () => (
    <div className="bg-white p-8 font-sans text-gray-900 max-w-[8.5in] mx-auto shadow-lg">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.personalInfo.fullName}
        </h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{data.personalInfo.phone}</span>
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{data.personalInfo.location}</span>
            </div>
          )}
          {data.personalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              <span>{data.personalInfo.linkedin}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{exp.startDate} - {exp.endDate}</p>
                    <p>{exp.location}</p>
                  </div>
                </div>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                  {exp.description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-2">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{edu.startDate} - {edu.endDate}</p>
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div>
          <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">
            Skills
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.skills.technical && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Technical</h3>
                <p className="text-gray-700 text-sm">{data.skills.technical.join(', ')}</p>
              </div>
            )}
            {data.skills.soft && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Soft Skills</h3>
                <p className="text-gray-700 text-sm">{data.skills.soft.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const ClassicTemplate = () => (
    <div className="bg-white p-8 font-serif text-gray-900 max-w-[8.5in] mx-auto shadow-lg">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {data.personalInfo.fullName}
        </h1>
        
        <div className="flex justify-center flex-wrap gap-6 text-sm text-gray-600">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed text-center italic">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="text-center mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                  <p className="font-semibold text-gray-700">{exp.company} - {exp.location}</p>
                  <p className="text-sm text-gray-600 italic">{exp.startDate} - {exp.endDate}</p>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-center">
                  {exp.description.map((item, idx) => (
                    <li key={idx} className="text-left">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index} className="text-center">
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
                {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            CORE COMPETENCIES
          </h2>
          <div className="text-center space-y-2">
            {data.skills.technical && (
              <p className="text-gray-700">
                <span className="font-semibold">Technical:</span> {data.skills.technical.join(' • ')}
              </p>
            )}
            {data.skills.soft && (
              <p className="text-gray-700">
                <span className="font-semibold">Leadership:</span> {data.skills.soft.join(' • ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const CreativeTemplate = () => (
    <div className="bg-white max-w-[8.5in] mx-auto shadow-lg overflow-hidden">
      <div className="grid grid-cols-3">
        {/* Sidebar */}
        <div className="bg-gradient-to-b from-purple-600 to-pink-600 text-white p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{data.personalInfo.fullName}</h1>
            <div className="space-y-2 text-sm">
              {data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span className="text-xs">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{data.personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">SKILLS</h2>
              {data.skills.technical && (
                <div className="mb-3">
                  <h3 className="font-semibold text-sm mb-2">Technical</h3>
                  <div className="flex flex-wrap gap-1">
                    {data.skills.technical.slice(0,6).map((skill, index) => (
                      <span key={index} className="bg-white/20 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Soft Skills</h3>
                  <div className="text-xs space-y-1">
                    {data.skills.soft.slice(0,4).map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-2 p-6">
          {/* Summary */}
          {data.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-purple-600 mb-3 border-b-2 border-purple-200 pb-1">
                ABOUT ME
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-purple-600 mb-3 border-b-2 border-purple-200 pb-1">
                EXPERIENCE
              </h2>
              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                      <p className="text-purple-600 font-semibold text-sm">{exp.company}</p>
                      <p className="text-xs text-gray-600">{exp.startDate} - {exp.endDate} | {exp.location}</p>
                    </div>
                    <ul className="list-disc list-inside text-gray-700 text-xs space-y-1 ml-3">
                      {exp.description.slice(0,3).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-purple-600 mb-3 border-b-2 border-purple-200 pb-1">
                EDUCATION
              </h2>
              <div className="space-y-2">
                {data.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                    <p className="text-gray-700 text-sm">{edu.institution}</p>
                    <p className="text-xs text-gray-600">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (template) {
      case "classic":
        return <ClassicTemplate />;
      case "creative":
        return <CreativeTemplate />;
      case "minimal":
        return <ModernTemplate />;
      default:
        return <ModernTemplate />;
    }
  };

  return (
    <div style={scaleStyle}>
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;