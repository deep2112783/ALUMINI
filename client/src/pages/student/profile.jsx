import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useStudentProfile, useUpdateProfile } from "@/hooks/use-api";
import { Loader2, Save, X, Plus, Linkedin, Github, Globe, Mail, Award, Camera, Edit, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: profile, isLoading } = useStudentProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showInfoCards, setShowInfoCards] = useState(true);
  const [newSkill, setNewSkill] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    cgpa: "",
    bio: "",
    skills: [],
    linkedin: "",
    github: "",
    portfolio: ""
  });

  const userEmail = localStorage.getItem("email") || "student@rgukt.ac.in";
  const userName = userEmail.split("@")[0];

  const populateFromProfile = () => {
    if (!profile) {
      console.log("No profile data available yet");
      return;
    }
    console.log("Populating form from profile:", profile);
    setFormData({
      name: profile.name || "",
      department: profile.department || "",
      year: profile.year || "",
      cgpa: profile.cgpa || "",
      bio: profile.bio || "",
      skills: profile.skills ? (Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',').map(s => s.trim()).filter(Boolean)) : [],
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      portfolio: profile.portfolio || ""
    });
    setProfileImage(profile.profile_image || null);
    setCoverImage(profile.cover_image || null);
    console.log("Form populated successfully");
  };

  useEffect(() => {
    console.log("Profile useEffect triggered, profile:", profile);
    populateFromProfile();
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Profile image must be less than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Cover image must be less than 4MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const trimmedSkills = (formData.skills || []).map((s) => s.trim()).filter(Boolean);
    
    // Only send non-empty fields - let backend preserve existing data
    const dataToUpdate = {};
    
    if (formData.name?.trim()) dataToUpdate.name = formData.name.trim();
    if (formData.department?.trim()) dataToUpdate.department = formData.department.trim();
    if (formData.year?.trim()) dataToUpdate.year = formData.year.trim();
    if (formData.cgpa && formData.cgpa !== "") dataToUpdate.cgpa = Number(formData.cgpa);
    if (formData.bio?.trim()) dataToUpdate.bio = formData.bio.trim();
    if (trimmedSkills.length > 0) dataToUpdate.skills = trimmedSkills;
    if (formData.linkedin?.trim()) dataToUpdate.linkedin = formData.linkedin.trim();
    if (formData.github?.trim()) dataToUpdate.github = formData.github.trim();
    if (formData.portfolio?.trim()) dataToUpdate.portfolio = formData.portfolio.trim();

    // Only include images if they are new base64 strings (not existing URLs)
    if (profileImage && typeof profileImage === 'string' && profileImage.startsWith('data:image')) {
      dataToUpdate.profile_image = profileImage;
    }
    if (coverImage && typeof coverImage === 'string' && coverImage.startsWith('data:image')) {
      dataToUpdate.cover_image = coverImage;
    }

    console.log("Saving profile with data (images excluded if too large):", {
      ...dataToUpdate,
      profile_image: dataToUpdate.profile_image ? "[BASE64]" : null,
      cover_image: dataToUpdate.cover_image ? "[BASE64]" : null
    });

    updateMutation.mutate(dataToUpdate, {
      onSuccess: () => {
        console.log("Profile update successful");
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
        // The hook will automatically refetch and update the cache via queryClient.invalidateQueries
        // No need to manually update local state - it will be handled by the useQuery
      },
      onError: (error) => {
        console.error("Update error:", error);
        toast({
          title: "Update Failed",
          description: error?.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const displayName = formData.name || profile?.name || userName;
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <Layout role="student">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 fade-in-up">
        <div className="max-w-5xl mx-auto space-y-6 p-6">
        
          {/* Header / Cover */}
          <div className="relative mb-20">
            <div className="h-56 rounded-2xl w-full shadow-lg overflow-hidden">
              <div 
                className="h-full w-full bg-cover bg-center"
                style={{ 
                  backgroundImage: coverImage 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url(${coverImage})` 
                    : "linear-gradient(135deg, var(--primary) 0%, rgba(59,130,246,0.85) 45%, rgba(99,102,241,0.8) 100%)"
                }}
              />
              {isEditing && (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 shadow hover:bg-white"
                >
                  <Camera className="h-4 w-4 text-primary" />
                  Change Cover
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
            <div className="absolute -bottom-16 inset-x-6 flex flex-wrap items-end gap-6">
              <div className="relative group cursor-pointer" onClick={() => !isEditing && setShowInfoCards(!showInfoCards)}>
                <Avatar className="h-36 w-36 border-4 border-white shadow-xl ring-2 ring-gray-100">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="bg-white text-primary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </>
                )}
                <div className="absolute bottom-2 right-2 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {showInfoCards && (
                <div className="mb-4 flex-1 min-w-[260px]">
                  <div className="bg-gradient-to-br from-white via-white to-primary/5 backdrop-blur-xl rounded-3xl shadow-2xl px-8 py-6 inline-flex flex-col gap-4 border-2 border-gray-200 max-w-lg">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight drop-shadow-sm">{displayName}</h1>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 px-2 py-1.5 text-xs text-gray-900 border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                        <Award className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="font-semibold">{formData.department || profile?.department || "Dept"}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 px-2 py-1.5 text-xs text-gray-900 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                        <GraduationCap className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold">{formData.year ? formData.year.toUpperCase() : (profile?.year ? profile.year.toUpperCase() : "Year")}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-50 px-2 py-1.5 text-xs text-gray-900 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                        <Mail className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="font-semibold truncate text-xs">{userEmail}</span>
                      </div>
                      {(formData.cgpa || profile?.cgpa) && (
                        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-100 to-amber-50 px-2 py-1.5 text-xs text-gray-900 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                          <span className="font-bold text-amber-600">GPA</span>
                          <span className="font-bold text-amber-700">{formData.cgpa || profile?.cgpa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -bottom-16 right-8 mb-4 flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      populateFromProfile();
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => {
                    setIsEditing(true);
                    setShowInfoCards(false);
                  }}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Bio & Academic Details */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">About Me</CardTitle>
                    <CardDescription>Tell us about yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                      <Textarea 
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself, your interests, and what you're looking for..."
                        className="min-h-[120px] resize-none transition-colors"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Academic Details
                    </CardTitle>
                    <CardDescription>Edit your academic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                        <div className="p-3 bg-gray-50 rounded-md text-gray-900 border border-gray-200">
                          {userEmail}
                        </div>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Department</Label>
                        <Input 
                          value={formData.department}
                          onChange={(e) => handleChange("department", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your department"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Year of Study</Label>
                        <Input 
                          value={formData.year}
                          onChange={(e) => handleChange("year", e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., E3"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">CGPA</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={formData.cgpa}
                          onChange={(e) => handleChange("cgpa", e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., 8.5"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Skills & Links */}
              <div className="space-y-6">
                <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Skills</CardTitle>
                    <CardDescription>Your technical expertise</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 min-h-[80px]">
                      {formData.skills.length > 0 ? (
                        formData.skills.map(skill => (
                          <Badge 
                            key={skill} 
                            variant="secondary" 
                            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors group"
                          >
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-1.5 hover:text-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No skills added yet</p>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add a skill" 
                          className="h-9 text-sm"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 px-3"
                          onClick={handleAddSkill}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Social Links</CardTitle>
                    <CardDescription>Connect your profiles</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="linkedin" className="text-xs font-medium flex items-center gap-2">
                        <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                        LinkedIn
                      </Label>
                      <Input 
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleChange("linkedin", e.target.value)}
                        disabled={!isEditing}
                        placeholder="linkedin.com/in/username"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="github" className="text-xs font-medium flex items-center gap-2">
                        <Github className="h-3.5 w-3.5" />
                        GitHub
                      </Label>
                      <Input 
                        id="github"
                        value={formData.github}
                        onChange={(e) => handleChange("github", e.target.value)}
                        disabled={!isEditing}
                        placeholder="github.com/username"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="portfolio" className="text-xs font-medium flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-green-600" />
                        Portfolio
                      </Label>
                      <Input 
                        id="portfolio"
                        value={formData.portfolio}
                        onChange={(e) => handleChange("portfolio", e.target.value)}
                        disabled={!isEditing}
                        placeholder="yourwebsite.com"
                        className="h-9 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
