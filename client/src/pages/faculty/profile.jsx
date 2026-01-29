import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Save, X, Camera, Mail, Briefcase, MapPin } from "lucide-react";
import { useFacultyProfile, useUpdateFacultyProfile } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";

export default function FacultyProfile() {
  const { data: profile, isLoading } = useFacultyProfile();
  const updateProfileMutation = useUpdateFacultyProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showInfoCards, setShowInfoCards] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    department: "",
    designation: "",
    office_location: "",
    phone_extension: "",
    bio: ""
  });
  
  const populateFromProfile = () => {
    if (!profile) {
      return;
    }
    setFormData({
      department: profile.department || "",
      designation: profile.designation || "",
      office_location: profile.office_location || "",
      phone_extension: profile.phone_extension || "",
      bio: profile.bio || ""
    });
    setProfileImage(profile.profile_image || null);
    setCoverImage(profile.cover_image || null);
  };

  useEffect(() => {
    populateFromProfile();
  }, [profile]);
  
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
  
  const handleUpdate = () => {
    console.log("[Faculty] handleUpdate called");
    console.log("[Faculty] profileImage type:", typeof profileImage);
    console.log("[Faculty] coverImage type:", typeof coverImage);
    
    // Only send non-empty fields
    const dataToUpdate = {};
    if (formData.department?.trim()) dataToUpdate.department = formData.department.trim();
    if (formData.designation?.trim()) dataToUpdate.designation = formData.designation.trim();
    if (formData.office_location?.trim()) dataToUpdate.office_location = formData.office_location.trim();
    if (formData.phone_extension?.trim()) dataToUpdate.phone_extension = formData.phone_extension.trim();
    if (formData.bio?.trim()) dataToUpdate.bio = formData.bio.trim();

    // ALWAYS include images if they exist (regardless of base64 check)
    // This ensures the backend receives them
    if (profileImage) {
      console.log("[Faculty] Setting profile_image to:", profileImage.substring(0, 100));
      dataToUpdate.profile_image = profileImage;
    }
    if (coverImage) {
      console.log("[Faculty] Setting cover_image to:", coverImage.substring(0, 100));
      dataToUpdate.cover_image = coverImage;
    }

    console.log("[Faculty updateProfile] Final data to send keys:", Object.keys(dataToUpdate));
    console.log("[Faculty updateProfile] Data length:", JSON.stringify(dataToUpdate).length, "bytes");

    updateProfileMutation.mutate(dataToUpdate, {
      onSuccess: (responseData) => {
        console.log("[Faculty updateProfile] Update successful!");
        console.log("[Faculty response] Keys:", Object.keys(responseData));
        console.log("[Faculty response] profile_image:", responseData.profile_image ? "EXISTS (" + responseData.profile_image.length + " bytes)" : "NULL");
        console.log("[Faculty response] cover_image:", responseData.cover_image ? "EXISTS (" + responseData.cover_image.length + " bytes)" : "NULL");
        
        // Update local state with response
        setProfileImage(responseData.profile_image || profileImage);
        setCoverImage(responseData.cover_image || coverImage);
        toast({ title: "Success", description: "Profile updated successfully" });
        setIsEditing(false);
      },
      onError: (error) => {
        console.error("[Faculty] Update error:", error);
        toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
      }
    });
  };
  
  if (isLoading) {
    return (
      <Layout role="faculty">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  const userEmail = profile?.email || localStorage.getItem("email") || "";
  const userName = userEmail.split("@")[0].split(".").map(n => 
    n.charAt(0).toUpperCase() + n.slice(1)
  ).join(" ");
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase();
  
  return (
    <Layout role="faculty">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
        <div className="max-w-5xl mx-auto space-y-6 p-6">
        
          {/* Header / Cover */}
          <div className="relative mb-20">
            <div className="h-56 rounded-2xl w-full shadow-lg overflow-hidden">
              <div 
                className="h-full w-full bg-cover bg-center"
                style={{ 
                  backgroundImage: coverImage 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url(${coverImage})` 
                    : "linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 0.85) 100%)"
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
                  <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
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
              </div>

              {showInfoCards && (
                <div className="mb-4 flex-1 min-w-[260px] mt-8">
                  <div className="bg-gradient-to-br from-white via-white to-blue-50 backdrop-blur-xl rounded-3xl shadow-2xl px-8 py-6 inline-flex flex-col gap-4 border-2 border-gray-200 max-w-lg">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight drop-shadow-sm pt-2">{userName}</h1>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {(formData.designation || profile?.designation) && (
                        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 px-2 py-1.5 text-xs text-gray-900 border border-blue-200 shadow-sm">
                          <Briefcase className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          <span className="font-semibold">{formData.designation || profile?.designation}</span>
                        </div>
                      )}
                      {(formData.department || profile?.department) && (
                        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 px-2 py-1.5 text-xs text-gray-900 border border-purple-200 shadow-sm">
                          <Briefcase className="h-3 w-3 text-purple-600 flex-shrink-0" />
                          <span className="font-semibold">{formData.department || profile?.department}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-100 to-green-50 px-2 py-1.5 text-xs text-gray-900 border border-green-200 shadow-sm">
                        <Mail className="h-3 w-3 text-green-600 flex-shrink-0" />
                        <span className="font-semibold truncate text-xs">{userEmail}</span>
                      </div>
                      {(formData.office_location || profile?.office_location) && (
                        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-100 to-amber-50 px-2 py-1.5 text-xs text-gray-900 border border-amber-200 shadow-sm">
                          <MapPin className="h-3 w-3 text-amber-600 flex-shrink-0" />
                          <span className="font-semibold">{formData.office_location || profile?.office_location}</span>
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
                    onClick={handleUpdate}
                    disabled={updateProfileMutation.isPending}
                    className="gap-2"
                  >
                    {updateProfileMutation.isPending ? (
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
              {/* Left Column - Details */}
              <div className="md:col-span-2 space-y-6">
                <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Faculty Details</CardTitle>
                    <CardDescription>Your professional information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Designation</Label>
                        <Input 
                          value={formData.designation} 
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., Associate Professor"
                          className={!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Department</Label>
                        <Input 
                          value={formData.department} 
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., Computer Science"
                          className={!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Bio</Label>
                      <Textarea 
                        value={formData.bio} 
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        className={`min-h-[100px] ${!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Contact */}
              <div className="space-y-6">
                <Card className="border-gray-200 shadow-md hover:shadow-lg transition-all bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Info</CardTitle>
                    <CardDescription>Office details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Email</Label>
                      <Input value={userEmail} disabled className="h-9 bg-gray-50" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Phone Extension</Label>
                      <Input 
                        value={formData.phone_extension} 
                        onChange={(e) => setFormData({ ...formData, phone_extension: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., 4521"
                        className={`h-9 ${!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Office Location</Label>
                      <Input 
                        value={formData.office_location} 
                        onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., AB-1, Room 304"
                        className={`h-9 ${!isEditing ? "bg-gray-50 cursor-not-allowed" : ""}`}
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
