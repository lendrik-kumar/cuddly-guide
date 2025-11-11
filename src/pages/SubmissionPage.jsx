import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import SubmissionDialog from "@/components/SubmissionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { submitTeamData, getSubmission } from "@/services/submissionService";
import { getTeamRegistration } from "@/services/authService";
import { toast } from "react-toastify";

const INITIAL_FORM_STATE = {
  githubLink: "",
  pptLink: "",
  videoLink: "",
  description: "",
};

const Submission = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [teamInfo, setTeamInfo] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false);

  // Load team info and existing submission when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load team registration data
        try {
          const teamResponse = await getTeamRegistration();
          setTeamInfo(teamResponse.data);
        } catch (error) {
          console.error("Error loading team data:", error);
          toast.error("Failed to load team information");
        }
        
        // Load existing submission
        try {
          const submissionResponse = await getSubmission();
          
          if (submissionResponse.hasSubmission && submissionResponse.data) {
            setFormData({
              githubLink: submissionResponse.data.githubLink || "",
              pptLink: submissionResponse.data.pptLink || "",
              videoLink: submissionResponse.data.videoLink || "",
              description: submissionResponse.data.description || "",
            });
            setHasExistingSubmission(true);
            toast.info("Loaded your existing submission");
          }
        } catch (error) {
          console.error("Error loading submission:", error);
          // Only show error if it's not a "not found" error
          if (error.error && !error.error.includes("not found")) {
            toast.error(error.error || "Failed to load submission");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate required fields (only the 4 input fields)
    if (!formData.githubLink || !formData.pptLink || !formData.videoLink || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmission = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    try {
      setIsSubmitting(true);
      
      const response = await submitTeamData(formData);
      
      if (response.isExisting) {
        toast.info("Submission already exists. Your previous submission has been loaded.");
        // Update form data with existing submission
        if (response.data) {
          setFormData({
            githubLink: response.data.githubLink || "",
            pptLink: response.data.pptLink || "",
            videoLink: response.data.videoLink || "",
            description: response.data.description || "",
          });
        }
        setHasExistingSubmission(true);
      } else {
        toast.success("Submission successful! Your project has been submitted.");
        setHasExistingSubmission(true);
      }
      
      setShowConfirmation(false);
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.error || error.details?.[0] || "Failed to submit. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Background elements - same as Auth page */}
      <div className="fixed inset-0 bg-linear-to-br from-grey-800 via-grey-900 to-black animate-gradient" />
      <motion.img
        src="./Auth_back.png"
        alt="background"
        className="fixed inset-0 w-full h-full object-cover opacity-50"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="fixed inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse" />

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Card className="max-w-3xl mx-auto backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-linear-to-r from-white to-white/80 bg-clip-text text-transparent">
                Project Submission Form
              </CardTitle>
              {hasExistingSubmission && (
                <p className="text-sm text-green-400 mt-2">
                  You have an existing submission. You can update your details below.
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  {/* Team Information Display */}
                  {teamInfo && (
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-3">Team Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/70">Team Name:</span>
                          <p className="text-white font-medium">{teamInfo.teamName || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-white/70">Team ID:</span>
                          <p className="text-white font-medium">{teamInfo.teamId || teamInfo.id || "N/A"}</p>
                        </div>
                        {teamInfo.members && teamInfo.members[0] && (
                          <>
                            <div>
                              <span className="text-white/70">Leader Name:</span>
                              <p className="text-white font-medium">{teamInfo.members[0].name || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-white/70">Leader Email:</span>
                              <p className="text-white font-medium">{teamInfo.members[0].email || "N/A"}</p>
                            </div>
                            <div>
                              <span className="text-white/70">Leader Phone:</span>
                              <p className="text-white font-medium">{teamInfo.members[0].phoneNumber || "N/A"}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">
                          GitHub Link <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="githubLink"
                          value={formData.githubLink}
                          onChange={handleInputChange}
                          type="url"
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="https://github.com/your-repo"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">
                          PPT Link <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="pptLink"
                          value={formData.pptLink}
                          onChange={handleInputChange}
                          type="url"
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="https://drive.google.com/..."
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">
                          Video Link <span className="text-red-400">*</span>
                        </label>
                        <Input
                          name="videoLink"
                          value={formData.videoLink}
                          onChange={handleInputChange}
                          type="url"
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="https://youtube.com/..."
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">
                          Project Description <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white min-h-[150px]"
                          placeholder="Describe your project..."
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                      className="pt-6"
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-linear-to-r from-gray-700 to-gray-800 hover:from-slate-700 hover:to-slate-800 border border-white/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : hasExistingSubmission ? "Update Submission" : "Submit Project"}
                      </Button>
                    </motion.div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <SubmissionDialog
        isOpen={showConfirmation}
        onClose={() => !isSubmitting && setShowConfirmation(false)}
        onConfirm={handleConfirmSubmission}
        formData={formData}
        teamInfo={teamInfo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Submission;
